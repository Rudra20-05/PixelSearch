/* ============================================
   PIXELSEARCH — HOME SCREEN
   ============================================ */

function renderHomeScreen() {
  return `
    <div class="screen active" id="screen-home">
      <!-- Hero Section -->
      <div class="home-hero">
        <div class="home-hero__badge">
          <span>✨</span>
          <span>AI-Powered Photo Intelligence</span>
        </div>
        <h1 class="home-hero__title">
          Search your memories<br/><span class="text-gradient">naturally.</span>
        </h1>
        <p class="home-hero__subtitle">
          AI-powered semantic photo retrieval — fully private, fully local. Describe any moment, and we'll find it.
        </p>
        <div class="home-hero__search">
          ${renderSearchBar('Describe any photo…', 'home-search')}
        </div>

        <!-- Smart Prompt Chips -->
        <div class="chips-scroll" style="justify-content:center;flex-wrap:wrap;margin-top:var(--space-5);">
          ${SmartPrompts.map(p => `
            <button class="chip chip--glow" onclick="navigateToSearch('${p.query}')">${p.label}</button>
          `).join('')}
        </div>

        <!-- Recent Searches -->
        <div class="home-recent" style="margin-top:var(--space-6);">
          <span style="font-size:var(--font-xs);color:var(--text-muted);margin-right:var(--space-2);">Recent:</span>
          ${RecentSearches.map(s => `
            <div class="home-recent__item" onclick="navigateToSearch('${s}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="10"/></svg>
              ${s}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Features Section -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Intelligent Features</h2>
          <span class="badge badge--primary">8 Modules</span>
        </div>
        <div class="features-grid stagger-children">
          ${renderFeatureCard('🔍', 'Natural Language Search', 'Search with everyday language like "beach sunset with friends"')}
          ${renderFeatureCard('🎤', 'Voice Search', 'Speak naturally — powered by OpenAI Whisper integration')}
          ${renderFeatureCard('📅', 'Memory Timeline', 'Relive life events with AI-clustered photo memories')}
          ${renderFeatureCard('😊', 'Emotion Search', 'Find photos by detected emotions — happy, surprised, calm')}
          ${renderFeatureCard('👥', 'Relationship Graph', 'Discover social connections from your photo library')}
          ${renderFeatureCard('🧠', 'Explainable AI', 'Understand why each photo matched your query')}
          ${renderFeatureCard('🎬', 'Highlight Reels', 'Auto-generate memory reels from your best moments')}
          ${renderFeatureCard('🗺️', 'Map View', 'See your photos plotted across the globe')}
        </div>
      </div>

      <!-- Performance Stats -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Performance</h2>
          <span class="badge badge--success">Real-time</span>
        </div>
        <div class="stats-grid stagger-children">
          ${StatsData.stats.map(s => `
            <div class="stat-card">
              <div class="stat-card__icon">${s.icon}</div>
              <div class="stat-card__value">${s.value}</div>
              <div class="stat-card__label">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI Engine Architecture -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">AI Engine</h2>
          <span class="badge badge--primary">On-Device</span>
        </div>
        <div class="ai-modules-grid stagger-children">
          ${renderAIModule('🖼️', 'CLIP', 'Semantic Embeddings')}
          ${renderAIModule('👁️', 'YOLO', 'Object Detection')}
          ${renderAIModule('🔎', 'FAISS', 'Vector Search')}
          ${renderAIModule('⚡', 'FastAPI', 'Backend Engine')}
          ${renderAIModule('💾', 'SQLite', 'Metadata Store')}
          ${renderAIModule('🎙️', 'Whisper', 'Voice Search')}
        </div>
      </div>

      <!-- Sample Gallery -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Your Gallery</h2>
          <button class="section-link" onclick="navigateTo('search')">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        ${renderPhotoGrid(PhotoData.photos.slice(0, 10))}
      </div>
    </div>
  `;
}

function renderFeatureCard(icon, title, desc) {
  return `
    <div class="feature-card">
      <div class="feature-card__icon">${icon}</div>
      <div class="feature-card__title">${title}</div>
      <div class="feature-card__desc">${desc}</div>
    </div>
  `;
}

function renderAIModule(icon, name, desc) {
  return `
    <div class="ai-module-card">
      <div class="ai-module-card__icon">${icon}</div>
      <div class="ai-module-card__name">${name}</div>
      <div class="ai-module-card__desc">${desc}</div>
    </div>
  `;
}
