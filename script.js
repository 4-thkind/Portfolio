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
    // The web is anchored at the top of the page and never moves; only
    // its LENGTH changes, so he rides up and down the same strand.
    // He does not track scrolling live: he waits for scrolling to stop,
    // then descends (or rises) slowly to the new spot and looks around.
    const swinger = document.getElementById('swinger');
    const body    = document.getElementById('swingerBody');

    if (swinger && body && !respectsMotion) {
        const ENTER_DELAY = 1500;  // stay hidden this long on load, ms
        const SETTLE      = 420;   // scrolling counts as stopped after this, ms
        const TRAVEL      = 1400;  // time to pay out / reel in the web, ms
        const REST        = 150;   // resting line length below the navbar, px

        const OPEN   = 'assets/spidey-hang.svg';
        const CLOSED = 'assets/spidey-blink.svg';
        const LEFT   = 'assets/spidey-left.svg';
        const RIGHT  = 'assets/spidey-right.svg';
        [CLOSED, LEFT, RIGHT].forEach(function (src) { new Image().src = src; });

        let lineNow  = REST;   // current web length
        let lineFrom = REST;
        let lineTo   = REST;
        let t0       = 0;
        let animating = false;
        let awake    = false;
        let stopTimer = null;

        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function paint() {
            swinger.style.setProperty('--line', lineNow.toFixed(1) + 'px');
        }

        function step(now) {
            const t = Math.min((now - t0) / TRAVEL, 1);
            lineNow = lineFrom + (lineTo - lineFrom) * ease(t);
            paint();
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                animating = false;
                glanceAround();          // look about once he arrives
            }
        }

        function travelTo(len) {
            lineFrom  = lineNow;
            lineTo    = len;
            t0        = performance.now();
            animating = true;
            requestAnimationFrame(step);
        }

        // Where he should hang for the current scroll position: further
        // down the page pays out more web, up reels it back in.
        function wantedLength() {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const frac = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            return REST + frac * Math.max(0, window.innerHeight - REST - 220);
        }

        function onScrollStopped() {
            if (!awake) return;
            const want = wantedLength();
            if (Math.abs(want - lineNow) > 6) travelTo(want);
        }

        window.addEventListener('scroll', function () {
            // ignore scrolling while it happens; act once it pauses
            clearTimeout(stopTimer);
            stopTimer = setTimeout(onScrollStopped, SETTLE);
        }, { passive: true });

        // ----- entrance: absent, then drops in on his web -----
        lineNow = 0;
        paint();
        setTimeout(function () {
            awake = true;
            swinger.classList.add('visible');
            travelTo(wantedLength());
        }, ENTER_DELAY);

        // ----- idle behaviour -----
        function glanceAround() {
            const first = Math.random() < 0.5 ? LEFT : RIGHT;
            const other = first === LEFT ? RIGHT : LEFT;
            setTimeout(function () { body.src = first; }, 220);
            setTimeout(function () { body.src = OPEN;  }, 1120);
            if (Math.random() < 0.6) {
                setTimeout(function () { body.src = other; }, 1400);
                setTimeout(function () { body.src = OPEN;  }, 2300);
            }
        }

        function scheduleGlance() {
            setTimeout(function () {
                if (!animating && awake) glanceAround();
                scheduleGlance();
            }, 11000 + Math.random() * 9000);
        }

        function blinkOnce(ms) {
            if (body.src.indexOf('blink') !== -1) return;
            const was = body.getAttribute('src');
            body.src = CLOSED;
            setTimeout(function () { body.src = was; }, ms);
        }

        function scheduleBlink() {
            setTimeout(function () {
                if (awake) blinkOnce(130);
                if (Math.random() < 0.3) setTimeout(function () { if (awake) blinkOnce(120); }, 380);
                scheduleBlink();
            }, 2500 + Math.random() * 5500);
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
            el.textContent = v.toFixed(decimals) + (t === 1 ? suffix : '');
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
