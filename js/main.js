/* ═══════════════════════════════════════════════════════════
   PARALLAX — motion layer
   Four parts: one signature moment (the room's light changing),
   a per-section entrance, feedback on every control, and the
   moving pictures themselves.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 0 · the motion switch ───────────────────────────────
     One control in the nav stops every moving thing on the
     page. Defaults to off when the system asks for less
     motion; otherwise it remembers the visitor's choice.
     Set on <html> before first paint so nothing flashes.     */
  var MOTION_KEY = "bp-motion";
  var motionOn = !reduced;
  try {
    var stored = localStorage.getItem(MOTION_KEY);
    if (stored === "off" || stored === "on") motionOn = stored === "on";
  } catch (err) {
    /* private mode — keep the default */
  }
  document.documentElement.setAttribute("data-motion", motionOn ? "on" : "off");

  /* ── the demo library ────────────────────────────────────
     Twelve takes of one prompt. The notes are the kind an
     editor writes on a contact sheet, not review copy.     */
  var CLIPS = [
    {
      id: "city",
      seed: "8F2A11C4",
      note: "the push arrives too early",
      words: [
        "city",
        "street",
        "urban",
        "neon",
        "car",
        "night",
        "noir",
        "road",
        "downtown",
        "buildings",
        "traffic",
      ],
    },
    {
      id: "forest",
      seed: "1D77E0A9",
      note: "the light dies before the subject does",
      words: [
        "forest",
        "trees",
        "tree",
        "wood",
        "woodland",
        "dark",
        "shaft",
        "light",
        "moss",
        "jungle",
      ],
    },
    {
      id: "rain",
      seed: "4C03B7F2",
      note: "the wet road carries the whole frame",
      words: [
        "rain",
        "wet",
        "street",
        "puddle",
        "water",
        "night",
        "rainy",
        "downpour",
        "umbrella",
      ],
    },
    {
      id: "smoke",
      seed: "77B21E5D",
      note: "ink never repeats a curve",
      words: [
        "smoke",
        "ink",
        "swirl",
        "cloud",
        "abstract",
        "liquid",
        "dye",
        "plume",
        "paint",
      ],
    },
    {
      id: "room",
      seed: "2E60C8B1",
      note: "too tidy to be lived in",
      words: [
        "room",
        "bed",
        "interior",
        "empty",
        "bedroom",
        "apartment",
        "house",
        "window",
      ],
    },
    {
      id: "clouds",
      seed: "9A31F5C6",
      note: "the sun arrives out of frame",
      words: [
        "cloud",
        "clouds",
        "sky",
        "sunset",
        "sun",
        "aerial",
        "horizon",
        "rays",
        "above",
        "heaven",
      ],
    },
    {
      id: "cliff",
      seed: "B5C7408E",
      note: "hold this frame for the edit",
      words: [
        "cliff",
        "edge",
        "rock",
        "coast",
        "ocean",
        "sea",
        "person",
        "man",
        "standing",
        "shore",
      ],
    },
    {
      id: "water",
      seed: "6F8A21D4",
      note: "the surface gives nothing away",
      words: [
        "water",
        "sea",
        "liquid",
        "ripple",
        "pool",
        "surface",
        "drop",
        "teal",
        "wave",
      ],
    },
    {
      id: "cabin",
      seed: "33AD6E17",
      note: "the fire does all the lighting",
      words: [
        "cabin",
        "fire",
        "fireplace",
        "wood",
        "log",
        "cosy",
        "cosy",
        "winter",
        "logs",
        "lantern",
      ],
    },
    {
      id: "pool",
      seed: "E0481F92",
      note: "the greenhouse won",
      words: [
        "pool",
        "abandoned",
        "overgrown",
        "overgrowth",
        "vines",
        "ruins",
        "greenhouse",
        "reclaimed",
      ],
    },
    {
      id: "roman",
      seed: "71C5B033",
      note: "the armour holds, the eyes do not",
      words: [
        "man",
        "portrait",
        "face",
        "armour",
        "armor",
        "helmet",
        "soldier",
        "warrior",
        "statue",
      ],
    },
    {
      id: "cigar",
      seed: "0D9E7A45",
      note: "eleven seconds of nothing happening",
      words: [
        "man",
        "portrait",
        "face",
        "smoke",
        "old",
        "cigar",
        "elder",
        "cigarette",
        "beard",
      ],
    },
  ];

  var src = function (id) {
    return "media/" + id + ".mp4";
  };
  var poster = function (id) {
    return "media/" + id + ".jpg";
  };
  var byId = {};
  CLIPS.forEach(function (c) {
    byId[c.id] = c;
  });

  /* ── 1 · the signature: the light in the room changes ───── */
  var heroVids = Array.prototype.slice.call(
    document.querySelectorAll(".hero__clip"),
  );
  var heroStack = document.querySelector(".hero__stack");
  var heroSec = document.querySelector(".hero");
  var heroSlot = 0;
  var PROGRAM = ["city", "forest", "clouds", "room"];
  var progIndex = 0;

  function fillSlot(i, id) {
    var v = heroVids[i];
    if (!v || v.dataset.clip === id) return;
    v.dataset.clip = id;
    v.poster = poster(id);
    v.setAttribute("src", src(id));
    v.load();
  }
  function showHero(id) {
    var target = -1;
    for (var i = 0; i < heroVids.length; i++)
      if (heroVids[i].dataset.clip === id) target = i;
    if (target === -1) {
      var free = [];
      for (var j = 0; j < heroVids.length; j++)
        if (j !== heroSlot) free.push(j);
      target = free[0];
      fillSlot(target, id);
    }
    if (target === heroSlot || target < 0) return;
    heroVids[heroSlot].classList.remove("is-on");
    heroVids[target].classList.add("is-on");
    heroSlot = target;
    playHero();
  }
  function playHero() {
    heroVids.forEach(function (v, i) {
      if (i === heroSlot) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else v.pause();
    });
  }
  if (heroVids.length && !reduced && motionOn) {
    playHero();
    setInterval(function () {
      if (document.hidden || !motionOn) return;
      progIndex = (progIndex + 1) % PROGRAM.length;
      showHero(PROGRAM[progIndex]);
    }, 6800);
  }

  /* ── 2 · the contact sheet ──────────────────────────────── */
  var list = document.getElementById("sheetList");
  var vidA = document.getElementById("vidA");
  var vidB = document.getElementById("vidB");
  var shotOut = document.getElementById("sheetShot");
  var seedOut = document.getElementById("sheetSeed");
  var noteOut = document.getElementById("sheetNote");
  var front = vidA,
    back = vidB;
  var picked = "city";

  var cells = [];

  if (list) {
    CLIPS.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sheet__cell";
      b.setAttribute("aria-pressed", String(c.id === picked));
      b.dataset.clip = c.id;
      b.setAttribute(
        "aria-label",
        "Take " + (i + 1) + " of 12, seed " + c.seed,
      );
      b.innerHTML =
        '<span class="sheet__thumb"><img src="' +
        poster(c.id) +
        '" alt="" width="1280" height="720" loading="lazy"></span>' +
        '<span class="sheet__cap"><span>' +
        c.seed +
        '</span><span class="sheet__pick">Picked</span></span>';
      b.addEventListener("mouseenter", function () {
        preview(c.id);
      });
      b.addEventListener("focus", function () {
        preview(c.id);
      });
      b.addEventListener("click", function () {
        pick(c.id);
      });
      list.appendChild(b);
      cells.push(b);
    });
  }

  if (list) {
    list.addEventListener("keydown", function (e) {
      var i = cells.indexOf(document.activeElement);
      if (i === -1) return;
      var cols = window.innerWidth <= 560 ? 2 : 3;
      var next = -1;
      if (e.key === "ArrowRight") next = i + 1;
      else if (e.key === "ArrowLeft") next = i - 1;
      else if (e.key === "ArrowDown") next = i + cols;
      else if (e.key === "ArrowUp") next = i - cols;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = cells.length - 1;
      if (next < 0 || next >= cells.length) {
        /* allow default */
      } else {
        e.preventDefault();
        cells[next].focus();
      }
    });
  }

  function showClip(id) {
    if (!front || !back) return;
    var c = byId[id];
    front.pause();
    back.poster = poster(id);
    back.src = src(id);
    back.classList.add("is-on");
    front.classList.remove("is-on");
    var t = front;
    front = back;
    back = t;
    var p = front.play();
    if (p && p.catch) p.catch(function () {});
    if (shotOut) shotOut.textContent = c.note;
    if (seedOut) seedOut.textContent = c.seed;
    if (noteOut)
      noteOut.textContent = "Take " + (CLIPS.indexOf(c) + 1) + " of 12";
  }
  function preview(id) {
    showClip(id);
  }
  function pick(id) {
    picked = id;
    if (list)
      Array.prototype.forEach.call(
        list.querySelectorAll(".sheet__cell"),
        function (b) {
          b.setAttribute("aria-pressed", String(b.dataset.clip === id));
        },
      );
    showClip(id);
  }
  if (vidA) {
    vidA.src = src(picked);
    var pp = vidA.play();
    if (pp && pp.catch) pp.catch(function () {});
  }

  /* ── 3 · the live thing: the prompt ────────────────────── */
  var form = document.getElementById("prompt");
  var input = document.getElementById("promptInput");
  var note = document.getElementById("promptNote");
  var bar = document.querySelector(".prompt__bar i");
  var DEFAULT_NOTE = "Twelve candidates. Picking one lights the room.";

  function match(text) {
    var words = String(text)
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return null;
    var best = null,
      bestScore = 0;
    CLIPS.forEach(function (c) {
      var score = 0;
      c.words.forEach(function (w) {
        if (words.indexOf(w) !== -1) score += 2;
      });
      words.forEach(function (w) {
        if (w.length > 4 && c.words.join(" ").indexOf(w) !== -1) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    });
    return bestScore > 0 ? best : null;
  }

  var renderBtn = document.getElementById("promptGo");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hit = match(input.value);
      if (!hit) {
        note.textContent =
          "No take in this library matches that. Try forest, rain, smoke, water or neon.";
        if (renderBtn) renderBtn.setAttribute("aria-busy", "false");
        return;
      }
      note.textContent = "Rendering twelve takes of that.";
      if (renderBtn) renderBtn.setAttribute("aria-busy", "true");
      var t0 = performance.now();
      bar.style.transition = "none";
      bar.style.width = "0%";
      bar.getBoundingClientRect();
      function step(now) {
        var p = Math.min(1, (now - t0) / 1500);
        bar.style.width = (p * 100).toFixed(1) + "%";
        if (p < 1) {
          requestAnimationFrame(step);
          return;
        }
        pick(hit.id);
        showHero(hit.id);
        note.textContent = "Twelve takes returned. Taking " + hit.note + ".";
        if (renderBtn) renderBtn.setAttribute("aria-busy", "false");
      }
      requestAnimationFrame(step);
    });
    input.addEventListener("input", function () {
      if (note.textContent !== DEFAULT_NOTE) {
        note.textContent = DEFAULT_NOTE;
        bar.style.width = "0%";
      }
    });
  }

  /* ── 4 · scrub: scroll drives the playhead, so does the slider ── */
  var scrubSec = document.querySelector(".scrub");
  var range = document.getElementById("scrubRange");
  var scrubVid = document.getElementById("scrubVid");
  var stageOut = document.getElementById("scrubStage");
  var nameEls = document.getElementById("scrubNames");
  var STAGES = [
    "First, it parses the shot.",
    "Twelve candidates render together.",
    "You pick one, twelve become one.",
    "It extends by four seconds.",
  ];
  var scrubbing = false,
    scrubTimer = 0,
    lastStage = -1,
    scrubbed = false;

  if (scrubSec && scrubVid) {
    scrubVid.src = src("flame");
    scrubVid.poster = poster("flame");
    var pp = scrubVid.play();
    if (pp && pp.catch) pp.catch(function () {});

    function span() {
      return Math.max(1, scrubSec.offsetHeight - window.innerHeight);
    }
    function apply(p) {
      p = Math.max(0, Math.min(1, p));
      if (scrubVid.duration && isFinite(scrubVid.duration)) {
        scrubVid.currentTime = p * Math.max(0, scrubVid.duration - 0.06);
      }
      range.value = String(Math.round(p * 1000));
      range.style.setProperty("--pct", (p * 100).toFixed(1) + "%");
      var st = Math.min(3, Math.floor(p * 4));
      if (st !== lastStage) {
        lastStage = st;
        stageOut.style.opacity = "0";
        setTimeout(
          function () {
            stageOut.textContent = STAGES[st];
            stageOut.style.opacity = "1";
          },
          reduced ? 0 : 180,
        );
        Array.prototype.forEach.call(nameEls.children, function (li, i) {
          li.classList.toggle("is-on", i === st);
        });
      }
    }
    function onScroll() {
      if (scrubbing) return;
      var top = scrubSec.offsetTop;
      var p = (window.scrollY - top) / span();
      if (p < -0.05 || p > 1.05) {
        if (p < -0.05 && !scrubbed) scrubVid.play();
        return;
      }
      apply(p);
      if (!scrubbed) scrubVid.pause();
    }

    range.addEventListener("pointerdown", function () {
      scrubbing = true;
      scrubbed = true;
    });
    range.addEventListener("input", function () {
      scrubbing = true;
      scrubbed = true;
      apply(range.value / 1000);
      window.scrollTo(0, scrubSec.offsetTop + (range.value / 1000) * span());
      clearTimeout(scrubTimer);
      scrubTimer = setTimeout(function () {
        scrubbing = false;
      }, 220);
    });
    range.addEventListener("keydown", function () {
      scrubbed = true;
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── 5 · hero drift, scroll-linked ─────────────────────── */
  if (heroSec && heroStack && !reduced) {
    var update = function () {
      if (!motionOn) {
        heroStack.style.setProperty("--drift", "1");
        return;
      }
      var p = Math.max(
        0,
        Math.min(1, window.scrollY / Math.max(1, heroSec.offsetHeight)),
      );
      heroStack.style.setProperty("--drift", (1 + p * 0.08).toFixed(4));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ── 6 · entrances ─────────────────────────────────────── */
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
  );
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-reveal]"),
    function (el, i) {
      if (!el.style.getPropertyValue("--i"))
        el.style.setProperty("--i", String(i % 6));
      io.observe(el);
    },
  );

  /* ── 7 · moving pictures only when they can be seen ────── */
  var loops = Array.prototype.slice.call(
    document.querySelectorAll("[data-playloop]"),
  );
  var loopIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else v.pause();
      });
    },
    { threshold: 0.15 },
  );
  loops.forEach(function (v) {
    loopIO.observe(v);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      heroVids.forEach(function (v) {
        v.pause();
      });
      loops.forEach(function (v) {
        v.pause();
      });
    } else if (!reduced && motionOn) {
      playHero();
    }
  });

  /* ── 8 · the workspace dialog ──────────────────────────── */
  var dialog = document.getElementById("dialog");
  if (dialog) {
    var wsName = document.getElementById("wsName");
    var wsOut = document.getElementById("dialogOut");
    var choices = dialog.querySelectorAll(".seg--wide [data-choice]");
    var choice = "Personal";
    Array.prototype.forEach.call(choices, function (el) {
      el.addEventListener("click", function () {
        choice = el.dataset.choice;
        Array.prototype.forEach.call(choices, function (o) {
          o.classList.toggle("is-on", o === el);
        });
      });
    });
    dialog.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (wsName.value || "").trim();
      if (!name) {
        wsOut.textContent = "A workspace needs a name.";
        return;
      }
      wsOut.textContent =
        name + " is ready. Sign-up is not wired on this demo page.";
    });
  }

  /* ── 9 · smooth scroll, native ───────────────────────────
     Native scroll, not a library: the scrub section reads the real
     scroll position every frame and a smoothing library would fight
     it (and every programmatic scroll, including anchor jumps and
     find-in-page). scroll-behavior on <html> gives the easing.     */
  /* nothing to initialise - see css/style.css */

  /* ------ motion switch: stops every moving thing ------ */
  var motionToggle = document.getElementById("motionToggle");
  function motionApply(on) {
    motionOn = on;
    document.documentElement.setAttribute("data-motion", on ? "on" : "off");
    try {
      localStorage.setItem(MOTION_KEY, on ? "on" : "off");
    } catch (err) {
      /* ignore */
    }
    if (!on) {
      heroVids.forEach(function (v) {
        v.pause();
      });
      loops.forEach(function (v) {
        v.pause();
      });
      if (scrubVid) scrubVid.pause();
    } else {
      if (heroVids.length && heroSlot >= 0) {
        var pp = heroVids[heroSlot].play();
        if (pp && pp.catch) pp.catch(function () {});
      }
    }
    if (motionToggle) {
      motionToggle.setAttribute("aria-pressed", String(on));
      motionToggle.title = on ? "Pause motion" : "Resume motion";
    }
  }
  if (motionToggle) {
    motionToggle.setAttribute("aria-pressed", String(motionOn));
    motionToggle.addEventListener("click", function () {
      motionApply(!motionOn);
    });
  }

  /* ------ mobile drawer ------ */
  var navToggle = document.getElementById("navToggle");
  var navDrawer = document.getElementById("navDrawer");
  function setDrawer(open) {
    if (!navToggle || !navDrawer) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navDrawer.hidden = !open;
    document.documentElement.classList.toggle("is-locked", open);
    var evt;
    try {
      evt = new CustomEvent("bp-drawer-lock", { detail: open });
    } catch (err) {
      evt = document.createEvent("CustomEvent");
      evt.initCustomEvent("bp-drawer-lock", !0, !0, open);
    }
    document.dispatchEvent(evt);
    if (open) {
      var first = navDrawer.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    } else {
      navToggle.focus();
    }
  }
  if (navToggle && navDrawer) {
    navToggle.addEventListener("click", function () {
      setDrawer(navToggle.getAttribute("aria-expanded") !== "true");
    });
    navDrawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Escape" &&
        navToggle.getAttribute("aria-expanded") === "true"
      )
        setDrawer(false);
      if (
        e.key === "Tab" &&
        navToggle.getAttribute("aria-expanded") === "true"
      ) {
        var focusables = Array.prototype.slice.call(
          navDrawer.querySelectorAll(
            'a,button,[tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusables.length) return;
        var first = focusables[0],
          last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener("resize", function () {
      if (
        window.innerWidth > 860 &&
        navToggle.getAttribute("aria-expanded") === "true"
      )
        setDrawer(false);
    });
  }

  /* ------ board: segments react and Re-roll returns a new seed ------ */
  Array.prototype.forEach.call(
    document.querySelectorAll(".seg button"),
    function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.parentElement;
        if (!group) return;
        Array.prototype.forEach.call(
          group.querySelectorAll("button"),
          function (b) {
            b.setAttribute("aria-pressed", String(b === btn));
          },
        );
      });
    },
  );
  var reroll = document.getElementById("reroll");
  var seedVal = document.getElementById("seedVal");
  var HEX = "0123456789ABCDEF";
  if (reroll && seedVal) {
    reroll.addEventListener("click", function () {
      var out = "";
      for (var i = 0; i < 8; i++) out += HEX[Math.floor(Math.random() * 16)];
      seedVal.textContent = out;
      reroll.setAttribute("aria-busy", "true");
      setTimeout(function () {
        reroll.setAttribute("aria-busy", "false");
      }, 320);
    });
  }

  /* ------ visibility: pause media when the tab is hidden ------ */
  document.addEventListener(
    "visibilitychange",
    function () {
      if (document.hidden) {
        heroVids.forEach(function (v) {
          v.pause();
        });
        loops.forEach(function (v) {
          v.pause();
        });
        if (scrubVid) scrubVid.pause();
      } else if (motionOn) {
        if (heroVids.length) {
          var ph = heroVids[heroSlot] && heroVids[heroSlot].play();
          if (ph && ph.catch) ph.catch(function () {});
        }
      }
    },
    false,
  );
})();
