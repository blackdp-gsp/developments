/* ============================================================
   NOVA CORE HUB — interactive layer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  initCardTilt();
  loadAppData();
  initSearch();
});

/* ---------------- animated tech grid backdrop ---------------- */
function initGridCanvas(){
  const canvas = document.getElementById('grid-canvas');
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

    // perspective floor grid
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

    // faint dot field above horizon
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

/* ---------------- 3D tilt on the app card ---------------- */
function initCardTilt(){
  const card = document.getElementById('app-card');
  if (!card) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const maxTilt = 6;

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

/* ---------------- load app.json and populate UI ---------------- */
let APP_DATA = null;

async function loadAppData(){
  try {
    const res = await fetch('app.json', { cache: 'no-store' });
    const data = await res.json();
    APP_DATA = data;
    renderAppData(data);
  } catch (err){
    console.error('Could not load app.json', err);
    document.getElementById('app-details').textContent =
      'Application data could not be loaded. Please check that app.json is present.';
  }
}

function renderAppData(data){
  document.getElementById('stat-version').textContent = 'v' + data.version;
  document.getElementById('stat-size').textContent = data.size;
  document.getElementById('stat-dev').textContent = data.developer;

  document.getElementById('app-name').textContent = data.appName;
  document.getElementById('app-category').textContent = data.category;
  document.getElementById('app-details').textContent = data.details;

  document.getElementById('meta-version').textContent = data.version;
  document.getElementById('meta-size').textContent = data.size;
  document.getElementById('meta-date').textContent = data.releaseDate;
  document.getElementById('meta-developer').textContent = data.developer;

  document.getElementById('url-text').textContent = data.url;

  const icon = document.querySelector('.app-icon span');
  if (icon){
    const initials = data.appName.split(' ').map(w => w[0]).join('').slice(0, 2);
    icon.textContent = initials.toUpperCase();
  }

  wireDownloadButton(data);
}

/* ---------------- download button ---------------- */
function wireDownloadButton(data){
  const btn = document.getElementById('download-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (btn.classList.contains('downloading')) return;
    btn.classList.add('downloading');
    const label = btn.querySelector('.btn-label');
    const originalLabel = label.textContent;
    label.textContent = 'INITIATING...';

    // Trigger the actual file download from the URL in app.json
    const link = document.createElement('a');
    link.href = data.url;
    link.download = '';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      label.textContent = 'DOWNLOAD STARTED';
      setTimeout(() => {
        btn.classList.remove('downloading');
        label.textContent = originalLabel;
      }, 1600);
    }, 1200);
  });
}

/* ---------------- search bar ---------------- */
function initSearch(){
  const input = document.getElementById('search-input');
  if (!input) return;

  const toast = document.createElement('div');
  toast.className = 'no-result-toast';
  toast.textContent = 'No matches — showing primary build';
  document.body.appendChild(toast);

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    if (APP_DATA && (APP_DATA.appName.toLowerCase().includes(q) || APP_DATA.category.toLowerCase().includes(q))){
      document.getElementById('app-section').scrollIntoView({ behavior: 'smooth' });
      flashCard();
    } else {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 1800);
    }
  });
}

function flashCard(){
  const card = document.getElementById('app-card');
  card.style.boxShadow = '0 0 0 1px rgba(77,243,255,0.6), 0 20px 70px rgba(77,243,255,0.25)';
  setTimeout(() => { card.style.boxShadow = ''; }, 900);
}
