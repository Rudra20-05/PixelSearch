/* ============================================
   PIXELSEARCH — SEARCH BAR COMPONENT
   ============================================ */

function renderSearchBar(placeholder = 'Describe any photo…', id = 'main-search') {
  return `
    <div class="search-bar" id="${id}">
      <svg class="search-bar__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
      </svg>
      <input type="text" class="search-bar__input" placeholder="${placeholder}" id="${id}-input" autocomplete="off" />
      <button class="search-bar__mic mic-pulse" id="${id}-mic" title="Voice search">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </button>
    </div>
  `;
}
