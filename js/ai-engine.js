/* ============================================
   PIXELSEARCH — AI ENGINE (CLIP in Browser)
   Runs OpenAI CLIP model entirely on-device
   using Transformers.js (Hugging Face)
   ============================================ */

import {
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  AutoTokenizer,
  AutoProcessor,
  RawImage,
  env
} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Configuration
const MODEL_ID = 'Xenova/clip-vit-base-patch32';

// Disable local model check (always use remote)
env.allowLocalModels = false;

// State
let textModel = null;
let visionModel = null;
let tokenizer = null;
let processor = null;
let isLoaded = false;
let isLoading = false;

// Indexed photos: array of { id, src, name, embedding }
let indexedPhotos = [];

/* ---- Model Loading ---- */
async function initModels(progressCallback) {
  if (isLoaded) return true;
  if (isLoading) return false;

  isLoading = true;

  try {
    const update = (stage, pct, detail) => {
      if (progressCallback) progressCallback({ stage, progress: pct, detail });
    };

    // Track progress across all model components
    let totalFiles = 0;
    let loadedFiles = 0;
    const fileProgress = {};

    const makeProgressCallback = (stageName) => (data) => {
      if (data.status === 'initiate') {
        totalFiles++;
        fileProgress[data.file] = 0;
      } else if (data.status === 'progress') {
        fileProgress[data.file] = data.progress || 0;
        const avgProgress = Object.values(fileProgress).reduce((a, b) => a + b, 0) / Math.max(totalFiles, 1);
        update(stageName, Math.round(avgProgress), data.file);
      } else if (data.status === 'done') {
        fileProgress[data.file] = 100;
        loadedFiles++;
      }
    };

    // 1. Load tokenizer
    update('tokenizer', 0, 'Downloading tokenizer...');
    tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
      progress_callback: makeProgressCallback('tokenizer')
    });
    update('tokenizer', 100, 'Tokenizer ready');

    // 2. Load processor
    update('processor', 0, 'Downloading image processor...');
    processor = await AutoProcessor.from_pretrained(MODEL_ID, {
      progress_callback: makeProgressCallback('processor')
    });
    update('processor', 100, 'Processor ready');

    // 3. Load text model
    update('text_model', 0, 'Downloading CLIP text encoder...');
    textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL_ID, {
      progress_callback: makeProgressCallback('text_model'),
      dtype: 'q8', // quantized for speed
    });
    update('text_model', 100, 'Text encoder ready');

    // 4. Load vision model
    update('vision_model', 0, 'Downloading CLIP vision encoder...');
    visionModel = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, {
      progress_callback: makeProgressCallback('vision_model'),
      dtype: 'q8', // quantized for speed
    });
    update('vision_model', 100, 'Vision encoder ready');

    isLoaded = true;
    isLoading = false;
    return true;
  } catch (err) {
    console.error('Failed to load AI models:', err);
    isLoading = false;
    throw err;
  }
}

/* ---- Text Embedding ---- */
async function getTextEmbedding(text) {
  if (!textModel || !tokenizer) throw new Error('Models not loaded');

  const inputs = tokenizer([text], { padding: true, truncation: true });
  const output = await textModel(inputs);
  // Get the embedding and normalize it
  const embedding = output.text_embeds.data;
  return normalizeVector(Array.from(embedding));
}

/* ---- Image Embedding ---- */
async function getImageEmbedding(imageSource) {
  if (!visionModel || !processor) throw new Error('Models not loaded');

  let image;
  if (typeof imageSource === 'string') {
    // URL
    image = await RawImage.read(imageSource);
  } else if (imageSource instanceof Blob) {
    // File/Blob
    const url = URL.createObjectURL(imageSource);
    image = await RawImage.read(url);
    URL.revokeObjectURL(url);
  } else {
    throw new Error('Invalid image source');
  }

  const inputs = await processor(image);
  const output = await visionModel(inputs);
  const embedding = output.image_embeds.data;
  return normalizeVector(Array.from(embedding));
}

/* ---- Index a Photo ---- */
async function indexPhoto(id, src, name, blob = null) {
  const embedding = await getImageEmbedding(blob || src);
  const entry = { id, src, name, embedding };
  indexedPhotos.push(entry);
  return entry;
}

/* ---- Semantic Search ---- */
async function search(query) {
  if (indexedPhotos.length === 0) return [];

  const textEmbedding = await getTextEmbedding(query);

  // Compute similarities
  const results = indexedPhotos.map(photo => ({
    ...photo,
    similarity: cosineSimilarity(textEmbedding, photo.embedding),
  }));

  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);

  // Convert to percentage (CLIP similarities are typically 0.15-0.35 range)
  // Scale to 0-100% for display
  return results.map(r => ({
    ...r,
    confidence: Math.round(Math.max(0, Math.min(100, ((r.similarity - 0.15) / 0.2) * 100))),
  }));
}

/* ---- Math Utilities ---- */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalizeVector(vec) {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

/* ---- Status Getters ---- */
function getStatus() {
  return {
    isLoaded,
    isLoading,
    indexedCount: indexedPhotos.length,
  };
}

function clearIndex() {
  indexedPhotos = [];
}

/* ---- Expose to Global Scope ---- */
window.AIEngine = {
  init: initModels,
  getTextEmbedding,
  getImageEmbedding,
  indexPhoto,
  search,
  getStatus,
  clearIndex,
  get isReady() { return isLoaded; },
  get indexedCount() { return indexedPhotos.length; },
};

// Signal that the AI engine module is loaded
window.dispatchEvent(new Event('ai-engine-ready'));
console.log('🧠 PixelSearch AI Engine module loaded');
