/**
 * Gator Plumbing - Motion Templates
 * Design Motion Principles applied as reusable, principled motion recipes.
 *
 * Context weighting (Marketing / landing page):
 *   Primary   - Jakub  (production polish: subtle, refined, 200-500ms)
 *   Secondary - Jhey   (creative delight: hero, cursor, water drops)
 *   Selective - Emil   (frequency gate: nav + forms stay instant/fast)
 *
 * Golden rule: the best animation is the one that goes unnoticed.
 */
(function (global) {
    'use strict';

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = global.matchMedia && global.matchMedia('(pointer: fine)').matches;

    var DURATIONS = {
        MICRO: 0.18,   // Emil - frequent interactions (nav, hovers)
        UI: 0.32,      // Jakub - buttons, panels, accordion (200-500ms)
        REVEAL: 0.6,   // Jakub - section reveals (once, occasional)
        HERO: 1.1      // Jhey  - expressive hero entrance (rare)
    };

    var EASING = {
        smooth: 'power2.out',
        snappy: 'power4.out',
        dramatic: 'power4.inOut',
        spring: { type: 'spring', stiffness: 180, damping: 18 }
    };

    // Anti-slop gate: only these properties may animate. (Performance rule)
    var ANIMATABLE = ['transform', 'opacity', 'clipPath'];

    function duration(key) {
        return reduced ? 0.01 : (DURATIONS[key] || DURATIONS.UI);
    }

    /**
     * Magnetic hover for an element.
     * Emil frequency gate: only primary CTAs, runs once per move.
     */
    function magnetic(el) {
        if (reduced || !finePointer || !el) return;
        var strength = 0.35;
        var x = 0;
        var y = 0;

        el.addEventListener('mousemove', function (e) {
            var r = el.getBoundingClientRect();
            x = (e.clientX - r.left - r.width / 2) * strength;
            y = (e.clientY - r.top - r.height / 2) * strength;
        });

        el.addEventListener('mouseleave', function () {
            x = 0;
            y = 0;
        });

        global.gsap.ticker.add(function () {
            global.gsap.to(el, {
                x: x,
                y: y,
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    }

    /**
     * Fade-up reveal for one or many elements with ScrollTrigger.
     * Jakub polish: 0.7s power2.out, transform + opacity only.
     */
    function reveal(targets, opts) {
        opts = opts || {};
        var els = global.gsap.utils.toArray(targets);
        if (!els.length) return;

        var cfg = {
            y: opts.y || 28,
            duration: duration('REVEAL'),
            ease: EASING.smooth,
            stagger: opts.stagger || 0.08
        };

        if (reduced) {
            global.gsap.set(els, { clearProps: 'all', opacity: 1 });
            return;
        }

        global.gsap.from(els, {
            y: cfg.y,
            opacity: 0,
            duration: cfg.duration,
            ease: cfg.ease,
            stagger: cfg.stagger,
            scrollTrigger: {
                trigger: opts.trigger || els[0],
                start: 'top 85%',
                once: true
            }
        });
    }

    /**
     * Title reveal - clip-path sweep. Jhey delight, reserved for
     * section headings so not every element animates identically
     * (anti-monotony: avoid the same fade-up everywhere).
     */
    function titleReveal(targets, opts) {
        opts = opts || {};
        var els = global.gsap.utils.toArray(targets);
        if (!els.length) return;

        if (reduced) {
            global.gsap.set(els, { clearProps: 'all', opacity: 1 });
            return;
        }

        global.gsap.from(els, {
            clipPath: 'inset(0 100% 0 0)',
            opacity: 0.15,
            duration: duration('REVEAL') + 0.1,
            ease: EASING.dramatic,
            stagger: opts.stagger || 0.1,
            scrollTrigger: {
                trigger: opts.trigger || els[0],
                start: 'top 85%',
                once: true
            }
        });
    }

    /**
     * Subtle 3D tilt on hover for cards. Jakub polish + Jhey delight:
     * max 4 degrees, spring return, pointer devices only.
     */
    function tilt(el, opts) {
        if (reduced || !finePointer || !el) return;
        opts = opts || {};
        var max = opts.max || 4;
        var perspective = opts.perspective || 900;
        var tx = 0;
        var ty = 0;

        el.addEventListener('mousemove', function (e) {
            var r = el.getBoundingClientRect();
            ty = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
            tx = -((e.clientY - r.top) / r.height - 0.5) * 2 * max;
        });

        el.addEventListener('mouseleave', function () {
            tx = 0;
            ty = 0;
        });

        global.gsap.ticker.add(function () {
            global.gsap.to(el, {
                rotationX: tx,
                rotationY: ty,
                transformPerspective: perspective,
                duration: 0.5,
                ease: EASING.smooth,
                overwrite: 'auto'
            });
        });
    }

    /**
     * Ambient signature drops (industry signature, Jhey delight).
     * Occasional frequency: one drop every few seconds, auto-removed.
     */
    function signatureDrops(container, opts) {
        if (reduced || !container) return;
        opts = opts || {};
        var intervalMs = opts.intervalMs || 4000;
        var className = opts.className || 'water-drop';
        var life = opts.life || 2000;

        function createDrop() {
            var drop = document.createElement('div');
            drop.className = className;
            var rect = container.getBoundingClientRect();
            drop.style.left = Math.random() * rect.width + 'px';
            drop.style.top = Math.random() * rect.height + 'px';
            container.appendChild(drop);
            setTimeout(function () { drop.remove(); }, life);
        }

        var interval = setInterval(createDrop, intervalMs);

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearInterval(interval);
        });

        return interval;
    }

    /**
     * Count-up number on view (IntersectionObserver + RAF).
     */
    function countUp(el) {
        if (!el) return;
        var target = parseFloat(el.getAttribute('data-countup') || '0');
        var decimals = parseInt(el.getAttribute('data-countup-decimals') || '0', 10);

        var format = function (v) { return v.toFixed(decimals); };
        var durationMs = reduced ? 0 : 1200;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                observer.unobserve(el);

                if (reduced) {
                    el.textContent = format(target);
                    return;
                }

                var start = null;
                var step = function (ts) {
                    if (!start) start = ts;
                    var p = Math.min((ts - start) / (durationMs * 60), 1);
                    p = 1 - Math.pow(1 - p, 4);
                    el.textContent = format(target * p);
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });
        }, { threshold: 0.4 });
        observer.observe(el);
    }

    /**
     * Custom cursor: dot + trailing ring (Jhey delight, occasional).
     */
    function cursor() {
        if (reduced || !finePointer) return;
        var dot = document.querySelector('.cursor-dot');
        var ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;

        document.documentElement.classList.add('has-cursor');
        var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        var ringPos = { x: pos.x, y: pos.y };

        document.addEventListener('mousemove', function (e) {
            pos.x = e.clientX;
            pos.y = e.clientY;
        });

        global.gsap.ticker.add(function () {
            ringPos.x += (pos.x - ringPos.x) * 0.15;
            ringPos.y += (pos.y - ringPos.y) * 0.15;
            global.gsap.set(dot, { x: pos.x - 3, y: pos.y - 3 });
            global.gsap.set(ring, { x: ringPos.x - 18, y: ringPos.y - 18 });
        });

        var growTargets = document.querySelectorAll('a, button, .btn, summary');
        growTargets.forEach(function (t) {
            t.addEventListener('mouseenter', function () {
                document.documentElement.classList.add('cursor-hover');
            });
            t.addEventListener('mouseleave', function () {
                document.documentElement.classList.remove('cursor-hover');
            });
        });
    }

    /**
     * Smooth scroll via Lenis wired to GSAP ScrollTrigger (critical setup).
     */
    function smoothScroll() {
        if (reduced || typeof global.Lenis === 'undefined') return;
        var lenis = new global.Lenis({
            lerp: 0.1,
            duration: 1.2,
            smoothWheel: true
        });

        lenis.on('scroll', global.ScrollTrigger.update);
        global.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        global.gsap.ticker.lagSmoothing(0);

        return lenis;
    }

    /**
     * Scroll progress bar at the top of the viewport.
     */
    function progressBar() {
        var bar = document.querySelector('.scroll-progress');
        if (!bar || reduced) return;
        global.gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });
    }

    global.MotionTemplates = {
        REDUCED: reduced,
        FINE_POINTER: finePointer,
        DURATIONS: DURATIONS,
        EASING: EASING,
        ANIMATABLE: ANIMATABLE,
        duration: duration,
        magnetic: magnetic,
        reveal: reveal,
        titleReveal: titleReveal,
        tilt: tilt,
        signatureDrops: signatureDrops,
        countUp: countUp,
        cursor: cursor,
        smoothScroll: smoothScroll,
        progressBar: progressBar
    };
})(window);
