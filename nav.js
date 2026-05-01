(function () {
  const loader = document.getElementById("atomicLoader");
  if (loader) {
    window.addEventListener("load", () => {
      setTimeout(() => loader.classList.add("hidden"), 900);
    });
  }
  ("use strict");
  const cur = document.getElementById("cur");
  const ring = document.getElementById("ring");
  if (cur && ring) {
    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = mx + "px";
      cur.style.top = my + "px";
    });
    (function animRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animRing);
    })();
  }

  const menuTrigger = document.getElementById("menuTrigger");
  const glassNav = document.getElementById("glassNav");
  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    menuTrigger.classList.add("open");
    menuTrigger.classList.remove("breathing");
    glassNav.classList.add("open");
  }
  function closeMenu() {
    menuOpen = false;
    menuTrigger.classList.remove("open");
    menuTrigger.classList.add("breathing");
    glassNav.classList.remove("open");
  }

  if (menuTrigger && glassNav) {
    menuTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      menuOpen ? closeMenu() : openMenu();
    });
    document.addEventListener("click", (e) => {
      if (
        menuOpen &&
        !glassNav.contains(e.target) &&
        !menuTrigger.contains(e.target)
      )
        closeMenu();
    });
    setTimeout(() => menuTrigger.classList.add("breathing"), 1200);
  }

  const SECTION_MAP = {
    home: "home",
    about: "page-about",
    resume: "page-resume",
    expertise: "page-resume",
    projects: "page-projects",
    contact: "page-contact",
  };

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  function openSection(pageId) {
    scrollToSection(pageId);
  }

  function closeSection() {
    scrollToSection("home");
  }

  if (glassNav) {
    glassNav.querySelectorAll(".nav-btn[aria-label]").forEach((btn) => {
      const key = btn.getAttribute("aria-label").toLowerCase();

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.add("nav-active");
        setTimeout(() => btn.classList.remove("nav-active"), 380);
        closeMenu();

        if (key === "home") {
          closeSection();
          return;
        }

        const pageId = SECTION_MAP[key];
        if (pageId) openSection(pageId);
      });

      btn.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          btn.click();
        },
        { passive: false },
      );
    });
  }
  window.portfolioNav = { openSection, closeSection };
  const revealEls = document.querySelectorAll(".section-page");
  if (revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.08 },
    );
    revealEls.forEach((el) => revealObs.observe(el));
  }
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.body.classList.add("dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector(".btn-send");
      const orig = btn.innerHTML;
      btn.textContent = "Sending…";
      btn.disabled = true;
      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          btn.textContent = "Message Sent ✓";
          btn.style.background = "#22c55e";
          contactForm.reset();
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.style.background = "";
            btn.disabled = false;
          }, 4000);
        } else throw new Error();
      } catch {
        btn.textContent = "Failed — try again";
        btn.style.background = "#ef4444";
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = "";
          btn.disabled = false;
        }, 3000);
      }
    });
  }

  const COINS = [
    { id: "bitcoin", sym: "BTC" },
    { id: "ethereum", sym: "ETH" },
    { id: "solana", sym: "SOL" },
    { id: "binancecoin", sym: "BNB" },
    { id: "ripple", sym: "XRP" },
    { id: "cardano", sym: "ADA" },
    { id: "dogecoin", sym: "DOGE" },
    { id: "polkadot", sym: "DOT" },
    { id: "avalanche-2", sym: "AVAX" },
    { id: "matic-network", sym: "POL" },
    { id: "chainlink", sym: "LINK" },
    { id: "uniswap", sym: "UNI" },
    { id: "cosmos", sym: "ATOM" },
    { id: "injective-protocol", sym: "INJ" },
    { id: "celestia", sym: "TIA" },
  ];

  const COIN_IDS = COINS.map((c) => c.id).join(",");
  const trackEl = document.getElementById("cryptoTrack");

  function formatPrice(p) {
    if (p === null || p === undefined) return "—";
    if (p >= 1000)
      return "$" + p.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (p >= 1) return "$" + p.toFixed(2);
    return "$" + p.toFixed(4);
  }

  function buildChipsFromMarkets(data) {
    if (!trackEl) {
      console.log("trackEl not found");
      return;
    }
    if (!data || !Array.isArray(data) || !data.length) {
      console.log("Invalid data:", data);
      return;
    }
    const validCoins = data.filter(
      (coin) => coin.current_price !== null && coin.current_price !== undefined,
    );
    console.log(
      `Building chips: ${validCoins.length} valid coins from ${data.length} total`,
    );
    if (!validCoins.length) {
      console.log("No valid coins after filtering");
      return;
    }
    const chips = validCoins
      .map((coin) => {
        const price = formatPrice(coin.current_price);
        const chg = coin.price_change_percentage_24h || 0;
        const chgStr = (chg >= 0 ? "▲" : "▼") + Math.abs(chg).toFixed(2) + "%";
        const cls = chg >= 0 ? "up" : "down";
        return `<span class="crypto-chip">
        <span class="c-sym">${coin.symbol.toUpperCase()}</span>
        <span class="c-price">${price}</span>
        <span class="c-chg ${cls}">${chgStr}</span>
      </span><span class="crypto-sep">◆</span>`;
      })
      .join("");
    trackEl.innerHTML = chips + chips + chips;
    console.log("Chips rendered successfully");
  }

  async function fetchCrypto() {
    try {
      const url = "https://crypto-proxy.thoorm95.workers.dev/";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      buildChipsFromMarkets(data);
      localStorage.setItem("cryptoData", JSON.stringify(data));
    } catch {
      // Do nothing, keep current display
    }
  }

  if (trackEl) {
    console.log("Initializing crypto ticker...");

    // Initial data to display immediately
    const initialData = [
      {
        id: "bitcoin",
        symbol: "btc",
        current_price: 77266,
        price_change_percentage_24h: 1.55701,
      },
      {
        id: "ethereum",
        symbol: "eth",
        current_price: 2282,
        price_change_percentage_24h: 0.79,
      },
      {
        id: "ripple",
        symbol: "xrp",
        current_price: 1.38,
        price_change_percentage_24h: 0.40909,
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        current_price: 617.36,
        price_change_percentage_24h: 0.26146,
      },
      {
        id: "solana",
        symbol: "sol",
        current_price: 83.9,
        price_change_percentage_24h: 1.09685,
      },
      {
        id: "dogecoin",
        symbol: "doge",
        current_price: 0.108373,
        price_change_percentage_24h: 1.81377,
      },
      {
        id: "cardano",
        symbol: "ada",
        current_price: 0.247971,
        price_change_percentage_24h: 0.85837,
      },
      {
        id: "chainlink",
        symbol: "link",
        current_price: 9.14,
        price_change_percentage_24h: 0.20845,
      },
      {
        id: "avalanche-2",
        symbol: "avax",
        current_price: 9.11,
        price_change_percentage_24h: -0.39503,
      },
      {
        id: "uniswap",
        symbol: "uni",
        current_price: 3.2,
        price_change_percentage_24h: 0.00829,
      },
      {
        id: "polkadot",
        symbol: "dot",
        current_price: 1.2,
        price_change_percentage_24h: -1.00244,
      },
      {
        id: "cosmos",
        symbol: "atom",
        current_price: 1.88,
        price_change_percentage_24h: -2.2372,
      },
      {
        id: "injective-protocol",
        symbol: "inj",
        current_price: 3.6,
        price_change_percentage_24h: 4.10299,
      },
      {
        id: "celestia",
        symbol: "tia",
        current_price: 0.355282,
        price_change_percentage_24h: -1.25863,
      },
    ];

    // Display initial data immediately
    console.log("Rendering initial data...");
    buildChipsFromMarkets(initialData);

    // Store initial data
    localStorage.setItem("cryptoData", JSON.stringify(initialData));

    // Attempt to fetch fresh data
    fetchCrypto();
    setInterval(fetchCrypto, 60 * 60 * 1000); // Update hourly
  }
})();
