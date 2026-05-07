import { useState, useEffect, useRef } from 'react';
import './EditModal.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const EDIT_MODES = [
  { id: 'edit',    label: 'Edit with AI',       icon: '✏️', description: 'Describe changes in plain English', output: 'image',  provider: 'Stability AI' },
  { id: 'enhance', label: 'Enhance & Upscale',  icon: '✨', description: 'AI clarity enhancement & upscaling',  output: 'image',  provider: 'Stability AI' },
  { id: 'style',   label: 'Apply Art Style',     icon: '🎨', description: 'Transform into painting, sketch, etc.', output: 'image', provider: 'Replicate' },
  { id: 'video',   label: 'Animate to Video',    icon: '🎬', description: 'Generate a short AI video from this photo', output: 'video', provider: 'Replicate' },
];

const PROMPT_SUGGESTIONS = {
  edit:    ['add professional makeup', 'make it look like sunset', 'remove background', 'add snow effect'],
  enhance: ['ultra sharp, 4K quality', 'restore old photo', 'remove noise and grain'],
  style:   ['oil painting style', 'anime illustration', 'watercolor sketch', 'charcoal drawing', 'cyberpunk neon'],
  video:   ['gentle camera pan', 'zoom into subject', 'cinematic slow motion'],
};

export default function EditModal({ image, onClose }) {
  const [stage, setStage] = useState('consent'); // consent | editor | loading | result
  const [selectedMode, setSelectedMode] = useState('edit');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const overlayRef = useRef(null);

  const imageUrl = `http://127.0.0.1:8000/api/images/${image.filename}`;
  const currentMode = EDIT_MODES.find(m => m.id === selectedMode);

  // Close on outside click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleConsent = () => setStage('editor');

  const handleEdit = async () => {
    if (!prompt.trim() && selectedMode !== 'enhance') {
      setError('Please enter a prompt describing what you want to do.');
      return;
    }
    setError(null);
    setStage('loading');

    const messages = {
      edit:    ['Sending image to Stability AI…', 'Applying your edits…', 'Almost done…'],
      enhance: ['Upscaling with AI…', 'Enhancing clarity…', 'Finishing up…'],
      style:   ['Starting style transfer on Replicate…', 'Generating your style…', 'Rendering final output…'],
      video:   ['Sending to Replicate…', 'Generating video frames…', 'This takes 30–90 seconds…', 'Compiling video…'],
    };
    const msgs = messages[selectedMode];
    let i = 0;
    setProgress(msgs[0]);
    const interval = setInterval(() => {
      i = Math.min(i + 1, msgs.length - 1);
      setProgress(msgs[i]);
    }, selectedMode === 'video' ? 15000 : 4000);

    try {
      const res = await fetch(`${API_BASE_URL}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: image.filename,
          prompt: prompt || 'high quality, detailed',
          mode: selectedMode,
          consent: true,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `API Error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setStage('result');
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setStage('editor');
    }
  };

  const handleDownload = () => {
    if (result?.result_b64) {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${result.result_b64}`;
      link.download = `pixelsearch_${selectedMode}_${image.filename}`;
      link.click();
    } else if (result?.result_url) {
      window.open(result.result_url, '_blank');
    }
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── Stage: Consent ── */}
        {stage === 'consent' && (
          <div className="modal-stage modal-consent">
            <div className="consent-icon">🔒</div>
            <h2>AI Editing Requires Online Services</h2>
            <p className="consent-lead">
              PixelSearch is built on a fully <strong>offline-first</strong> foundation — your search is 100% local and private.
            </p>
            <div className="consent-warning">
              <p>
                The AI editing features listed below require sending your photo to <strong>third-party cloud APIs</strong> (Stability AI and/or Replicate). By continuing:
              </p>
              <ul>
                <li>✅ Your photo will be transmitted over the internet to the selected provider</li>
                <li>✅ PixelSearch does <em>not</em> store or log any results</li>
                <li>✅ The provider's own privacy policy applies to the transmitted data</li>
                <li>✅ You can cancel at any time before submitting</li>
              </ul>
              <div className="providers-info">
                <span className="provider-badge">Stability AI</span>
                <span className="provider-badge">Replicate</span>
              </div>
            </div>
            <div className="consent-actions">
              <button className="btn-secondary" onClick={onClose}>Cancel, Keep Private</button>
              <button className="btn-primary" onClick={handleConsent}>I Understand, Continue →</button>
            </div>
          </div>
        )}

        {/* ── Stage: Editor ── */}
        {stage === 'editor' && (
          <div className="modal-stage modal-editor">
            <div className="editor-sidebar">
              <img src={imageUrl} alt={image.filename} className="editor-preview" />
              <p className="editor-filename">{image.filename}</p>
              {image.tags?.length > 0 && (
                <div className="editor-tags">
                  {image.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
            </div>

            <div className="editor-controls">
              <h2>Choose an AI Feature</h2>

              {/* Mode selector */}
              <div className="mode-grid">
                {EDIT_MODES.map(mode => (
                  <button
                    key={mode.id}
                    className={`mode-card ${selectedMode === mode.id ? 'mode-card--active' : ''}`}
                    onClick={() => { setSelectedMode(mode.id); setPrompt(''); }}
                  >
                    <span className="mode-icon">{mode.icon}</span>
                    <span className="mode-label">{mode.label}</span>
                    <span className="mode-provider">{mode.provider}</span>
                  </button>
                ))}
              </div>

              {/* Prompt input */}
              <div className="prompt-section">
                <label className="prompt-label">
                  {selectedMode === 'enhance' ? 'Enhancement style (optional)' : 'Your prompt'}
                </label>
                <textarea
                  className="prompt-input"
                  rows={3}
                  placeholder={`e.g. ${PROMPT_SUGGESTIONS[selectedMode][0]}`}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <div className="prompt-suggestions">
                  {PROMPT_SUGGESTIONS[selectedMode].map(s => (
                    <button key={s} className="suggestion-chip" onClick={() => setPrompt(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {error && <div className="edit-error">⚠️ {error}</div>}

              <div className="editor-actions">
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary btn-glow" onClick={handleEdit}>
                  {currentMode?.icon} {currentMode?.label}
                </button>
              </div>

              <p className="online-notice">
                🌐 This action will send your photo to <strong>{currentMode?.provider}</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── Stage: Loading ── */}
        {stage === 'loading' && (
          <div className="modal-stage modal-loading">
            <div className="loading-orb"></div>
            <h3>{currentMode?.icon} {currentMode?.label}</h3>
            <p className="loading-status">{progress}</p>
            <p className="loading-sub">Processing via {currentMode?.provider}…</p>
          </div>
        )}

        {/* ── Stage: Result ── */}
        {stage === 'result' && result && (
          <div className="modal-stage modal-result">
            <div className="result-compare">
              <div className="compare-panel">
                <span className="compare-label">Original</span>
                <img src={imageUrl} alt="original" className="compare-img" />
              </div>
              <div className="compare-divider">→</div>
              <div className="compare-panel">
                <span className="compare-label">AI Result</span>
                {result.output === 'video' || result.result_url?.includes('.mp4') ? (
                  <video src={result.result_url} controls autoPlay loop className="compare-img" />
                ) : result.result_b64 ? (
                  <img src={`data:image/jpeg;base64,${result.result_b64}`} alt="result" className="compare-img" />
                ) : (
                  <img src={result.result_url} alt="result" className="compare-img" />
                )}
              </div>
            </div>
            <p className="result-provider">Generated by {result.provider} • {result.message}</p>
            <div className="result-actions">
              <button className="btn-secondary" onClick={() => setStage('editor')}>← Try Again</button>
              <button className="btn-primary btn-glow" onClick={handleDownload}>⬇ Download Result</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
