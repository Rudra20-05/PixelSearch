/* ============================================
   PIXELSEARCH — MAP VIEW SCREEN
   ============================================ */

function renderMapsScreen() {
  return `
    <div class="screen" id="screen-maps">
      <div style="margin-bottom:var(--space-6);">
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);margin-bottom:var(--space-2);">
          <span class="text-gradient">Photo Map</span>
        </h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">Your memories plotted across the globe</p>
      </div>

      <div class="map-container" id="leaflet-map"></div>

      <!-- Location Cards -->
      <div class="section" style="margin-top:var(--space-6);">
        <div class="section-header">
          <h3 class="section-title">Travel Locations</h3>
          <span class="badge badge--primary">${MapData.locations.length} places</span>
        </div>
        <div class="map-locations">
          ${MapData.locations.map(loc => `
            <div class="map-location-card" onclick="flyToLocation(${loc.lat}, ${loc.lng})">
              <img class="map-location-card__image" src="${loc.image}" alt="${loc.name}" loading="lazy" />
              <div class="map-location-card__info">
                <div class="map-location-card__name">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:4px;color:var(--primary-400);">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  ${loc.name}
                </div>
                <div class="map-location-card__count">${loc.photos} photos</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Travel Stats -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Travel Summary</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon">🗺️</div>
            <div class="stat-card__value">5</div>
            <div class="stat-card__label">Locations</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">📸</div>
            <div class="stat-card__value">604</div>
            <div class="stat-card__label">Geotagged Photos</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">✈️</div>
            <div class="stat-card__value">12</div>
            <div class="stat-card__label">Trips</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">📅</div>
            <div class="stat-card__value">2023</div>
            <div class="stat-card__label">Most Active Year</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

let leafletMap = null;

function initMap() {
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Initialize map centered on India
  leafletMap = L.map('leaflet-map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([19.5, 74.5], 6);

  // Add tile layer with dark style
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  L.tileLayer(tileUrl, {
    maxZoom: 18,
  }).addTo(leafletMap);

  // Add zoom control to top right
  L.control.zoom({ position: 'topright' }).addTo(leafletMap);

  // Add markers
  MapData.locations.forEach(loc => {
    const marker = L.circleMarker([loc.lat, loc.lng], {
      radius: Math.min(loc.photos / 10 + 6, 20),
      fillColor: '#7C3AED',
      color: '#fff',
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.7,
    }).addTo(leafletMap);

    marker.bindPopup(`
      <div class="map-popup">
        <img src="${loc.image}" alt="${loc.name}" />
        <h4>${loc.name}</h4>
        <p>${loc.photos} photos</p>
      </div>
    `, { className: 'custom-popup' });
  });

  // Draw travel path
  const pathCoords = MapData.locations.map(l => [l.lat, l.lng]);
  L.polyline(pathCoords, {
    color: '#7C3AED',
    weight: 2,
    opacity: 0.4,
    dashArray: '8, 8',
  }).addTo(leafletMap);

  // Fix map rendering after tab switch
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 300);
}

function flyToLocation(lat, lng) {
  if (leafletMap) {
    leafletMap.flyTo([lat, lng], 11, { duration: 1.5 });
  }
}
