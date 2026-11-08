(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu ---------- */
  var nav = document.getElementById("siteNav");
  var toggle = document.getElementById("navToggle");

  function setMenu(open, returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      var first = nav.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"), false);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false, false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });

    // Tabbing out of the open menu closes it instead of leaving focus behind it
    document.addEventListener("focusin", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && e.target !== toggle) {
        setMenu(false, false);
      }
    });

    // The menu is only an overlay below this width
    window.matchMedia("(min-width: 1081px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false, false);
    });
  }

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  var toTop = document.getElementById("backToTop");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 8);
    if (toTop) toTop.classList.toggle("is-on", y > 700);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveals: progressive enhancement only ---------- */
  var revealEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Counters in the readout strip ---------- */
  var counters = document.querySelectorAll("[data-count]");

  function runCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = performance.now();
    var duration = 1200;
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Quote form (demo only: nothing is sent) ---------- */
  var form = document.getElementById("quoteForm");
  var status = document.getElementById("formStatus");
  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.classList.add("is-error");
        status.textContent = "Please fill in the highlighted fields.";
        form.reportValidity();
        return;
      }
      status.classList.remove("is-error");
      status.textContent = "This is a demo site — in a live build this form would send your enquiry to the business.";
    });
  }

  /* ---------- Anchor links: clear the sticky header (scroll-margin on targets) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* ---------- Mouse effects: fine pointers only, never with reduced motion ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var card = document.querySelector(".price");
    var panel = document.querySelector(".hero__panel");
    if (card && panel) {
      panel.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilt");
        card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        card.style.setProperty("--ry", ((x - 0.5) * 5).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 4).toFixed(2) + "deg");
      });
      panel.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    }
    document.querySelectorAll(".trade").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", (e.clientX - r.left) + "px");
        t.style.setProperty("--my", (e.clientY - r.top) + "px");
        t.classList.add("is-lit");
      });
      t.addEventListener("pointerleave", function () { t.classList.remove("is-lit"); });
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();

/* Map facade: load the map only when asked */
(function () {
  var box = document.getElementById("mapEmbed");
  if (!box) return;
  var btn = box.querySelector(".map__btn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var frame = document.createElement("iframe");
    frame.title = box.getAttribute("data-map-title") || "Map";
    frame.src = box.getAttribute("data-map-src");
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.tabIndex = 0;
    box.textContent = "";
    box.appendChild(frame);
    frame.focus();
  });
})();
