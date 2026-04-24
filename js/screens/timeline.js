/* ============================================
   PIXELSEARCH — MEMORY TIMELINE SCREEN
   ============================================ */

function renderTimelineScreen() {
  return `
    <div class="screen" id="screen-timeline">
      <div style="margin-bottom:var(--space-6);">
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);margin-bottom:var(--space-2);">
          <span class="text-gradient">Memory Timeline</span>
        </h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">Your life events, beautifully organized by AI</p>
      </div>

      ${renderSearchBar('Search memories… e.g. "Goa memories"', 'timeline-search')}

      <div style="margin-top:var(--space-6);">
        <!-- Year Label -->
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-6);">
          <span style="font-size:var(--font-lg);font-weight:var(--font-bold);color:var(--primary-400);">2024</span>
          <div style="flex:1;height:1px;background:var(--border-subtle);"></div>
        </div>

        <div class="timeline-container">
          ${TimelineData.events.map((event, i) => {
            // Insert year divider before 2023 events
            let yearDivider = '';
            if (i === 2) {
              yearDivider = `
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-3);margin:var(--space-8) 0 var(--space-6);">
                  <span style="font-size:var(--font-lg);font-weight:var(--font-bold);color:var(--accent-400);">2023</span>
                  <div style="flex:1;height:1px;background:var(--border-subtle);"></div>
                </div>
                <div class="timeline-container">
              `;
            }
            return `${yearDivider}${renderTimelineEvent(event)}`;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTimelineEvent(event) {
  const photos = event.photos.map(i => PhotoData.photos[i]).filter(Boolean);

  return `
    <div class="timeline-event">
      <div class="timeline-event__dot" style="box-shadow: 0 0 0 3px ${event.color}33;"></div>
      <div class="timeline-event__date">${event.icon} ${event.date}</div>
      <div class="timeline-event__card">
        <div class="timeline-event__title">${event.title}</div>
        <div class="timeline-event__desc">${event.description}</div>
        <div class="timeline-event__photos">
          ${photos.map(p => `
            <img class="timeline-event__photo" src="${p.src}" alt="${p.title}" onclick="openPhotoModal(${p.id})" />
          `).join('')}
        </div>
        <div class="timeline-event__count">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          ${event.photoCount} photos in this event
        </div>
      </div>
    </div>
  `;
}
