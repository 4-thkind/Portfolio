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
    // Behaviour: when the page scrolls he holds still for a beat, then
    // pays out web and glides to the new position, easing to a stop.
    // Once settled he idles — glancing left/right and blinking on his
    // own irregular schedule, independent of scrolling.
    const swinger = document.getElementById('swinger');

    if (swinger && !respectsMotion) {
        const REST      = 96;    // resting line length, px
        const REACT_MIN = 500;   // hold this long before reacting, ms
        const REACT_MAX = 1000;
        const GLIDE     = 1100;  // travel time to the new spot, ms

        let shownY   = window.scrollY;  // where he currently hangs
        let fromY    = shownY;
        let targetY  = shownY;
        let moveStart = 0;
        let moving   = false;
        let holdUntil = 0;
        let raf      = null;

        // easeInOutCubic: slow to leave, slow to arrive — reads as "sleek"
        function ease(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function paint(drop, stretch) {
            swinger.style.setProperty('--drop', drop.toFixed(1) + 'px');
            swinger.style.setProperty('--line', (REST + stretch).toFixed(1) + 'px');
        }

        function loop(now) {
            const pageY = window.scrollY;

            // a new scroll position arms a fresh reaction delay
            if (pageY !== targetY) {
                targetY   = pageY;
                holdUntil = now + REACT_MIN + Math.random() * (REACT_MAX - REACT_MIN);
                moving    = false;
            }

            if (!moving && shownY !== targetY && now >= holdUntil) {
                fromY     = shownY;
                moveStart = now;
                moving    = true;
            }

            if (moving) {
                const t = Math.min((now - moveStart) / GLIDE, 1);
                const e = ease(t);
                shownY  = fromY + (targetY - fromY) * e;
                if (t === 1) moving = false;
            }

            // he trails the page: the gap becomes visible line + offset
            const lag = shownY - window.scrollY;
            paint(-lag * 0.14, Math.max(-30, Math.min(150, -lag * 0.30)));

            raf = requestAnimationFrame(loop);
        }

        raf = requestAnimationFrame(loop);

        // ----- idle: glance left/right, and blink, on separate clocks -----
        const body = swinger.querySelector('.swinger-body');

        function scheduleLook() {
            // roughly every 15s, jittered so it never feels metronomic
            setTimeout(function () {
                const dir = Math.random() < 0.5 ? 'look-left' : 'look-right';
                body.classList.add(dir);
                setTimeout(function () {
                    body.classList.remove(dir);
                    // sometimes immediately glance the other way
                    if (Math.random() < 0.45) {
                        const other = dir === 'look-left' ? 'look-right' : 'look-left';
                        body.classList.add(other);
                        setTimeout(function () { body.classList.remove(other); }, 900);
                    }
                }, 1000);
                scheduleLook();
            }, 11000 + Math.random() * 9000);
        }

        const OPEN   = 'assets/spidey-hang.svg';
        const CLOSED = 'assets/spidey-blink.svg';

        // preload so the first blink does not flash an empty frame
        new Image().src = CLOSED;

        function blinkOnce(ms) {
            body.src = CLOSED;
            setTimeout(function () { body.src = OPEN; }, ms);
        }

        function scheduleBlink() {
            setTimeout(function () {
                blinkOnce(130);
                // occasional quick double-blink
                if (Math.random() < 0.3) setTimeout(function () { blinkOnce(120); }, 380);
                scheduleBlink();
            }, 2500 + Math.random() * 5500);
        }

        scheduleLook();
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
