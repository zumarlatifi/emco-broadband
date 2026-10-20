(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const tween = (from, to, dur, cb) => new Promise(res => {
    if (reduce) { cb(to); return res(); }
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / dur);
      cb(from + (to - from) * easeOut(t));
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  requestAnimationFrame(() => document.body.classList.add('loaded'));

  /* ---------- PERSISTENT CART STATE ---------- */
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem('wsb_cart') || '[]'); }
    catch { return []; }
  };
  const saveCart = cart => {
    localStorage.setItem('wsb_cart', JSON.stringify(cart));
    updateCartBadges();
  };
  const updateCartBadges = () => {
    const cart = getCart();
    $$('.cart-count').forEach(el => {
      el.textContent = cart.length;
      el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    });
  };
  updateCartBadges();

  const toast = $('.toast'), toastText = $('#toastText');
  let toastTimer;
  const showToast = msg => {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  document.addEventListener('click', e => {
    const btn = e.target.closest('.add');
    if (!btn) return;
    e.preventDefault();
    const name = btn.dataset.name || 'Plan';
    const price = +(btn.dataset.price || 49.99);
    const cart = getCart();
    cart.push({ id: Date.now(), name, price });
    saveCart(cart);
    showToast(`${name} added to cart!`);

    const span = btn.querySelector('span');
    if (span) {
      btn.dataset.orig = btn.dataset.orig || span.textContent;
      span.textContent = 'Added ✓';
      btn.classList.add('added');
      setTimeout(() => {
        span.textContent = btn.dataset.orig;
        btn.classList.remove('added');
      }, 1400);
    }
  });

  /* ---------- SHARED DATA ---------- */
  const INTERNET_PLANS = [
    { id: 'att-1000', name: 'AT&T Fiber 1 Gig', type: 'Fiber', speedVal: 1000, speed: '1,000 Mbps symmetrical', price: 65, tag: 'Most Popular', rating: 4.8, promo: 'No price hike, equipment included', color: '#00A8E0' },
    { id: 'att-500', name: 'AT&T Fiber 500', type: 'Fiber', speedVal: 500, speed: '500 Mbps symmetrical', price: 55, tag: 'Value Fiber', rating: 4.8, promo: 'Includes Wi-Fi 6 gateway', color: '#00A8E0' },
    { id: 'google-2000', name: 'Google Fiber 2 Gig', type: 'Fiber', speedVal: 2000, speed: '2,000 Mbps symmetrical', price: 100, tag: 'Ultra-Fast', rating: 4.9, promo: 'Wi-Fi 6E whole-home mesh', color: '#4285F4' },
    { id: 'spectrum-500', name: 'Spectrum Ultra', type: 'Cable', speedVal: 500, speed: '500 Mbps download', price: 50, tag: 'Wide Availability', rating: 4.6, promo: 'Includes Free 5G Mobile Line', color: '#005494' },
    { id: 'xfinity-400', name: 'Xfinity Fast', type: 'Cable', speedVal: 400, speed: '400 Mbps download', price: 45, tag: 'Budget Pick', rating: 4.5, promo: 'Guaranteed 2-year rate', color: '#E51B24' },
    { id: 'tmobile-home', name: 'T-Mobile 5G Home', type: '5G Home', speedVal: 245, speed: 'Up to 245 Mbps wireless', price: 40, tag: 'No Contract', rating: 4.7, promo: '15-day risk-free test drive', color: '#EA0A8E' },
    { id: 'starlink-res', name: 'Starlink Standard', type: 'Satellite', speedVal: 220, speed: 'Up to 220 Mbps high-speed', price: 120, tag: 'Rural Reach', rating: 4.4, promo: 'Available anywhere in the US', color: '#000000' }
  ];

  const MOBILE_PLANS = [
    { id: 'visible-plus', name: 'Visible+', type: 'Unlimited 5G', speed: 'Unlimited 5G Ultra & Hotspot', price: 35, tag: 'Best Value', rating: 4.8, promo: 'Powered by Verizon 5G network', color: '#001489' },
    { id: 'visible-base', name: 'Visible Basic', type: 'Prepaid', speed: 'Unlimited 5G & Talk/Text', price: 25, tag: 'Budget Champ', rating: 4.7, promo: 'Taxes and fees all included', color: '#001489' },
    { id: 'mint-unlim', name: 'Mint Mobile Unlimited', type: 'Prepaid', speed: 'Unlimited 5G (40GB High-Speed)', price: 15, tag: 'Intro Special', rating: 4.7, promo: '$15/mo for first 3 months', color: '#97D700' },
    { id: 'tmobile-go5g', name: 'T-Mobile Go5G Plus', type: 'Unlimited 5G', speed: '50GB Hotspot + Premium 5G', price: 50, tag: 'Perks Included', rating: 4.9, promo: 'Netflix & Apple TV+ on Us', color: '#EA0A8E' },
    { id: 'att-unlim-fam', name: 'AT&T Unlimited Premium', type: 'Family Plans', speed: 'Unlimited High-Speed Data', price: 40, tag: 'Family Saver', rating: 4.7, promo: 'Multi-line bundle pricing', color: '#00A8E0' }
  ];

  const PHONES_DATA = [
    { name: 'iPhone 17 Pro', brand: 'Apple', price: 999, mo: 27.75, colors: ['#C8C0B3', '#2C2C2E', '#3E4C5E'], screen: ['#FFB27A', '#FF5A1F'], badge: 'Save $300' },
    { name: 'Galaxy S26 Ultra', brand: 'Samsung', price: 1199, mo: 33.31, colors: ['#2A2D33', '#B7BCC4', '#5D6B57'], screen: ['#9DB8FF', '#22347A'], badge: 'Free Watch' },
    { name: 'Pixel 10 Pro', brand: 'Google', price: 899, mo: 24.97, colors: ['#BCC7B2', '#EDE8DF', '#1F1F1F'], screen: ['#E2F3CF', '#4E7D4B'], badge: '$100 Credit' },
    { name: 'Galaxy Z Flip7', brand: 'Samsung', price: 1099, mo: 30.53, colors: ['#E8BDB3', '#C9D6E8', '#262626'], screen: ['#FFD9E2', '#C2185B'], badge: '$0 Down' },
    { name: 'iPhone 17', brand: 'Apple', price: 799, mo: 22.20, colors: ['#A9BFDD', '#F1E3C8', '#D4D9CF'], screen: ['#CFE3FF', '#3A6FB8'], badge: 'Popular' },
    { name: 'Moto Edge 2026', brand: 'Motorola', price: 549, mo: 15.25, colors: ['#3F4A3C', '#7A3B2E', '#D9D2C5'], screen: ['#FFE3B0', '#C46A1A'], badge: 'Save $200' }
  ];

  /* ---------- INTERNET PAGE DIRECTORY ---------- */
  const internetRows = $('#internetRows');
  if (internetRows) {
    let filterType = 'All', sortMode = 'rec';
    const renderInternet = () => {
      let items = [...INTERNET_PLANS];
      if (filterType !== 'All') items = items.filter(p => p.type === filterType);
      if (sortMode === 'price-low') items.sort((a,b) => a.price - b.price);
      else if (sortMode === 'speed-high') items.sort((a,b) => b.speedVal - a.speedVal);
      else items.sort((a,b) => b.rating - a.rating);

      internetRows.innerHTML = items.map((p, i) => `
        <article class="row-card ${i === 0 ? 'highlight' : ''}">
          <div class="prov-cell">
            <div class="prov-logo" style="box-shadow: inset 0 0 0 2px ${p.color};">${p.name.substring(0,2).toUpperCase()}</div>
            <div class="prov-meta">
              <h3>${p.name} ${p.tag ? `<span class="badge-tag">${p.tag}</span>` : ''}</h3>
              <p>${p.promo} · ★ ${p.rating}</p>
            </div>
          </div>
          <div class="type-cell">${p.type}</div>
          <div class="speed-cell"><b>${p.speed}</b><span>Unlimited Data</span></div>
          <div class="price-cell"><b>$${p.price}</b><span>/mo</span></div>
          <div class="action-cell">
            <button class="btn btn-ink add" data-name="${p.name}" data-price="${p.price}"><span>Order Plan</span></button>
          </div>
        </article>
      `).join('');
    };
    renderInternet();

    $('#internetChips').addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#internetChips .chip').forEach(c => c.classList.toggle('on', c === chip));
      filterType = chip.dataset.type;
      renderInternet();
    });

    $$('.sort button').forEach(sb => {
      sb.addEventListener('click', () => {
        $$('.sort button').forEach(b => b.classList.remove('on'));
        sb.classList.add('on');
        sortMode = sb.dataset.sort;
        renderInternet();
      });
    });

    const searchForm = $('#searchFilterForm');
    if (searchForm) {
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const v = $('#filterAddrInput').value.trim() || '75201';
        showToast(`Showing confirmed plans for ${v}`);
        renderInternet();
      });
    }
  }

  /* ---------- MOBILE PAGE DIRECTORY ---------- */
  const mobileRows = $('#mobileRows');
  if (mobileRows) {
    let filterCat = 'All', linesCount = 1;
    const renderMobile = () => {
      let items = [...MOBILE_PLANS];
      if (filterCat !== 'All') items = items.filter(p => p.type === filterCat);
      mobileRows.innerHTML = items.map((p, i) => {
        const discount = linesCount >= 4 ? 15 : linesCount >= 2 ? 5 : 0;
        const adjustedPrice = Math.max(15, p.price - discount);
        return `
          <article class="row-card ${i === 0 ? 'highlight' : ''}">
            <div class="prov-cell">
              <div class="prov-logo" style="box-shadow: inset 0 0 0 2px ${p.color};">${p.name.substring(0,2).toUpperCase()}</div>
              <div class="prov-meta">
                <h3>${p.name} ${p.tag ? `<span class="badge-tag">${p.tag}</span>` : ''}</h3>
                <p>${p.promo} · ★ ${p.rating}</p>
              </div>
            </div>
            <div class="type-cell">${p.type}</div>
            <div class="speed-cell"><b>${p.speed}</b><span>Multi-line eligible</span></div>
            <div class="price-cell"><b>$${adjustedPrice}</b><span>/line /mo</span></div>
            <div class="action-cell">
              <button class="btn btn-ink add" data-name="${p.name} (${linesCount} line${linesCount>1?'s':''})" data-price="${adjustedPrice * linesCount}">
                <span>Add ${linesCount} Line${linesCount>1?'s':''}</span>
              </button>
            </div>
          </article>
        `;
      }).join('');
    };
    renderMobile();

    $('#mobileChips').addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#mobileChips .chip').forEach(c => c.classList.toggle('on', c === chip));
      filterCat = chip.dataset.type;
      renderMobile();
    });

    $$('.sort button').forEach(sb => {
      sb.addEventListener('click', () => {
        $$('.sort button').forEach(b => b.classList.remove('on'));
        sb.classList.add('on');
        linesCount = +sb.dataset.lines;
        renderMobile();
      });
    });
  }

  /* ---------- PHONES CATALOG PAGE ---------- */
  const phonesGridPage = $('#phonesGridPage');
  if (phonesGridPage) {
    let brandFilter = 'All', typeFilter = 'all';
    const renderPhonesGrid = () => {
      let items = [...PHONES_DATA];
      if (brandFilter !== 'All') items = items.filter(p => p.brand === brandFilter);
      if (typeFilter === 'deals') items = items.filter(p => p.badge);
      if (typeFilter === 'budget') items = items.filter(p => p.mo <= 25);

      phonesGridPage.innerHTML = items.map(p => `
        <article class="phone-card">
          <div class="phone-stage" style="--body:${p.colors[0]};--s1:${p.screen[0]};--s2:${p.screen[1]}">
            ${p.badge ? `<span class="badge mono">${p.badge}</span>` : ''}
            <div class="phone-float"><div class="phone"><div class="screen"><span class="island"></span><span class="time">9:41</span></div></div></div>
          </div>
          <div class="phone-info">
            <span class="mono brand">${p.brand}</span>
            <h3>${p.name}</h3>
            <div class="swatches">${p.colors.map((c, i) => `<button class="${i ? '' : 'on'}" style="--c:${c}" data-color="${c}" aria-label="Color"></button>`).join('')}</div>
            <div class="phone-price"><div><b>$${p.mo.toFixed(2)}</b><span>/mo · 36 mo</span></div><span class="mono">or $${p.price}</span></div>
            <button class="btn btn-ink full add" data-name="${p.name}" data-price="${p.mo}"><span>Add Phone</span></button>
          </div>
        </article>
      `).join('');
    };
    renderPhonesGrid();

    $('#brandChips').addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      $$('#brandChips .chip').forEach(c => c.classList.toggle('on', c === chip));
      brandFilter = chip.dataset.brand;
      renderPhonesGrid();
    });

    $$('.sort button').forEach(sb => {
      sb.addEventListener('click', () => {
        $$('.sort button').forEach(b => b.classList.remove('on'));
        sb.classList.add('on');
        typeFilter = sb.dataset.filter;
        renderPhonesGrid();
      });
    });

    phonesGridPage.addEventListener('click', e => {
      const sw = e.target.closest('.swatches button');
      if (!sw) return;
      const card = sw.closest('.phone-card');
      $$('.swatches button', card).forEach(b => b.classList.toggle('on', b === sw));
      $('.phone-stage', card).style.setProperty('--body', sw.dataset.color);
    });
  }

  /* ---------- CART & CHECKOUT PAGE ---------- */
  const cartItemsList = $('#cartItemsList');
  if (cartItemsList) {
    const emptyState = $('#cartEmptyState');
    const monthlyTotalEl = $('#cartMonthlyTotal');
    const renderCartPage = () => {
      const cart = getCart();
      if (!cart.length) {
        cartItemsList.style.display = 'none';
        emptyState.style.display = 'block';
        monthlyTotalEl.textContent = '$0.00/mo';
        return;
      }
      cartItemsList.style.display = 'grid';
      emptyState.style.display = 'none';
      let total = 0;
      cartItemsList.innerHTML = cart.map((item, idx) => {
        total += item.price;
        return `
          <div class="cart-item-card">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <span>Includes 24/7 Priority Support & Free Activation</span>
            </div>
            <div class="cart-item-actions">
              <b>$${item.price.toFixed(2)}/mo</b>
              <button class="cart-item-del" data-idx="${idx}">Remove</button>
            </div>
          </div>
        `;
      }).join('');
      monthlyTotalEl.textContent = `$${total.toFixed(2)}/mo`;
    };
    renderCartPage();

    cartItemsList.addEventListener('click', e => {
      if (e.target.classList.contains('cart-item-del')) {
        const idx = +e.target.dataset.idx;
        const cart = getCart();
        cart.splice(idx, 1);
        saveCart(cart);
        renderCartPage();
        showToast('Item removed');
      }
    });

    $('#clearCartBtn').addEventListener('click', () => {
      saveCart([]);
      renderCartPage();
      showToast('Cart cleared');
    });

    $('#orderForm').addEventListener('submit', e => {
      e.preventDefault();
      saveCart([]);
      renderCartPage();
      alert('Thank you! Your order request has been received. A dedicated We Sell Broadband onboarding concierge will reach out within 15 minutes to verify your installation details.');
    });
  }

  /* ---------- COVERAGE MAP SCANNER ---------- */
  const canvas = $('#mapCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dots = [], waves = [], isMapVisible = false, lastSpawn = 0;

    const sizeMap = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const gap = 16;
      for (let y = gap; y < H - gap; y += gap) {
        for (let x = gap; x < W - gap; x += gap) {
          const nx = x / W - 0.5, ny = y / H - 0.52, a = Math.atan2(ny, nx);
          const r = Math.hypot(nx * 1.05, ny * 1.35);
          const edge = 0.4 + 0.05 * Math.sin(a * 3 + 1) + 0.035 * Math.cos(a * 7) + 0.02 * Math.sin(a * 13);
          if (r < edge) dots.push({ x, y });
        }
      }
    };

    const spawnWave = (x, y, max) => {
      const d = x == null ? dots[Math.floor(Math.random() * dots.length)] : { x, y };
      if (d) waves.push({ x: d.x, y: d.y, t: performance.now(), max: max || 140 + Math.random() * 120 });
    };

    const LIFE = 2800;
    const drawMap = now => {
      if (isMapVisible) {
        if (now - lastSpawn > 950) { spawnWave(); lastSpawn = now; }
        waves = waves.filter(w => now - w.t < LIFE);
        ctx.clearRect(0, 0, W, H);
        for (const d of dots) {
          let hot = 0;
          for (const w of waves) {
            const age = (now - w.t) / LIFE;
            const r = easeOut(age) * w.max;
            const k = Math.max(0, 1 - Math.abs(Math.hypot(d.x - w.x, d.y - w.y) - r) / 18) * (1 - age);
            if (k > hot) hot = k;
          }
          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.6 + hot * 2, 0, Math.PI * 2);
          ctx.fillStyle = hot > 0.04 ? `rgba(230,57,0,${0.3 + hot * 0.7})` : 'rgba(14,15,18,0.18)';
          ctx.fill();
        }
      }
      requestAnimationFrame(drawMap);
    };

    new IntersectionObserver(es => es.forEach(e => isMapVisible = e.isIntersecting)).observe(canvas);
    sizeMap();
    addEventListener('resize', sizeMap);
    requestAnimationFrame(drawMap);

    const covForm = $('#coverageSearchForm');
    if (covForm) {
      covForm.addEventListener('submit', e => {
        e.preventDefault();
        const v = $('#coverageInput').value.trim() || '75201';
        const cr = $('#coverageResult');
        cr.innerHTML = `<span style="color:var(--green)">✓ Live Radar Match:</span> Gigabit Fiber & 5G Ultra active at <b>${esc(v)}</b>.`;
        $('#currentScannedZip').textContent = v;
        spawnWave(W / 2, H / 2, Math.max(W, H));
        setTimeout(() => spawnWave(W / 2, H / 2, Math.max(W, H)), 300);
      });
    }
  }

  /* ---------- SCROLL REVEAL & CURSOR ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  if (fine && !reduce) {
    const cur = $('.cursor');
    if (cur) {
      let x = -100, y = -100, cx = -100, cy = -100;
      addEventListener('pointermove', e => {
        x = e.clientX; y = e.clientY;
        cur.style.opacity = 1;
        cur.classList.toggle('big', !!e.target.closest('a, button, input, .phone-stage, .chip, .choice, .deal-card'));
      });
      document.addEventListener('pointerleave', () => cur.style.opacity = 0);
      const loop = () => {
        cx += (x - cx) * 0.22;
        cy += (y - cy) * 0.22;
        cur.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  }
})();
