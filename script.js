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
        '.project-card, .research-card, .achievement, .cert, .skill-group, .edu-item, .contact-item'
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

})();
