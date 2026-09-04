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
    // The web always runs from a fixed anchor under the navbar down to
    // him — only its length changes, so the strand is never detached.
    // Scrolling down reels him up to the anchor and out of sight;
    // scrolling up pays the web out until he drops below the fold.
    // When scrolling stops he crawls back to his resting length.
    const swinger = document.getElementById('swinger');
    const body    = document.getElementById('swingerBody');

    if (swinger && body && !respectsMotion) {
        const ENTER_DELAY = 1500;  // stay away this long on load, ms
        const SETTLE      = 450;   // scrolling counts as stopped after this, ms
        const DROP_TIME   = 1200;  // time to crawl back into place, ms
        const EXIT_TIME   = 420;   // time to leave the frame, ms
        const HANG        = 360;   // resting web length from the off-screen anchor, px

        const OPEN   = 'assets/spidey-hang.svg';
        const CLOSED = 'assets/spidey-blink.svg';
        const LEFT   = 'assets/spidey-left.svg';
        const RIGHT  = 'assets/spidey-right.svg';
        [CLOSED, LEFT, RIGHT].forEach(function (src) { new Image().src = src; });

        let len = 0, from = 0, to = 0;
        let t0 = 0, dur = DROP_TIME, running = false;
        let awake = false, down = false;
        let stopTimer = null, lastY = window.scrollY;
        let glancing = false;      // true while a look-around is playing

        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(now) {
            const t = Math.min((now - t0) / dur, 1);
            len = from + (to - from) * ease(t);
            swinger.style.setProperty('--line', len.toFixed(1) + 'px');
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                running = false;
                if (down) glanceAround(true);   // arriving: always looks left first
            }
        }

        function travel(target, ms) {
            from = len;
            to   = target;
            dur  = ms;
            t0   = performance.now();
            if (!running) { running = true; requestAnimationFrame(step); }
        }

        // how much web is needed to carry him past the bottom edge
        function belowFold() {
            const anchor = swinger.getBoundingClientRect().top;
            return Math.max(0, window.innerHeight - anchor) + 160;
        }

        function comeBack() {
            down = true;
            swinger.classList.add('visible');
            travel(HANG, DROP_TIME);
        }

        function leave(dir) {
            down = false;
            glancing = false;
            body.src = OPEN;
            // scrolling down  -> reel all the way in, he vanishes upward
            // scrolling up    -> pay out until he is past the bottom edge
            travel(dir < 0 ? 0 : belowFold(), EXIT_TIME);
        }

        window.addEventListener('scroll', function () {
            const y = window.scrollY;
            const dir = y > lastY ? -1 : 1;   // -1 down, +1 up
            lastY = y;

            if (!awake) return;
            if (down) leave(dir);

            clearTimeout(stopTimer);
            stopTimer = setTimeout(comeBack, SETTLE);
        }, { passive: true });

        // ----- entrance -----
        swinger.style.setProperty('--line', '0px');
        setTimeout(function () { awake = true; comeBack(); }, ENTER_DELAY);

        // ----- idle behaviour -----
        // A glance owns the sprite for its whole duration; blinking is
        // suppressed while it runs so the two never fight over the frame.
        // `arriving` glances always start to the left, so every time he drops
        // in he reads as looking over the page before settling. Idle glances
        // that fire while he is just hanging around pick a side at random.
        function glanceAround(arriving) {
            if (glancing || !down) return;
            glancing = true;

            const first = arriving ? LEFT : (Math.random() < 0.5 ? LEFT : RIGHT);
            const other = first === LEFT ? RIGHT : LEFT;
            // on arrival he always sweeps both ways; idle glances sometimes do
            const twice = arriving || Math.random() < 0.6;

            setTimeout(function () { if (down) body.src = first; }, 260);
            setTimeout(function () { if (down) body.src = OPEN;  }, 1200);

            if (twice) {
                setTimeout(function () { if (down) body.src = other; }, 1500);
                setTimeout(function () { if (down) body.src = OPEN;  }, 2450);
            }
            setTimeout(function () { glancing = false; }, twice ? 2600 : 1350);
        }

        function scheduleGlance() {
            setTimeout(function () {
                if (!running && down) glanceAround(false);
                scheduleGlance();
            }, 11000 + Math.random() * 9000);
        }

        function blinkOnce(ms) {
            // never blink mid-glance, and never stack blinks
            if (!down || glancing || body.src.indexOf('blink') !== -1) return;
            body.src = CLOSED;
            setTimeout(function () {
                if (down && !glancing) body.src = OPEN;
            }, ms);
        }

        function scheduleBlink() {
            setTimeout(function () {
                blinkOnce(130);
                if (Math.random() < 0.3) setTimeout(function () { blinkOnce(120); }, 380);
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
