/* ============================================
   PIXELSEARCH — HIGHLIGHT REELS SCREEN
   ============================================ */

function renderReelsScreen() {
  return `
    <div class="screen" id="screen-reels" style="display:none;">
      <div style="margin-bottom:var(--space-6);">
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);margin-bottom:var(--space-2);">
          <span class="text-gradient">Highlight Reels</span>
        </h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">AI-generated memory reels from your best moments</p>
      </div>

      <!-- Category Filter -->
      <div class="chips-scroll" style="margin-bottom:var(--space-5);">
        <button class="chip chip--active">All</button>
        <button class="chip">Trips</button>
        <button class="chip">Festivals</button>
        <button class="chip">People</button>
        <button class="chip">Nature</button>
        <button class="chip">Adventures</button>
      </div>

      <!-- Reels Carousel -->
      <div class="reels-carousel">
        ${ReelsData.reels.map(reel => `
          <div class="reel-card">
            <img class="reel-card__cover" src="${reel.cover}" alt="${reel.title}" loading="lazy" />
            <div class="reel-card__overlay">
              <span class="badge badge--primary" style="align-self:flex-start;margin-bottom:var(--space-2);">${reel.category}</span>
              <div class="reel-card__title">${reel.title}</div>
              <div class="reel-card__meta">${reel.subtitle}</div>
            </div>
            <div class="reel-card__play">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Featured Reel -->
      <div class="section" style="margin-top:var(--space-8);">
        <div class="section-header">
          <h3 class="section-title">Featured Memory</h3>
          <span class="badge badge--warning">✨ AI Pick</span>
        </div>
        <div class="glass-card" style="padding:0;overflow:hidden;">
          <div style="position:relative;">
            <img src="${ReelsData.reels[0].cover}" alt="Featured reel" style="width:100%;height:220px;object-fit:cover;" />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 60%);display:flex;flex-direction:column;justify-content:flex-end;padding:var(--space-6);">
              <div style="font-size:var(--font-xl);font-weight:var(--font-bold);color:white;margin-bottom:var(--space-2);">${ReelsData.reels[0].title}</div>
              <div style="font-size:var(--font-sm);color:rgba(255,255,255,0.7);margin-bottom:var(--space-4);">An AI-curated collection of your best beach memories from December 2023</div>
              <div style="display:flex;gap:var(--space-3);">
                <button class="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Play Reel
                </button>
                <button class="btn btn-secondary" style="border-color:rgba(255,255,255,0.2);color:white;">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Your Own -->
      <div class="create-reel-cta" onclick="showReelCreator()">
        <div class="create-reel-cta__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14"/>
            <path d="M5 12h14"/>
          </svg>
        </div>
        <div class="create-reel-cta__title">Create Memory Reel</div>
        <div class="create-reel-cta__desc">AI will automatically select your best photos and create a beautiful recap</div>
      </div>

      <!-- Reel Stats -->
      <div class="section" style="margin-top:var(--space-8);">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon">🎬</div>
            <div class="stat-card__value">6</div>
            <div class="stat-card__label">Reels Created</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">📸</div>
            <div class="stat-card__value">847</div>
            <div class="stat-card__label">Photos Used</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">⏱️</div>
            <div class="stat-card__value">12m</div>
            <div class="stat-card__label">Total Duration</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">❤️</div>
            <div class="stat-card__value">24</div>
            <div class="stat-card__label">Favorites</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showReelCreator() {
  // Mock reel creation animation
  const cta = document.querySelector('.create-reel-cta');
  if (cta) {
    cta.innerHTML = `
      <div class="create-reel-cta__icon" style="animation: pulseGlow 1.5s infinite;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 2s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
      <div class="create-reel-cta__title">Creating your reel...</div>
      <div class="create-reel-cta__desc">
        <div class="progress-bar" style="width:200px;margin:var(--space-3) auto 0;">
          <div class="progress-bar__fill" style="width:0%;animation: progressFill 3s ease forwards;"></div>
        </div>
      </div>
    `;

    // Add progress fill animation
    const style = document.createElement('style');
    style.textContent = `@keyframes progressFill { to { width: 100%; } }`;
    document.head.appendChild(style);

    setTimeout(() => {
      cta.innerHTML = `
        <div class="create-reel-cta__icon" style="background:var(--success);">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div class="create-reel-cta__title">Reel Created! 🎉</div>
        <div class="create-reel-cta__desc">Your "Best of 2023" reel is ready to play</div>
        <button class="btn btn-primary mt-4">View Reel</button>
      `;
    }, 3500);
  }
}
