(function () {
    'use strict';

    const themeToggle = document.getElementById('themeToggle');
    const html        = document.documentElement;

    // initial theme is set by the inline script in <head> so there is no flash

    themeToggle.addEventListener('click', function () {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const next   = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    const navbar = document.getElementById('navbar');

    function onScroll() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); 


    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const navMenu   = document.getElementById('navMenu');

    function closeMenu() {
        navLinks.classList.remove('open');
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', function () {
        const isOpen = !navMenu.classList.contains('open');
        navMenu.classList.toggle('open', isOpen);
        // below 640px the nav links live in the same drawer
        navLinks.classList.toggle('open', isOpen);
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        positionMenu();
    });

    // on mobile the links drawer is open above the panel, so push the panel below it
    function positionMenu() {
        if (!navMenu.classList.contains('open')) return;
        const stacked = getComputedStyle(navLinks).position === 'absolute';
        navMenu.style.top = stacked
            ? (navLinks.offsetTop + navLinks.offsetHeight + 8) + 'px'
            : '';
    }

    window.addEventListener('resize', positionMenu);

    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // switching theme should not dismiss the menu
    navMenu.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

   
    const sections   = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    const navList    = document.getElementById('navLinks');

    function moveBar(anchor) {
        if (!anchor || !navList) return;
        const listRect   = navList.getBoundingClientRect();
        const linkRect   = anchor.getBoundingClientRect();
        navList.style.setProperty('--bar-left',  (linkRect.left  - listRect.left)  + 'px');
        navList.style.setProperty('--bar-width', linkRect.width + 'px');
    }

    // the About link points at #hero, so treat the #about section as the same target
    const SECTION_ALIAS = { about: 'hero' };

    function setActive(id) {
        const target = SECTION_ALIAS[id] || id;
        let activeAnchor = null;
        navAnchors.forEach(function (a) {
            const isActive = a.getAttribute('href') === '#' + target;
            a.classList.toggle('active', isActive);
            if (isActive) activeAnchor = a;
           
            a.style.color      = '';
            a.style.fontWeight = '';
        });
        moveBar(activeAnchor);
    }

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        },
        {
            rootMargin: '-50% 0px -45% 0px',
            threshold: 0
        }
    );

    sections.forEach(function (section) {
        observer.observe(section);
    });

    navAnchors.forEach(function (a) {
        a.addEventListener('click', function () {
            navAnchors.forEach(function (x) { x.classList.remove('active'); });
            a.classList.add('active');
            moveBar(a);
        });
    });

   
    window.addEventListener('load', function () {
        var first = navList && navList.querySelector('a.active');
        if (!first) {
          
            first = navList && navList.querySelector('a[href="#hero"]');
            if (first) first.classList.add('active');
        }
        if (first) moveBar(first);
    });

    
    const fadeEls = document.querySelectorAll(
        '.project-card, .research-card, .achievement, .cert, .skill-group, .edu-item, .contact-item, .stat'
    );

    const respectsMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!respectsMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('js-reveal');

        const fadeObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        fadeObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        fadeEls.forEach(function (el) {
            fadeObserver.observe(el);
        });
    }

    // scroll progress bar
    const progress = document.getElementById('scrollProgress');

    function onProgress() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }

    window.addEventListener('scroll', onProgress, { passive: true });
    window.addEventListener('resize', onProgress);
    onProgress();

    // ---------- WEB SLINGER ----------
    // He behaves like he is pinned to the page, not to the viewport: as
    // you scroll, the web pays out or reels in by exactly the distance
    // scrolled, so he drifts with the content instead of reacting. Small
    // scrolls barely move him. Only a large scroll carries him off the
    // edge on his own. When scrolling stops he settles back to rest.
    const swinger = document.getElementById('swinger');
    const body    = document.getElementById('swingerBody');

    if (swinger && body && !respectsMotion) {
        const ENTER_DELAY = 500;   // stay away this long on load, ms
        const SETTLE      = 420;   // scrolling counts as stopped after this, ms
        const DROP_TIME   = 1100;  // time to settle back into place, ms
        const ANCHOR_OFF  = 150;   // how far the anchor sits above the viewport, px
        const HANG        = 360;   // resting web length from the off-screen anchor, px

        const OPEN   = 'assets/spidey-hang.svg';
        const CLOSED = 'assets/spidey-blink.svg';
        const LEFT   = 'assets/spidey-left.svg';
        const RIGHT  = 'assets/spidey-right.svg';
        [CLOSED, LEFT, RIGHT].forEach(function (src) { new Image().src = src; });

        // How far the web may pay out: enough to carry him fully past the
        // bottom edge (so scrolling up genuinely removes him from view),
        // but no further, so the glide back is never absurdly long.
        function maxLen() {
            const anchorTop = swinger.getBoundingClientRect().top;
            const spriteH   = body.offsetHeight || 120;
            return Math.max(HANG + 120, window.innerHeight - anchorTop + spriteH + 40);
        }

        let len = 0, from = 0, to = 0;
        let t0 = 0, dur = DROP_TIME, running = false;
        let awake = false;
        let stopTimer = null, lastY = window.scrollY;
        let glancing = false;      // true while a look-around is playing

        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function paint() {
            swinger.style.setProperty('--line', len.toFixed(1) + 'px');
        }

        // is he close enough to his resting spot to count as "in place"?
        function atRest() {
            return Math.abs(len - HANG) < 24;
        }

        // A real spider does not glide down a thread at constant speed: it
        // pays out a length, stops, pays out again. `crawl` maps linear
        // time onto that stop-start rhythm, then overshoots slightly and
        // rebounds so the thread reads as elastic.
        function crawl(t) {
            // Two beats: he lowers just enough to show his head, hangs
            // there a moment (long enough for a blink), then drops the
            // rest of the way in one smooth movement.
            // The anchor sits above the viewport, so the first beat has to
            // pay out enough web to bring his head into view before pausing.
            const peek = Math.min(0.62, Math.max(0.15, (ANCHOR_OFF + 78) / HANG));
            const PHASES = [
                [0.00, 0.22, 0.00, peek],   // t range -> progress range
                [0.22, 0.54, peek, peek],   // hold — the peek
                [0.54, 1.00, peek, 1.00]    // smooth descent
            ];
            for (let i = 0; i < PHASES.length; i++) {
                const [t0p, t1p, p0, p1] = PHASES[i];
                if (t <= t1p || i === PHASES.length - 1) {
                    if (p0 === p1) return p0;                 // holding still
                    const local = (t - t0p) / (t1p - t0p);
                    return p0 + (p1 - p0) * ease(Math.max(0, Math.min(1, local)));
                }
            }
            return 1;
        }

        // Inertia: the thread does not stop dead. Once the travel is
        // essentially done it overshoots and oscillates in place, decaying
        // to nothing — like a weight settling on an elastic line.
        function rebound(t) {
            if (t >= 1) return 0;
            // Silent while gliding. Once he arrives the thread gives once,
            // gently — a single soft overshoot and return, not a buzz.
            if (t < 0.72) return 0;
            const u = (t - 0.72) / 0.28;              // 0..1 across the tail
            return Math.sin(u * Math.PI) * Math.pow(1 - u, 0.55);
        }

        let bobT0 = 0;       // idle bob clock
        let useCrawl = false; // stop-start shape (entrance only)
        let bobbing = false; // idle bob loop is running

        function step(now) {
            const t = Math.min((now - t0) / dur, 1);
            // the first descent keeps the stop-start crawl; every later
            // move is smooth and finishes with an inertia wobble
            const shape = useCrawl ? crawl(t) : ease(t);
            const travelled = from + (to - from) * shape;
            // Overshoot follows the direction of travel, so a weight moving
            // up carries past its stop and falls back, exactly as one moving
            // down carries below and rises. Physics does not pick a side.
            const dir   = to >= from ? 1 : -1;
            const swing = Math.max(6, Math.min(14, Math.abs(to - from) * 0.055));
            len = travelled + rebound(t) * swing * dir;
            paint();
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                len = to;
                target = to;
                paint();
                running = false;
                bobT0 = now;
                if (!bobbing) { bobbing = true; requestAnimationFrame(bob); }
                glanceAround(true);   // arriving: always looks left first
            }
        }

        // while he just hangs there, breathe the thread a couple of pixels
        function bob(now) {
            // stop the moment anything else takes over the thread
            if (running || !bobbing || !atRest()) { bobbing = false; return; }
            const e = (now - bobT0) / 1000;
            len = HANG + Math.sin(e * 1.6) * 2.4 + Math.sin(e * 0.7) * 1.2;
            paint();
            requestAnimationFrame(bob);
        }

        function settleBack(crawling) {
            useCrawl = !!crawling;
            from = len;
            to   = HANG;
            dur  = crawling
                ? Math.max(1900, Math.min(2600, 1400 + Math.abs(to - from) * 1.6))
                : Math.max(900, Math.min(1500, 620 + Math.abs(to - from) * 1.1));
            t0   = performance.now();
            if (!running) { running = true; requestAnimationFrame(step); }
        }

        // While the page is moving he is simply carried with it — the web
        // pays out or reels in by exactly the scroll delta. No easing runs
        // during the scroll, which is what used to make it stutter. The one
        // smooth glide + wobble happens only once scrolling stops.
        let target = 0;
        let travelled = 0;          // net scroll since the last rest
        const LEAVE = 90;           // px of scroll before he clears the frame

        window.addEventListener('scroll', function () {
            const y  = window.scrollY;
            const dy = y - lastY;
            lastY = y;

            if (!awake) return;

            // cancel any settle or idle bob — the page is moving again
            running  = false;
            bobbing  = false;
            glancing = false;

            // He is pinned to the page, so the web tracks the scroll 1:1.
            // Past a small threshold that carries him clear of the frame:
            // scrolling down reels him up and out, scrolling up pays out
            // until he is below the fold. Either way he leaves with the
            // page rather than riding along with it.
            travelled += dy;

            if (travelled > LEAVE) {          // net scroll down
                target = 0;                   // reel in, off the top
            } else if (travelled < -LEAVE) {  // net scroll up
                target = maxLen();            // pay out, below the bottom
            } else {
                target = Math.max(0, Math.min(maxLen(), target - dy));
            }

            len = target;
            paint();

            clearTimeout(stopTimer);
            stopTimer = setTimeout(function () {
                travelled = 0;
                settleBack(false);   // one smooth glide, ending in a wobble
            }, SETTLE);
        }, { passive: true });

        // ----- entrance -----
        paint();
        setTimeout(function () {
            awake = true;
            swinger.classList.add('visible');
            settleBack(true);        // two-beat entrance: peek, blink, descend

            // blink while he is hanging at the peek, before the drop
            const peekAt = t0 + dur * 0.34;   // mid-way through the peek hold
            const wait   = Math.max(0, peekAt - performance.now());
            setTimeout(function () {
                body.src = CLOSED;
                setTimeout(function () { body.src = OPEN; }, 190);
            }, wait);
        }, ENTER_DELAY);

        // ----- idle behaviour -----
        function glanceAround(arriving) {
            if (glancing || !atRest()) return;
            glancing = true;

            const first = arriving ? LEFT : (Math.random() < 0.5 ? LEFT : RIGHT);
            const other = first === LEFT ? RIGHT : LEFT;
            const twice = arriving || Math.random() < 0.6;

            setTimeout(function () { if (atRest()) body.src = first; }, 260);
            setTimeout(function () { if (atRest()) body.src = OPEN;  }, 1200);

            if (twice) {
                setTimeout(function () { if (atRest()) body.src = other; }, 1500);
                setTimeout(function () { if (atRest()) body.src = OPEN;  }, 2450);
            }
            setTimeout(function () { glancing = false; }, twice ? 2600 : 1350);
        }

        function scheduleGlance() {
            setTimeout(function () {
                if (!running && atRest()) glanceAround(false);
                scheduleGlance();
            }, 11000 + Math.random() * 9000);
        }

        function blinkOnce(ms) {
            // never blink mid-glance, and never stack blinks
            if (!atRest() || glancing || body.src.indexOf('blink') !== -1) return;
            body.src = CLOSED;
            setTimeout(function () {
                if (atRest() && !glancing) body.src = OPEN;
            }, ms);
        }

        function scheduleBlink() {
            setTimeout(function () {
                blinkOnce(130);
                if (Math.random() < 0.3) setTimeout(function () { blinkOnce(120); }, 380);
                scheduleBlink();
            }, 2400 + Math.random() * 1900);   // ~3.35s average -> ~13 blinks / 45s
        }

        scheduleGlance();
        scheduleBlink();
    }

    // ---------- HUD CLOCK ----------
    const clock = document.getElementById('hudClock');

    function tickClock() {
        const d = new Date();
        const pad = function (n) { return String(n).padStart(2, '0'); };
        clock.textContent = 'SYS ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    if (clock) {
        tickClock();
        setInterval(tickClock, 1000);
    }

    // ---------- STAT COUNTERS ----------
    const stats = document.querySelectorAll('.stat-value[data-count]');

    function runCount(el) {
        const target   = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const suffix   = el.dataset.suffix || '';
        const duration = 900;
        const start    = performance.now();

        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            // ease-out so it settles rather than stopping dead
            const v = target * (1 - Math.pow(1 - t, 3));
            // keep the suffix visible the whole way up so it does not pop in
            el.textContent = v.toFixed(decimals) + suffix;
            if (t < 1) requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window && !respectsMotion) {
        const statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    runCount(entry.target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(function (el) { statObserver.observe(el); });
    } else {
        // reduced motion or no observer: show the final numbers immediately
        stats.forEach(function (el) {
            const d = parseInt(el.dataset.decimals || '0', 10);
            el.textContent = parseFloat(el.dataset.count).toFixed(d) + (el.dataset.suffix || '');
        });
    }

})();
