  document.addEventListener('DOMContentLoaded', () => {
  if (window.__portfolioReady) return;
  window.__portfolioReady = true;
  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const menuButton = $('#menu-btn');
  const navMenu = $('#nav-menu');
  const navLinks = $$('#nav-menu a');

  const boot = $('#boot-screen');
  const progress = $('#boot-progress');
  const status = $('#boot-status');
  const toast = $('#toast');
  const soundButton = $('#sound-toggle');

  let soundEnabled = false;
  let audioContext = null;
  let toastTimeout;

  // ARCADE STARTUP SEQUENCE
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let amount = 0;

    const messages = [
      'LOADING PLAYER DATA...',
      'INITIALIZING PIXEL ENGINE...',
      'CALIBRATING INTERFACE...',
      'READY PLAYER ONE.'
    ];

    const timer = setInterval(() => {
      amount = Math.min(100, amount + 20 + Math.random() * 16);

      progress.style.width = `${amount}%`;

      status.textContent =
        messages[
          Math.min(
            messages.length - 1,
            Math.floor(amount / 27)
          )
        ];

      if (amount >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          boot.classList.add('done');
        }, 220);
      }
    }, 125);
  } else {
    boot.classList.add('done');
  }

  // AUTOMATIC COPYRIGHT YEAR
  $('#year').textContent = new Date().getFullYear();

  // MOBILE NAVIGATION
  function closeMenu() {
    navMenu.classList.remove('open');

    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  }

  menuButton.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');

    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '✕' : '☰';

    playTone(open ? 440 : 330, 0.045);
  });

  // CLOSE MENU WHEN A LINK IS CLICKED
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
      playTone(520, 0.035);
    });
  });

  // CLOSE MENU WHEN CLICKING OUTSIDE
  document.addEventListener('click', event => {
    if (
      !navMenu.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // CLOSE MENU USING ESCAPE
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  // SCROLL REVEAL ANIMATIONS
  const revealItems = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            if (
              entry.target.classList.contains('skills-panel')
            ) {
              entry.target.classList.add('in-view');
            }

            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.13
      }
    );

    revealItems.forEach(item => {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(item => {
      item.classList.add('visible');
    });
  }

  // ACTIVE NAVIGATION LINK
  const sections = $$('main section[id]');

  function updateNavigation() {
    let current = 'home';

    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= 150) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      const active =
        link.getAttribute('href') === `#${current}`;

      link.classList.toggle('active', active);
    });
  }

  window.addEventListener('scroll', updateNavigation, {
    passive: true
  });

  updateNavigation();

  // CURSOR GLOW EFFECT
  const glow = $('.cursor-glow');

  if (window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener(
      'pointermove',
      event => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
      },
      {
        passive: true
      }
    );
  } else {
    glow.style.display = 'none';
  }

  // OPTIONAL 8-BIT SOUND EFFECTS
  function playTone(frequency = 520, duration = 0.05) {
    if (!soundEnabled) return;

    try {
      audioContext ||=
        new (
          window.AudioContext ||
          window.webkitAudioContext
        )();

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(
        0.025,
        audioContext.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(
        audioContext.currentTime + duration
      );
    } catch (_) {
      // Audio is optional.
    }
  }

 
  // BACKGROUND MUSIC + SOUND TOGGLE
 
 
const backgroundMusic = document.querySelector('#background-music');

soundButton.addEventListener('click', async () => {
  soundEnabled = !soundEnabled;

  soundButton.innerHTML = soundEnabled
    ? '♫ <span>SOUND: ON</span>'
    : '♪ <span>SOUND: OFF</span>';

  if (soundEnabled) {
    try {
      await backgroundMusic.play();
      showToast('BACKGROUND MUSIC ON');
    } catch (error) {
      soundEnabled = false;
      soundButton.innerHTML = '♪ <span>SOUND: OFF</span>';
      showToast('CHECK AUDIO FILE');
    }
  } else {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    showToast('MUSIC MUTED');
  }
});



  // ARCADE NOTIFICATION
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 1700);
  }

  // BUTTON CLICK SOUNDS
  $$('.arcade-btn, .mission-link, .contact-card, .back-top')
    .forEach(item => {
      item.addEventListener('pointerdown', () => {
        playTone(600, 0.035);
      });
    });

  // PROFILE IMAGE FALLBACK
  const portrait = $('.portrait');
  const image = $('img', portrait);

  if (image.complete && image.naturalWidth === 0) {
    portrait.classList.add('no-photo');
  }
  // Pokémon appear after 10 seconds without user activity.
  const pokemonStage = document.querySelector('#pokemon-walkers');

  if (
    pokemonStage &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const pokemonFiles = Array.from(
      { length: 25 },
      (_, i) =>
        `images/pokemon/pokemon-${String(i + 1).padStart(2, '0')}.png`
    );

    let idleTimer;
    let walkers = [];
    let walking = false;

    function resetIdleTimer() {
      pokemonStage.classList.remove('is-visible');
      walking = false;

      walkers.forEach(walker => {
        if (walker.frame) {
          cancelAnimationFrame(walker.frame);
        }
      });

      walkers = [];
      pokemonStage.replaceChildren();
      clearTimeout(idleTimer);

      idleTimer = setTimeout(startPokemonWalk, 10000);
    }

    function startPokemonWalk() {
      if (walking || document.hidden) return;

      walking = true;
      pokemonStage.classList.add('is-visible');

      const count = 3 + Math.floor(Math.random() * 3);

      const chosen = [...pokemonFiles]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      chosen.forEach((src, index) => {
        const sprite = document.createElement('img');

        sprite.className = 'pokemon-walker';
        sprite.alt = '';
        sprite.draggable = false;
        sprite.src = src;

        pokemonStage.appendChild(sprite);

        const direction = index % 2 === 0 ? 1 : -1;

        const startX =
          direction === 1
            ? -70 - index * 85
            : window.innerWidth + index * 85;

        const speed = 24 + Math.random() * 24;

        const walker = {
          sprite,
          x: startX,
          direction,
          speed,
          last: 0,
          frame: 0
        };

        if (direction < 0) {
          sprite.style.transform = 'scaleX(-1)';
        }

        walkers.push(walker);

        function animate(now) {
          if (!walking || !sprite.isConnected) return;

          if (!walker.last) walker.last = now;

          const delta = Math.min(
            (now - walker.last) / 1000,
            0.05
          );

          walker.last = now;
          walker.x += walker.direction * walker.speed * delta;

          sprite.style.left = `${walker.x}px`;

          if (
            (walker.direction > 0 &&
              walker.x > window.innerWidth + 75) ||
            (walker.direction < 0 && walker.x < -75)
          ) {
            walker.x =
              walker.direction > 0
                ? -75
                : window.innerWidth + 75;
          }

          walker.frame = requestAnimationFrame(animate);
        }

        walker.frame = requestAnimationFrame(animate);
      });
    }

    [
      'pointermove',
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
      'wheel'
    ].forEach(eventName => {
      window.addEventListener(eventName, resetIdleTimer, {
        passive: true
      });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resetIdleTimer();
      }
    });

    resetIdleTimer();
  }

});
/* ============================================================
   HOENN TRAIL — Pokémon-style mini game (JavaScript part)
   ============================================================ */
(() => {
  'use strict';

  const root = document.getElementById('pg-game');
  if (!root) return;

  /* ================= SETTINGS (pwede mong baguhin) ================= */
  const SPRITE_PATH = n => `images/pokemon/pokemon-${String(n).padStart(2, '0')}.png`;
  const FLIP_ALLY = false;        // true = i-mirror ang sprite ng Pokémon mo sa battle
  const ENCOUNTER_RATE = 0.16;    // chance per step sa tall grass
  const STEP_MS = 150;            // bilis ng lakad (mas mababa = mas mabilis)
  const MAX_LV = 50;
  const SAVE_KEY = 'hoennTrailSave_v1';

  /* ================= MAP CONSTANTS ================= */
  const TILE = 32, VIEW_W = 15, VIEW_H = 10, MAP_W = 44, MAP_H = 32;
  const W = VIEW_W * TILE, H = VIEW_H * TILE;
  const SPAWN = { x: 21, y: 17 };
  const DOOR = { x: 21, y: 5 };
  const G = 0, P = 1, T = 2, R = 3, WA = 4, F = 5, WALL = 6, ROOF = 7, D = 9;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

  /* ================= GAME DATA ================= */
  const TYPE_COL = {
    normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030',
    bug: '#a8b820', flying: '#a890f0', dark: '#705848', psychic: '#f85888', fighting: '#c03028', ground: '#e0c068'
  };

  const CHART = {
    fire: { grass: 2, bug: 2, water: .5, fire: .5 },
    water: { fire: 2, ground: 2, water: .5, grass: .5 },
    grass: { water: 2, ground: 2, fire: .5, grass: .5, bug: .5, flying: .5 },
    electric: { water: 2, flying: 2, grass: .5, electric: .5, ground: 0 },
    bug: { grass: 2, psychic: 2, dark: 2, fire: .5, fighting: .5, flying: .5 },
    flying: { grass: 2, bug: 2, fighting: 2, electric: .5 },
    dark: { psychic: 2, fighting: .5, dark: .5 },
    psychic: { fighting: 2, psychic: .5, dark: 0 },
    fighting: { normal: 2, dark: 2, bug: .5, flying: .5, psychic: .5 },
    ground: { fire: 2, electric: 2, grass: .5, bug: .5, flying: 0 }
  };

  // p = power, a = accuracy, pp, pri = priority, fx = special effect
  const MOVES = {
    struggle:    { n: 'Struggle',     t: 'normal',   p: 40, a: 100, pp: 1,  fx: 'recoil' },
    tackle:      { n: 'Tackle',       t: 'normal',   p: 40, a: 100, pp: 35 },
    scratch:     { n: 'Scratch',      t: 'normal',   p: 40, a: 100, pp: 35 },
    quick:       { n: 'Quick Attack', t: 'normal',   p: 40, a: 100, pp: 30, pri: 1 },
    headbutt:    { n: 'Headbutt',     t: 'normal',   p: 70, a: 100, pp: 15 },
    growl:       { n: 'Growl',        t: 'normal',   p: 0,  a: 100, pp: 40, fx: 'foeAtk' },
    leer:        { n: 'Leer',         t: 'normal',   p: 0,  a: 100, pp: 30, fx: 'foeDef' },
    howl:        { n: 'Howl',         t: 'normal',   p: 0,  a: 100, pp: 40, fx: 'selfAtk' },
    harden:      { n: 'Harden',       t: 'normal',   p: 0,  a: 100, pp: 30, fx: 'selfDef' },
    ember:       { n: 'Ember',        t: 'fire',     p: 40, a: 100, pp: 25 },
    flamewheel:  { n: 'Flame Wheel',  t: 'fire',     p: 60, a: 100, pp: 25 },
    watergun:    { n: 'Water Gun',    t: 'water',    p: 40, a: 100, pp: 25 },
    bubblebeam:  { n: 'Bubble Beam',  t: 'water',    p: 65, a: 100, pp: 20 },
    absorb:      { n: 'Absorb',       t: 'grass',    p: 25, a: 100, pp: 25, fx: 'drain' },
    vinewhip:    { n: 'Vine Whip',    t: 'grass',    p: 45, a: 100, pp: 25 },
    razorleaf:   { n: 'Razor Leaf',   t: 'grass',    p: 55, a: 95,  pp: 25 },
    thundershock:{ n: 'Thunder Shock',t: 'electric', p: 40, a: 100, pp: 30 },
    spark:       { n: 'Spark',        t: 'electric', p: 65, a: 100, pp: 20 },
    bite:        { n: 'Bite',         t: 'dark',     p: 60, a: 100, pp: 25 },
    peck:        { n: 'Peck',         t: 'flying',   p: 35, a: 100, pp: 35 },
    wingattack:  { n: 'Wing Attack',  t: 'flying',   p: 60, a: 100, pp: 35 },
    confusion:   { n: 'Confusion',    t: 'psychic',  p: 50, a: 100, pp: 25 },
    bugbite:     { n: 'Bug Bite',     t: 'bug',      p: 60, a: 100, pp: 20 },
    mudshot:     { n: 'Mud Shot',     t: 'ground',   p: 55, a: 95,  pp: 15 },
    karatechop:  { n: 'Karate Chop',  t: 'fighting', p: 50, a: 100, pp: 25 }
  };

  // sprite = number ng file sa images/pokemon/pokemon-XX.png (palitan para tumama sa sprites mo)
  const SPECIES = {
    treecko:   { n: 'Treecko',   t: ['grass'],            hp: 40, atk: 45,  def: 35, spd: 70, exp: 62, catch: .45, sprite: 1,  col: '#6bd36b',
                 moves: [[1,'scratch'],[1,'leer'],[6,'absorb'],[10,'quick'],[14,'razorleaf'],[18,'headbutt']] },
    torchic:   { n: 'Torchic',   t: ['fire'],             hp: 45, atk: 60,  def: 40, spd: 45, exp: 62, catch: .45, sprite: 2,  col: '#ff9a4d',
                 moves: [[1,'scratch'],[1,'growl'],[6,'ember'],[10,'quick'],[14,'flamewheel'],[18,'headbutt']] },
    mudkip:    { n: 'Mudkip',    t: ['water'],            hp: 50, atk: 70,  def: 50, spd: 40, exp: 62, catch: .45, sprite: 3,  col: '#5aa9ff',
                 moves: [[1,'tackle'],[1,'growl'],[6,'watergun'],[10,'mudshot'],[14,'bubblebeam'],[18,'headbutt']] },

    zigzagoon: { n: 'Zigzagoon', t: ['normal'],           hp: 38, atk: 30,  def: 41, spd: 60, exp: 56, catch: .75, sprite: 4,  col: '#c9a37a',
                 moves: [[1,'tackle'],[1,'growl'],[7,'quick'],[13,'headbutt']] },
    poochyena: { n: 'Poochyena', t: ['dark'],             hp: 35, atk: 55,  def: 35, spd: 35, exp: 56, catch: .70, sprite: 5,  col: '#7a7f8c',
                 moves: [[1,'tackle'],[1,'howl'],[7,'bite'],[13,'quick']] },
    wurmple:   { n: 'Wurmple',   t: ['bug'],              hp: 45, atk: 45,  def: 35, spd: 20, exp: 56, catch: .80, sprite: 6,  col: '#e56b6b',
                 moves: [[1,'tackle'],[1,'harden'],[7,'bugbite']] },
    taillow:   { n: 'Taillow',   t: ['normal','flying'],  hp: 40, atk: 55,  def: 30, spd: 85, exp: 59, catch: .60, sprite: 7,  col: '#4f78d6',
                 moves: [[1,'peck'],[1,'growl'],[8,'quick'],[13,'wingattack']] },
    wingull:   { n: 'Wingull',   t: ['water','flying'],   hp: 40, atk: 30,  def: 30, spd: 85, exp: 54, catch: .65, sprite: 8,  col: '#dfe9f5',
                 moves: [[1,'watergun'],[1,'growl'],[7,'quick'],[12,'wingattack']] },
    lotad:     { n: 'Lotad',     t: ['water','grass'],    hp: 40, atk: 30,  def: 30, spd: 30, exp: 74, catch: .60, sprite: 9,  col: '#58b8d8',
                 moves: [[1,'watergun'],[1,'growl'],[7,'absorb'],[13,'bubblebeam']] },
    seedot:    { n: 'Seedot',    t: ['grass'],            hp: 40, atk: 40,  def: 50, spd: 30, exp: 74, catch: .60, sprite: 10, col: '#b88a4a',
                 moves: [[1,'tackle'],[1,'harden'],[7,'absorb'],[13,'razorleaf']] },
    shroomish: { n: 'Shroomish', t: ['grass'],            hp: 60, atk: 40,  def: 60, spd: 35, exp: 65, catch: .60, sprite: 11, col: '#e8d9a8',
                 moves: [[1,'tackle'],[1,'absorb'],[8,'headbutt']] },
    surskit:   { n: 'Surskit',   t: ['bug','water'],      hp: 40, atk: 30,  def: 32, spd: 65, exp: 63, catch: .60, sprite: 12, col: '#4bb7e0',
                 moves: [[1,'watergun'],[1,'quick'],[8,'bugbite'],[14,'bubblebeam']] },
    electrike: { n: 'Electrike', t: ['electric'],         hp: 40, atk: 45,  def: 40, spd: 65, exp: 59, catch: .60, sprite: 13, col: '#7fe27f',
                 moves: [[1,'tackle'],[1,'leer'],[5,'thundershock'],[10,'quick'],[16,'spark']] },
    numel:     { n: 'Numel',     t: ['fire','ground'],    hp: 60, atk: 60,  def: 40, spd: 35, exp: 61, catch: .55, sprite: 14, col: '#f0c040',
                 moves: [[1,'tackle'],[1,'growl'],[6,'ember'],[12,'mudshot']] },
    makuhita:  { n: 'Makuhita',  t: ['fighting'],         hp: 72, atk: 60,  def: 30, spd: 25, exp: 47, catch: .55, sprite: 15, col: '#f2d24a',
                 moves: [[1,'tackle'],[1,'leer'],[7,'karatechop'],[13,'headbutt']] },
    trapinch:  { n: 'Trapinch',  t: ['ground'],           hp: 45, atk: 100, def: 45, spd: 10, exp: 58, catch: .50, sprite: 16, col: '#d8a860',
                 moves: [[1,'mudshot'],[1,'bite'],[10,'headbutt']] },
    ralts:     { n: 'Ralts',     t: ['psychic'],          hp: 28, atk: 25,  def: 25, spd: 40, exp: 40, catch: .45, sprite: 17, col: '#f4f0f0',
                 moves: [[1,'growl'],[1,'confusion'],[6,'quick']] },
    pikachu:   { n: 'Pikachu',   t: ['electric'],         hp: 35, atk: 55,  def: 30, spd: 90, exp: 82, catch: .30, sprite: 18, col: '#ffd84a',
                 moves: [[1,'thundershock'],[1,'growl'],[5,'quick'],[10,'spark']] }
  };

  const STARTERS = ['treecko', 'torchic', 'mudkip'];
  const WILD = [
    ['zigzagoon', 10], ['poochyena', 10], ['wurmple', 10], ['taillow', 10], ['wingull', 9],
    ['lotad', 9], ['seedot', 9], ['shroomish', 6], ['surskit', 6], ['electrike', 6],
    ['numel', 6], ['makuhita', 6], ['trapinch', 2], ['ralts', 2], ['pikachu', 1]
  ];

  /* ================= HELPERS ================= */
  const $ = s => root.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  const els = {
    screen: $('#pg-screen'), canvas: $('#pg-canvas'), ui: $('#pg-ui'),
    hud: $('#pg-hud'), hudLead: $('#pg-hud-lead'), hudBar: $('#pg-hud-bar'), hudItems: $('#pg-hud-items'),
    title: $('#pg-title'), btnNew: $('#pg-new'), btnContinue: $('#pg-continue'),
    starter: $('#pg-starter'), starterList: $('#pg-starter-list'),
    party: $('#pg-party'), partyList: $('#pg-party-list'), partyClose: $('#pg-party-close'),
    partyTitle: $('#pg-party-title'), boxCount: $('#pg-box-count'),
    battle: $('#pg-battle'),
    foeName: $('#pg-foe-name'), foeLv: $('#pg-foe-lv'), foeHp: $('#pg-foe-hp'), foeSprite: $('#pg-foe-sprite'),
    allyName: $('#pg-ally-name'), allyLv: $('#pg-ally-lv'), allyHp: $('#pg-ally-hp'),
    allyHpText: $('#pg-ally-hptext'), allyXp: $('#pg-ally-xp'), allySprite: $('#pg-ally-sprite'),
    msg: $('#pg-msg'),
    panelMain: $('#pg-panel-main'), panelMoves: $('#pg-panel-moves'), panelBag: $('#pg-panel-bag'),
    potionN: $('#pg-potion-n'), ballN: $('#pg-ball-n'),
    flash: $('#pg-flash'), toast: $('#pg-toast'),
    openParty: $('#pg-open-party'), reset: $('#pg-reset')
  };
  const ctx = els.canvas.getContext('2d');

  /* ================= SCALE UI TO SCREEN ================= */
  function fitUi() {
    els.ui.style.setProperty('--pg-scale', (els.screen.clientWidth / 480).toFixed(4));
  }
  fitUi();
  if ('ResizeObserver' in window) new ResizeObserver(fitUi).observe(els.screen);
  window.addEventListener('resize', fitUi);

  /* ================= MAP GENERATION ================= */
  function mulberry(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(G));

  (function buildMap() {
    const rand = mulberry(2026);
    const inb = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;
    const rect = (x, y, w, h, t) => {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inb(i, j)) map[j][i] = t;
    };
    const blob = (x, y, w, h, t) => {
      for (let j = y; j < y + h; j++) {
        for (let i = x; i < x + w; i++) {
          const edge = i === x || j === y || i === x + w - 1 || j === y + h - 1;
          if (edge && rand() < 0.4) continue;
          map[j][i] = t;
        }
      }
    };

    // tall grass patches (bushes)
    [[4, 4, 11, 8], [29, 5, 11, 7], [4, 20, 12, 8], [29, 20, 11, 8],
     [10, 12, 7, 3], [27, 12, 7, 3], [23, 22, 5, 6], [14, 6, 4, 4]].forEach(a => blob(...a, T));

    // ponds
    [[17, 20, 4, 3], [24, 8, 4, 3], [5, 14, 4, 2]].forEach(a => blob(...a, WA));

    // dirt paths
    rect(21, 6, 2, MAP_H - 8, P);
    rect(3, 16, MAP_W - 6, 2, P);

    // flowers + scattered trees
    for (let y = 2; y < MAP_H - 2; y++) {
      for (let x = 2; x < MAP_W - 2; x++) {
        if (map[y][x] !== G) continue;
        const r = rand();
        const nearSpawn = Math.abs(x - SPAWN.x) < 4 && Math.abs(y - SPAWN.y) < 4;
        if (r < 0.05) map[y][x] = F;
        else if (r < 0.095 && !nearSpawn) map[y][x] = R;
      }
    }

    // tree border (2 thick)
    rect(0, 0, MAP_W, 2, R);
    rect(0, MAP_H - 2, MAP_W, 2, R);
    rect(0, 0, 2, MAP_H, R);
    rect(MAP_W - 2, 0, 2, MAP_H, R);

    // heal house
    rect(19, 3, 6, 1, ROOF);
    rect(19, 4, 6, 2, WALL);
    map[DOOR.y][DOOR.x] = D;
    [[20, 6], [23, 6]].forEach(([x, y]) => { if (map[y][x] === R) map[y][x] = G; });
  })();

  const walkable = (x, y) =>
    x >= 0 && y >= 0 && x < MAP_W && y < MAP_H && [G, P, T, F, D].includes(map[y][x]);

  /* ================= MON LOGIC ================= */
  const calcStat = (base, l) => Math.floor(base * 2 * l / 100) + 5;

  function computeStats(m) {
    const s = SPECIES[m.key], l = m.level;
    m.maxhp = Math.floor(s.hp * 2 * l / 100) + l + 10;
    m.atk = calcStat(s.atk, l);
    m.def = calcStat(s.def, l);
    m.spd = calcStat(s.spd, l);
  }

  function movesFor(key, level) {
    return SPECIES[key].moves
      .filter(([lv]) => lv <= level)
      .map(([, k]) => k)
      .slice(-4)
      .map(k => ({ k, pp: MOVES[k].pp }));
  }

  function makeMon(key, level) {
    const m = { key, level, xp: level ** 3, st: { atk: 0, def: 0 } };
    computeStats(m);
    m.hp = m.maxhp;
    m.moves = movesFor(key, level);
    return m;
  }

  const stageMul = s => (s >= 0 ? (2 + s) / 2 : 2 / (2 - s));

  function effectiveness(type, defTypes) {
    let m = 1;
    defTypes.forEach(t => { m *= (CHART[type] && CHART[type][t] !== undefined) ? CHART[type][t] : 1; });
    return m;
  }

  function calcDamage(att, def, mv) {
    const A = att.atk * stageMul(att.st.atk);
    const D2 = def.def * stageMul(def.st.def);
    let dmg = ((2 * att.level / 5 + 2) * mv.p * A / D2) / 50 + 2;
    const stab = SPECIES[att.key].t.includes(mv.t) ? 1.5 : 1;
    const eff = effectiveness(mv.t, SPECIES[def.key].t);
    const crit = Math.random() < 1 / 16;
    dmg *= stab * eff * (crit ? 1.5 : 1) * (0.85 + Math.random() * 0.15);
    return { dmg: eff === 0 ? 0 : Math.max(1, Math.floor(dmg)), eff, crit };
  }

  const xpFloor = l => l ** 3;

  function pickWild() {
    const total = WILD.reduce((s, w) => s + w[1], 0);
    let r = Math.random() * total;
    for (const [k, w] of WILD) { r -= w; if (r <= 0) return k; }
    return WILD[0][0];
  }

  /* ================= GAME STATE ================= */
  let mode = 'title';           // title | starter | map | menu | battle
  let party = [];
  let box = [];
  let items = { ball: 10, potion: 5 };
  let dex = new Set();
  let battle = null;
  let visible = true;
  let held = [];

  const player = { x: SPAWN.x, y: SPAWN.y, dir: 'down', moving: false, t: 0, tx: 0, ty: 0, toggle: false };

  const lead = () => party[0];
  const nameOf = (m, side) => (side === 'foe' ? 'Wild ' : '') + SPECIES[m.key].n;

  /* ================= SAVE / LOAD ================= */
  const ser = m => ({ key: m.key, level: m.level, xp: m.xp, hp: m.hp });
  function deser(o) {
    const m = makeMon(o.key, o.level);
    m.xp = o.xp;
    m.hp = clamp(o.hp, 0, m.maxhp);
    return m;
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        party: party.map(ser), box: box.map(ser), items, dex: [...dex], x: player.x, y: player.y
      }));
    } catch (_) { /* storage optional */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d.party || !d.party.length) return false;
      party = d.party.map(deser);
      box = (d.box || []).map(deser);
      items = Object.assign({ ball: 10, potion: 5 }, d.items);
      dex = new Set(d.dex || []);
      if (walkable(d.x, d.y)) { player.x = d.x; player.y = d.y; }
      return true;
    } catch (_) { return false; }
  }

  const hasSave = () => { try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; } };

  /* ================= UI HELPERS ================= */
  let toastTimer;
  function showToast(text, ms = 2200) {
    els.toast.textContent = text;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), ms);
  }

  let wake = null;
  const sleep = ms => new Promise(res => {
    const t = setTimeout(() => { wake = null; res(); }, ms);
    wake = () => { clearTimeout(t); wake = null; res(); };
  });

  let skipFn = null;
  els.msg.addEventListener('click', () => { if (skipFn) skipFn(); });

  async function say(text, hold = 700) {
    let skipped = false;
    skipFn = () => { skipped = true; if (wake) wake(); };
    els.msg.textContent = '';
    for (let i = 1; i <= text.length; i++) {
      if (skipped) break;
      els.msg.textContent = text.slice(0, i);
      await sleep(14);
    }
    els.msg.textContent = text;
    if (!skipped) await sleep(hold);
    skipFn = null;
  }

  const setMsg = t => { els.msg.textContent = t; };

  function pulse(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  function setBar(el, ratio) {
    ratio = clamp(ratio, 0, 1);
    el.style.width = (ratio * 100) + '%';
    el.classList.toggle('mid', ratio <= 0.5 && ratio > 0.2);
    el.classList.toggle('low', ratio <= 0.2);
  }

  function renderSprite(el, key, flip) {
    const s = SPECIES[key];
    el.replaceChildren();
    el.classList.remove('pg-faint', 'pg-caught', 'pg-hit', 'pg-shake');
    el.classList.toggle('pg-flip', !!flip);
    const img = new Image();
    img.alt = s.n;
    img.draggable = false;
    img.src = SPRITE_PATH(s.sprite);
    const fb = document.createElement('span');
    fb.className = 'pg-sprite-fb';
    fb.textContent = s.n.slice(0, 2).toUpperCase();
    fb.style.background = s.col;
    fb.hidden = true;
    img.onerror = () => { img.remove(); fb.hidden = false; };
    el.append(img, fb);
  }

  function updateHud() {
    const l = lead();
    if (!l) return;
    els.hudLead.textContent = `${SPECIES[l.key].n}  Lv${l.level}`;
    setBar(els.hudBar, l.hp / l.maxhp);
    els.hudItems.innerHTML =
      `BALL x${items.ball} &nbsp; POTION x${items.potion}<br>DEX ${dex.size}/${Object.keys(SPECIES).length}`;
  }

  function refreshBattle() {
    const a = lead(), f = battle.foe;
    els.foeName.textContent = SPECIES[f.key].n;
    els.foeLv.textContent = 'Lv' + f.level;
    setBar(els.foeHp, f.hp / f.maxhp);

    els.allyName.textContent = SPECIES[a.key].n;
    els.allyLv.textContent = 'Lv' + a.level;
    setBar(els.allyHp, a.hp / a.maxhp);
    els.allyHpText.textContent = `${Math.max(0, a.hp)} / ${a.maxhp}`;
    const lo = xpFloor(a.level), hi = xpFloor(a.level + 1);
    els.allyXp.style.width = (a.level >= MAX_LV ? 100 : clamp((a.xp - lo) / (hi - lo), 0, 1) * 100) + '%';
  }

  function showPanel(name) {
    els.panelMain.hidden = name !== 'main';
    els.panelMoves.hidden = name !== 'moves';
    els.panelBag.hidden = name !== 'bag';
  }

  function healParty() {
    party.forEach(m => {
      m.hp = m.maxhp;
      m.moves.forEach(mv => { mv.pp = MOVES[mv.k].pp; });
    });
  }

  /* ================= PARTY SCREEN ================= */
  let partyResolve = null;

  function openParty(kind) {
    return new Promise(resolve => {
      partyResolve = resolve;
      els.partyTitle.textContent =
        kind === 'view' ? 'PARTY — TAP A POKéMON TO MAKE IT LEAD' :
        kind === 'forced' ? 'CHOOSE THE NEXT POKéMON' : 'SWITCH POKéMON';
      els.partyClose.hidden = kind === 'forced';
      els.boxCount.textContent = box.length ? `BOX: ${box.length} STORED` : '';
      renderParty(kind);
      els.party.hidden = false;
    });
  }

  function closeParty(result) {
    els.party.hidden = true;
    const r = partyResolve;
    partyResolve = null;
    if (r) r(result);
  }

  function renderParty(kind) {
    els.partyList.replaceChildren();
    party.forEach((m, i) => {
      const s = SPECIES[m.key];
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'pg-party-row' + (i === 0 ? ' lead' : '');
      const dead = m.hp <= 0;
      row.disabled = dead || i === 0;

      const sp = document.createElement('div');
      sp.className = 'pg-sprite';
      renderSprite(sp, m.key);

      const info = document.createElement('div');
      info.innerHTML = `<b>${s.n}</b> <small>${i === 0 ? '★ LEAD · ' : ''}Lv${m.level} · ${s.t.join('/').toUpperCase()}${dead ? ' · FAINTED' : ''}</small>`;

      const hp = document.createElement('div');
      hp.innerHTML = `<div class="pg-hp"><i></i></div><small>${m.hp}/${m.maxhp}</small>`;
      setBar(hp.querySelector('i'), m.hp / m.maxhp);

      row.append(sp, info, hp);
      row.addEventListener('click', () => {
        if (kind === 'view') {
          [party[0], party[i]] = [party[i], party[0]];
          renderParty('view');
          updateHud();
          save();
        } else {
          closeParty(i);
        }
      });
      els.partyList.appendChild(row);
    });
  }

  els.partyClose.addEventListener('click', () => closeParty(null));

  async function viewParty() {
  if (mode === 'battle') return showToast('Use the POKéMON button during battle.');
  if (mode !== 'map') return showToast('Start the game first!');
    mode = 'menu';
    held = [];
    await openParty('view');
    mode = 'map';
  }

  els.openParty.addEventListener('click', viewParty);

  /* ================= BATTLE ================= */
  let pendingAction = null;
  const getAction = () => new Promise(res => { pendingAction = res; });
  function chooseAction(a) {
    if (!pendingAction) return;
    const r = pendingAction;
    pendingAction = null;
    showPanel('none');
    r(a);
  }

  function buildMovesPanel() {
    const a = lead();
    els.panelMoves.replaceChildren();
    a.moves.forEach((slot, i) => {
      const mv = MOVES[slot.k];
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.act = 'move';
      b.dataset.idx = i;
      b.disabled = slot.pp <= 0;
      b.style.borderColor = TYPE_COL[mv.t];
      b.innerHTML = `${mv.n}<small>${mv.t.toUpperCase()} · PP ${slot.pp}/${mv.pp}</small>`;
      els.panelMoves.appendChild(b);
    });
    for (let i = a.moves.length; i < 4; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.disabled = true;
      b.textContent = '—';
      els.panelMoves.appendChild(b);
    }
    const back = document.createElement('button');
    back.type = 'button';
    back.dataset.act = 'back';
    back.className = 'pg-back';
    back.style.gridColumn = '1 / -1';
    back.textContent = '◀ BACK';
    els.panelMoves.appendChild(back);
  }

  els.battle.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-act]');
    if (!btn || !pendingAction || btn.disabled) return;
    const act = btn.dataset.act;
    const a = lead();

    if (act === 'fight') {
      if (a.moves.every(m => m.pp <= 0)) { chooseAction({ type: 'move', idx: -1 }); return; }
      buildMovesPanel(); showPanel('moves');
    } else if (act === 'bag') {
      els.potionN.textContent = `x${items.potion}`;
      els.ballN.textContent = `x${items.ball}`;
      showPanel('bag');
    } else if (act === 'back') {
      showPanel('main');
    } else if (act === 'move') {
      chooseAction({ type: 'move', idx: +btn.dataset.idx });
    } else if (act === 'potion') {
      if (items.potion <= 0) return setMsg('You have no Potions left!');
      if (a.hp >= a.maxhp) return setMsg(`${SPECIES[a.key].n}'s HP is already full!`);
      chooseAction({ type: 'potion' });
    } else if (act === 'ball') {
      if (items.ball <= 0) return setMsg('You have no Poké Balls left!');
      chooseAction({ type: 'ball' });
    } else if (act === 'run') {
      chooseAction({ type: 'run' });
    } else if (act === 'party') {
      showPanel('none');
      const idx = await openParty('switch');
      if (idx === null) showPanel('main');
      else chooseAction({ type: 'switch', idx });
    }
  });

  function statChange(mon, stat, delta, name) {
    const label = stat === 'atk' ? 'Attack' : 'Defense';
    const next = clamp(mon.st[stat] + delta, -4, 4);
    if (next === mon.st[stat]) return `${name}'s ${label} won't go any ${delta > 0 ? 'higher' : 'lower'}!`;
    mon.st[stat] = next;
    return `${name}'s ${label} ${delta > 0 ? 'rose' : 'fell'}!`;
  }

  async function useMove(att, def, slot, side) {
    const mv = MOVES[slot.k];
    const defSide = side === 'ally' ? 'foe' : 'ally';
    const attName = nameOf(att, side), defName = nameOf(def, defSide);
    const aEl = side === 'ally' ? els.allySprite : els.foeSprite;
    const dEl = side === 'ally' ? els.foeSprite : els.allySprite;

    if (side === 'ally' && slot.k !== 'struggle') slot.pp = Math.max(0, slot.pp - 1);

    await say(`${attName} used ${mv.n}!`, 300);
    pulse(aEl, side === 'ally' ? 'pg-lunge-ally' : 'pg-lunge-foe', 350);
    await sleep(260);

    if (Math.random() * 100 > mv.a) { await say(`${attName}'s attack missed!`, 500); return; }

    if (mv.p === 0) {
      let text = '';
      if (mv.fx === 'foeAtk') text = statChange(def, 'atk', -1, defName);
      else if (mv.fx === 'foeDef') text = statChange(def, 'def', -1, defName);
      else if (mv.fx === 'selfAtk') text = statChange(att, 'atk', 1, attName);
      else if (mv.fx === 'selfDef') text = statChange(att, 'def', 1, attName);
      await say(text, 600);
      return;
    }

    const r = calcDamage(att, def, mv);
    if (r.eff === 0) { await say(`It doesn't affect ${defName}...`, 600); return; }

    pulse(dEl, 'pg-hit', 400);
    def.hp = Math.max(0, def.hp - r.dmg);
    refreshBattle();
    await sleep(500);

    if (r.crit) await say('A critical hit!', 450);
    if (r.eff > 1) await say("It's super effective!", 550);
    else if (r.eff < 1) await say("It's not very effective...", 550);

    if (mv.fx === 'drain') {
      att.hp = Math.min(att.maxhp, att.hp + Math.max(1, Math.floor(r.dmg / 2)));
      refreshBattle();
      await say(`${attName} drained energy!`, 450);
    } else if (mv.fx === 'recoil') {
      att.hp = Math.max(0, att.hp - Math.max(1, Math.floor(r.dmg / 4)));
      refreshBattle();
      await say(`${attName} is hurt by recoil!`, 450);
    }
  }

  async function gainExp(mon, amount) {
    const name = SPECIES[mon.key].n;
    mon.xp += amount;
    refreshBattle();
    await say(`${name} gained ${amount} EXP. Points!`, 600);

    while (mon.level < MAX_LV && mon.xp >= xpFloor(mon.level + 1)) {
      const oldMax = mon.maxhp;
      mon.level++;
      computeStats(mon);
      mon.hp += mon.maxhp - oldMax;
      const old = mon.moves;
      const next = movesFor(mon.key, mon.level);
      mon.moves = next.map(n => old.find(o => o.k === n.k) || n);
      refreshBattle();
      await say(`${name} grew to Lv. ${mon.level}!`, 800);
      for (const n of next) {
        if (!old.some(o => o.k === n.k)) await say(`${name} learned ${MOVES[n.k].n}!`, 800);
      }
    }
  }

  async function foeFainted() {
    const foe = battle.foe, a = lead();
    els.foeSprite.classList.add('pg-faint');
    await say(`${nameOf(foe, 'foe')} fainted!`, 700);
    const amount = Math.max(1, Math.floor(SPECIES[foe.key].exp * foe.level / 5));
    await gainExp(a, amount);
    battle.over = true;
  }

  async function allyFainted() {
    const a = lead();
    els.allySprite.classList.add('pg-faint');
    await say(`${SPECIES[a.key].n} fainted!`, 700);

    if (party.some(m => m.hp > 0)) {
      const idx = await openParty('forced');
      [party[0], party[idx]] = [party[idx], party[0]];
      party[0].st = { atk: 0, def: 0 };
      renderSprite(els.allySprite, party[0].key, FLIP_ALLY);
      refreshBattle();
      await say(`Go! ${SPECIES[party[0].key].n}!`, 600);
    } else {
      await say('You have no Pokémon left to fight!', 800);
      await say('You rushed to the Poké Center...', 900);
      battle.result = 'whiteout';
      battle.over = true;
    }
  }

  async function afterAct() {
    if (battle.over) return;
    if (battle.foe.hp <= 0) { await foeFainted(); return; }
    if (lead().hp <= 0) await allyFainted();
  }

  async function throwBall() {
    const foe = battle.foe, s = SPECIES[foe.key];
    items.ball--;
    updateHud();
    await say('You threw a Poké Ball!', 500);

    const p = clamp((1 - 0.66 * foe.hp / foe.maxhp) * s.catch * 1.15, 0.05, 0.95);
    const shakes = Math.random() < p ? 3 : rint(0, 2);
    for (let i = 0; i < shakes; i++) {
      pulse(els.foeSprite, 'pg-shake', 500);
      await say('...', 450);
    }
    if (shakes === 3) {
      els.foeSprite.classList.add('pg-caught');
      await say(`Gotcha! ${s.n} was caught!`, 900);
      dex.add(foe.key);
      foe.st = { atk: 0, def: 0 };
      if (party.length < 6) {
        party.push(foe);
      } else {
        box.push(foe);
        await say(`${s.n} was sent to the Box.`, 800);
      }
      battle.over = true;
    } else {
      pulse(els.foeSprite, 'pg-shake', 500);
      await say(shakes === 0 ? 'Oh no! The Pokémon broke free!' : 'Aww! It appeared to be caught!', 700);
    }
  }

  async function allyAct(action) {
    const a = lead();
    if (action.type === 'move') {
      const slot = action.idx === -1 ? { k: 'struggle', pp: 1 } : a.moves[action.idx];
      if (action.idx === -1) await say(`${SPECIES[a.key].n} has no moves left!`, 600);
      await useMove(a, battle.foe, slot, 'ally');
    } else if (action.type === 'potion') {
      items.potion--;
      const before = a.hp;
      a.hp = Math.min(a.maxhp, a.hp + 20);
      refreshBattle();
      updateHud();
      await say(`You used a Potion. ${SPECIES[a.key].n} recovered ${a.hp - before} HP!`, 700);
    } else if (action.type === 'ball') {
      await throwBall();
    } else if (action.type === 'switch') {
      await say(`Come back, ${SPECIES[a.key].n}!`, 500);
      [party[0], party[action.idx]] = [party[action.idx], party[0]];
      party[0].st = { atk: 0, def: 0 };
      renderSprite(els.allySprite, party[0].key, FLIP_ALLY);
      refreshBattle();
      await say(`Go! ${SPECIES[party[0].key].n}!`, 600);
    } else if (action.type === 'run') {
      battle.runTries++;
      const f = battle.foe;
      const chance = Math.min(0.95, 0.4 + 0.12 * battle.runTries + a.spd / (a.spd + f.spd) * 0.4);
      if (Math.random() < chance) {
        await say('Got away safely!', 700);
        battle.over = true;
        return;
      }
      await say("You can't escape!", 600);
    }
    await afterAct();
  }

  async function foeAct() {
    const foe = battle.foe;
    const slot = foe.moves[rint(0, foe.moves.length - 1)];
    await useMove(foe, lead(), slot, 'foe');
    await afterAct();
  }

  async function round(action) {
    const actor = lead();
    let order = ['ally', 'foe'];

    if (action.type === 'move') {
      const slot = action.idx === -1 ? null : actor.moves[action.idx];
      const pri = slot ? (MOVES[slot.k].pri || 0) : 0;
      const foePri = 0;
      if (pri < foePri) order = ['foe', 'ally'];
      else if (pri === foePri) {
        const as = actor.spd * stageMul(0), fs = battle.foe.spd;
        if (fs > as || (fs === as && Math.random() < 0.5)) order = ['foe', 'ally'];
      }
    }

    for (const who of order) {
      if (battle.over) break;
      if (who === 'ally') {
        if (actor.hp <= 0 || lead() !== actor && action.type === 'move') continue;
        await allyAct(action);
      } else {
        if (battle.foe.hp <= 0 || lead().hp <= 0) continue;
        await foeAct();
      }
    }
  }

  async function battleLoop() {
    while (!battle.over) {
      refreshBattle();
      setMsg(`What will ${SPECIES[lead().key].n} do?`);
      showPanel('main');
      const action = await getAction();
      await round(action);
    }
  }

  async function startEncounter() {
    if (mode === 'battle') return;
    mode = 'battle';
    held = [];

    if (lead().hp <= 0) {
      const i = party.findIndex(m => m.hp > 0);
      if (i > 0) [party[0], party[i]] = [party[i], party[0]];
    }

    els.flash.classList.add('go');
    await sleep(900);

    const key = pickWild();
    const lv = clamp(lead().level + rint(-2, 1), 2, MAX_LV);
    battle = { foe: makeMon(key, lv), over: false, runTries: 0, result: null };
    party.forEach(m => { m.st = { atk: 0, def: 0 }; });

    renderSprite(els.foeSprite, key, false);
    renderSprite(els.allySprite, lead().key, FLIP_ALLY);
    showPanel('none');
    refreshBattle();
    els.battle.hidden = false;
    els.flash.classList.remove('go');

    await say(`A wild ${SPECIES[key].n} appeared!`, 800);
    await say(`Go! ${SPECIES[lead().key].n}!`, 500);
    await battleLoop();
    await endBattle();
  }

  async function endBattle() {
    await sleep(250);
    els.battle.hidden = true;
    if (battle.result === 'whiteout') {
      healParty();
      player.x = SPAWN.x; player.y = SPAWN.y; player.moving = false;
      showToast('Your Pokémon were healed. Try again!');
    }
    battle = null;
    save();
    updateHud();
    mode = 'map';
  }

  /* ================= INPUT ================= */
  const press = d => { if (!held.includes(d)) held.push(d); };
  const release = d => { held = held.filter(x => x !== d); };
  const heldDir = () => held[held.length - 1];

  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
  };
  const focused = () => root.contains(document.activeElement);

  window.addEventListener('keydown', e => {
    if (!focused()) return;
    if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
    const d = KEYMAP[e.key];
    if (d) press(d);
    if ((e.key === 'p' || e.key === 'P') && mode === 'map') viewParty();
  });
  window.addEventListener('keyup', e => { const d = KEYMAP[e.key]; if (d) release(d); });
  window.addEventListener('blur', () => { held = []; });

  root.addEventListener('pointerdown', () => {
    if (!root.contains(document.activeElement)) root.focus({ preventScroll: true });
  });

  root.querySelectorAll('.pg-dpad button').forEach(b => {
    const d = b.dataset.dir;
    b.addEventListener('pointerdown', e => { e.preventDefault(); press(d); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => release(d)));
    b.addEventListener('contextmenu', e => e.preventDefault());
  });

  /* ================= MAP UPDATE ================= */
  function onArrive() {
    const tile = map[player.y][player.x];
    if (tile === D) {
      healParty();
      items.ball = Math.max(items.ball, 8);
      items.potion = Math.max(items.potion, 4);
      updateHud();
      save();
      showToast('Your Pokémon were fully healed! Items restocked.');
      return;
    }
    if (tile === T && Math.random() < ENCOUNTER_RATE) startEncounter();
  }

  function update(dt) {
    if (mode !== 'map') return;

    if (!player.moving) {
      const d = heldDir();
      if (!d) return;
      player.dir = d;
      const [dx, dy] = DIRS[d];
      const nx = player.x + dx, ny = player.y + dy;
      if (!walkable(nx, ny)) return;
      player.moving = true;
      player.t = 0;
      player.tx = nx;
      player.ty = ny;
    }

    player.t += dt / STEP_MS;
    if (player.t >= 1) {
      player.x = player.tx;
      player.y = player.ty;
      player.moving = false;
      player.t = 0;
      player.toggle = !player.toggle;
      onArrive();
    }
  }

  /* ================= RENDERING ================= */
  const n01 = (x, y, k = 0) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + k * 37.719) * 43758.5453;
    return v - Math.floor(v);
  };

  function drawGrassBase(px, py, x, y) {
    ctx.fillStyle = '#5db85d';
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = '#4aa34a';
    for (let i = 0; i < 3; i++) {
      if (n01(x, y, i) < 0.6) {
        ctx.fillRect(px + 3 + Math.floor(n01(x, y, i + 5) * 24), py + 3 + Math.floor(n01(x, y, i + 9) * 24), 3, 2);
      }
    }
  }

  function drawTallGrass(px, py, x, y, time, bottomOnly) {
    const sway = Math.round(Math.sin(time / 350 + x * 1.7 + y) * 1);
    if (!bottomOnly) {
      ctx.fillStyle = '#2f8a43';
      ctx.fillRect(px, py, TILE, TILE);
    }
    for (let i = 0; i < 4; i++) {
      const bx = px + 2 + i * 8;
      const top = (bottomOnly ? py + 17 : py + 5) + (i % 2) * 4;
      ctx.fillStyle = '#1d6b30';
      ctx.fillRect(bx + sway, top, 4, py + TILE - top);
      ctx.fillStyle = '#5fd072';
      ctx.fillRect(bx + 1 + sway, top, 2, 9);
    }
  }

  function drawTile(t, x, y, time) {
    const px = x * TILE, py = y * TILE;
    switch (t) {
      case G: drawGrassBase(px, py, x, y); break;
      case P:
        ctx.fillStyle = '#d8b878';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#c4a060';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(px + 3 + Math.floor(n01(x, y, i) * 24), py + 3 + Math.floor(n01(x, y, i + 4) * 24), 3, 3);
        }
        break;
      case T: drawTallGrass(px, py, x, y, time, false); break;
      case R:
        drawGrassBase(px, py, x, y);
        ctx.fillStyle = '#6b4a2a';
        ctx.fillRect(px + 12, py + 20, 8, 12);
        ctx.fillStyle = '#1f6b2a';
        ctx.beginPath(); ctx.arc(px + 16, py + 14, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2f8f3a';
        ctx.beginPath(); ctx.arc(px + 12, py + 10, 7, 0, Math.PI * 2); ctx.fill();
        break;
      case WA: {
        ctx.fillStyle = '#3a7bd5';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#6fa8f0';
        const o = Math.floor(time / 400 + x * 2 + y) % 3;
        ctx.fillRect(px + 4 + o * 4, py + 8, 10, 2);
        ctx.fillRect(px + 14 - o * 3, py + 20, 12, 2);
        break;
      }
      case F:
        drawGrassBase(px, py, x, y);
        for (let i = 0; i < 3; i++) {
          const fx = px + 4 + Math.floor(n01(x, y, i + 20) * 22), fy = py + 4 + Math.floor(n01(x, y, i + 30) * 22);
          ctx.fillStyle = ['#ff6b8a', '#ffe066', '#ffffff'][i];
          ctx.fillRect(fx, fy, 4, 4);
          ctx.fillStyle = '#ffb000';
          ctx.fillRect(fx + 1, fy + 1, 2, 2);
        }
        break;
      case ROOF:
        ctx.fillStyle = '#d9453b';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#b3332b';
        for (let i = 0; i < 4; i++) ctx.fillRect(px, py + 6 + i * 8, TILE, 2);
        break;
      case WALL:
      case D:
        ctx.fillStyle = '#f2e6c8';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#d8c9a2';
        ctx.fillRect(px, py + TILE - 3, TILE, 3);
        if (t === D) {
          ctx.fillStyle = '#2d46b8';
          ctx.fillRect(px + 4, py + 2, 24, 30);
          ctx.fillStyle = '#6f8cff';
          ctx.fillRect(px + 7, py + 5, 18, 27);
          ctx.fillStyle = '#ffd34d';
          ctx.fillRect(px + 21, py + 18, 3, 3);
        } else {
          ctx.fillStyle = '#8fd0f5';
          ctx.fillRect(px + 8, py + 6, 16, 14);
          ctx.fillStyle = '#ffffff88';
          ctx.fillRect(px + 10, py + 8, 5, 10);
        }
        break;
      default: break;
    }
  }

  function drawPlayer(sx, sy, dir, walking, toggle) {
    const bob = walking ? -1 : 0;
    const y0 = sy + 2 + bob;
    ctx.fillStyle = '#00000044';
    ctx.beginPath(); ctx.ellipse(sx + 16, sy + 29, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

    // legs
    ctx.fillStyle = '#2b4aa8';
    const l1 = walking && toggle ? 2 : 0, l2 = walking && !toggle ? 2 : 0;
    ctx.fillRect(sx + 10, y0 + 20, 5, 8 - l1);
    ctx.fillRect(sx + 17, y0 + 20, 5, 8 - l2);

    // arms
    ctx.fillStyle = '#f2c9a0';
    ctx.fillRect(sx + 6, y0 + 12, 3, 8);
    ctx.fillRect(sx + 23, y0 + 12, 3, 8);

    // body
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(sx + 9, y0 + 11, 14, 10);
    ctx.fillStyle = '#3fae5a';
    ctx.fillRect(sx + 9, y0 + 11, 14, 3);

    // head
    ctx.fillStyle = '#f2c9a0';
    ctx.fillRect(sx + 10, y0 + 2, 12, 10);
    if (dir === 'up') {
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(sx + 10, y0 + 5, 12, 7);
    } else if (dir === 'down') {
      ctx.fillStyle = '#1b1f33';
      ctx.fillRect(sx + 12, y0 + 7, 2, 3);
      ctx.fillRect(sx + 18, y0 + 7, 2, 3);
    } else if (dir === 'left') {
      ctx.fillStyle = '#1b1f33';
      ctx.fillRect(sx + 11, y0 + 7, 2, 3);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(sx + 18, y0 + 5, 4, 7);
    } else {
      ctx.fillStyle = '#1b1f33';
      ctx.fillRect(sx + 19, y0 + 7, 2, 3);
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(sx + 10, y0 + 5, 4, 7);
    }

    // cap
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(sx + 9, y0, 14, 5);
    ctx.fillStyle = '#3fae5a';
    ctx.fillRect(sx + 9, y0 + 3, 14, 2);
    if (dir === 'left') ctx.fillRect(sx + 6, y0 + 4, 4, 2);
    if (dir === 'right') ctx.fillRect(sx + 22, y0 + 4, 4, 2);
  }

  function draw(time) {
    ctx.imageSmoothingEnabled = false;

    const k = player.moving ? Math.min(player.t, 1) : 0;
    const rx = player.x + (player.moving ? (player.tx - player.x) * k : 0);
    const ry = player.y + (player.moving ? (player.ty - player.y) * k : 0);

    const camX = Math.round(clamp(rx * TILE + TILE / 2 - W / 2, 0, MAP_W * TILE - W));
    const camY = Math.round(clamp(ry * TILE + TILE / 2 - H / 2, 0, MAP_H * TILE - H));

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(-camX, -camY);

    const x0 = Math.max(0, Math.floor(camX / TILE)), x1 = Math.min(MAP_W - 1, Math.ceil((camX + W) / TILE));
    const y0 = Math.max(0, Math.floor(camY / TILE)), y1 = Math.min(MAP_H - 1, Math.ceil((camY + H) / TILE));

    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) drawTile(map[y][x], x, y, time);

    // HEAL sign
    ctx.fillStyle = '#d9453b';
    ctx.fillRect(20 * TILE + 8, 3 * TILE - 14, 4 * TILE - 16, 13);
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HEAL', 22 * TILE, 3 * TILE - 4);
    ctx.textAlign = 'left';

    // player
    drawPlayer(Math.round(rx * TILE), Math.round(ry * TILE), player.dir, player.moving, player.toggle);

    // grass covers the player's feet
    const gx = Math.round(rx), gy = Math.round(ry);
    if (map[gy] && map[gy][gx] === T) drawTallGrass(gx * TILE, gy * TILE, gx, gy, time, true);

    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 50);
    last = now;
    if (visible) { update(dt); draw(now); }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: 0.01 }).observe(root);
  }

  /* ================= START / TITLE / STARTER ================= */
  function startMap() {
    els.title.hidden = true;
    els.starter.hidden = true;
    els.hud.hidden = false;
    updateHud();
    mode = 'map';
  }

  function showStarters() {
    els.title.hidden = true;
    els.starter.hidden = false;
    mode = 'starter';
    els.starterList.replaceChildren();
    STARTERS.forEach(key => {
      const s = SPECIES[key];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pg-starter-card';
      const sp = document.createElement('div');
      sp.className = 'pg-sprite';
      renderSprite(sp, key);
      const b = document.createElement('b');
      b.textContent = s.n;
      const small = document.createElement('small');
      small.textContent = s.t[0].toUpperCase() + ' TYPE';
      small.style.color = TYPE_COL[s.t[0]];
      card.append(sp, b, small);
      card.addEventListener('click', () => {
        party = [makeMon(key, 5)];
        box = [];
        items = { ball: 10, potion: 5 };
        dex = new Set([key]);
        player.x = SPAWN.x; player.y = SPAWN.y; player.dir = 'down'; player.moving = false;
        save();
        startMap();
        showToast(`${s.n} joined your team! Find the tall grass!`, 3000);
      });
      els.starterList.appendChild(card);
    });
  }

  els.btnNew.addEventListener('click', () => {
    if (hasSave() && !confirm('Start a new game? Your old save will be replaced.')) return;
    showStarters();
  });

  els.btnContinue.addEventListener('click', () => {
    if (load()) startMap();
    else showStarters();
  });

  let resetArmed = false, resetTimer;
els.reset.addEventListener('click', () => {
  if (mode === 'battle') return showToast('Finish the battle first!');
  if (mode === 'menu') return showToast('Close the party screen first.');
  if (!hasSave() && mode !== 'map') return showToast('Nothing to reset yet.');

  if (!resetArmed) {
    resetArmed = true;
    showToast('Tap RESET again to delete your save', 3000);
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { resetArmed = false; }, 3000);
    return;
  }
  resetArmed = false;

  try { localStorage.removeItem(SAVE_KEY); } catch (_) { /* ignore */ }
  held = [];
  party = []; box = []; dex = new Set();
  player.x = SPAWN.x; player.y = SPAWN.y; player.moving = false;
  els.hud.hidden = true;
  els.starter.hidden = true;
  els.btnContinue.hidden = true;
  els.title.hidden = false;
  mode = 'title';
});

  els.btnContinue.hidden = !hasSave();
  requestAnimationFrame(frame);
})();