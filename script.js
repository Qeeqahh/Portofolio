(function () {
  "use strict";

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.querySelector(".nav__links");

  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = ["home", "profile", "cases", "transmit"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("data-nav") === id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (en) {
        if (en.isIntersecting && (!best || en.intersectionRatio > best.intersectionRatio)) {
          best = en;
        }
      });
      if (best) setActive(best.target.id);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] });
    sections.forEach(function (s) { spy.observe(s); });
  }


  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function markIn(el) {
    if (el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    setTimeout(function () {
      if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    }, 1300);
  }

  if (reduced) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else if ("IntersectionObserver" in window) {
    var revObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          markIn(en.target);
          obs.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { revObserver.observe(el); });
  }

  if (!reduced) {
    var ticking = false;
    var syncPass = function () {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;

      for (var i = revealEls.length - 1; i >= 0; i--) {
        var el = revealEls[i];
        if (el.classList.contains("is-in")) continue;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) markIn(el);
      }

      var mid = vh / 2, current = null, bestDist = Infinity;
      for (var j = 0; j < sections.length; j++) {
        var sr = sections[j].getBoundingClientRect();
        if (sr.top <= mid && sr.bottom >= mid) { current = sections[j].id; break; }
        var d = Math.min(Math.abs(sr.top - mid), Math.abs(sr.bottom - mid));
        if (d < bestDist) { bestDist = d; current = sections[j].id; }
      }
      if (current) setActive(current);
    };
    var requestSync = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(syncPass); }
    };
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("load", syncPass);
    syncPass();
  } else {
    setActive("home");
  }


  var glowA = document.getElementById("glowA");
  var glowB = document.getElementById("glowB");
  if (!reduced && glowA && glowB && window.matchMedia("(pointer:fine)").matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      glowA.style.transform = "translate(" + (cx * 0.5) + "px," + (cy * 0.5) + "px)";
      glowB.style.transform = "translate(" + (-cx * 0.35) + "px," + (-cy * 0.35) + "px)";
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("mousemove", function (e) {
      tx = (e.clientX - window.innerWidth / 2);
      ty = (e.clientY - window.innerHeight / 2);
      if (!raf) loop();
    }, { passive: true });
  }


  if (!reduced && window.matchMedia("(pointer:fine)").matches) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
    cards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
          (px * 8).toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      });
    });
  }
})();
