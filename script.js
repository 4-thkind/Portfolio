/* ============================================================
 
(function () {
    'use strict';

    /* ── Theme toggle ── */
    const themeToggle = document.getElementById('themeToggle');
    const html        = document.documentElement;

    // Restore saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', function () {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const next   = isDark ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    /* ── Navbar scroll shadow ── */
    const navbar = document.getElementById('navbar');

    function onScroll() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ── Mobile hamburger ── */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    hamburger.addEventListener('click', function () {
        const isOpen = navLinks.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target)) {
            navLinks.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    /* ── Active nav link + sliding bar on scroll ── */
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

    function setActive(id) {
        let activeAnchor = null;
        navAnchors.forEach(function (a) {
            const isActive = a.getAttribute('href') === '#' + id;
            a.classList.toggle('active', isActive);
            if (isActive) activeAnchor = a;
            // clear old inline styles from previous implementation
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

    // Move bar on click immediately (don't wait for scroll observer)
    navAnchors.forEach(function (a) {
        a.addEventListener('click', function () {
            navAnchors.forEach(function (x) { x.classList.remove('active'); });
            a.classList.add('active');
            moveBar(a);
        });
    });

    // Position bar on initial load
    window.addEventListener('load', function () {
        var first = navList && navList.querySelector('a.active');
        if (!first) {
            // default to About (home) on fresh load
            first = navList && navList.querySelector('a[href="#hero"]');
            if (first) first.classList.add('active');
        }
        if (first) moveBar(first);
    });

    /* ── Fade-in on scroll (subtle entrance animation) ── */
    const fadeEls = document.querySelectorAll(
        '.project-card, .research-card, .achievement, .cert, .skill-group, .edu-item, .contact-item'
    );

    const respectsMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!respectsMotion && 'IntersectionObserver' in window) {
        // Set initial state
        fadeEls.forEach(function (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(16px)';
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        });

        const fadeObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        fadeObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        fadeEls.forEach(function (el) {
            fadeObserver.observe(el);
        });
    }

})();
