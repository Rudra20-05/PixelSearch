/* ============================================
   PIXELSEARCH — PHOTO CARD COMPONENT
   ============================================ */

function renderPhotoCard(photo, confidence = null) {
  const confValue = confidence || Math.floor(Math.random() * 15 + 80);
  return `
    <div class="photo-card" data-photo-id="${photo.id}" onclick="openPhotoModal(${photo.id})">
      <img class="photo-card__image" src="${photo.src}" alt="${photo.title}" loading="lazy" />
      ${confidence !== null ? `<span class="photo-card__confidence">${confValue}%</span>` : ''}
      <div class="photo-card__overlay">
        <div style="color: white; font-size: var(--font-sm); font-weight: var(--font-semibold);">${photo.title}</div>
        <div class="photo-card__tags">
          ${photo.tags.slice(0, 3).map(t => `<span class="photo-card__tag">${t}</span>`).join('')}
        </div>
        <div class="photo-card__meta">${photo.date} · ${photo.location}</div>
      </div>
    </div>
  `;
}

function renderPhotoGrid(photos, withConfidence = false) {
  return `
    <div class="photo-grid stagger-children">
      ${photos.map(p => renderPhotoCard(p, withConfidence ? Math.floor(Math.random() * 15 + 80) : null)).join('')}
    </div>
  `;
}
