/* ============================================
   PIXELSEARCH — MAIN APP CONTROLLER
   ============================================ */

// Current state
let currentScreen = 'home';
let currentTheme = 'dark';

/* ---- Theme Management ---- */
function initTheme() {
  const saved = localStorage.getItem('pixelsearch-theme');
  currentTheme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeToggle();
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('pixelsearch-theme', currentTheme);
  updateThemeToggle();

  // Reinit map with new theme tiles
  if (currentScreen === 'maps') {
    setTimeout(() => initMap(), 100);
  }
}

function updateThemeToggle() {
  const toggles = document.querySelectorAll('#theme-toggle-settings');
  toggles.forEach(t => {
    t.checked = currentTheme === 'dark';
  });
}

/* ---- Navigation / Router ---- */
function navigateTo(screenId) {
  if (screenId === currentScreen) return;

  // Hide current screen
  const currentEl = document.getElementById(`screen-${currentScreen}`);
  if (currentEl) {
    currentEl.classList.remove('active');
    currentEl.style.display = 'none';
  }

  // Show target screen
  currentScreen = screenId;
  const targetEl = document.getElementById(`screen-${screenId}`);
  if (targetEl) {
    targetEl.style.display = 'block';
    // Re-trigger animation
    targetEl.style.animation = 'none';
    targetEl.offsetHeight; // Force reflow
    targetEl.style.animation = '';
    targetEl.classList.add('active');
  }

  // Update nav
  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screenId);
  });

  // Screen-specific init
  if (screenId === 'search') initSearchScreen();
  if (screenId === 'maps') setTimeout(() => initMap(), 100);
  if (screenId === 'assistant') initAssistant();
  if (screenId === 'graph') setTimeout(() => initGraph(), 100);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToSearch(query) {
  navigateTo('search');
  setTimeout(() => {
    const input = document.getElementById('search-main-input');
    if (input) {
      input.value = query;
      runSearch(query);
    }
  }, 300);
}

/* ---- App Initialization ---- */
function initApp() {
  initTheme();

  const appContent = document.getElementById('app-content');
  const navContainer = document.getElementById('nav-container');

  if (!appContent || !navContainer) return;

  // Render all screens
  appContent.innerHTML = 
    renderHomeScreen() +
    renderSearchScreen() +
    renderTimelineScreen() +
    renderAssistantScreen() +
    renderGraphScreen() +
    renderMapsScreen() +
    renderReelsScreen() +
    renderSettingsScreen();

  // Render navigation
  navContainer.innerHTML = renderNavbar('home');

  // Bind nav clicks
  document.querySelectorAll('.bottom-nav__item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.screen);
    });
  });

  // Bind home search
  const homeSearch = document.getElementById('home-search-input');
  if (homeSearch) {
    homeSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && homeSearch.value.trim()) {
        navigateToSearch(homeSearch.value);
      }
    });
    homeSearch.addEventListener('focus', () => {
      navigateTo('search');
    });
  }

  // Show home
  navigateTo('home');

  // Handle reels navigation from home feature cards
  document.querySelectorAll('.feature-card').forEach((card, i) => {
    const screens = ['search', 'search', 'timeline', 'search', 'graph', 'search', 'reels', 'maps'];
    card.addEventListener('click', () => {
      navigateTo(screens[i] || 'search');
    });
  });
}

// Launch!
document.addEventListener('DOMContentLoaded', initApp);
