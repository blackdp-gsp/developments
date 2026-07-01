/* ============================================================
   PRAGADEESH HUB — High-Tech Interactive Grid Layer
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

/* ---------------- Load app.json and Populate UI elements ---------------- */
let ALL_APPS = [];

async function loadAppData(){
  try {
    const res = await fetch('app.json', { cache: 'no-store' });
    const data = await res.json();
    
    // Normalize into array format
    ALL_APPS = Array.isArray(data) ? data : [data];

    // Update top hero statistics panel dynamically
    if (document.getElementById('stat-count')) {
      document.getElementById('stat-count').textContent = ALL_APPS.length;
    }
    if (document.getElementById('stat-latest') && ALL_APPS.length > 0) {
      document.getElementById('stat-latest').textContent = 'v' + ALL_APPS[0].version;
    }
    if (document.getElementById('stat-dev') && ALL_APPS.length > 0) {
      document.getElementById('stat-dev').textContent = ALL_APPS[0].developer || "Pragadeesh";
    }

    // Build the beautiful library grid cards
    renderAppGrid(ALL_APPS);
    initSearch();

  } catch (err){
    console.error('Could not load app.json schema parameters', err);
    const grid = document.getElementById('app-grid');
    if (grid) {
      grid.innerHTML = `<p style="color: #ff4d4d; font-family: 'JetBrains Mono'; text-align: center; width: 100%;">Error loading configurations from app.json.</p>`;
    }
  }
}

/* ---------------- Render App Grid Layout Cards ---------------- */
function renderAppGrid(appsList) {
  const grid = document.getElementById('app-grid');
  const emptyMsg = document.getElementById('no-apps-msg');
  const headingIndex = document.getElementById('heading-index');
  
  if (!grid) return;
  grid.innerHTML = ""; // Wipe container clean

  if (appsList.length === 0) {
    if (emptyMsg) emptyMsg.hidden = false;
    if (headingIndex) headingIndex.textContent = `// RUNNING SYSTEMS: 0 ACTIVE`;
    return;
  }

  if (emptyMsg) emptyMsg.hidden = true;
  if (headingIndex) headingIndex.textContent = `// RUNNING SYSTEMS [${appsList.length}]`;

  // Change your app-grid to use standard styling matching your style.css layout options
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(450px, 1fr))";
  grid.style.gap = "30px";

  appsList.forEach((app, index) => {
    // Generate standard 2 letter code for app icon
    const initials = app.appName ? app.appName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AP';

    // Construct the authentic card using your EXACT CSS layout selectors
    const card = document.createElement('div');
    card.className = 'app-card';
    card.id = `app-card-${index}`;
    
    card.innerHTML = `
      <div class="card-corner tl"></div>
      <div class="card-corner tr"></div>
      <div class="card-corner bl"></div>
      <div class="card-corner br"></div>
      
      <div class="card-shine"></div>

      <div class="card-top">
        <div class="app-icon"><span>${initials}</span></div>
        <div class="app-heading">
          <h3>${app.appName}</h3>
          <div class="app-category">${app.category || 'Utility'}</div>
        </div>
        <div class="status-pill">
          <span class="status-dot"></span> SECURE
        </div>
      </div>

      <p class="app-details">${app.details || ''}</p>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Version</span>
          <span class="meta-value">${app.version}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">File Size</span>
          <span class="meta-value">${app.size}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Released</span>
          <span class="meta-value">${app.releaseDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Developer</span>
          <span class="meta-value">${app.developer}</span>
        </div>
      </div>

      <div class="card-actions">
        <button class="download-btn" data-url="${app.url}">
          <div class="btn-progress"></div>
          <span class="btn-icon">⬇</span>
          <span class="btn-label">DOWNLOAD APK</span>
        </button>
        
        <div class="url-display">
          <span class="url-dot"></span>
          <span class="url-text" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${app.url}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
    wireCardDownload(card.querySelector('.download-btn'), app);
    initCardTiltEffect(card);
  });
}

/* ---------------- Authentic 3D Tilt & Mouse Shine Effect ---------------- */
function initCardTiltEffect(card) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const maxTilt = 5;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotY = (px - 0.5) * maxTilt * 2;
    const rotX = (0.5 - py) * maxTilt * 2;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.setProperty('--mx', `${px * 100}%`);
    card.style.setProperty('--my', `${py * 100}%`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}

/* ---------------- Wire Card Download Mechanics ---------------- */
function wireCardDownload(btn, appData) {
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.classList.contains('downloading')) return;
    btn.classList.add('downloading');
    
    const label = btn.querySelector('.btn-label');
    if (label) label.textContent = 'CONNECTING...';

    const link = document.createElement('a');
    link.href = appData.url;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      if (label) label.textContent = 'PACKET SHIPPED';
      setTimeout(() => {
        btn.classList.remove('downloading');
        if (label) label.textContent = 'DOWNLOAD APK';
      }, 1600);
    }, 1200);
  });
}

/* ---------------- Live Interactive Input Filter Search ---------------- */
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
