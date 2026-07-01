/* ============================================================
   PRAGADEESH HUB — Interactive Layout Layer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  loadAppData();
});

/* ---------------- animated tech grid backdrop ---------------- */
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

/* ---------------- load app.json and populate UI elements ---------------- */
let ALL_APPS = [];

async function loadAppData(){
  try {
    const res = await fetch('app.json', { cache: 'no-store' });
    const data = await res.json();
    
    // Normalize into array format if it's a single object or an array
    ALL_APPS = Array.isArray(data) ? data : [data];

    // Update top hero statistics panel dynamically
    if (document.getElementById('stat-count')) {
      document.getElementById('stat-count').textContent = ALL_APPS.length;
    }
    if (document.getElementById('stat-latest') && ALL_APPS.length > 0) {
      document.getElementById('stat-latest').textContent = ALL_APPS[0].version;
    }
    if (document.getElementById('stat-dev') && ALL_APPS.length > 0) {
      document.getElementById('stat-dev').textContent = ALL_APPS[0].developer;
    }

    // Build the library grid cards
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
  grid.innerHTML = ""; // Wipe container clear

  if (appsList.length === 0) {
    if (emptyMsg) emptyMsg.hidden = false;
    if (headingIndex) headingIndex.textContent = `// COLLECTION RESULT: 0 FOUND`;
    return;
  }

  if (emptyMsg) emptyMsg.hidden = true;
  if (headingIndex) headingIndex.textContent = `// RUNNING SYSTEMS [${appsList.length}]`;

  appsList.forEach((app, index) => {
    // Generate standard 2 letter code for app icon
    const initials = app.appName ? app.appName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AP';

    // Construct the customized theme block
    const card = document.createElement('div');
    card.className = 'app-card';
    card.id = `app-card-${index}`;
    card.style.cssText = "background: rgba(10, 11, 16, 0.65); border: 1px solid rgba(77, 243, 255, 0.15); padding: 24px; border-radius: 8px; transition: all 0.3s ease; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;";
    
    card.innerHTML = `
      <div>
        <div class="app-icon" style="width: 48px; height: 48px; background: rgba(138, 91, 255, 0.15); border: 1px solid rgba(138, 91, 255, 0.4); display: flex; align-items: center; justify-content: center; border-radius: 6px; font-family: 'Orbitron'; font-weight: bold; color: #8a5bff; margin-bottom: 16px;">
          <span>${initials}</span>
        </div>
        <div class="app-category" style="font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #8a5bff; text-transform: uppercase; tracking-letter: 1px; margin-bottom: 4px;">${app.category || 'Utility'}</div>
        <h3 class="app-name" style="font-family: 'Orbitron'; font-size: 1.35rem; font-weight: 700; color: #fff; margin: 0 0 12px 0;">${app.appName}</h3>
        <p class="app-details" style="font-family: 'Space Grotesk'; font-size: 0.9rem; color: #a0a5b5; line-height: 1.5; margin: 0 0 20px 0;">${app.details || ''}</p>
      </div>

      <div>
        <div class="meta-spec-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #4df3ff; margin-bottom: 16px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 4px; border-left: 2px solid #4df3ff;">
          <div>VER: <span style="color:#fff;">${app.version}</span></div>
          <div>SIZE: <span style="color:#fff;">${app.size}</span></div>
          <div style="grid-column: 1 / -1; margin-top: 4px;">RELEASED: <span style="color:#fff;">${app.releaseDate}</span></div>
        </div>

        <button class="download-btn" style="width: 100%; background: transparent; border: 1px solid #4df3ff; color: #4df3ff; padding: 12px; font-family: 'Orbitron'; font-weight: bold; cursor: pointer; transition: all 0.2s ease; border-radius: 4px;" data-url="${app.url}">
          <span class="btn-label">DOWNLOAD APK</span>
        </button>
      </div>
    `;

    grid.appendChild(card);
    wireCardDownload(card.querySelector('.download-btn'), app);
  });
}

/* ---------------- wire card download mechanics ---------------- */
function wireCardDownload(btn, appData) {
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.classList.contains('downloading')) return;
    btn.classList.add('downloading');
    
    const label = btn.querySelector('.btn-label');
    if (label) label.textContent = 'INITIATING LINK...';

    const link = document.createElement('a');
    link.href = appData.url;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      if (label) label.textContent = 'DOWNLOAD STARTED';
      setTimeout(() => {
        btn.classList.remove('downloading');
        if (label) label.textContent = 'DOWNLOAD APK';
      }, 1600);
    }, 1200);
  });
}

/* ---------------- live interactive input search matrix ---------------- */
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
