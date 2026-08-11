/**
 * Gator Plumbing - Awwwards-grade Animation Layer
 * Lenis smooth scroll + GSAP ScrollTrigger, hero choreography,
 * custom cursor, magnetic CTAs, scroll reveals, count-up, FAQ motion.
 * Consumes the principled MotionTemplates (design-motion skill).
 */
(function (global) {
    'use strict';

    var gsap = global.gsap;
    var ScrollTrigger = global.ScrollTrigger;
    var T = global.MotionTemplates;

    // No GSAP / templates loaded -> reveal everything instantly.
    if (!gsap || !T) {
        document.documentElement.classList.remove('js');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var DUR = T.DURATIONS;
    var EASE = T.EASING;
    var reduced = T.REDUCED;

    /* =========================================
       Smooth scroll + ScrollTrigger (critical)
       ========================================= */
    var lenis = T.smoothScroll();
    if (lenis) global.__LENIS__ = lenis;

    /* =========================================
       Navbar: glass on scroll + hide/show
       ========================================= */
    (function initNavbarMotion() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) return;
        var lastY = global.scrollY;

        global.addEventListener('scroll', function () {
            var y = global.scrollY;
            navbar.classList.toggle('scrolled', y > 24);
            if (y > 320 && y > lastY) {
                navbar.classList.add('nav-hidden');
            } else {
                navbar.classList.remove('nav-hidden');
            }
            lastY = y;
        }, { passive: true });
    })();

    /* =========================================
       Hero entrance choreography (Jhey delight)
       ========================================= */
    (function initHero() {
        var hero = document.querySelector('.hero');
        var bg = document.querySelector('.hero-bg');
        var content = document.querySelector('.hero-content');
        if (!hero) return;

        if (reduced) {
            gsap.set('.line-inner', { clearProps: 'all' });
            return;
        }

        // Slow Ken-Burns-style settle on the background
        gsap.fromTo(bg, { scale: 1.12 }, {
            scale: 1,
            duration: 1.6,
            ease: EASE.smooth,
            overwrite: 'auto'
        });

        // Line-mask title reveal
        gsap.to('.line-inner', {
            y: 0,
            duration: DUR.HERO,
            ease: EASE.dramatic,
            stagger: 0.12,
            delay: 0.15
        });

        // Subhead + CTAs rise in
        gsap.fromTo('[data-hero-fade]', {
            y: 26,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: EASE.smooth,
            stagger: 0.14,
            delay: 0.45
        });

        // Parallax: bg drifts up, content fades out on scroll
        gsap.to(bg, {
            yPercent: 22,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.to(content, {
            yPercent: -14,
            opacity: 0.15,
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    })();

    /* =========================================
       Scroll reveals (Jakub polish, once only)
       ========================================= */
    (function initReveals() {
        var groups = {
            '.trustbar-grid': '.trust-item',
            '.services-grid': '.service-card',
            '.area-grid': '.area-card',
            '.faq-list': '.faq-item'
        };

        Object.keys(groups).forEach(function (containerSel) {
            var container = document.querySelector(containerSel);
            if (!container) return;
            var children = container.querySelectorAll(groups[containerSel]);
            if (children.length) T.reveal(children, { trigger: container, stagger: 0.08 });
        });

        // Standalone reveals (section titles, panels)
        var groupSelectors = '.trustbar-grid, .services-grid, .area-grid, .faq-list';
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            if (el.closest(groupSelectors)) return;
            if (el.classList.contains('section-title')) {
                T.titleReveal(el, { y: 0 });
            } else {
                T.reveal(el, { y: 24 });
            }
        });
    })();

    /* =========================================
       Card tilt (Jakub polish + Jhey delight)
       ========================================= */
    document.querySelectorAll('.service-card').forEach(function (el) {
        T.tilt(el);
    });

    /* =========================================
       Signature water drops (Jhey, occasional)
       ========================================= */
    T.signatureDrops(document.querySelector('.hero'), {
        className: 'water-drop',
        intervalMs: 4200,
        life: 2200
    });

    /* =========================================
       Count-up rating (occasional frequency)
       ========================================= */
    (function initCountUps() {
        document.querySelectorAll('[data-countup]').forEach(function (el) {
            T.countUp(el);
        });
    })();

    /* =========================================
       Custom cursor + magnetic CTAs
       ========================================= */
    T.cursor();
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
        T.magnetic(el);
    });

    /* =========================================
       FAQ accordion with animated height
       ========================================= */
    (function initFaq() {
        document.querySelectorAll('.faq-item').forEach(function (item) {
            var summary = item.querySelector('summary');
            var content = item.querySelector('p');
            if (!summary || !content) return;

            var panel = document.createElement('div');
            panel.className = 'faq-panel';
            content.parentNode.insertBefore(panel, content);
            panel.appendChild(content);

            gsap.set(panel, { height: 0 });

            summary.addEventListener('click', function (e) {
                e.preventDefault();
                var opening = !item.open;

                if (reduced) {
                    item.open = opening;
                    return;
                }

                if (opening) {
                    item.open = true;
                    gsap.fromTo(panel, { height: 0 }, {
                        height: panel.scrollHeight,
                        duration: DUR.UI,
                        ease: EASE.smooth,
                        overwrite: 'auto'
                    });
                } else {
                    gsap.to(panel, {
                        height: 0,
                        duration: DUR.UI,
                        ease: EASE.smooth,
                        overwrite: 'auto',
                        onComplete: function () { item.open = false; }
                    });
                }
            });
        });
    })();

    /* =========================================
       Scroll progress bar
       ========================================= */
    T.progressBar();

    /* =========================================
       Refresh ScrollTrigger after images/fonts
       ========================================= */
    if (global.addEventListener) {
        global.addEventListener('load', function () {
            ScrollTrigger.refresh();
        });
    }
})(window);
