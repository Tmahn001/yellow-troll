(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Basic config – replace these when you have real addresses/links
  const CONFIG = {
    contract: $('#contractAddress')?.dataset.address || '0x82cab245d74fdaffe3a010ee6c7f31241e304444',
    dexscreener: 'https://dexscreener.com/bsc/0x82cab245d74fdaffe3a010ee6c7f31241e304444',
    dextools: 'https://www.dextools.io/app/en/bnb',
    trade: 'https://pancakeswap.finance/swap',
    x: 'https://x.com/yellowtrollbsc',
  };

  // Wire external links
  const linkMap = [
    ['#dexscreenerLink', CONFIG.dexscreener],
    ['#dextoolsLink', CONFIG.dextools],
    ['#tradeLink', CONFIG.trade],
    ['#xLink', CONFIG.x],
    ['#xHeroLink', CONFIG.x],
    ['#bscscanLink', `https://bscscan.com/token/${CONFIG.contract}`],
  ];
  linkMap.forEach(([id, href]) => { const el = $(id); if (el && href) el.href = href; });

  // Contract address text
  const contractEl = $('#contractAddress');
  if (contractEl) contractEl.textContent = CONFIG.contract;

  // Preloader
  window.addEventListener('load', () => {
    setTimeout(() => { $('#preloader')?.classList.add('hidden'); }, 450);
  });

  // Smooth scroll for header nav (explicit for older browsers without CSS support)
  $$('.nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Dark theme removed

  // Copy contract
  const copyBtn = $('#copyAddress');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.contract);
        toast('Contract copied');
      } catch (e) {
        toast('Copy failed');
      }
    });
  }

  // Small copy button inside contract box
  const copyMini = $('#copyMini');
  if (copyMini) {
    copyMini.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.contract);
        toast('Copied');
      } catch (_) { toast('Copy failed'); }
    });
  }

  // Add to wallet (MetaMask)
  const addToWalletBtn = $('#addToWallet');
  if (addToWalletBtn) {
    addToWalletBtn.addEventListener('click', async () => {
      if (!(window.ethereum && window.ethereum.request)) return toast('Wallet not detected');
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: CONFIG.contract,
              symbol: 'RER',
              decimals: 18,
              image: location.origin + '/dexscreener.webp',
            },
          },
        });
      } catch (e) {
        toast('Add failed');
      }
    });
  }

  // Confetti
  const confettiBtn = $('#confettiBtn');
  if (confettiBtn) confettiBtn.addEventListener('click', () => confettiBurst());

  // Simple toast
  function toast(text) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111;color:#ffd100;padding:10px 14px;border-radius:12px;border:2px solid #ffd100;font-weight:800;z-index:200;opacity:0;transition:opacity .2s';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    setTimeout(() => el && (el.style.opacity = '0'), 1400);
  }

  // Canvas ambient orbs
  const canvas = $('#orbCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const size = 600;
    canvas.width = size * DPR; canvas.height = size * DPR; canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
    ctx.scale(DPR, DPR);
    const orbs = Array.from({ length: 16 }).map((_, i) => ({
      r: 20 + Math.random() * 80,
      x: 300 + Math.cos(i) * (120 + Math.random() * 60),
      y: 300 + Math.sin(i) * (120 + Math.random() * 60),
      sp: 0.3 + Math.random() * 0.8,
      hue: 46 + Math.random() * 12,
    }));
    let t = 0;
    function draw() {
      t += 0.01;
      ctx.clearRect(0, 0, size, size);
      orbs.forEach((o, i) => {
        const k = i * 0.6 + t * o.sp;
        const x = 300 + Math.cos(k) * (160 + Math.sin(t + i) * 30);
        const y = 300 + Math.sin(k) * (160 + Math.cos(t + i) * 30);
        const grd = ctx.createRadialGradient(x, y, 0, x, y, o.r);
        grd.addColorStop(0, `hsla(${o.hue},100%,65%,0.55)`);
        grd.addColorStop(1, 'hsla(46,100%,50%,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, o.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Scroll reveal using IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // Lightweight confetti implementation
  function confettiBurst() {
    const N = 120;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
      const s = document.createElement('span');
      const size = 6 + Math.random() * 8;
      s.style.cssText = `position:fixed;left:${50 + (Math.random() * 20 - 10)}%;top:10%;width:${size}px;height:${size}px;background:${randColor()};transform:translateX(-50%);border-radius:${Math.random()>.5?'50%':'4px'};pointer-events:none;z-index:150;opacity:0.95;`;
      s.animate([
        { transform: `translate(-50%, -20px) rotate(0deg)`, opacity: .95 },
        { transform: `translate(${(Math.random()*200-100)}px, ${600+Math.random()*200}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
      ], { duration: 1600 + Math.random()*600, easing: 'cubic-bezier(.2,.6,0,1)' }).onfinish = () => s.remove();
      frag.appendChild(s);
    }
    document.body.appendChild(frag);
  }
  function randColor(){
    const colors = ['#ffd100','#ffb800','#111','#fff'];
    return colors[(Math.random()*colors.length)|0];
  }
})();


