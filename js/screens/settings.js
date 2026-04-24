/* ============================================
   PIXELSEARCH — SETTINGS / PRIVACY SCREEN
   ============================================ */

function renderSettingsScreen() {
  return `
    <div class="screen" id="screen-settings">
      <!-- Profile Header -->
      <div style="text-align:center;padding:var(--space-8) 0 var(--space-6);">
        <div style="width:80px;height:80px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4);font-size:var(--font-2xl);box-shadow:var(--shadow-glow);">
          👤
        </div>
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);">Rudra Dalvi</h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">2,847 photos indexed · 8 AI modules active</p>
      </div>

      <!-- Privacy Banner -->
      <div class="settings-privacy-banner">
        <div class="settings-privacy-banner__icon">🛡️</div>
        <div class="settings-privacy-banner__title">100% Private & On-Device</div>
        <div class="settings-privacy-banner__desc">
          Your photos never leave your device. All AI processing — from embeddings to search — runs entirely locally. Zero cloud uploads, zero data sharing.
        </div>
      </div>

      <!-- Appearance -->
      <div class="settings-section">
        <div class="settings-section__title">Appearance</div>
        <div class="settings-list">
          <div class="settings-item" onclick="toggleTheme()">
            <div class="settings-item__left">
              <div class="settings-item__icon">🌙</div>
              <div class="settings-item__text">
                <h4>Dark Mode</h4>
                <p>Toggle between dark and light themes</p>
              </div>
            </div>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" id="theme-toggle-settings" onchange="toggleTheme()" />
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- AI Indexing -->
      <div class="settings-section">
        <div class="settings-section__title">AI Indexing</div>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">🧠</div>
              <div class="settings-item__text">
                <h4>Auto-Index New Photos</h4>
                <p>Automatically process new photos with AI</p>
              </div>
            </div>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" checked />
              <span class="toggle__slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">😊</div>
              <div class="settings-item__text">
                <h4>Emotion Detection</h4>
                <p>Detect emotions in faces for search</p>
              </div>
            </div>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" checked />
              <span class="toggle__slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">👥</div>
              <div class="settings-item__text">
                <h4>Face Recognition</h4>
                <p>Identify people in photos for grouping</p>
              </div>
            </div>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" checked />
              <span class="toggle__slider"></span>
            </label>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">📍</div>
              <div class="settings-item__text">
                <h4>Location Tagging</h4>
                <p>Use GPS metadata for map features</p>
              </div>
            </div>
            <label class="toggle" onclick="event.stopPropagation()">
              <input type="checkbox" checked />
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- AI Engine Modules -->
      <div class="settings-section">
        <div class="settings-section__title">AI Engine Modules</div>
        <div class="ai-modules-grid stagger-children">
          ${renderSettingsModule('🖼️', 'CLIP ViT-B/32', 'Semantic Embeddings', 'Active', true)}
          ${renderSettingsModule('👁️', 'YOLOv8', 'Object Detection', 'Active', true)}
          ${renderSettingsModule('🔎', 'FAISS IVF', 'Vector Search', 'Active', true)}
          ${renderSettingsModule('⚡', 'FastAPI', 'Backend Engine', 'Running', true)}
          ${renderSettingsModule('💾', 'SQLite', 'Metadata Store', '2.3 MB', true)}
          ${renderSettingsModule('🎙️', 'Whisper', 'Voice Search', 'Active', true)}
        </div>
      </div>

      <!-- Storage -->
      <div class="settings-section">
        <div class="settings-section__title">Storage</div>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">💾</div>
              <div class="settings-item__text">
                <h4>Index Size</h4>
                <p>FAISS vector index + metadata</p>
              </div>
            </div>
            <span style="font-size:var(--font-sm);color:var(--primary-400);font-weight:var(--font-semibold);">124 MB</span>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">📊</div>
              <div class="settings-item__text">
                <h4>Indexing Progress</h4>
                <p>2,847 of 2,847 photos processed</p>
              </div>
            </div>
            <span class="badge badge--success">Complete</span>
          </div>
        </div>
        <div style="padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;font-size:var(--font-xs);color:var(--text-tertiary);margin-bottom:var(--space-2);">
            <span>Storage used</span>
            <span>124 MB / 1 GB</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width:12.4%;"></div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section__title">About</div>
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">📱</div>
              <div class="settings-item__text">
                <h4>PixelSearch</h4>
                <p>Version 1.0.0</p>
              </div>
            </div>
            <span style="font-size:var(--font-xs);color:var(--text-muted);">v1.0.0</span>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">🎓</div>
              <div class="settings-item__text">
                <h4>B.Tech Major Project</h4>
                <p>Vidyalankar Institute of Technology</p>
              </div>
            </div>
          </div>
          <div class="settings-item">
            <div class="settings-item__left">
              <div class="settings-item__icon">❤️</div>
              <div class="settings-item__text">
                <h4>Made with love</h4>
                <p>Privacy-first AI photo intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align:center;padding:var(--space-8) 0;color:var(--text-muted);font-size:var(--font-xs);">
        PixelSearch © 2024 · "The gallery app that remembers your life."
      </div>
    </div>
  `;
}

function renderSettingsModule(icon, name, desc, status, active) {
  return `
    <div class="ai-module-card">
      <div class="ai-module-card__icon">${icon}</div>
      <div class="ai-module-card__name">${name}</div>
      <div class="ai-module-card__desc">${desc}</div>
      <div style="margin-top:var(--space-2);">
        <span class="badge ${active ? 'badge--success' : 'badge--warning'}">${status}</span>
      </div>
    </div>
  `;
}
