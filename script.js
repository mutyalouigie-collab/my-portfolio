document.addEventListener('DOMContentLoaded', () => {
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
});