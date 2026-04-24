/* ============================================
   PIXELSEARCH — AI SEARCH SCREEN (Functional)
   Real CLIP-powered semantic search
   ============================================ */

// Track search timing
let searchStartTime = 0;

function renderSearchScreen() {
  return `
    <div class="screen" id="screen-search">
      <div class="search-header">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);margin-bottom:var(--space-2);">
              <span class="text-gradient">AI Search</span>
            </h2>
            <p style="font-size:var(--font-sm);color:var(--text-tertiary);">Real semantic search powered by CLIP ViT-B/32 — running in your browser</p>
          </div>
          <div id="ai-status-badge"></div>
        </div>
      </div>

      <!-- AI Engine Setup Panel -->
      <div id="ai-setup-panel">
        <div class="glass-card glass-card--static" style="padding:var(--space-6);text-align:center;margin-bottom:var(--space-5);">
          <div style="font-size:2.5rem;margin-bottom:var(--space-3);">🧠</div>
          <h3 style="font-size:var(--font-lg);font-weight:var(--font-semibold);margin-bottom:var(--space-2);">Initialize AI Engine</h3>
          <p style="font-size:var(--font-sm);color:var(--text-tertiary);margin-bottom:var(--space-5);max-width:400px;margin-left:auto;margin-right:auto;">
            Download & load CLIP model for real semantic search. ~150MB on first load, then cached in your browser. <strong>100% on-device — no data leaves your machine.</strong>
          </p>
          <button class="btn btn-primary btn-lg" onclick="loadAIEngine()" id="btn-load-ai">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg>
            Load CLIP Model
          </button>

          <!-- Progress -->
          <div id="ai-load-progress" style="display:none;margin-top:var(--space-5);text-align:left;">
            <div id="ai-load-stage" style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-2);">Initializing...</div>
            <div class="progress-bar" style="margin-bottom:var(--space-2);">
              <div class="progress-bar__fill" id="ai-load-bar" style="width:0%;transition:width 0.3s ease;"></div>
            </div>
            <div id="ai-load-detail" style="font-size:var(--font-xs);color:var(--text-muted);">Starting download...</div>
          </div>
        </div>
      </div>

      <!-- Upload & Index Panel (shown after AI loads) -->
      <div id="photo-upload-panel" style="display:none;">
        <!-- Upload Zone -->
        <div class="upload-zone" id="upload-zone" onclick="document.getElementById('photo-file-input').click()">
          <input type="file" id="photo-file-input" multiple accept="image/*" style="display:none;" onchange="handlePhotoUpload(event)" />
          <div class="upload-zone__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
          </div>
          <div style="font-size:var(--font-base);font-weight:var(--font-semibold);margin-bottom:var(--space-1);">Upload Your Photos</div>
          <div style="font-size:var(--font-sm);color:var(--text-tertiary);">Click to browse or drag & drop images here</div>
        </div>

        <!-- Or use sample photos -->
        <div style="text-align:center;margin:var(--space-4) 0;">
          <span style="font-size:var(--font-xs);color:var(--text-muted);">— or —</span>
        </div>
        <button class="btn btn-secondary w-full" onclick="indexSamplePhotos()" id="btn-index-samples" style="justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          Index 20 Sample Photos (Unsplash)
        </button>

        <!-- Indexing Progress -->
        <div id="indexing-progress" style="display:none;margin-top:var(--space-4);">
          <div class="glass-card glass-card--static" style="padding:var(--space-4);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-2);">
              <span style="font-size:var(--font-sm);font-weight:var(--font-semibold);" id="indexing-label">Indexing photos...</span>
              <span style="font-size:var(--font-xs);color:var(--text-tertiary);" id="indexing-count">0/0</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar__fill" id="indexing-bar" style="width:0%;transition:width 0.3s ease;"></div>
            </div>
            <div id="indexing-current" style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-2);">Preparing...</div>
          </div>
        </div>

        <!-- Indexed Photos Count -->
        <div id="indexed-status" style="display:none;margin-top:var(--space-4);">
          <div class="glass-card glass-card--static" style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-3);">
            <div style="width:36px;height:36px;border-radius:var(--radius-md);background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;color:var(--success);">✓</div>
            <div>
              <div style="font-size:var(--font-sm);font-weight:var(--font-semibold);" id="indexed-count-label">0 photos indexed</div>
              <div style="font-size:var(--font-xs);color:var(--text-tertiary);">Ready for semantic search</div>
            </div>
            <button class="btn btn-sm btn-secondary" style="margin-left:auto;" onclick="document.getElementById('photo-file-input').click()">
              + Add More
            </button>
          </div>
        </div>
      </div>

      <!-- Search Bar (shown after indexing) -->
      <div id="search-bar-container" style="display:none;margin-top:var(--space-5);">
        ${renderSearchBar('Describe any photo… e.g. "sunset over mountains"', 'search-main')}

        <!-- Smart Chips -->
        <div class="chips-scroll" style="margin-top:var(--space-4);">
          ${SmartPrompts.slice(0, 6).map(p => `
            <button class="chip" onclick="triggerSearch('${p.query}')">${p.label}</button>
          `).join('')}
        </div>
      </div>

      <!-- Processing States -->
      <div class="search-processing" id="search-processing" style="display:none;">
        <div class="search-processing__title">Query Processing — Live AI Inference</div>
        <div class="progress-step" id="step-embed">
          <div class="progress-step__indicator">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </div>
          <div class="progress-step__label">Encoding query with CLIP text encoder…</div>
        </div>
        <div class="progress-step" id="step-search">
          <div class="progress-step__indicator">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <div class="progress-step__label">Computing cosine similarity against indexed vectors…</div>
        </div>
        <div class="progress-step" id="step-rank">
          <div class="progress-step__indicator">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/></svg>
          </div>
          <div class="progress-step__label">Ranking results by relevance score…</div>
        </div>
      </div>

      <!-- Results Container -->
      <div id="search-results-container"></div>

      <!-- Initial Empty State (when no AI loaded) -->
      <div class="empty-state" id="search-empty" style="display:none;">
        <div class="empty-state__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <div class="empty-state__title">Search your memories</div>
        <div class="empty-state__desc">Type a natural language description to find matching photos using real CLIP embeddings</div>
      </div>
    </div>
  `;
}

/* ---- Load AI Engine ---- */
async function loadAIEngine() {
  const btn = document.getElementById('btn-load-ai');
  const progressDiv = document.getElementById('ai-load-progress');
  const stageEl = document.getElementById('ai-load-stage');
  const barEl = document.getElementById('ai-load-bar');
  const detailEl = document.getElementById('ai-load-detail');

  if (!btn || !progressDiv) return;

  btn.disabled = true;
  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Loading model...
  `;
  progressDiv.style.display = 'block';

  const stageWeights = {
    tokenizer: { start: 0, end: 5 },
    processor: { start: 5, end: 10 },
    text_model: { start: 10, end: 50 },
    vision_model: { start: 50, end: 100 },
  };

  const stageLabels = {
    tokenizer: '1/4  Loading tokenizer...',
    processor: '2/4  Loading image processor...',
    text_model: '3/4  Downloading CLIP text encoder (this is the big one)...',
    vision_model: '4/4  Downloading CLIP vision encoder...',
  };

  try {
    await window.AIEngine.init((info) => {
      const weight = stageWeights[info.stage] || { start: 0, end: 100 };
      const overallProgress = weight.start + (info.progress / 100) * (weight.end - weight.start);

      if (stageEl) stageEl.textContent = stageLabels[info.stage] || info.stage;
      if (barEl) barEl.style.width = Math.round(overallProgress) + '%';
      if (detailEl && info.detail) {
        // Show just filename
        const filename = info.detail.split('/').pop();
        detailEl.textContent = filename ? `Downloading: ${filename}` : info.detail;
      }
    });

    // Success!
    onAIReady();
  } catch (err) {
    console.error('AI Engine load failed:', err);
    if (stageEl) stageEl.textContent = '❌ Failed to load model';
    if (detailEl) detailEl.textContent = err.message;
    btn.disabled = false;
    btn.innerHTML = 'Retry Loading';
  }
}

function onAIReady() {
  // Hide setup, show upload panel
  const setupPanel = document.getElementById('ai-setup-panel');
  const uploadPanel = document.getElementById('photo-upload-panel');
  const statusBadge = document.getElementById('ai-status-badge');

  if (setupPanel) setupPanel.style.display = 'none';
  if (uploadPanel) uploadPanel.style.display = 'block';
  if (statusBadge) {
    statusBadge.innerHTML = '<span class="badge badge--success">🧠 AI Ready</span>';
  }
}

/* ---- Photo Upload ---- */
async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  await indexPhotos(files.map((file, i) => ({
    id: `upload-${Date.now()}-${i}`,
    src: URL.createObjectURL(file),
    name: file.name,
    blob: file,
  })));
}

/* ---- Index Sample Photos ---- */
async function indexSamplePhotos() {
  const btn = document.getElementById('btn-index-samples');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Indexing...';
  }

  const samplesToIndex = PhotoData.photos.map(p => ({
    id: `sample-${p.id}`,
    src: p.src,
    name: p.title,
    blob: null,
  }));

  await indexPhotos(samplesToIndex);
}

/* ---- Core Indexing Logic ---- */
async function indexPhotos(photos) {
  const progressDiv = document.getElementById('indexing-progress');
  const labelEl = document.getElementById('indexing-label');
  const countEl = document.getElementById('indexing-count');
  const barEl = document.getElementById('indexing-bar');
  const currentEl = document.getElementById('indexing-current');

  if (progressDiv) progressDiv.style.display = 'block';

  let indexed = 0;
  const total = photos.length;
  const errors = [];

  for (const photo of photos) {
    if (countEl) countEl.textContent = `${indexed}/${total}`;
    if (barEl) barEl.style.width = Math.round((indexed / total) * 100) + '%';
    if (currentEl) currentEl.textContent = `Processing: ${photo.name}`;

    try {
      await window.AIEngine.indexPhoto(photo.id, photo.src, photo.name, photo.blob);
      indexed++;
    } catch (err) {
      console.warn(`Failed to index ${photo.name}:`, err);
      errors.push(photo.name);
      indexed++;
    }
  }

  // Done!
  if (barEl) barEl.style.width = '100%';
  if (labelEl) labelEl.textContent = `✅ Indexed ${indexed - errors.length} of ${total} photos`;
  if (currentEl) currentEl.textContent = errors.length > 0
    ? `${errors.length} failed (usually CORS for remote images)`
    : 'All photos processed successfully!';

  // Show indexed status & search bar
  setTimeout(() => {
    if (progressDiv) progressDiv.style.display = 'none';
    updateIndexedStatus();
    showSearchUI();
  }, 1500);
}

function updateIndexedStatus() {
  const statusDiv = document.getElementById('indexed-status');
  const countLabel = document.getElementById('indexed-count-label');
  if (statusDiv) statusDiv.style.display = 'block';
  if (countLabel && window.AIEngine) {
    countLabel.textContent = `${window.AIEngine.indexedCount} photos indexed`;
  }
}

function showSearchUI() {
  const searchBar = document.getElementById('search-bar-container');
  if (searchBar) searchBar.style.display = 'block';

  // Initialize search input
  initSearchScreen();
}

/* ---- Trigger Search ---- */
function triggerSearch(query) {
  const input = document.getElementById('search-main-input');
  if (input) input.value = query;
  runSearch(query);
}

/* ---- Run Real AI Search ---- */
async function runSearch(query) {
  if (!query || query.trim() === '') return;
  if (!window.AIEngine || !window.AIEngine.isReady) {
    alert('Please load the AI engine first');
    return;
  }
  if (window.AIEngine.indexedCount === 0) {
    alert('Please index some photos first');
    return;
  }

  searchStartTime = performance.now();

  const emptyState = document.getElementById('search-empty');
  const processing = document.getElementById('search-processing');
  const resultsContainer = document.getElementById('search-results-container');

  if (emptyState) emptyState.style.display = 'none';
  if (resultsContainer) resultsContainer.innerHTML = '';
  if (processing) processing.style.display = 'block';

  // Reset steps
  ['step-embed', 'step-search', 'step-rank'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.remove('active', 'done');
  });

  try {
    // Step 1: Embedding query (REAL)
    setStepActive('step-embed');
    const startEmbed = performance.now();
    // The actual CLIP text encoding happens inside AIEngine.search()
    await new Promise(r => setTimeout(r, 100)); // Brief UI update pause

    // Step 2: Searching (REAL)
    setStepDone('step-embed');
    setStepActive('step-search');

    const results = await window.AIEngine.search(query);

    // Step 3: Ranking
    setStepDone('step-search');
    setStepActive('step-rank');
    await new Promise(r => setTimeout(r, 300)); // Brief animation pause

    setStepDone('step-rank');

    const totalTime = ((performance.now() - searchStartTime) / 1000).toFixed(2);

    // Show results
    setTimeout(() => {
      if (processing) processing.style.display = 'none';
      showRealResults(query, results, totalTime);
    }, 400);

  } catch (err) {
    console.error('Search failed:', err);
    if (processing) processing.style.display = 'none';
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="glass-card" style="padding:var(--space-5);text-align:center;">
          <div style="font-size:2rem;margin-bottom:var(--space-3);">❌</div>
          <div style="font-size:var(--font-base);font-weight:var(--font-semibold);">Search failed</div>
          <div style="font-size:var(--font-sm);color:var(--text-tertiary);margin-top:var(--space-2);">${err.message}</div>
        </div>
      `;
    }
  }
}

function setStepActive(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('done'); el.classList.add('active'); }
}

function setStepDone(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('active'); el.classList.add('done'); }
}

/* ---- Display Real Results ---- */
function showRealResults(query, results, timeStr) {
  const resultsContainer = document.getElementById('search-results-container');
  if (!resultsContainer) return;

  // Filter to results with positive confidence
  const relevantResults = results.filter(r => r.confidence > 5);

  resultsContainer.innerHTML = `
    <div style="animation: fadeInUp 0.5s ease;">

      <div class="search-results-header">
        <div>
          <span style="font-size:var(--font-base);font-weight:var(--font-semibold);">${relevantResults.length} results</span>
          <span style="font-size:var(--font-xs);color:var(--text-tertiary);margin-left:var(--space-2);">in ${timeStr}s (real inference)</span>
        </div>
        <span class="badge badge--success">✨ CLIP Live</span>
      </div>

      <!-- Results Grid -->
      <div class="photo-grid stagger-children" style="margin-top:var(--space-4);">
        ${relevantResults.map((r, i) => `
          <div class="photo-card" style="cursor:pointer;" onclick="showPhotoDetail('${r.name}', ${r.confidence}, ${r.similarity.toFixed(4)})">
            <img class="photo-card__image" src="${r.src}" alt="${r.name}" loading="lazy"
                 onerror="this.style.background='var(--surface-2)';this.alt='Image load error';" />
            <span class="photo-card__confidence" style="
              background: ${r.confidence > 70 ? 'rgba(16,185,129,0.9)' : r.confidence > 40 ? 'rgba(245,158,11,0.9)' : 'rgba(100,116,139,0.9)'};
            ">${r.confidence}%</span>
            <div class="photo-card__overlay">
              <div style="color:white;font-size:var(--font-sm);font-weight:var(--font-semibold);">${r.name}</div>
              <div style="color:rgba(255,255,255,0.7);font-size:10px;margin-top:2px;">
                Cosine sim: ${r.similarity.toFixed(4)} · Rank #${i + 1}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Real Similarity Scores Panel -->
      <div class="explainable-panel" style="margin-top:var(--space-6);">
        <div class="explainable-panel__title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          CLIP Similarity Scores (Real Cosine Similarity)
        </div>
        ${relevantResults.slice(0, 8).map(r => `
          <div class="explain-item">
            <div class="explain-item__label" style="flex:1;min-width:0;">
              <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;display:inline-block;">${r.name}</span>
            </div>
            <div class="explain-item__bar">
              <div class="explain-item__bar-fill" style="width:${r.confidence}%;"></div>
            </div>
            <div class="explain-item__value" style="min-width:50px;">${r.similarity.toFixed(4)}</div>
          </div>
        `).join('')}
      </div>

      <!-- Query Technical Info -->
      <div class="glass-card glass-card--static" style="padding:var(--space-4);margin-top:var(--space-4);">
        <div style="font-size:var(--font-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--space-2);">Query Technical Details</div>
        <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;">
          <div style="font-size:var(--font-sm);">
            <span style="color:var(--text-tertiary);">Model:</span>
            <span style="color:var(--primary-400);font-weight:var(--font-medium);">CLIP ViT-B/32</span>
          </div>
          <div style="font-size:var(--font-sm);">
            <span style="color:var(--text-tertiary);">Inference:</span>
            <span style="color:var(--accent-400);font-weight:var(--font-medium);">ONNX Runtime (WASM)</span>
          </div>
          <div style="font-size:var(--font-sm);">
            <span style="color:var(--text-tertiary);">Vectors searched:</span>
            <span style="color:var(--success);font-weight:var(--font-medium);">${window.AIEngine.indexedCount}</span>
          </div>
          <div style="font-size:var(--font-sm);">
            <span style="color:var(--text-tertiary);">Latency:</span>
            <span style="color:var(--spark-400);font-weight:var(--font-medium);">${timeStr}s</span>
          </div>
          <div style="font-size:var(--font-sm);">
            <span style="color:var(--text-tertiary);">Query:</span>
            <span style="color:var(--text-primary);font-weight:var(--font-medium);">"${query}"</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showPhotoDetail(name, confidence, similarity) {
  // Simple alert for now — could be extended to full modal
  alert(`📸 ${name}\n\nMatch Confidence: ${confidence}%\nCosine Similarity: ${similarity}\nModel: CLIP ViT-B/32`);
}

/* ---- Initialize Search Screen ---- */
function initSearchScreen() {
  const input = document.getElementById('search-main-input');
  if (input) {
    // Remove old listeners by cloning
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runSearch(newInput.value);
      }
    });
  }

  // Setup drag & drop
  const uploadZone = document.getElementById('upload-zone');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('upload-zone--active');
    });
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('upload-zone--active');
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('upload-zone--active');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        handlePhotoUpload({ target: { files } });
      }
    });
  }

  // Check if AI is already loaded (e.g., navigating back)
  if (window.AIEngine && window.AIEngine.isReady) {
    onAIReady();
    if (window.AIEngine.indexedCount > 0) {
      updateIndexedStatus();
      showSearchUI();
    }
  }
}
