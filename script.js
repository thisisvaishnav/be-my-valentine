import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import anime from 'https://cdn.skypack.dev/animejs';

// ===== DOM ELEMENTS =====
const yesButton = document.getElementById('yesButton');
let noButton = document.getElementById('noButton');
const imageDisplay = document.getElementById('imageDisplay');
const valentineQuestion = document.getElementById('valentineQuestion');
const responseButtons = document.getElementById('responseButtons');
const typewriterText = document.getElementById('typewriterText');
const floatingHeartsContainer = document.getElementById('floatingHearts');
const sparklesContainer = document.getElementById('sparkles');
const mainCard = document.getElementById('mainCard');
const imageFrame = document.querySelector('.image-frame');

// ===== STATE =====
let noClickCount = 0;
let isEvilMode = false;

// ===== CUSTOM CURSOR & TRAIL =====
const customCursor = document.createElement('div');
customCursor.className = 'custom-cursor';
customCursor.setAttribute('aria-hidden', 'true');
customCursor.textContent = '💖';
document.body.appendChild(customCursor);

const trailSymbols = ['✦', '✧', '♥', '·', '❤'];
const evilTrailSymbols = ['💔', '🔥', '💢', '❌', '😈'];
let lastTrailTime = 0;
const TRAIL_THROTTLE_MS = 40;

// Cursor emojis that escalate with each No click (9 stages + default)
const cursorEmojisByNoCount = ['💖', '🥺', '😢', '💗', '💔', '😩', '😤', '🤖', '🥹', '💘'];
let currentDefaultCursorEmoji = '💖';

const handleMouseMove = (e) => {
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;

  const now = Date.now();
  if (now - lastTrailTime < TRAIL_THROTTLE_MS) return;
  lastTrailTime = now;

  const particle = document.createElement('span');
  particle.setAttribute('aria-hidden', 'true');

  if (isEvilMode) {
    particle.className = 'trail-particle evil-particle';
    particle.textContent = evilTrailSymbols[Math.floor(Math.random() * evilTrailSymbols.length)];
    particle.style.color = '#ff1a1a';
    particle.style.filter = 'drop-shadow(0 0 4px rgba(255,0,0,0.6))';
  } else {
    particle.className = 'trail-particle';
    const symbols = trailSymbols;
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    particle.style.color = '#ff6b8a';
    particle.style.filter = 'drop-shadow(0 0 3px rgba(255,107,138,0.5))';
  }

  // Slight random offset for organic feel
  const offsetX = (Math.random() - 0.5) * 14;
  const offsetY = (Math.random() - 0.5) * 14;
  particle.style.left = `${e.clientX + offsetX}px`;
  particle.style.top = `${e.clientY + offsetY}px`;
  particle.style.fontSize = `${Math.random() * 8 + 10}px`;

  document.body.appendChild(particle);

  setTimeout(() => particle.remove(), 320);
};

document.addEventListener('mousemove', handleMouseMove);

// Hide custom cursor when mouse leaves the viewport
document.addEventListener('mouseleave', () => {
  customCursor.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  customCursor.style.opacity = '1';
});

// Evil mode toggles on No button hover
const handleNoButtonEnter = () => {
  isEvilMode = true;
  customCursor.textContent = '😈';
  customCursor.classList.add('evil-mode');
};

const handleNoButtonLeave = () => {
  isEvilMode = false;
  customCursor.textContent = currentDefaultCursorEmoji;
  customCursor.classList.remove('evil-mode');
};

noButton.addEventListener('mouseenter', handleNoButtonEnter);
noButton.addEventListener('mouseleave', handleNoButtonLeave);

// =============================================================
// ===== AUDIO CONTEXT =====
// =============================================================
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
};

// ===== CHIME SOUND (ascending tones on Yes click) =====
const playChime = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const startTime = now + i * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 1);
  });
};

// ===== MUSIC SWELL (warm chord that builds after chime) =====
const playMusicSwell = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  // C major 7 chord: C4, E4, G4, B4
  const chordFreqs = [261.63, 329.63, 392.0, 493.88];

  chordFreqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
    gain.gain.linearRampToValueAtTime(0.05, now + 3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 5.5);
  });
};


// =============================================================
// ===== MICRO-REACTIONS =====
// =============================================================

// ----- 1. BUTTON PRESS RIPPLE (pink heart ripple) -----
const addRippleEffect = (button) => {
  // Ensure ripple container exists inside the button
  let rippleContainer = button.querySelector('.ripple-container');
  if (!rippleContainer) {
    rippleContainer = document.createElement('span');
    rippleContainer.className = 'ripple-container';
    rippleContainer.setAttribute('aria-hidden', 'true');
    button.appendChild(rippleContainer);
  }

  const handleRippleClick = (e) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-heart';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    rippleContainer.appendChild(ripple);

    setTimeout(() => ripple.remove(), 650);
  };

  button.addEventListener('mousedown', handleRippleClick);
};

// Attach ripple to both buttons
addRippleEffect(yesButton);
addRippleEffect(noButton);

// ----- 2. CARD PARALLAX TILT -----
const TILT_MAX_DEG = 2; // max ±2° rotation for premium feel
const PERSPECTIVE_PX = 800;

const handleCardMouseMove = (e) => {
  const rect = mainCard.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // -1 to 1 range from center
  const offsetX = (e.clientX - centerX) / (rect.width / 2);
  const offsetY = (e.clientY - centerY) / (rect.height / 2);

  // Clamp to prevent extreme tilt
  const clampedX = Math.max(-1, Math.min(1, offsetX));
  const clampedY = Math.max(-1, Math.min(1, offsetY));

  // rotateY follows X axis, rotateX follows inverted Y axis
  const rotateY = clampedX * TILT_MAX_DEG;
  const rotateX = -clampedY * TILT_MAX_DEG;

  mainCard.classList.remove('tilt-reset');
  mainCard.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
};

const handleCardMouseLeave = () => {
  mainCard.classList.add('tilt-reset');
  mainCard.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(0deg) rotateY(0deg)`;
};

mainCard.addEventListener('mousemove', handleCardMouseMove);
mainCard.addEventListener('mouseleave', handleCardMouseLeave);

// ----- 3. DUCK GIF BORDER GLOW (mouse proximity) -----
const GLOW_MAX_DISTANCE = 300; // pixels — glow starts fading at this distance

const handleProximityGlow = (e) => {
  if (!imageFrame) return;

  const rect = imageFrame.getBoundingClientRect();
  const frameCenterX = rect.left + rect.width / 2;
  const frameCenterY = rect.top + rect.height / 2;

  const dx = e.clientX - frameCenterX;
  const dy = e.clientY - frameCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 1 = mouse on top, 0 = at max distance or beyond
  const proximity = Math.max(0, 1 - distance / GLOW_MAX_DISTANCE);

  // Interpolate glow values
  const baseSpread = 20;
  const extraSpread = proximity * 30; // up to 50px total
  const baseAlpha = 0.3;
  const extraAlpha = proximity * 0.45; // up to 0.75 total
  const outerAlpha = proximity * 0.3;
  const brightness = 1 + proximity * 0.15; // subtle brightness boost

  imageFrame.style.boxShadow = `
    0 4px ${baseSpread + extraSpread}px rgba(255, 107, 138, ${(baseAlpha + extraAlpha).toFixed(2)}),
    0 0 ${60 * proximity}px rgba(255, 107, 138, ${outerAlpha.toFixed(2)})
  `;
  imageFrame.style.filter = `brightness(${brightness.toFixed(2)})`;
};

document.addEventListener('mousemove', handleProximityGlow);
const imagePaths = [
  './images/image1.gif',
  './images/image2.gif',
  './images/image3.gif',
  './images/smile.jpeg',
  './images/image5.gif',
  './images/image6.gif',
  './images/image7.gif',
];

// ===== NO ESCALATION SCRIPT (9 stages) =====
const noEscalation = [
  // Click 1 — Soft + Playful
  {
    text: 'Wait… was that a misclick? 👀',
    sub: 'Try again, Anshu 🥺',
    img: './images/image2.gif',
  },
  // Click 2 — Emotional Pull
  {
    text: "Okay… now you're just testing my patience 😭",
    sub: 'My heart is literally buffering right now…',
    img: './images/image3.gif',
  },
  // Click 3 — Personal + Flirty
  {
    text: "Anshu… you know I'd choose you every single time, right? 💖",
    sub: "Don't make me say it out loud again 🫠",
    img: './images/smile.jpeg',
  },
  // Click 4 — Fake Sad Drama
  {
    text: 'Wow. Okay. This hurts more than leg day. 💔',
    sub: 'Duck is crying. I am crying.',
    img: './images/image5.gif',
  },
  // Click 5 — Desi Cute Mode
  {
    text: 'Areee yaar Anshu 😩',
    sub: 'Itna bhi bhaav nahi dete…',
    img: './images/monkey.jpeg',
  },
  // Click 6 — Soft Threat (Funny)
  {
    text: "One more No and I'm stealing your KitKats 😤🍫",
    sub: 'Last warning.',
    img: './images/baby.jpeg',
  },
  // Click 7 — Meta / Dev Humor
  {
    text: 'Mera stomach kharab h aur mood maat kharab karo no pe click kar k 😤',
    sub: 'Please click Yes to continue ❤️',
    img: './images/image1.gif',
  },
  // Click 8 — Surrender but Actually Not
  {
    text: 'Fine. I give up.',
    sub: `Just kidding. I'll never give up on you 🥹`,
    subDelay: 1000,
    img: './images/image7.gif',
  },
  // Click 9 — Final Lock-In
  {
    text: 'Alright. Decision made.',
    sub: "You're mine now. 💘",
    img: './images/image3.gif',
    finalLockin: true,
  },
];

// ===== SOUND =====
const playSound = (soundPath) => {
  const audio = new Audio(soundPath);
  audio.play().catch(() => {});
};

// ===== TYPEWRITER EFFECT =====
const typewriterEffect = (element, text, speed = 70) => {
  let index = 0;
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  element.textContent = '';
  element.appendChild(cursor);

  const type = () => {
    if (index < text.length) {
      element.insertBefore(document.createTextNode(text.charAt(index)), cursor);
      index++;
      setTimeout(type, speed);
    } else {
      setTimeout(() => cursor.remove(), 2000);
    }
  };

  setTimeout(type, 800);
};

// Start typewriter on load
typewriterEffect(typewriterText, 'Will you be my Valentine? 💕');

// ===== FLOATING HEARTS GENERATOR =====
const heartSymbols = ['♥', '❤', '💕', '💗', '💖', '💝'];

const createFloatingHeart = () => {
  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${Math.random() * 24 + 24}px`;
  const duration = Math.random() * 6 + 10;
  heart.style.animationDuration = `${duration}s`;
  heart.style.animationDelay = `${Math.random() * 3}s`;
  heart.style.opacity = '0';
  floatingHeartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), (duration + 3) * 1000);
};

// Generate hearts slowly — elegant, not chaotic
setInterval(createFloatingHeart, 2500);
// Gentle initial burst — just a few
for (let i = 0; i < 4; i++) {
  setTimeout(createFloatingHeart, i * 600);
}

// ===== SPARKLES GENERATOR =====
const createSparkle = () => {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = `${Math.random() * 100}%`;
  sparkle.style.top = `${Math.random() * 100}%`;
  sparkle.style.animationDelay = `${Math.random() * 2.5}s`;
  sparkle.style.animationDuration = `${Math.random() * 2 + 2}s`;
  sparkle.style.opacity = '0';
  sparklesContainer.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 5000);
};

// Fewer sparkles — subtle ambient shimmer
setInterval(createSparkle, 1200);
for (let i = 0; i < 6; i++) {
  setTimeout(createSparkle, i * 350);
}

// ===== UTILITIES =====
const getRandomNumber = (num) => Math.floor(Math.random() * (num + 1));

// ===== RUNAWAY BUTTON LOGIC =====
const runawayButtonLogic = (button) => {
  const moveButton = function () {
    const top = getRandomNumber(window.innerHeight - this.offsetHeight);
    const left = getRandomNumber(window.innerWidth - this.offsetWidth);
    animateMove(this, 'top', top).play();
    animateMove(this, 'left', left).play();
  };
  button.addEventListener('mouseover', moveButton);
  button.addEventListener('click', moveButton);
};

const animateMove = (element, prop, pixels) =>
  anime({
    targets: element,
    [prop]: `${pixels}px`,
    easing: 'easeOutCirc',
    duration: 500,
  });

// ===== HELPER: Animate text change with pop =====
const animateTextChange = (element, newText) => {
  element.textContent = newText;
  element.style.animation = 'none';
  element.offsetHeight; // force reflow
  element.style.animation = '';
  element.classList.add('text-pop-animate');
  setTimeout(() => element.classList.remove('text-pop-animate'), 600);
};

// ===== HELPER: Animate subtext change =====
const animateSubChange = (element, newText, delay = 0) => {
  if (delay > 0) {
    element.textContent = '';
    element.style.opacity = '0';
    setTimeout(() => {
      element.textContent = newText;
      element.className = 'subtext escalation-sub';
      element.style.opacity = '';
      element.style.animation = 'none';
      element.offsetHeight;
      element.style.animation = '';
      element.classList.add('text-pop-animate');
    }, delay);
    return;
  }

  element.textContent = newText;
  element.className = 'subtext escalation-sub';
  element.style.opacity = '';
  element.style.animation = 'none';
  element.offsetHeight;
  element.style.animation = '';
  element.classList.add('text-pop-animate');
};

// =============================================================
// ===== EMOTIONAL CURVE EFFECTS =====
// =============================================================

// ----- 3rd No: Emotional Dip (dim + sad duck + tear) -----
const triggerEmotionalDip = () => {
  // 1. Background dim overlay
  const dimOverlay = document.createElement('div');
  dimOverlay.className = 'emotional-dim-overlay';
  dimOverlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dimOverlay);

  // 2. Sad duck — desaturate image frame
  const imgFrame = document.querySelector('.image-frame');
  if (imgFrame) {
    imgFrame.classList.add('sad-duck-frame');
    // Recover after 4 seconds (next click will also reset it)
    setTimeout(() => imgFrame.classList.remove('sad-duck-frame'), 4000);
  }

  // 3. Tear drops from the image
  const tearEmojis = ['😢', '💧'];
  tearEmojis.forEach((emoji, i) => {
    const tear = document.createElement('span');
    tear.className = 'tear-drop';
    tear.textContent = emoji;
    tear.setAttribute('aria-hidden', 'true');
    // Position near the image
    if (imgFrame) {
      const rect = imgFrame.getBoundingClientRect();
      tear.style.left = `${rect.left + rect.width * (0.3 + i * 0.4)}px`;
      tear.style.top = `${rect.bottom - 10}px`;
    }
    document.body.appendChild(tear);
    setTimeout(() => tear.remove(), 2200);
  });

  // 4. Mute floating hearts briefly
  floatingHeartsContainer.classList.add('muted-hearts');
  setTimeout(() => floatingHeartsContainer.classList.remove('muted-hearts'), 3500);

  // Auto-remove dim overlay
  setTimeout(() => dimOverlay.remove(), 4000);
};

// ----- 6th No: Humor Spike (flash + chocolate rain + bounce) -----
const triggerHumorSpike = () => {
  // 1. Quick comedic screen flash
  const flash = document.createElement('div');
  flash.className = 'humor-flash-overlay';
  flash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);

  // 2. Chocolate / candy emoji rain
  const candyEmojis = ['🍫', '🍬', '🍭', '🍩', '🧁', '🎂', '🍪', '🍰'];
  for (let i = 0; i < 18; i++) {
    const candy = document.createElement('span');
    candy.className = 'chocolate-rain-particle';
    candy.textContent = candyEmojis[Math.floor(Math.random() * candyEmojis.length)];
    candy.setAttribute('aria-hidden', 'true');
    candy.style.left = `${Math.random() * 100}vw`;
    candy.style.top = `${-10 - Math.random() * 20}px`;
    candy.style.fontSize = `${24 + Math.random() * 20}px`;
    const duration = 1.5 + Math.random() * 1.5;
    candy.style.animationDuration = `${duration}s`;
    candy.style.animationDelay = `${Math.random() * 0.6}s`;
    document.body.appendChild(candy);
    setTimeout(() => candy.remove(), (duration + 0.6) * 1000 + 200);
  }

  // 3. Card playful bounce
  mainCard.classList.remove('humor-bounce');
  mainCard.offsetHeight; // force reflow
  mainCard.classList.add('humor-bounce');
  setTimeout(() => mainCard.classList.remove('humor-bounce'), 900);

  // 4. Remove any lingering sadness from earlier
  const imgFrame = document.querySelector('.image-frame');
  if (imgFrame) imgFrame.classList.remove('sad-duck-frame');
  document.querySelector('.emotional-dim-overlay')?.remove();
  floatingHeartsContainer.classList.remove('muted-hearts');
};

// ----- 8th No: Magnetic Yes Pull (glow + spotlight + No shrink) -----
const triggerYesMagneticPull = () => {
  // 1. Yes button magnetic glow
  yesButton.classList.add('yes-magnetic-glow');

  // 2. Spotlight ring behind Yes button
  const existingSpotlight = yesButton.parentElement.querySelector('.yes-spotlight-ring');
  if (!existingSpotlight) {
    // Make parent relative if not already
    yesButton.style.position = 'relative';
    const spotlightRing = document.createElement('div');
    spotlightRing.className = 'yes-spotlight-ring';
    spotlightRing.setAttribute('aria-hidden', 'true');
    yesButton.appendChild(spotlightRing);
  }

  // 3. Shrink & fade the No button
  noButton.classList.add('no-shrinking');

  // 4. Clear any lingering earlier effects
  const imgFrame = document.querySelector('.image-frame');
  if (imgFrame) imgFrame.classList.remove('sad-duck-frame');
  document.querySelector('.emotional-dim-overlay')?.remove();
  floatingHeartsContainer.classList.remove('muted-hearts');
};

// ===== NO BUTTON HESITATION DELAY =====
let noButtonProcessing = false;

const getHesitationDelay = (currentClickCount) => {
  // currentClickCount is the count BEFORE this click is processed
  if (currentClickCount < 3) return 0;       // Clicks 1–3: instant
  if (currentClickCount === 3) return 200;    // Click 4: slight hesitation
  if (currentClickCount === 4) return 400;    // Click 5: noticeable
  if (currentClickCount === 5) return 600;    // Click 6: heavier
  if (currentClickCount === 6) return 800;    // Click 7: sluggish
  if (currentClickCount === 7) return 1100;   // Click 8: very reluctant
  return 0;                                    // Click 9: runaway (no delay)
};

// ===== NO ESCALATION PROCESSOR =====
const processNoEscalation = () => {
  noClickCount++;

  const stage = noEscalation[noClickCount - 1];
  const greetingLine = document.querySelector('.greeting-line');
  const questionLine = document.querySelector('.question-line');
  const subtextEl = document.querySelector('.subtext');

  // Show Yes button if hidden (after cheeky popup reset)
  if (yesButton.style.display === 'none') {
    yesButton.style.display = '';
  }

  // Update image
  imageDisplay.src = stage.img;

  // Escalate cursor emoji
  currentDefaultCursorEmoji = cursorEmojisByNoCount[noClickCount] || '💘';
  customCursor.textContent = currentDefaultCursorEmoji;

  // Update main heading — switch to escalation mode
  if (greetingLine) {
    greetingLine.classList.add('escalation-mode');
    animateTextChange(greetingLine, stage.text);
  }

  // Hide the typewriter question line
  if (questionLine) {
    questionLine.style.display = 'none';
  }

  // Update subtext
  if (subtextEl) {
    animateSubChange(subtextEl, stage.sub, stage.subDelay || 0);
  }

  // Grow Yes button (quadratic escalation — starts at click 2)
  if (noClickCount >= 2) {
    const factor = noClickCount - 1; // 1 to 8
    const newHeight = 52 + factor * factor * 1.2;
    const newWidth = 130 + factor * factor * 2.5;
    const newFontSize = 18 + factor * factor * 0.4;
    yesButton.style.height = `${Math.round(newHeight)}px`;
    yesButton.style.width = `${Math.round(newWidth)}px`;
    yesButton.style.fontSize = `${Math.round(newFontSize)}px`;
  }

  // ===== EMOTIONAL CURVE — stage-specific effects =====
  // 3rd No → emotional dip
  if (noClickCount === 3) {
    triggerEmotionalDip();
  }
  // 6th No → humor spike
  else if (noClickCount === 6) {
    triggerHumorSpike();
  }
  // 8th No → UI magnetic pull toward Yes
  else if (noClickCount === 8) {
    triggerYesMagneticPull();
  }

  // Card shake for dramatic effect (skip when humor-bounce is active)
  if (noClickCount !== 6) {
    mainCard.classList.remove('card-shake');
    mainCard.offsetHeight;
    mainCard.classList.add('card-shake');
    setTimeout(() => mainCard.classList.remove('card-shake'), 500);
  }

  // ===== FINAL LOCK-IN (Click 9) =====
  if (stage.finalLockin) {
    // Make Yes button massive with glowing pulse
    yesButton.style.height = '140px';
    yesButton.style.width = '320px';
    yesButton.style.fontSize = '46px';
    yesButton.classList.remove('bounce2');
    yesButton.classList.add('yes-button-lockin');

    // Add vignette overlay for cinematic feel
    const vignette = document.createElement('div');
    vignette.className = 'lockin-vignette';
    vignette.setAttribute('aria-hidden', 'true');
    document.body.appendChild(vignette);

    // Create runaway No button
    const runawayBtn = document.createElement('button');
    runawayBtn.id = 'runawayButton';
    runawayBtn.textContent = 'No';
    runawayBtn.style.position = 'absolute';
    runawayBtn.style.backgroundColor = '#ff5a5f';
    runawayBtn.style.color = 'white';
    runawayBtn.style.padding = '10px 22px';
    runawayBtn.style.borderRadius = '50px';
    runawayBtn.style.cursor = 'pointer';
    runawayBtn.style.fontSize = '14px';
    runawayBtn.style.fontWeight = '600';
    runawayBtn.style.fontFamily = "'Poppins', sans-serif";
    runawayBtn.style.opacity = '0.7';
    runawayBtn.style.transition = 'opacity 0.2s ease';

    const yesRect = yesButton.getBoundingClientRect();
    runawayBtn.style.top = `${yesRect.bottom + 15}px`;
    runawayBtn.style.left = `${yesRect.left + yesRect.width / 2}px`;

    // Transfer evil-mode hover
    noButton.removeEventListener('mouseenter', handleNoButtonEnter);
    noButton.removeEventListener('mouseleave', handleNoButtonLeave);
    runawayBtn.addEventListener('mouseenter', handleNoButtonEnter);
    runawayBtn.addEventListener('mouseleave', handleNoButtonLeave);

    noButton.replaceWith(runawayBtn);
    addRippleEffect(runawayBtn);
    runawayButtonLogic(runawayBtn);
    return;
  }

  // Update No button text contextually for earlier stages
  const noButtonTexts = [
    'No', 'Still no', 'No...', 'No 💔',
    'Nahi', 'No 😤', '404', '...', 'No',
  ];
  noButton.textContent = noButtonTexts[noClickCount - 1] || 'No';
};

// ===== NO BUTTON HANDLER (9-stage escalation with hesitation) =====
const handleNoClick = () => {
  playSound('./sounds/click.mp3');
  if (noClickCount >= 9 || noButtonProcessing) return;

  const hesitationDelay = getHesitationDelay(noClickCount);

  if (hesitationDelay > 0) {
    // Button feels reluctant — visual hesitation then processes
    noButtonProcessing = true;
    noButton.classList.add('no-button-hesitant');
    setTimeout(() => {
      noButton.classList.remove('no-button-hesitant');
      noButtonProcessing = false;
      processNoEscalation();
    }, hesitationDelay);
  } else {
    processNoEscalation();
  }
};

noButton.addEventListener('click', handleNoClick);

// ===== HEART-SHAPED CONFETTI =====
const heartShape = confetti.shapeFromPath({
  path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
});

const fireHeartConfetti = () => {
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.4,
    decay: 0.94,
    startVelocity: 20,
    colors: ['#FF6B8A', '#FF9A9E', '#FFD1DC', '#bd1e59', '#ff5a5f'],
    shapes: [heartShape],
    scalar: 1.2,
  };

  confetti({ ...defaults, particleCount: 50, origin: { x: 0.2, y: 0.5 } });
  confetti({ ...defaults, particleCount: 50, origin: { x: 0.8, y: 0.5 } });

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.5, y: 0.3 } });
  }, 300);

  setTimeout(() => {
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.3, y: 0.7 } });
    confetti({ ...defaults, particleCount: 40, origin: { x: 0.7, y: 0.7 } });
  }, 600);

  // Keep confetti going for celebration
  let burstCount = 0;
  const confettiInterval = setInterval(() => {
    confetti({
      particleCount: 15,
      spread: 180,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: ['#FF6B8A', '#FF9A9E', '#FFD1DC', '#bd1e59'],
      shapes: [heartShape],
      scalar: 0.8,
      gravity: 0.6,
    });
    burstCount++;
    if (burstCount > 20) clearInterval(confettiInterval);
  }, 400);
};

// ===== CHEEKY POPUP (said yes too fast → sends back to start) =====
let hasBeenScolded = false;

const showCheekyPopup = () => {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'cheeky-overlay';

  // Popup card
  const popup = document.createElement('div');
  popup.className = 'cheeky-popup';
  popup.innerHTML = `
    <div class="cheeky-emoji">😏</div>
    <div class="cheeky-title">Areee Anshu!</div>
    <div class="cheeky-message">Nakhre kon dikhayega?<br>Itni jaldi haa bol diya! 😂💕</div>
    <div class="cheeky-sub">Thoda toh tadpaati... but okay, I love it! 🥰</div>
    <p style="font-family:'Poppins',sans-serif; font-size:13px; color:#bd1e59; margin-top:8px; font-weight:600;">Pehle thoda drama kar, phir bol haa 😤💕</p>
    <button class="cheeky-btn" aria-label="Try again" tabindex="0">
      Okay okay, dobara try karti hoon 🙈
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    popup.style.transform = 'scale(1) translateY(0)';
    popup.style.opacity = '1';
  });

  // Dismiss → reset page, hide Yes button
  const dismissBtn = popup.querySelector('.cheeky-btn');
  addRippleEffect(dismissBtn);
  const handleDismiss = () => {
    popup.style.transform = 'scale(0.8) translateY(20px)';
    popup.style.opacity = '0';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      resetToStart();
    }, 350);
  };

  dismissBtn.addEventListener('click', handleDismiss);
  dismissBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handleDismiss();
  });
};

// ===== RESET TO START (after cheeky popup) =====
const resetToStart = () => {
  hasBeenScolded = true;
  noClickCount = 0;
  noButtonProcessing = false;

  // Reset image
  imageDisplay.src = imagePaths[0];

  // Reset heading to original state
  const greetingLine = document.querySelector('.greeting-line');
  const questionLine = document.querySelector('.question-line');
  const subtextEl = document.querySelector('.subtext');

  if (greetingLine) {
    greetingLine.classList.remove('escalation-mode');
    greetingLine.textContent = 'Hey Anshu';
    greetingLine.style.animation = '';
  }

  if (questionLine) {
    questionLine.style.display = '';
    typewriterText.textContent = '';
    typewriterEffect(typewriterText, 'Will you be my Valentine? 💕');
  }

  if (subtextEl) {
    subtextEl.textContent = 'I made this just for you... 🥺';
    subtextEl.className = 'subtext fade-in-delayed';
  }

  // Reset Yes button size + state
  yesButton.style.height = '';
  yesButton.style.width = '';
  yesButton.style.fontSize = '';
  yesButton.classList.remove('yes-button-lockin');
  yesButton.classList.add('bounce2');
  yesButton.style.display = 'none'; // must click No first!

  // Remove vignette if present
  document.querySelector('.lockin-vignette')?.remove();

  // Reset emotional curve effects
  yesButton.classList.remove('yes-magnetic-glow');
  yesButton.querySelector('.yes-spotlight-ring')?.remove();
  noButton.classList.remove('no-shrinking');
  document.querySelector('.emotional-dim-overlay')?.remove();
  const imgFrameReset = document.querySelector('.image-frame');
  if (imgFrameReset) imgFrameReset.classList.remove('sad-duck-frame');
  floatingHeartsContainer.classList.remove('muted-hearts');

  // Reset cursor
  currentDefaultCursorEmoji = '💖';
  customCursor.textContent = '💖';

  // Reset No button (in case it was replaced by runaway button)
  const existingRunaway = document.getElementById('runawayButton');
  if (existingRunaway) {
    const freshNoButton = document.createElement('button');
    freshNoButton.id = 'noButton';
    freshNoButton.className = 'no-button';
    freshNoButton.textContent = 'No';
    freshNoButton.setAttribute('aria-label', 'Say no');
    freshNoButton.setAttribute('tabindex', '0');
    freshNoButton.addEventListener('click', handleNoClick);
    freshNoButton.addEventListener('mouseenter', handleNoButtonEnter);
    freshNoButton.addEventListener('mouseleave', handleNoButtonLeave);
    addRippleEffect(freshNoButton);
    existingRunaway.replaceWith(freshNoButton);
    noButton = freshNoButton;
  } else {
    noButton.textContent = 'No';
  }
};

// ===== CELEBRATION LOGIC =====
const showCelebration = () => {
  // Remove image and buttons
  const imageFrame = imageDisplay.closest('.image-frame');
  if (imageFrame) imageFrame.remove();
  else imageDisplay.remove();

  responseButtons.style.display = 'none';
  document.querySelector('.subtext')?.remove();

  // Build celebration page
  valentineQuestion.innerHTML = `
    <div class="celebration-container">
      <img src="./images/image7.gif" alt="Celebration duckie" class="celebration-image" />
      <div class="celebration-title">Yayyy Anshu!!</div>
      <div class="celebration-subtitle">You just made me the happiest person ever! 🥹💖</div>
      <div class="celebration-message">
        Happy Valentine's Day, my love!<br>
        I promise to always make you smile ❤️
      </div>
    </div>
  `;

  // Add floating baddie image (floats in and settles, never covers the card)
  const floatImage = document.createElement('img');
  floatImage.src = './images/baddie.jpg';
  floatImage.alt = 'My Valentine';
  floatImage.className = 'baddie-float-in';
  document.body.appendChild(floatImage);

  // Fire heart confetti
  fireHeartConfetti();

  // Play "10 things" song
  const loveSong = new Audio('./images/10 things.mp3');
  loveSong.loop = true;
  loveSong.volume = 0.5;
  loveSong.play().catch(() => {});

  // Add the hidden Easter egg to the celebration page
  setTimeout(() => addCelebrationEasterEgg(), 1200);

  // Add the "Save this memory" button (appears after celebration settles)
  setTimeout(() => addSaveMemoryButton(), 2000);
};

// ===== CINEMATIC YES TRANSITION =====
const cinematicYesTransition = (callback) => {
  // 1. Brief silence (200ms) → then chime
  setTimeout(() => {
    playChime();
  }, 200);

  // 3. Music swell builds after chime
  setTimeout(() => {
    playMusicSwell();
  }, 800);

  // 4. Proceed to celebration after chime finishes
  setTimeout(() => {
    callback();
  }, 1000);
};

// ===== YES BUTTON HANDLER =====
const handleYesClick = () => {
  playSound('./sounds/click.mp3');

  // If she hasn't been scolded yet and said yes without clicking No → cheeky popup, reset
  if (!hasBeenScolded && noClickCount === 0) {
    showCheekyPopup();
    return;
  }

  // Otherwise cinematic transition → celebration
  cinematicYesTransition(() => showCelebration());
};

yesButton.addEventListener('click', handleYesClick);

// ===== YES BUTTON HOVER TEXT SWAP =====
const handleYesMouseEnter = () => {
  if (yesButton.classList.contains('yes-button-lockin')) return;
  const rippleContainer = yesButton.querySelector('.ripple-container');
  yesButton.innerHTML = '<span class="button-heart">&#10084;</span> Obviously Yes <span class="button-heart">&#10084;</span>';
  if (rippleContainer) yesButton.appendChild(rippleContainer);
};

const handleYesMouseLeave = () => {
  if (yesButton.classList.contains('yes-button-lockin')) return;
  const rippleContainer = yesButton.querySelector('.ripple-container');
  yesButton.innerHTML = '<span class="button-heart">&#10084;</span> Yes <span class="button-heart">&#10084;</span>';
  if (rippleContainer) yesButton.appendChild(rippleContainer);
};

yesButton.addEventListener('mouseenter', handleYesMouseEnter);
yesButton.addEventListener('mouseleave', handleYesMouseLeave);

// =============================================================
// ===== CELEBRATION EASTER EGG (5-click egg → photo reveal) ===
// =============================================================

const EASTER_EGG_PHOTO = './images/both.jpeg';
const EGG_CLICKS_NEEDED = 5;
let eggClickCount = 0;
let eggRevealed = false;

// Spawn burst particles when egg cracks open
const spawnEggBurstParticles = (x, y) => {
  const emojis = ['✨', '💖', '💕', '🌟', '💗', '⭐', '🥚'];
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('span');
    particle.className = 'egg-burst-particle';
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.setAttribute('aria-hidden', 'true');

    const angle = (Math.PI * 2 * i) / 10;
    const distance = 60 + Math.random() * 50;
    const endX = x + Math.cos(angle) * distance;
    const endY = y + Math.sin(angle) * distance;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.fontSize = `${14 + Math.random() * 12}px`;
    particle.style.animation = 'none';

    document.body.appendChild(particle);

    // Animate each particle outward
    requestAnimationFrame(() => {
      particle.style.transition = `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      particle.style.left = `${endX}px`;
      particle.style.top = `${endY}px`;
      particle.style.opacity = '0';
      particle.style.transform = `translate(-50%, -50%) scale(0.3) rotate(${Math.random() * 360}deg)`;
    });

    setTimeout(() => particle.remove(), 800);
  }
};

// Play magical reveal chime
const playEggRevealChime = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = now + i * 0.13;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1);
  });
};

// Show the "Us Forever" photo reveal
const showUsForeverPhoto = () => {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'egg-reveal-overlay';
  document.body.appendChild(overlay);

  // Photo container
  const photoContainer = document.createElement('div');
  photoContainer.className = 'us-forever-reveal';

  const photo = document.createElement('img');
  photo.src = './images/both.jpeg';
  photo.alt = 'Us together';
  photo.className = 'us-forever-photo';
  photoContainer.appendChild(photo);

  const foreverLabel = document.createElement('div');
  foreverLabel.className = 'us-forever-label';
  foreverLabel.textContent = 'Us Forever 💕';
  photoContainer.appendChild(foreverLabel);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'rose-video-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close photo');
  closeBtn.setAttribute('tabindex', '0');
  photoContainer.appendChild(closeBtn);

  document.body.appendChild(photoContainer);

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  // Mini heart confetti burst for the moment
  fireHeartConfetti();

  // Dismiss handler
  const handlePhotoDismiss = () => {
    photoContainer.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    photoContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
    photoContainer.style.opacity = '0';
    overlay.classList.remove('visible');

    setTimeout(() => {
      overlay.remove();
      photoContainer.remove();
    }, 400);
  };

  overlay.addEventListener('click', handlePhotoDismiss);
  closeBtn.addEventListener('click', handlePhotoDismiss);
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handlePhotoDismiss();
  });
};

// Show the rose video in a beautiful overlay
const showRoseVideo = () => {
  let loopCount = 0;
  let transitioned = false;

  // Transition from video to "Us Forever" photo
  const transitionToPhoto = () => {
    if (transitioned) return;
    transitioned = true;

    videoContainer.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    videoContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
    videoContainer.style.opacity = '0';
    overlay.classList.remove('visible');

    setTimeout(() => {
      video.pause();
      overlay.remove();
      videoContainer.remove();
      // Show the couple photo after a brief pause
      setTimeout(() => showUsForeverPhoto(), 300);
    }, 400);
  };

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'egg-reveal-overlay';
  document.body.appendChild(overlay);

  // Create video container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'rose-video-reveal';

  const video = document.createElement('video');
  video.src = './images/ROSE.mp4';
  video.autoplay = true;
  video.loop = true;
  video.muted = false;
  video.playsInline = true;
  video.setAttribute('aria-label', 'A rose for you');
  videoContainer.appendChild(video);

  // Track loops — after 2 full plays, auto-show the photo
  video.addEventListener('ended', () => {
    loopCount++;
    if (loopCount >= 2) {
      transitionToPhoto();
    }
  });

  // Since loop=true, 'ended' won't fire. Use 'timeupdate' + 'seeked' instead.
  // Actually, with loop=true the 'ended' event does NOT fire. 
  // We track via 'timeupdate' watching for resets to start.
  let lastTime = 0;
  video.addEventListener('timeupdate', () => {
    if (transitioned) return;
    // Detect loop restart: currentTime jumps back to near 0
    if (video.currentTime < lastTime - 0.5) {
      loopCount++;
      if (loopCount >= 2) {
        transitionToPhoto();
      }
    }
    lastTime = video.currentTime;
  });

  const label = document.createElement('div');
  label.className = 'rose-video-label';
  label.textContent = 'Here is a rose for you, my Valentine 🌹💕';
  videoContainer.appendChild(label);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'rose-video-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close video');
  closeBtn.setAttribute('tabindex', '0');
  videoContainer.appendChild(closeBtn);

  document.body.appendChild(videoContainer);

  // Animate overlay in
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
  });

  // Close / overlay click → transition to photo
  closeBtn.addEventListener('click', transitionToPhoto);
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') transitionToPhoto();
  });
  overlay.addEventListener('click', transitionToPhoto);
};

// Reveal the rose video after egg cracks (5-second wait)
const revealEggPhoto = (eggButton) => {
  eggRevealed = true;

  // Get egg position for burst particles
  const eggRect = eggButton.getBoundingClientRect();
  const eggX = eggRect.left + eggRect.width / 2;
  const eggY = eggRect.top + eggRect.height / 2;

  // Remove the egg wrapper (label + egg) with a pop
  const eggWrapper = eggButton.closest('.easter-egg-wrapper');
  eggButton.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  eggButton.style.transform = 'scale(1.5)';
  eggButton.style.opacity = '0';
  if (eggWrapper) {
    eggWrapper.style.transition = 'opacity 0.3s ease';
    eggWrapper.style.opacity = '0';
    setTimeout(() => eggWrapper.remove(), 300);
  } else {
    setTimeout(() => eggButton.remove(), 300);
  }

  // Burst particles from egg position
  spawnEggBurstParticles(eggX, eggY);

  // Play chime
  playEggRevealChime();

  // Show a "something special" teaser message during the wait
  const teaserMsg = document.createElement('div');
  teaserMsg.className = 'rose-teaser-message';
  teaserMsg.textContent = 'Something special is coming... 🌹';
  teaserMsg.setAttribute('aria-live', 'polite');
  const celebrationContainer = document.querySelector('.celebration-container');
  if (celebrationContainer) {
    celebrationContainer.appendChild(teaserMsg);
  }

  // After 2 seconds, remove teaser and show the rose video
  setTimeout(() => {
    teaserMsg.remove();
    showRoseVideo();
  }, 2000);
};

// Handle egg clicks with progressive feedback
const handleEggClick = (eggButton) => {
  if (eggRevealed) return;

  eggClickCount++;

  // Visual feedback per click stage
  if (eggClickCount === 1 || eggClickCount === 2) {
    // Subtle wobble
    eggButton.classList.add('egg-shaking');
    setTimeout(() => eggButton.classList.remove('egg-shaking'), 400);
  } else if (eggClickCount === 3) {
    // First crack — emoji changes, glow starts
    eggButton.textContent = '🥚';
    eggButton.classList.add('egg-crack-1');
    eggButton.classList.add('egg-shaking');
    setTimeout(() => eggButton.classList.remove('egg-shaking'), 400);
  } else if (eggClickCount === 4) {
    // More cracks — stronger glow and wobble
    eggButton.textContent = '😄';
    eggButton.classList.remove('egg-crack-1');
    eggButton.classList.add('egg-crack-2');
  }

  // 5th click — reveal!
  if (eggClickCount >= EGG_CLICKS_NEEDED) {
    revealEggPhoto(eggButton);
  }
};

// Inject the egg into the celebration container
const addCelebrationEasterEgg = () => {
  const celebrationContainer = document.querySelector('.celebration-container');
  if (!celebrationContainer) return;

  celebrationContainer.style.position = 'relative';

  // Wrapper for egg + label
  const eggWrapper = document.createElement('div');
  eggWrapper.className = 'easter-egg-wrapper';

  // Label text
  const eggLabel = document.createElement('div');
  eggLabel.className = 'easter-egg-label';
  eggLabel.textContent = 'Crack this egg in 5 clicks! 🥚✨';
  eggWrapper.appendChild(eggLabel);

  // Egg button
  const eggButton = document.createElement('button');
  eggButton.className = 'easter-egg-btn';
  eggButton.textContent = '🥚';
  eggButton.setAttribute('aria-label', 'Crack this egg in 5 clicks');
  eggButton.setAttribute('tabindex', '0');

  eggButton.addEventListener('click', () => handleEggClick(eggButton));
  eggButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handleEggClick(eggButton);
  });

  eggWrapper.appendChild(eggButton);
  celebrationContainer.appendChild(eggWrapper);
};

// =============================================================
// ===== SAVE THIS MOMENT (Export Feature) ======================
// =============================================================

const LOVE_LETTER_TEXT = `💌 Our Valentine's Memory 💌
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey Anshu,

You said YES! 🥹💖

You just made me the happiest person ever!
Happy Valentine's Day, my love!
I promise to always make you smile ❤️

This moment — saved forever.
Because you're my forever.

With all my love,
Your Valentine 💕

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Saved on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
`;

// Play a soft shutter / capture sound
const playCaptureSound = () => {
  const ctx = getAudioCtx();
  const now = ctx.currentTime;

  // Soft "snap" click
  const noise = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  noise.type = 'sine';
  noise.frequency.value = 1200;
  noiseGain.gain.setValueAtTime(0.12, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.1);

  // Followed by a warm confirmation tone
  const confirm = ctx.createOscillator();
  const confirmGain = ctx.createGain();
  confirm.type = 'triangle';
  confirm.frequency.value = 880;
  confirmGain.gain.setValueAtTime(0, now + 0.1);
  confirmGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
  confirmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  confirm.connect(confirmGain);
  confirmGain.connect(ctx.destination);
  confirm.start(now + 0.1);
  confirm.stop(now + 0.7);
};

// Flash overlay effect (camera flash)
const triggerFlashEffect = () => {
  const flash = document.createElement('div');
  flash.className = 'save-flash-overlay';
  flash.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flash);

  requestAnimationFrame(() => {
    flash.style.opacity = '1';
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 400);
    }, 150);
  });
};

// ---- Export: Screenshot ----
const handleSaveScreenshot = async () => {
  const celebrationContainer = document.querySelector('.celebration-container');
  if (!celebrationContainer) return;

  playCaptureSound();
  triggerFlashEffect();

  try {
    // Brief delay for flash effect
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(celebrationContainer, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
      borderRadius: '24px',
    });

    // Create a styled output canvas with a pretty background
    const outputCanvas = document.createElement('canvas');
    const padding = 60;
    outputCanvas.width = canvas.width + padding * 2;
    outputCanvas.height = canvas.height + padding * 2 + 80;
    const ctx2d = outputCanvas.getContext('2d');

    // Gradient background
    const gradient = ctx2d.createLinearGradient(0, 0, outputCanvas.width, outputCanvas.height);
    gradient.addColorStop(0, '#ffb6c1');
    gradient.addColorStop(0.5, '#ffd1dc');
    gradient.addColorStop(1, '#fff0f5');
    ctx2d.fillStyle = gradient;
    ctx2d.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Draw the captured content centered
    ctx2d.drawImage(canvas, padding, padding);

    // Add footer text
    ctx2d.font = '24px "Dancing Script", cursive, sans-serif';
    ctx2d.fillStyle = '#bd1e59';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(
      `Saved with love — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      outputCanvas.width / 2,
      outputCanvas.height - 30
    );

    // Download
    const link = document.createElement('a');
    link.download = `valentine-memory-${Date.now()}.png`;
    link.href = outputCanvas.toDataURL('image/png');
    link.click();

    showSaveToast('Image saved! Check your downloads 📸');
  } catch (err) {
    console.error('Screenshot failed:', err);
    showSaveToast('Oops! Could not save image 😢');
  }
};

// ---- Export: Copy Love Note to Clipboard ----
const handleCopyLoveNote = async () => {
  playCaptureSound();

  try {
    await navigator.clipboard.writeText(LOVE_LETTER_TEXT);
    showSaveToast('Love note copied! Paste it anywhere 💌');
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = LOVE_LETTER_TEXT;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showSaveToast('Love note copied! 💌');
  }
};

// ---- Export: Download Love Letter (.txt) ----
const handleDownloadLoveLetter = () => {
  playCaptureSound();

  const blob = new Blob([LOVE_LETTER_TEXT], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `love-letter-for-anshu.txt`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);

  showSaveToast('Love letter downloaded! 💕');
};

// ---- Toast notification ----
const showSaveToast = (message) => {
  // Remove existing toast if any
  document.querySelector('.save-toast')?.remove();

  const toast = document.createElement('div');
  toast.className = 'save-toast';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('save-toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('save-toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
};

// ---- Show Export Modal ----
const showSaveModal = () => {
  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'save-modal-overlay';

  // Modal
  const modal = document.createElement('div');
  modal.className = 'save-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Save this memory');

  modal.innerHTML = `
    <button class="save-modal-close" aria-label="Close" tabindex="0">&times;</button>
    <div class="save-modal-header">
      <span class="save-modal-icon">💖</span>
      <h3 class="save-modal-title">Save this memory</h3>
      <p class="save-modal-subtitle">Make this moment last forever</p>
    </div>
    <div class="save-modal-options">
      <button class="save-option-btn" data-action="screenshot" aria-label="Save as image" tabindex="0">
        <span class="save-option-icon">📸</span>
        <span class="save-option-label">Save as Image</span>
        <span class="save-option-desc">Download a beautiful screenshot</span>
      </button>
      <button class="save-option-btn" data-action="copy" aria-label="Copy love note" tabindex="0">
        <span class="save-option-icon">💌</span>
        <span class="save-option-label">Copy Love Note</span>
        <span class="save-option-desc">Copy our message to clipboard</span>
      </button>
      <button class="save-option-btn" data-action="download" aria-label="Download love letter" tabindex="0">
        <span class="save-option-icon">💕</span>
        <span class="save-option-label">Download Love Letter</span>
        <span class="save-option-desc">Keep a text keepsake forever</span>
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    modal.style.transform = 'scale(1) translateY(0)';
    modal.style.opacity = '1';
  });

  // Close handler
  const handleClose = () => {
    modal.style.transform = 'scale(0.85) translateY(20px)';
    modal.style.opacity = '0';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 350);
  };

  // Close button
  modal.querySelector('.save-modal-close').addEventListener('click', handleClose);
  modal.querySelector('.save-modal-close').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClose();
  });

  // Overlay click to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handleClose();
  });

  // Option buttons
  modal.querySelectorAll('.save-option-btn').forEach((btn) => {
    addRippleEffect(btn);

    const handleOptionClick = () => {
      const action = btn.dataset.action;
      handleClose();

      // Small delay so modal closes before action
      setTimeout(() => {
        if (action === 'screenshot') handleSaveScreenshot();
        if (action === 'copy') handleCopyLoveNote();
        if (action === 'download') handleDownloadLoveLetter();
      }, 400);
    };

    btn.addEventListener('click', handleOptionClick);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleOptionClick();
    });
  });

  // Escape to close
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleClose();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
};

// ---- Inject Save Button into Celebration ----
const addSaveMemoryButton = () => {
  const celebrationContainer = document.querySelector('.celebration-container');
  if (!celebrationContainer) return;

  const saveWrapper = document.createElement('div');
  saveWrapper.className = 'save-memory-wrapper';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'save-memory-btn';
  saveBtn.innerHTML = `<span class="save-btn-heart">💖</span> Save this memory`;
  saveBtn.setAttribute('aria-label', 'Save this memory');
  saveBtn.setAttribute('tabindex', '0');

  saveBtn.addEventListener('click', showSaveModal);
  saveBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') showSaveModal();
  });

  addRippleEffect(saveBtn);
  saveWrapper.appendChild(saveBtn);
  celebrationContainer.appendChild(saveWrapper);
};

