(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const isStatic = new URLSearchParams(location.search).has('static');
  if (isStatic) document.documentElement.classList.add('static');

  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const tween = (from, to, dur, cb) => new Promise(res => {
    if (reduce || isStatic) { cb(to); return res(); }
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

  /* ---------- SCROLL REVEAL ---------- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal], .wordmark').forEach(el => io.observe(el));

  /* ---------- NAV HIDE/SHOW ON SCROLL ---------- */
  const nav = $('.nav');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hidden', y > lastY && y > 240);
    lastY = y;
  }, { passive: true });

  /* ---------- HERO ROTATOR ---------- */
  const rot = $('.rotator');
  if (rot) {
    const words = $$('.rw', rot);
    let ri = 0;
    const setRot = i => {
      const prev = (i - 1 + words.length) % words.length;
      words.forEach((w, j) => {
        w.classList.toggle('is-active', j === i);
        w.classList.toggle('is-exit', j === prev && j !== i);
      });
      rot.style.width = words[i].offsetWidth + 'px';
    };
    setRot(0);
    document.fonts.ready.then(() => setRot(ri));
    addEventListener('resize', () => setRot(ri));
    if (!reduce && !isStatic) setInterval(() => setRot(ri = (ri + 1) % words.length), 2500);
  }

  /* ---------- PROVIDER DATA (INTERNET & MOBILE) ---------- */
  const DATA = {
    internet: [
      { id: 'att', name: 'AT&T Fiber', type: 'Fiber', speedVal: 1000, speed: '1,000 Mbps (1 Gig)', price: 65, tag: 'Editor\'s Choice', rating: 4.8, promo: 'No price hike at 12 mo', color: '#00A8E0' },
      { id: 'spectrum', name: 'Spectrum One', type: 'Cable', speedVal: 500, speed: '500 Mbps', price: 50, tag: 'Free Mobile Line', rating: 4.6, promo: 'Includes free 5G mobile line for 1 yr', color: '#005494' },
      { id: 'xfinity', name: 'Xfinity', type: 'Cable', speedVal: 400, speed: '400 Mbps', price: 45, tag: 'Best Value', rating: 4.5, promo: 'Guaranteed 2-yr rate', color: '#E51B24' },
      { id: 'verizon', name: 'Verizon Fios', type: 'Fiber', speedVal: 1000, speed: '1,000 Mbps (1 Gig)', price: 70, tag: 'Ultra-fast', rating: 4.9, promo: '$200 Target gift card included', color: '#EE0000' },
      { id: 'tmobile', name: 'T-Mobile Home', type: '5G Home', speedVal: 245, speed: 'Up to 245 Mbps', price: 40, tag: 'No Hardware Fee', rating: 4.7, promo: '15-day test drive, no contract', color: '#EA0A8E' },
      { id: 'google', name: 'Google Fiber', type: 'Fiber', speedVal: 2000, speed: '2,000 Mbps (2 Gig)', price: 100, tag: 'Fastest', rating: 4.9, promo: 'Wi-Fi 6E whole-home mesh router', color: '#4285F4' },
      { id: 'starlink', name: 'Starlink', type: 'Satellite', speedVal: 220, speed: 'Up to 220 Mbps', price: 120, tag: 'Rural Pick', rating: 4.4, promo: 'Nationwide coverage anywhere in US', color: '#000000' }
    ],
    mobile: [
      { id: 'visible', name: 'Visible by Verizon', type: 'Unlimited 5G', speedVal: 100, speed: 'Unlimited 5G & Hotspot', price: 25, tag: 'Cheapest Unlimited', rating: 4.8, promo: 'Taxes & fees included in price', color: '#001489' },
      { id: 'mint', name: 'Mint Mobile', type: 'Prepaid', speedVal: 100, speed: 'Unlimited 5G', price: 15, tag: 'Best Intro Promo', rating: 4.7, promo: '$15/mo for first 3 months', color: '#97D700' },
      { id: 'tmobile-mob', name: 'T-Mobile Go5G', type: 'Unlimited 5G', speedVal: 250, speed: 'Unlimited Premium 5G', price: 50, tag: 'Streaming Perks', rating: 4.8, promo: 'Apple TV+ and Netflix on Us', color: '#EA0A8E' },
      { id: 'att-mob', name: 'AT&T Unlimited', type: 'Family Plans', speedVal: 150, speed: 'Unlimited 5G Active', price: 40, tag: 'Multi-line Deal', rating: 4.6, promo: 'Save $10/line with 4 lines', color: '#00A8E0' },
      { id: 'cricket', name: 'Cricket Wireless', type: 'Prepaid', speedVal: 100, speed: 'Unlimited 5G Core', price: 30, tag: 'No Contract', rating: 4.5, promo: 'Includes Max streaming with ads', color: '#008752' }
    ]
  };

  /* ---------- HERO ADDRESS LOOKUP SIMULATOR ---------- */
  const rcZip = $('#rcZip'), rcCount = $('#rcCount'), rcList = $('#rcList'), heroForm = $('#heroForm');
  const updateHeroResults = (zip = '75201') => {
    rcZip.textContent = zip;
    rcCount.textContent = 'Checking availability…';
    rcList.innerHTML = '';
    setTimeout(() => {
      const picks = DATA.internet.slice(0, 3);
      rcCount.textContent = `${picks.length + 3} providers available`;
      rcList.innerHTML = picks.map((p, i) => `
        <div class="rc-item" style="--i:${i}">
          <div class="rc-prov">
            <div class="rc-badge" style="border: 2px solid ${p.color};">${p.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <div class="rc-name">${p.name}</div>
              <div class="rc-sub">${p.speed} · ${p.type}</div>
            </div>
          </div>
          <div class="rc-price">
            <b>$${p.price}</b><span>/mo</span>
          </div>
        </div>
      `).join('');
    }, 450);
  };
  updateHeroResults('75201');

  heroForm.addEventListener('submit', e => {
    e.preventDefault();
    const val = heroForm.querySelector('input').value.trim() || '75201';
    updateHeroResults(val);
    const comp = $('#compare');
    if (comp) comp.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- COMPARE TABLE & FILTERS ---------- */
  let currentCategory = 'internet';
  let currentSort = 'rec';
  let currentFilter = 'All';

  const chipsContainer = $('#chips');
  const rowsContainer = $('#rows');
  const metricHead = $('#metricHead');

  const updateChips = () => {
    const filters = currentCategory === 'internet' 
      ? ['All', 'Fiber', 'Cable', '5G Home', 'Satellite']
      : ['All', 'Unlimited 5G', 'Prepaid', 'Family Plans'];
    chipsContainer.innerHTML = filters.map(f => `
      <button class="chip ${f === currentFilter ? 'on' : ''}" data-filter="${f}">${f}</button>
    `).join('');
  };

  const renderComparisonRows = () => {
    let items = [...DATA[currentCategory]];
    if (currentFilter !== 'All') {
      items = items.filter(it => it.type === currentFilter);
    }

    if (currentSort === 'price') {
      items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'metric') {
      items.sort((a, b) => b.speedVal - a.speedVal);
    } else {
      items.sort((a, b) => b.rating - a.rating);
    }

    metricHead.textContent = currentCategory === 'internet' ? 'Download Speed' : 'Data & Coverage';

    rowsContainer.innerHTML = items.map((p, i) => `
      <article class="row-card ${i === 0 && currentSort === 'rec' ? 'highlight' : ''}" style="--i:${i}">
        <div class="prov-cell">
          <div class="prov-logo" style="box-shadow: inset 0 0 0 2px ${p.color};">${p.name.substring(0, 2).toUpperCase()}</div>
          <div class="prov-meta">
            <h3>${p.name} ${p.tag ? `<span class="badge-tag">${p.tag}</span>` : ''}</h3>
            <p>${p.promo} · ★ ${p.rating}</p>
          </div>
        </div>
        <div class="type-cell">${p.type}</div>
        <div class="speed-cell">
          <b>${p.speed}</b>
          <span>${currentCategory === 'internet' ? 'Symmetrical options' : 'Nationwide 5G'}</span>
        </div>
        <div class="price-cell">
          <b>$${p.price}</b><span>/mo</span>
        </div>
        <div class="action-cell">
          <button class="btn btn-ink add" data-name="${p.name} plan"><span>View Plan</span></button>
        </div>
      </article>
    `).join('');
  };

  updateChips();
  renderComparisonRows();

  // Tab switching
  const tabs = $$('.tab'), tabIndicator = $('.tab-indicator');
  const alignIndicator = () => {
    const act = $('.tab.is-active');
    if (act && tabIndicator) {
      tabIndicator.style.width = act.offsetWidth + 'px';
      tabIndicator.style.transform = `translateX(${act.offsetLeft}px)`;
    }
  };
  alignIndicator();
  addEventListener('resize', alignIndicator);

  const switchCategory = cat => {
    if (cat === currentCategory) return;
    currentCategory = cat;
    currentFilter = 'All';
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === cat));
    alignIndicator();
    updateChips();
    renderComparisonRows();
  };

  tabs.forEach(t => t.addEventListener('click', () => switchCategory(t.dataset.tab)));
  $$('[data-tab-link]').forEach(a => a.addEventListener('click', () => switchCategory(a.dataset.tabLink)));

  // Filter chips click
  chipsContainer.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    currentFilter = chip.dataset.filter;
    $$('.chip', chipsContainer).forEach(c => c.classList.toggle('on', c === chip));
    renderComparisonRows();
  });

  // Sort click
  $$('.sort button').forEach(sb => {
    sb.addEventListener('click', () => {
      $$('.sort button').forEach(b => b.classList.remove('on'));
      sb.classList.add('on');
      currentSort = sb.dataset.sort;
      renderComparisonRows();
    });
  });

  /* ---------- HOW IT WORKS STEP ANIMATION ---------- */
  const stepsLine = $('#stepsLine');
  const howSection = $('#how');
  if (stepsLine && howSection) {
    addEventListener('scroll', () => {
      const rect = howSection.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (rect.height + 200)));
      stepsLine.style.transform = `translateX(${progress * 200}%)`;
    }, { passive: true });
  }

  /* ---------- PHONES TRACK & 3D TILT ---------- */
  const PHONES = [
    { name: 'iPhone 17 Pro', brand: 'Apple', price: 999, mo: 27.75, colors: ['#C8C0B3', '#2C2C2E', '#3E4C5E'], screen: ['#FFB27A', '#FF5A1F'], badge: 'Save $300' },
    { name: 'Galaxy S26 Ultra', brand: 'Samsung', price: 1199, mo: 33.31, colors: ['#2A2D33', '#B7BCC4', '#5D6B57'], screen: ['#9DB8FF', '#22347A'], badge: 'Free Watch' },
    { name: 'Pixel 10 Pro', brand: 'Google', price: 899, mo: 24.97, colors: ['#BCC7B2', '#EDE8DF', '#1F1F1F'], screen: ['#E2F3CF', '#4E7D4B'] },
    { name: 'Galaxy Z Flip7', brand: 'Samsung', price: 1099, mo: 30.53, colors: ['#E8BDB3', '#C9D6E8', '#262626'], screen: ['#FFD9E2', '#C2185B'], badge: '$0 Down' },
    { name: 'Moto Edge 2026', brand: 'Motorola', price: 549, mo: 15.25, colors: ['#3F4A3C', '#7A3B2E', '#D9D2C5'], screen: ['#FFE3B0', '#C46A1A'], badge: 'Save $200' }
  ];

  const phonesTrack = $('#phonesTrack');
  if (phonesTrack) {
    phonesTrack.innerHTML = PHONES.map(p => `
      <article class="phone-card">
        <div class="phone-stage" style="--body:${p.colors[0]};--s1:${p.screen[0]};--s2:${p.screen[1]}">
          ${p.badge ? `<span class="badge mono">${p.badge}</span>` : ''}
          <div class="phone-float"><div class="phone"><div class="screen"><span class="island"></span><span class="time">9:41</span></div></div></div>
        </div>
        <div class="phone-info">
          <span class="mono brand">${p.brand}</span>
          <h3>${p.name}</h3>
          <div class="swatches">${p.colors.map((c, i) => `<button class="${i ? '' : 'on'}" style="--c:${c}" data-color="${c}" aria-label="Color option ${i + 1}"></button>`).join('')}</div>
          <div class="phone-price"><div><b>$${p.mo.toFixed(2)}</b><span>/mo · 36 mo</span></div><span class="mono">or $${p.price}</span></div>
          <button class="btn btn-light full add" data-name="${p.name}"><span>Add to Order</span></button>
        </div>
      </article>
    `).join('');

    // Color Swatches
    phonesTrack.addEventListener('click', e => {
      const sw = e.target.closest('.swatches button');
      if (!sw) return;
      const card = sw.closest('.phone-card');
      $$('.swatches button', card).forEach(b => b.classList.toggle('on', b === sw));
      $('.phone-stage', card).style.setProperty('--body', sw.dataset.color);
    });

    // 3D Tilt on Pointer Move
    if (fine && !reduce) {
      phonesTrack.addEventListener('pointermove', e => {
        const stage = e.target.closest('.phone-stage');
        if (!stage) return;
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const ph = $('.phone', stage);
        ph.style.setProperty('--ry', `${x * 38}deg`);
        ph.style.setProperty('--rx', `${-y * 22}deg`);
      });
      phonesTrack.addEventListener('pointerout', e => {
        const stage = e.target.closest('.phone-stage');
        if (stage && !stage.contains(e.relatedTarget)) {
          const ph = $('.phone', stage);
          ph.style.removeProperty('--ry');
          ph.style.removeProperty('--rx');
        }
      });
    }

    // Scroll-driven horizontal carousel
    const phonesSec = $('#phones'), prog = $('#phonesProgress');
    let dist = 0;
    const isWide = () => innerWidth > 1024;
    const syncPhones = () => {
      if (!isWide()) return;
      const top = phonesSec.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, -top / (dist || 1)));
      phonesTrack.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
      if (prog) prog.style.transform = `scaleX(${p})`;
    };
    const sizePhones = () => {
      if (!isWide()) { phonesSec.style.height = ''; phonesTrack.style.transform = ''; return; }
      dist = Math.max(0, phonesTrack.scrollWidth - innerWidth);
      phonesSec.style.height = innerHeight + dist + 'px';
      syncPhones();
    };
    addEventListener('scroll', syncPhones, { passive: true });
    addEventListener('resize', sizePhones);
    document.fonts.ready.then(sizePhones);
    sizePhones();
  }

  /* ---------- SPEED FINDER & GAUGE ---------- */
  let peopleCount = 2;
  const selectedUses = new Set(['stream', 'wfh']);
  const peopleLabel = $('#peopleLabel');
  const segThumb = $('.seg-thumb');
  const recNum = $('#recNum');
  const recRows = $('#recRows');
  const gaugeFill = $('.gauge-fill');

  const calculateSpeed = () => {
    let base = peopleCount * 75;
    if (selectedUses.has('stream')) base += 100;
    if (selectedUses.has('game')) base += 200;
    if (selectedUses.has('wfh')) base += 150;
    if (selectedUses.has('creator')) base += 400;
    if (selectedUses.has('smart')) base += 50;

    let tier = 300;
    let desc = 'Fiber 300 or Cable 400';
    if (base > 700) { tier = 1000; desc = 'Gigabit Fiber (1 Gig)'; }
    else if (base > 450) { tier = 500; desc = 'Fiber 500 or Fast Cable'; }

    tween(+(recNum.textContent || 0), tier, 600, v => {
      recNum.textContent = Math.round(v);
      if (gaugeFill) gaugeFill.style.strokeDashoffset = 100 - Math.min(v, 1000) / 10;
    });

    recRows.innerHTML = `
      <div class="sum-row"><span>Recommended Plan Tier</span><span>${desc}</span></div>
      <div class="sum-row"><span>Simultaneous 4K Streams</span><span>${Math.max(2, peopleCount * 2)} devices</span></div>
      <div class="sum-row"><span>Est. Monthly Cost</span><span>$45 – $65/mo</span></div>
    `;
  };

  // People Stepper
  $$('[data-people]').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      peopleCount = +btn.dataset.people;
      $$('[data-people]').forEach(b => b.classList.toggle('on', b === btn));
      segThumb.style.setProperty('--idx', idx);
      peopleLabel.textContent = `${peopleCount === 5 ? '5+ people' : peopleCount + ' people'}`;
      calculateSpeed();
    });
  });
  // Init default people selection
  $$('[data-people]')[1].classList.add('on');
  segThumb.style.setProperty('--idx', 1);

  // Use choices toggle
  $$('[data-use]').forEach(btn => {
    const use = btn.dataset.use;
    if (selectedUses.has(use)) btn.classList.add('on');
    btn.addEventListener('click', () => {
      if (selectedUses.has(use)) {
        selectedUses.delete(use);
        btn.classList.remove('on');
      } else {
        selectedUses.add(use);
        btn.classList.add('on');
      }
      calculateSpeed();
    });
  });
  calculateSpeed();

  $('#seeMatches').addEventListener('click', () => {
    const comp = $('#compare');
    if (comp) comp.scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- STATS COUNTERS ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target;
    const to = +el.dataset.count;
    const dec = +(el.dataset.dec || 0);
    const suf = el.dataset.suffix || '';
    const pref = el.dataset.prefix || '';
    tween(0, to, 1800, v => el.textContent = pref + v.toFixed(dec) + suf);
  }), { threshold: 0.5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- COVERAGE MAP CANVAS ---------- */
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
      if (isMapVisible || isStatic) {
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

    $('#zipForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = $('#zipForm input').value.trim() || '75201';
      const zr = $('#zipResult');
      zr.innerHTML = `<span style="color:#16a34a;font-weight:600;">✓</span> High-speed coverage confirmed for <b>${esc(v)}</b>: Fiber, Cable & 5G Home are available.`;
      zr.classList.add('show');
      spawnWave(W / 2, H / 2, Math.max(W, H));
      setTimeout(() => spawnWave(W / 2, H / 2, Math.max(W, H)), 300);
    });
  }

  /* ---------- FAQ ACCORDION ---------- */
  $$('.faq-q').forEach(q => q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    $$('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  }));

  /* ---------- CART & TOAST FEEDBACK ---------- */
  let cartCount = 0, toastTimer;
  const cc = $('.cart-count'), toast = $('.toast'), toastText = $('#toastText');
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add');
    if (!btn) return;
    e.preventDefault();
    cartCount++;
    cc.textContent = cartCount;
    cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump');
    toastText.textContent = `${btn.dataset.name} added to cart`;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);

    const span = btn.querySelector('span');
    btn.dataset.orig = btn.dataset.orig || span.textContent;
    span.textContent = 'Added ✓';
    btn.classList.add('added');
    setTimeout(() => {
      span.textContent = btn.dataset.orig;
      btn.classList.remove('added');
    }, 1400);
  });

  /* ---------- MAGNETIC BUTTONS & CURSOR ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(m => {
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      m.addEventListener('pointerleave', () => m.style.transform = '');
    });

    const cur = $('.cursor');
    if (cur) {
      let x = -100, y = -100, cx = -100, cy = -100;
      addEventListener('pointermove', e => {
        x = e.clientX; y = e.clientY;
        cur.style.opacity = 1;
        cur.classList.toggle('big', !!e.target.closest('a, button, input, .phone-stage, .chip, .choice'));
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
