
(function () { 
const loader = document.getElementById('atomicLoader');
if (loader) {
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 900);
  });
}
  'use strict';
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('ring');
  if (cur && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }
  
  const menuTrigger = document.getElementById('menuTrigger');
  const glassNav    = document.getElementById('glassNav');
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuTrigger.classList.add('open');
    menuTrigger.classList.remove('breathing');
    glassNav.classList.add('open');
  }
  function closeMenu() {
    menuOpen = false;
    menuTrigger.classList.remove('open');
    menuTrigger.classList.add('breathing');
    glassNav.classList.remove('open');
  }

  if (menuTrigger && glassNav) {
    menuTrigger.addEventListener('click', e => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });
    document.addEventListener('click', e => {
      if (menuOpen && !glassNav.contains(e.target) && !menuTrigger.contains(e.target)) closeMenu();
    });
    setTimeout(() => menuTrigger.classList.add('breathing'), 1200);
  }

  const SECTION_MAP = {
    home:     'home',
    about:    'page-about',
    resume:   'page-resume',
    expertise:'page-resume',
    projects: 'page-projects',
    contact:  'page-contact',
  };

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function openSection(pageId) {
    scrollToSection(pageId);
  }

  function closeSection() {
    scrollToSection('home');
  }

  if (glassNav) {
    glassNav.querySelectorAll('.nav-btn[aria-label]').forEach(btn => {
      const key = btn.getAttribute('aria-label').toLowerCase();

      btn.addEventListener('click', e => {
        e.preventDefault();
         e.stopPropagation();
        btn.classList.add('nav-active');
        setTimeout(() => btn.classList.remove('nav-active'), 380);
        closeMenu();

        if (key === 'home') { closeSection(); return; }

        const pageId = SECTION_MAP[key];
        if (pageId) openSection(pageId);
      });

      btn.addEventListener('touchend', e => {
        e.preventDefault();
        btn.click();
      }, { passive: false });
    });
  }
  window.portfolioNav = { openSection, closeSection };
  const revealEls = document.querySelectorAll('.section-page');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      });
    }, { threshold: 0.08 });
    revealEls.forEach(el => revealObs.observe(el));
  }
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn  = contactForm.querySelector('.btn-send');
      const orig = btn.innerHTML;
      btn.textContent = 'Sending…';
      btn.disabled    = true;
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          btn.textContent      = 'Message Sent ✓';
          btn.style.background = '#22c55e';
          contactForm.reset();
          setTimeout(() => {
            btn.innerHTML        = orig;
            btn.style.background = '';
            btn.disabled         = false;
          }, 4000);
        } else throw new Error();
      } catch {
        btn.textContent      = 'Failed — try again';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.innerHTML        = orig;
          btn.style.background = '';
          btn.disabled         = false;
        }, 3000);
      }
    });
  }

  const COINS = [
    { id: 'bitcoin',             sym: 'BTC'  },
    { id: 'ethereum',            sym: 'ETH'  },
    { id: 'solana',              sym: 'SOL'  },
    { id: 'binancecoin',         sym: 'BNB'  },
    { id: 'ripple',              sym: 'XRP'  },
    { id: 'cardano',             sym: 'ADA'  },
    { id: 'dogecoin',            sym: 'DOGE' },
    { id: 'polkadot',            sym: 'DOT'  },
    { id: 'avalanche-2',         sym: 'AVAX' },
    { id: 'matic-network',       sym: 'POL'  },
    { id: 'chainlink',           sym: 'LINK' },
    { id: 'uniswap',             sym: 'UNI'  },
    { id: 'cosmos',              sym: 'ATOM' },
    { id: 'injective-protocol',  sym: 'INJ'  },
    { id: 'celestia',            sym: 'TIA'  },
  ];

  const COIN_IDS   = COINS.map(c => c.id).join(',');
  const trackEl    = document.getElementById('cryptoTrack');

  function formatPrice(p) {
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 1)    return '$' + p.toFixed(2);
    return '$' + p.toFixed(4);
  }

  function buildChipsFromMarkets(data) {
    if (!trackEl || !data.length) return;
    const chips = data.map(coin => {
      const price  = formatPrice(coin.current_price);
      const chg    = coin.price_change_percentage_24h || 0;
      const chgStr = (chg >= 0 ? '▲' : '▼') + Math.abs(chg).toFixed(2) + '%';
      const cls    = chg >= 0 ? 'up' : 'down';
      return `<span class="crypto-chip">
        <span class="c-sym">${coin.symbol.toUpperCase()}</span>
        <span class="c-price">${price}</span>
        <span class="c-chg ${cls}">${chgStr}</span>
      </span><span class="crypto-sep">◆</span>`;
    }).join('');
    trackEl.innerHTML = chips + chips;
  }

  async function fetchCrypto() {
    try {
      const url = 'https://crypto-proxy.thoorm95.workers.dev/';
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      buildChipsFromMarkets(await res.json());
    } catch {
      if (!trackEl) return;
      const fallback = COINS.map(c =>
        `<span class="crypto-chip"><span class="c-sym">${c.sym}</span><span class="c-price">—</span></span><span class="crypto-sep">◆</span>`
      ).join('');
      trackEl.innerHTML = fallback + fallback;
    }
  }

  if (trackEl) {
    fetchCrypto();
    setInterval(fetchCrypto, 5 * 60 * 1000);
  }
})();
