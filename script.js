
"use strict";

// Mobile navigation
const menuButton = document.getElementById("menu-btn");
const navigation = document.getElementById("nav-menu");
const navigationLinks = document.querySelectorAll(".nav-link");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Automatically update the footer year
const yearElement = document.getElementById("current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Reveal sections when they enter the viewport
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// Highlight the current navigation section
const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", isCurrent);
        });
      });
    },
    { rootMargin: "-30% 0px -55% 0px" }
  );

  pageSections.forEach((section) => sectionObserver.observe(section));
}

// Welcome notification
const welcomeToast = document.getElementById("welcome-toast");

if (welcomeToast) {
  window.setTimeout(() => {
    welcomeToast.classList.add("show");

    window.setTimeout(() => {
      welcomeToast.classList.remove("show");
    }, 3000);
  }, 700);
}

// --------------------------------------------------
// Original 8-bit game-inspired background music
// Uses Web Audio API; no external audio file needed.
// --------------------------------------------------

const soundToggle = document.getElementById("sound-toggle");
const soundLabel = document.getElementById("sound-label");

let audioContext = null;
let masterGain = null;
let musicPlaying = false;
let activeMusicId = 0;
let nextNoteTimer = null;
let nextNoteTime = 0;
let currentNoteIndex = 0;

const melody = [
  [659.25, 0.16], [783.99, 0.16], [987.77, 0.22],
  [783.99, 0.16], [659.25, 0.16], [523.25, 0.22],
  [587.33, 0.16], [659.25, 0.16], [783.99, 0.28],
  [659.25, 0.16], [587.33, 0.16], [523.25, 0.28],
  [440.00, 0.16], [523.25, 0.16], [659.25, 0.22],
  [587.33, 0.16], [523.25, 0.16], [493.88, 0.22],
  [523.25, 0.16], [587.33, 0.16], [659.25, 0.28],
  [783.99, 0.16], [659.25, 0.16], [587.33, 0.30]
];

function setupAudio() {
  if (audioContext) return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }

  audioContext = new AudioContextClass();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(audioContext.destination);
}

function playTone(frequency, startTime, duration, type, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(
    Math.max(volume, 0.0002),
    startTime + 0.012
  );
  gain.gain.setValueAtTime(
    Math.max(volume, 0.0002),
    startTime + Math.max(0.02, duration * 0.65)
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );

  oscillator.connect(gain);
  gain.connect(masterGain);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function scheduleNextNote(musicId) {
  if (!musicPlaying || musicId !== activeMusicId) return;

  const [frequency, beatLength] = melody[currentNoteIndex];
  const duration = beatLength * 0.88;

  playTone(frequency, nextNoteTime, duration, "square", 0.17);

  // A simple bass line adds a retro handheld-game feel.
  if (currentNoteIndex % 3 === 0) {
    const bassFrequency = frequency / 2;
    playTone(
      bassFrequency,
      nextNoteTime,
      beatLength * 0.82,
      "triangle",
      0.16
    );
  }

  nextNoteTime += beatLength;
  currentNoteIndex = (currentNoteIndex + 1) % melody.length;

  const delay = Math.max(
    20,
    (nextNoteTime - audioContext.currentTime - 0.08) * 1000
  );

  nextNoteTimer = window.setTimeout(() => {
    scheduleNextNote(musicId);
  }, delay);
}

async function startMusic() {
  try {
    setupAudio();
    await audioContext.resume();

    musicPlaying = true;
    activeMusicId += 1;
    currentNoteIndex = 0;
    nextNoteTime = audioContext.currentTime + 0.05;

    soundToggle.classList.add("is-playing");
    soundToggle.setAttribute("aria-pressed", "true");
    soundLabel.textContent = "MUSIC: ON";

    scheduleNextNote(activeMusicId);
  } catch (error) {
    console.error("Could not start background music:", error);
    soundLabel.textContent = "MUSIC UNAVAILABLE";
  }
}

function stopMusic() {
  musicPlaying = false;
  activeMusicId += 1;

  if (nextNoteTimer !== null) {
    window.clearTimeout(nextNoteTimer);
    nextNoteTimer = null;
  }

  if (masterGain && audioContext) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(
      0.0001,
      audioContext.currentTime,
      0.04
    );
  }

  soundToggle.classList.remove("is-playing");
  soundToggle.setAttribute("aria-pressed", "false");
  soundLabel.textContent = "MUSIC: OFF";

  // Recreate a fresh gain node the next time music starts.
  if (audioContext) {
    window.setTimeout(() => {
      if (!musicPlaying && audioContext && masterGain) {
        masterGain.disconnect();
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.12;
        masterGain.connect(audioContext.destination);
      }
    }, 150);
  }
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    if (musicPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });
}
