/* =============================================================
   HK Consulting — site behaviour
   Everything here is an enhancement: the page is fully readable,
   navigable and bookable with JavaScript switched off.
   ============================================================= */

/* The ONLY global. Swap for your Calendly / GHL / booking link. */
var BOOKING_URL = "/apply";

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* --- Point every CTA at the booking link ------------------- */
  function initBookingLinks() {
    var links = document.querySelectorAll("[data-book]");
    for (var i = 0; i < links.length; i++) links[i].setAttribute("href", BOOKING_URL);
  }

  /* --- Header gains a blurred background once scrolled ------- */
  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    function onScroll() { header.classList.toggle("scrolled", window.scrollY > 8); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile menu (click, Escape, and link-close) ----------- */
  function initMobileMenu() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("open", open);
    }
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* --- Scroll reveal: one observer for every .reveal --------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    function showAll() {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
    }
    if (reduceMotion || !hasIO) { showAll(); return; }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    for (var i = 0; i < items.length; i++) observer.observe(items[i]);
    setTimeout(showAll, 2600); // failsafe: never leave content hidden
  }

  /* --- Result numbers count up once, on entry ---------------- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    function paint(el, n, suffix) { el.textContent = n + suffix; }
    function finalise(el) {
      paint(el, parseInt(el.getAttribute("data-count-to"), 10), el.getAttribute("data-suffix") || "");
    }
    if (reduceMotion || !hasIO) {
      for (var i = 0; i < counters.length; i++) finalise(counters[i]);
      return;
    }

    function animate(el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1500;
      var start = null;
      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
      function step(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        paint(el, Math.round(easeOut(p) * target), suffix);
        if (p < 1) requestAnimationFrame(step); else paint(el, target, suffix);
      }
      paint(el, 0, suffix);
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    for (var j = 0; j < counters.length; j++) observer.observe(counters[j]);
  }

  /* --- Signature: the call transcript plays itself in -------- */
  function initTranscript() {
    var wrap = document.getElementById("transcript");
    if (!wrap) return;
    var bubbles = wrap.querySelectorAll(".bubble");
    function showAll() {
      for (var i = 0; i < bubbles.length; i++) bubbles[i].classList.add("shown");
    }
    if (reduceMotion || !hasIO) { showAll(); return; }

    var played = false;
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || played) return;
        played = true;
        obs.unobserve(entry.target);
        bubbles.forEach(function (b, i) {
          setTimeout(function () { b.classList.add("shown"); }, 500 + i * 850);
        });
      });
    }, { threshold: 0.3 });
    observer.observe(wrap);
    setTimeout(showAll, 7000); // failsafe
  }

  /* --- Missed-call cost calculator --------------------------- */
  function initCalculator() {
    var calls = document.getElementById("calls");
    var value = document.getElementById("value");
    var close = document.getElementById("close");
    var amountEl = document.getElementById("calc-amount");
    if (!calls || !value || !close || !amountEl) return;

    var callsOut = document.getElementById("calls-out");
    var valueOut = document.getElementById("value-out");
    var closeOut = document.getElementById("close-out");
    var lostEl = document.getElementById("calc-lost");

    var money = new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0
    });

    /* "33%" reads better to a business owner as "1 in 3" */
    function asRatio(pct) {
      var oneIn = Math.max(1, Math.round(100 / pct));
      return "1 in " + oneIn;
    }

    function render() {
      var perWeek = parseInt(calls.value, 10);
      var dealValue = parseInt(value.value, 10);
      var closePct = parseInt(close.value, 10);

      var lostCustomers = Math.round(perWeek * 52 * (closePct / 100));
      var lostRevenue = lostCustomers * dealValue;

      callsOut.textContent = perWeek;
      valueOut.textContent = money.format(dealValue);
      closeOut.textContent = asRatio(closePct);
      if (lostEl) lostEl.textContent = lostCustomers.toLocaleString("en-US");
      amountEl.textContent = money.format(lostRevenue);
    }

    [calls, value, close].forEach(function (input) {
      input.addEventListener("input", render);
    });
    render();
  }

  /* --- FAQ accordion: one open at a time, animated height ---- */
  function initAccordion() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll(".accordion-trigger"));

    function collapse(panel, trigger) {
      if (panel.style.height === "auto") panel.style.height = panel.scrollHeight + "px";
      requestAnimationFrame(function () { panel.style.height = "0px"; });
      trigger.setAttribute("aria-expanded", "false");
    }
    function expand(panel, trigger) {
      panel.style.height = panel.scrollHeight + "px";
      trigger.setAttribute("aria-expanded", "true");
      panel.addEventListener("transitionend", function done() {
        if (trigger.getAttribute("aria-expanded") === "true") panel.style.height = "auto";
        panel.removeEventListener("transitionend", done);
      });
    }

    triggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      panel.style.height = "0px"; // JS present, so start closed

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        triggers.forEach(function (other) {
          if (other !== trigger && other.getAttribute("aria-expanded") === "true") {
            var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
            if (otherPanel) collapse(otherPanel, other);
          }
        });
        if (isOpen) collapse(panel, trigger); else expand(panel, trigger);
      });
    });
  }

  /* --- Footer year ------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function init() {
    initBookingLinks();
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initCounters();
    initTranscript();
    initCalculator();
    initAccordion();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
