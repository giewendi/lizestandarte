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

/* =========================
   Contact form (Netlify Forms)
   - Validates on blur, clears as you fix
   - Submits via AJAX so success/error shows in place
   ========================= */
const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");
const formError = document.getElementById("formError");

if (contactForm) {
  const submitBtn = contactForm.querySelector("button[type='submit']");
  const submitText = submitBtn?.textContent;

  const fields = Array.from(contactForm.querySelectorAll("input[name], textarea[name]"))
    .filter(el => el.type !== "hidden" && el.name !== "bot-field");

  function errorSlot(field) {
    return contactForm.querySelector(`[data-error-for="${field.name}"]`);
  }

  function messageFor(field) {
    const v = field.validity;
    if (v.valueMissing) {
      if (field.name === "email") return "Please enter your email address.";
      if (field.name === "message") return "Please tell me what you need help with.";
      return "Please enter your name.";
    }
    if (v.typeMismatch) return "Please enter a valid email address, like you@email.com.";
    if (v.tooShort) return `Please use at least ${field.minLength} characters (${field.value.trim().length} so far).`;
    if (v.tooLong) return `Please keep this under ${field.maxLength} characters.`;
    return field.validationMessage;
  }

  function validate(field) {
    // Trim first so whitespace alone can't pass a required field
    if (field.value !== field.value.trim() && !field.value.trim()) field.value = "";

    const ok = field.checkValidity();
    const slot = errorSlot(field);

    field.setAttribute("aria-invalid", ok ? "false" : "true");
    if (slot) slot.textContent = ok ? "" : messageFor(field);

    return ok;
  }

  function clearError(field) {
    field.setAttribute("aria-invalid", "false");
    const slot = errorSlot(field);
    if (slot) slot.textContent = "";
  }

  fields.forEach(field => {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validate(field);
    });
  });

  function setStatus(state) {
    formSuccess?.toggleAttribute("hidden", state !== "success");
    formError?.toggleAttribute("hidden", state !== "error");
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(null);

    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(contactForm)).toString(),
      });

      if (!res.ok) throw new Error(`Submission failed with status ${res.status}`);

      contactForm.reset();
      fields.forEach(clearError);
      setStatus("success");
    } catch (err) {
      console.error("Contact form submission failed:", err);
      setStatus("error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitText;
      }
    }
  });
}
