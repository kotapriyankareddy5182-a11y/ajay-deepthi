const openButton = document.getElementById("openInvitation");
const opening = document.getElementById("opening");
const invitation = document.getElementById("invitation");
const controls = document.getElementById("controls");
const pauseButton = document.getElementById("pauseScroll");
const topButton = document.getElementById("topButton");

let autoScrolling = false;
let paused = false;
let animationId = null;
let lastTime = null;

// Comfortable invitation speed: about 42 pixels/second.
// Change this number if you want it slightly faster or slower.
const SCROLL_SPEED = 42;

function autoScroll(timestamp) {
  if (!autoScrolling) return;

  if (lastTime === null) lastTime = timestamp;
  const elapsed = timestamp - lastTime;
  lastTime = timestamp;

  if (!paused) {
    window.scrollBy(0, (SCROLL_SPEED * elapsed) / 1000);
  }

  const nearBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 3;

  if (nearBottom) {
    autoScrolling = false;
    pauseButton.textContent = "✓";
    pauseButton.setAttribute("aria-label", "Invitation finished");
    return;
  }

  animationId = requestAnimationFrame(autoScroll);
}

function startAutoScroll() {
  cancelAnimationFrame(animationId);
  autoScrolling = true;
  paused = false;
  lastTime = null;
  pauseButton.textContent = "Ⅱ";
  pauseButton.setAttribute("aria-label", "Pause automatic scrolling");
  animationId = requestAnimationFrame(autoScroll);
}

openButton.addEventListener("click", () => {
  opening.style.display = "none";
  invitation.classList.add("visible");
  controls.classList.add("visible");
  document.body.classList.add("opened");

  // Start at the beginning of the invitation pages.
  window.scrollTo({ top: 0, behavior: "auto" });

  // Give the first page a moment to appear before auto-scrolling.
  setTimeout(startAutoScroll, 900);
});

pauseButton.addEventListener("click", () => {
  if (!autoScrolling) {
    startAutoScroll();
    return;
  }

  paused = !paused;
  pauseButton.textContent = paused ? "▶" : "Ⅱ";
  pauseButton.setAttribute(
    "aria-label",
    paused ? "Resume automatic scrolling" : "Pause automatic scrolling"
  );
});

topButton.addEventListener("click", () => {
  cancelAnimationFrame(animationId);
  autoScrolling = false;
  paused = false;
  window.scrollTo({ top: 0, behavior: "smooth" });

  setTimeout(() => {
    startAutoScroll();
  }, 900);
});

// If the visitor manually scrolls, do not fight their movement.
// Restart automatic scrolling after they stop interacting.
let manualTimer;
function handleManualScroll() {
  if (!autoScrolling) return;

  paused = true;
  pauseButton.textContent = "▶";
  clearTimeout(manualTimer);

  manualTimer = setTimeout(() => {
    paused = false;
    pauseButton.textContent = "Ⅱ";
  }, 1800);
}

window.addEventListener("wheel", handleManualScroll, { passive: true });
window.addEventListener("touchmove", handleManualScroll, { passive: true });
