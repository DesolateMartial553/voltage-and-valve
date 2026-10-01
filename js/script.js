(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("site-nav");
  // Must match the breakpoint where the CSS collapses the nav into the burger menu
  const desktopNav = window.matchMedia("(min-width: 1101px)");

  function setNav(open, returnFocus) {
    nav.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    if (open) {
      const first = nav.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      setNav(!nav.classList.contains("is-open"), false);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNav(false, false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setNav(false, true);
      }
    });

    // Tabbing out of the open menu closes it rather than leaving focus behind it
    document.addEventListener("focusin", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && e.target !== navToggle) {
        setNav(false, false);
      }
    });

    desktopNav.addEventListener("change", (e) => {
      if (e.matches) setNav(false, false);
    });
  }

  /* ---------- Sticky header shrink ---------- */
  const header = document.getElementById("site-header");
  function onScroll() {
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }

    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated stats counters ---------- */
  const statEls = document.querySelectorAll(".stat__num");
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (statEls.length && "IntersectionObserver" in window) {
    const statIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statEls.forEach((el) => statIo.observe(el));
  }

  /* ---------- Testimonial dots ---------- */
  const track = document.getElementById("testimonialTrack");
  const dotsWrap = document.getElementById("testimonialDots");
  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    const twoUp = window.matchMedia("(min-width: 760px)");
    let dots = [];

    function slideStep() {
      return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    }

    function updateActive() {
      const index = Math.round(track.scrollLeft / slideStep());
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function buildDots() {
      const perView = twoUp.matches ? 2 : 1;
      const dotCount = Math.max(1, slides.length - perView + 1);
      dotsWrap.textContent = "";
      dots = [];
      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "Go to review " + (i + 1));
        dot.addEventListener("click", () => {
          track.scrollTo({ left: i * slideStep(), behavior: scrollBehavior });
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
      updateActive();
    }

    let scrollTimeout;
    track.addEventListener(
      "scroll",
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActive, 80);
      },
      { passive: true }
    );

    twoUp.addEventListener("change", buildDots);
    window.addEventListener("resize", updateActive);
    buildDots();
  }

  /* ---------- Quote form (demo only: nothing is sent) ---------- */
  const form = document.getElementById("quoteForm");
  const note = document.getElementById("formNote");
  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = "Please fill in all required fields.";
        note.classList.add("is-error");
        form.reportValidity();
        return;
      }
      note.classList.remove("is-error");
      note.textContent =
        "This is a demo site — in a live build this form would send your enquiry to the business.";
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
