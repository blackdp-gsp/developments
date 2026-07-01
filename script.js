/* ============================================================
   PRAGADEESH HUB — Interactive Application Grid Layer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  loadAppData();
});

/* ---------------- Animated Tech Grid Backdrop ---------------- */
function initGridCanvas(){
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const spacing = 46;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(){
    ctx.clearRect(0, 0, w, h);
    const horizon = h * 0.55;

    ctx.strokeStyle = 'rgba(77,243,255,0.10)';
    ctx.lineWidth = 1;

    for (let x = -w; x < w * 2; x += spacing){
      const shift = reduceMotion ? 0 : (t * 0.4) % spacing;
      ctx.beginPath();
      ctx.moveTo(x + shift, h);
      ctx.lineTo(w / 2 + (x + shift - w / 2) * 0.06, horizon);
      ctx.stroke();
    }
    const rows = 18;
    for (let i = 0; i <= rows; i++){
      const p = i / rows;
      const y = h - (h - horizon) * Math.pow(p, 1.7);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(138,91,255,0.5)';
    for (let i = 0; i < 40; i++){
      const seed = i * 137.5;
      const x = (seed * 3.1 + t * 0.05) % w;
      const y = (seed * 1.7) % horizon;
      const r = (Math.sin(seed) + 1) * 0.6;
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(t * 0.01 + i);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion){
      t += 1;
      requestAnimationFrame(draw);
    }
  }
  draw();
}

/* ---------------- Load app.json and Populate UI Grid ---------------- */
let ALL_APPS = [];

async function loadAppData(){
  try {
    const res = await fetch('app.json', { cache: 'no-store' });
    const data = await res.json();
    
    // Normalize into array format if it isn't already
    ALL_APPS = Array.isArray(data) ? data : [data];

    // 1. Populate global top hero statistics[cite: 1]
    if(document.getElementById('stat-count')) {
      document.getElementById('stat-count').textContent = ALL_APPS.length;
    }
    if(document.getElementById('stat-latest') && ALL_APPS.length > 0) {
      document.getElementById('stat-latest').textContent = ALL_APPS[0].appName;
    }
    if(document.getElementById('stat-dev') && ALL_APPS.length > 0) {
      document.getElementById('stat-dev').textContent = ALL_APPS[0].developer || "Pragadeesh";
    }

    // 2. Render all apps inside the grid container[cite: 1]
    renderAppGrid(ALL_APPS);
    initSearch();

  } catch (err){
    console.error('Could not load app.json data structure', err);
    const grid = document.getElementById('app-grid');
    if (grid) {
      grid.innerHTML = `<p class="error-msg" style="color: #ff4d4d; font-family: 'JetBrains Mono'; grid-column: 1/-1; text-align: center;">CRITICAL ERROR: Failed to load application library data configuration.</p>`;
    }
  }
}

/* ---------------- Build Cards Dynamically ---------------- */
function renderAppGrid(appsList) {
  const grid = document.getElementById('app-grid');
  const emptyMsg = document.getElementById('no-apps-msg');
  const headingIndex = document.getElementById('heading-index');
  
  if (!grid) return;
  grid.innerHTML = ""; // Clear existing elements

  if (appsList.length === 0) {
    if (emptyMsg) emptyMsg.hidden = false;
    if (headingIndex) headingIndex.textContent = `// INDEX RESULT: 0 FOUND`;
    return;
  }

  if (emptyMsg) emptyMsg.hidden = true;
  if (headingIndex) headingIndex.textContent = `// RUNNING SYSTEMS [${appsList.length}]`;

  appsList.forEach((app, index) => {
    // Generate two-letter badge initials based on App Name
    const initials = app.appName ? app.appName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'APP';

    // Construct cyberpunk styled card layout matching your dashboard UI
    const card = document.createElement('div');
    card.className = 'app-card';
    card.id = `card-${index}`;
    card.innerHTML = `
      <div class="app-icon"><span>${initials}</span></div>
      <div class="app-category">${app.category || 'Utility'}</div>
      <h3 class="app-name" style="font-family: 'Orbitron'; margin: 0.5rem 0; color: #fff;">${app.appName}</h3>
      <p class="app-details" style="font-family: 'Space Grotesk'; font-size: 0.9rem; color: #a0a5b5; margin-bottom: 1.2rem; line-height: 1.4;">${app.details || ''}</p>
      
      <div class="meta-spec-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #4df3ff; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
        <div>VER: <span style="color:#fff;">${app.version}</span></div>
        <div>SIZE: <span style="color:#fff;">${app.size}</span></div>
        <div style="grid-column: 1 / -1;">REL: <span style="color:#fff;">${app.releaseDate}</span></div>
      </div>

      <button class="download-btn" style="width: 100%;" data-url="${app.url}">
        <span class="btn-label">DOWNLOAD APK</span>
      </button>
    `;

    grid.appendChild(card);
    wireCardDownload(card.querySelector('.download-btn'), app);
    applyTiltEffect(card);
  });
}

/* ---------------- Micro-interactions for Download Targets ---------------- */
function wireCardDownload(btn, appData) {
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.classList.contains('downloading')) return;
    btn.classList.add('downloading');
    
    const label = btn.querySelector('.btn-label');
    const originalText = label ? label.textContent : 'DOWNLOAD APK';
    if (label) label.textContent = 'CONNECTING...';

    const link = document.createElement('a');
    link.href = appData.url;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      if (label) label.textContent = 'PACKET RECEIVED';
      setTimeout(() => {
        btn.classList.remove('downloading');
        if (label) label.textContent = originalText;
      }, 1600);
    }, 1200);
  });
}

/* ---------------- Live Filter Matrix Search ---------------- */
function initSearch(){
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    
    const filtered = ALL_APPS.filter(app => 
      (app.appName && app.appName.toLowerCase().includes(query)) || 
      (app.category && app.category.toLowerCase().includes(query)) ||
      (app.details && app.details.toLowerCase().includes(query))
    );

    renderAppGrid(filtered);
  });
}

/* ---------------- Mouse Tracking Hover Effect ---------------- */
function applyTiltEffect(card) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 10;
    const rotX = (0.5 - py) * 10;

    card.style.transform = `perspective(1000px) rotateX(${Normally I can help with things like this, but I don't seem to have access to that content. You can try again or ask me for something else.
