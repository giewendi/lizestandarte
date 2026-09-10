// Mobile nav
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // close on link click (mobile)
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* =========================
   Theme toggle (Dark/Light)
   - Defaults to system preference
   - Saves user choice in localStorage
   ========================= */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  if (themeIcon && themeLabel) {
    const isLight = theme === "light";
    themeIcon.textContent = isLight ? "☀️" : "🌙";
    themeLabel.textContent = isLight ? "Light" : "Dark";
  }
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }

  // No saved preference -> follow system
  const prefersLight = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  setTheme(prefersLight ? "light" : "dark");
}

initTheme();

const mq = window.matchMedia?.("(prefers-color-scheme: light)");
mq?.addEventListener?.("change", (e) => {
  const saved = localStorage.getItem("theme");
  if (saved) return; // user locked preference
  setTheme(e.matches ? "light" : "dark");
});

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  setTheme(current === "dark" ? "light" : "dark");
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Scroll reveal
const revealEls = document.querySelectorAll("[data-reveal]");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("in");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

/* =========================
   Reviews Carousel
   ========================= */
const track = document.getElementById("reviewTrack");
const prevBtn = document.getElementById("prevReview");
const nextBtn = document.getElementById("nextReview");
const dotsWrap = document.getElementById("reviewDots");

let index = 0;
let autoTimer = null;

function getSlides() {
  return track ? Array.from(track.children) : [];
}

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  const slides = getSlides();
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot-btn";
    b.type = "button";
    b.setAttribute("aria-label", `Go to review ${i + 1}`);
    b.setAttribute("aria-current", i === index ? "true" : "false");
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(b);
  });
}

function updateCarousel() {
  if (!track) return;
  track.style.transform = `translateX(-${index * 100}%)`;

  if (dotsWrap) {
    dotsWrap.querySelectorAll(".dot-btn").forEach((d, i) => {
      d.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }
}

function goTo(i, userTriggered = false) {
  const slides = getSlides();
  if (!slides.length) return;

  index = (i + slides.length) % slides.length;
  updateCarousel();

  if (userTriggered) restartAuto();
}

function next() { goTo(index + 1, true); }
function prev() { goTo(index - 1, true); }

prevBtn?.addEventListener("click", prev);
nextBtn?.addEventListener("click", next);

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!track) return;
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    goTo(index + 1, false);
  }, 5500);
}
function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}
function restartAuto() {
  startAuto();
}

// Pause on hover
const carousel = document.querySelector(".carousel");
carousel?.addEventListener("mouseenter", stopAuto);
carousel?.addEventListener("mouseleave", startAuto);

// Init
renderDots();
updateCarousel();
startAuto();

// Keep it correct if window resizes (optional)
window.addEventListener("resize", () => updateCarousel());