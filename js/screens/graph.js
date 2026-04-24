/* ============================================
   PIXELSEARCH — RELATIONSHIP GRAPH SCREEN
   ============================================ */

function renderGraphScreen() {
  return `
    <div class="screen" id="screen-graph" style="display:none;">
      <div style="margin-bottom:var(--space-6);">
        <h2 style="font-size:var(--font-xl);font-weight:var(--font-bold);margin-bottom:var(--space-2);">
          <span class="text-gradient">Relationship Graph</span>
        </h2>
        <p style="font-size:var(--font-sm);color:var(--text-tertiary);">Social connections discovered from your photo library</p>
      </div>

      <div class="graph-container" id="graph-canvas-container">
        <canvas id="relationship-canvas"></canvas>
      </div>

      <!-- Graph Legend -->
      <div style="display:flex;gap:var(--space-4);flex-wrap:wrap;margin-top:var(--space-4);justify-content:center;">
        <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);color:var(--text-tertiary);">
          <span style="width:10px;height:10px;border-radius:50%;background:var(--primary-500);display:inline-block;"></span>
          You
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);color:var(--text-tertiary);">
          <span style="width:10px;height:10px;border-radius:50%;background:var(--accent-500);display:inline-block;"></span>
          Friends
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);color:var(--text-tertiary);">
          <span style="width:10px;height:10px;border-radius:50%;background:#EF4444;display:inline-block;"></span>
          Family
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-xs);color:var(--text-tertiary);">
          Line thickness = connection strength
        </div>
      </div>

      <!-- Insights -->
      <div class="section" style="margin-top:var(--space-8);">
        <div class="section-header">
          <h3 class="section-title">Top Connections</h3>
          <span class="badge badge--primary">${GraphData.people.length - 1} people</span>
        </div>
        <div class="graph-insights stagger-children">
          ${GraphData.insights.map(insight => `
            <div class="graph-insight-card">
              <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
                <span style="font-size:var(--font-lg);">${insight.icon}</span>
                <div class="graph-insight-card__name">${insight.name}</div>
              </div>
              <div class="graph-insight-card__stat">${insight.stat}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initGraph() {
  const canvas = document.getElementById('relationship-canvas');
  if (!canvas) return;

  const container = document.getElementById('graph-canvas-container');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = rect.height;

  // Animation state
  let animProgress = 0;
  let hoveredNode = null;

  // Precompute positions
  const nodes = GraphData.people.map(p => ({
    ...p,
    px: p.x * W,
    py: p.y * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));

  function getNode(id) {
    return nodes.find(n => n.id === id);
  }

  // Handle hover
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    hoveredNode = null;
    for (const node of nodes) {
      const dx = mx - node.px;
      const dy = my - node.py;
      if (Math.sqrt(dx*dx + dy*dy) < node.radius + 5) {
        hoveredNode = node;
        canvas.style.cursor = 'pointer';
        break;
      }
    }
    if (!hoveredNode) canvas.style.cursor = 'default';
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    animProgress = Math.min(animProgress + 0.02, 1);

    // Gentle motion
    nodes.forEach(node => {
      node.px += node.vx;
      node.py += node.vy;

      // Bounce off edges
      if (node.px < node.radius || node.px > W - node.radius) node.vx *= -1;
      if (node.py < node.radius || node.py > H - node.radius) node.vy *= -1;

      // Damping
      node.vx *= 0.999;
      node.vy *= 0.999;
    });

    // Draw connections
    GraphData.connections.forEach(conn => {
      const from = getNode(conn.from);
      const to = getNode(conn.to);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.px, from.py);
      ctx.lineTo(to.px, to.py);
      ctx.strokeStyle = `rgba(124, 58, 237, ${conn.strength * 0.3 * animProgress})`;
      ctx.lineWidth = conn.strength * 3;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node;
      const r = isHovered ? node.radius * 1.3 : node.radius;

      // Glow
      if (node.id === 'you' || isHovered) {
        const gradient = ctx.createRadialGradient(node.px, node.py, r, node.px, node.py, r * 2.5);
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, `${node.color}00`);
        ctx.beginPath();
        ctx.arc(node.px, node.py, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(node.px, node.py, r * animProgress, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Border
      ctx.beginPath();
      ctx.arc(node.px, node.py, r * animProgress, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Name label
      if (animProgress > 0.5) {
        ctx.font = `${isHovered ? '600' : '500'} ${isHovered ? 13 : 11}px Inter, sans-serif`;
        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.8)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.px, node.py + r + 16);

        // Photo count on hover
        if (isHovered) {
          ctx.font = '400 10px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText(`${node.photos} photos`, node.px, node.py + r + 30);
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw();
}
