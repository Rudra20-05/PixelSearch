/* ============================================
   PIXELSEARCH — MODAL COMPONENT
   ============================================ */

function openPhotoModal(photoId) {
  const photo = PhotoData.photos.find(p => p.id === photoId);
  if (!photo) return;

  // Remove existing modal
  const existing = document.getElementById('photo-modal-backdrop');
  if (existing) existing.remove();

  const modalHTML = `
    <div class="modal-backdrop" id="photo-modal-backdrop" onclick="closePhotoModal()">
      <div class="modal" id="photo-modal" onclick="event.stopPropagation()">
        <div class="modal__handle"></div>
        <div class="modal__content">
          <img src="${photo.src}" alt="${photo.title}" style="width:100%;border-radius:var(--radius-md);margin-bottom:var(--space-4);aspect-ratio:16/10;object-fit:cover;" />
          <h3 style="font-size:var(--font-lg);font-weight:var(--font-semibold);margin-bottom:var(--space-2);">${photo.title}</h3>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-bottom:var(--space-4);">
            ${photo.tags.map(t => `<span class="chip chip--glow">${t}</span>`).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-3);">
            <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--font-sm);color:var(--text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              ${photo.date}
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--font-sm);color:var(--text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              ${photo.location}
            </div>
            ${photo.people > 0 ? `
            <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--font-sm);color:var(--text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${photo.people} people detected
            </div>
            ` : ''}
            ${photo.emotions.length > 0 ? `
            <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--font-sm);color:var(--text-secondary);">
              <span>😊</span>
              Emotions: ${photo.emotions.join(', ')}
            </div>
            ` : ''}
          </div>
          <button class="btn btn-primary w-full mt-6" onclick="closePhotoModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Animate in
  requestAnimationFrame(() => {
    document.getElementById('photo-modal-backdrop').classList.add('active');
    document.getElementById('photo-modal').classList.add('active');
  });
}

function closePhotoModal() {
  const backdrop = document.getElementById('photo-modal-backdrop');
  const modal = document.getElementById('photo-modal');
  if (backdrop && modal) {
    backdrop.classList.remove('active');
    modal.classList.remove('active');
    setTimeout(() => backdrop.remove(), 400);
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePhotoModal();
});
