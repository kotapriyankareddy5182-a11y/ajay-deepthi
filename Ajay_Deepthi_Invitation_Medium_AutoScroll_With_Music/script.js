const openButton = document.getElementById("openInvitation");
const opening = document.getElementById("opening");
const invitation = document.getElementById("invitation");
const controls = document.getElementById("controls");
const pauseButton = document.getElementById("pauseScroll");
const topButton = document.getElementById("topButton");
const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicButton");

let autoScrolling = false;
let paused = false;
let animationId = null;
let lastTime = 0;
let manualPauseTimer = null;

// Slow, smooth invitation scrolling.
const SCROLL_SPEED = 55; // pixels per second — balanced medium speed

function updateScrollButton() {
  if (paused) {
    pauseButton.textContent = "▶";
    pauseButton.setAttribute("aria-label", "Resume automatic scrolling");
    pauseButton.title = "Resume auto scroll";
  } else if (autoScrolling) {
    pauseButton.textContent = "Ⅱ";
    pauseButton.setAttribute("aria-label", "Pause automatic scrolling");
    pauseButton.title = "Pause auto scroll";
  } else {
    pauseButton.textContent = "▶";
    pauseButton.setAttribute("aria-label", "Start automatic scrolling");
    pauseButton.title = "Start auto scroll";
  }
}

function autoScroll(timestamp) {
  if (!autoScrolling) return;

  if (!lastTime) lastTime = timestamp;
  const elapsed = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  if (!paused) {
    const nextY = window.scrollY + (SCROLL_SPEED * elapsed / 1000);
    const maxY = document.documentElement.scrollHeight - window.innerHeight;

    if (nextY >= maxY - 2) {
      window.scrollTo(0, maxY);
      autoScrolling = false;
      paused = false;
      updateScrollButton();
      pauseButton.textContent = "✓";
      pauseButton.title = "Invitation finished";
      return;
    }

    window.scrollTo(0, nextY);
  }

  animationId = requestAnimationFrame(autoScroll);
}

function startAutoScroll() {
  cancelAnimationFrame(animationId);
  clearTimeout(manualPauseTimer);

  autoScrolling = true;
  paused = false;
  lastTime = 0;
  updateScrollButton();
  animationId = requestAnimationFrame(autoScroll);
}

function pauseAutoScroll() {
  paused = true;
  updateScrollButton();
}

function resumeAutoScroll() {
  paused = false;
  updateScrollButton();
}

openButton.addEventListener("click", () => {
  music.volume = 0.45;
  music.play().then(() => {
    musicButton.textContent = "♫";
    musicButton.setAttribute("aria-label", "Pause background music");
  }).catch(() => {});

  opening.style.display = "none";
  invitation.classList.add("visible");
  controls.classList.add("visible");
  controls.setAttribute("aria-hidden", "false");
  document.body.classList.add("opened");

  window.scrollTo(0, 0);

  // Start automatically after the first invitation page is visible.
  setTimeout(startAutoScroll, 1200);
});

pauseButton.addEventListener("click", () => {
  if (!autoScrolling) {
    startAutoScroll();
  } else if (paused) {
    resumeAutoScroll();
  } else {
    pauseAutoScroll();
  }
});

topButton.addEventListener("click", () => {
  cancelAnimationFrame(animationId);
  autoScrolling = false;
  paused = false;
  updateScrollButton();

  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(startAutoScroll, 1000);
});

// If the visitor manually scrolls, pause briefly instead of fighting their movement.
let lastProgrammaticScroll = 0;
window.addEventListener("scroll", () => {
  if (!autoScrolling) return;
  if (Date.now() - lastProgrammaticScroll < 120) return;
}, { passive: true });

function manualInteraction() {
  if (!autoScrolling) return;

  paused = true;
  updateScrollButton();
  clearTimeout(manualPauseTimer);

  manualPauseTimer = setTimeout(() => {
    if (autoScrolling) {
      paused = false;
      updateScrollButton();
    }
  }, 2000);
}

window.addEventListener("wheel", manualInteraction, { passive: true });
window.addEventListener("touchstart", manualInteraction, { passive: true });

musicButton.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      musicButton.textContent = "♫";
      musicButton.setAttribute("aria-label", "Pause background music");
    }).catch(() => {});
  } else {
    music.pause();
    musicButton.textContent = "♪";
    musicButton.setAttribute("aria-label", "Play background music");
  }
});

updateScrollButton();
