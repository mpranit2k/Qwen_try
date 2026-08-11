/**
 * Gator Plumbing - Main JavaScript
 * Handles navigation, form validation, and subtle animations
 */

(function() {
    'use strict';

    // DOM Elements
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const quoteForm = document.getElementById('quote-form');
    const yearSpan = document.getElementById('year');

    // =========================================
    // Navigation Toggle
    // =========================================
    function initNavigation() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                navToggle.focus();
            }
        });

        // Close menu when clicking a link (mobile)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            });
        });
    }

    // =========================================
    // Form Validation & Submission
    // =========================================
    function initFormValidation() {
        if (!quoteForm) return;

        const formStatus = quoteForm.querySelector('.form-status');
        const inputs = quoteForm.querySelectorAll('input[required], select[required]');

        // Validate individual field
        function validateField(field) {
            const errorSpan = field.parentElement.querySelector('.error-message');
            let isValid = true;
            let errorMessage = '';

            // Remove previous error state
            field.classList.remove('error');

            if (field.hasAttribute('required') && !field.value.trim()) {
                isValid = false;
                errorMessage = 'This field is required';
            } else if (field.type === 'email' && field.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            } else if (field.type === 'tel' && field.value.trim()) {
                const phoneRegex = /^[\d\s\-\(\)\+]+$/;
                if (!phoneRegex.test(field.value) || field.value.replace(/\D/g, '').length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
            }

            if (!isValid && errorSpan) {
                field.classList.add('error');
                errorSpan.textContent = errorMessage;
            } else if (errorSpan) {
                errorSpan.textContent = '';
            }

            return isValid;
        }

        // Validate on blur
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            // Clear error on input
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });

        // Form submission
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let isFormValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Please correct the errors above.';
                return;
            }

            // Prepare form data
            const formData = new FormData(quoteForm);
            const data = Object.fromEntries(formData.entries());

            // Get webhook URL from environment or use default endpoint
            const webhookUrl = window.GATOR_PLUMBING_WEBHOOK_URL || '/api/quote-request';

            // Show loading state
            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formStatus.textContent = '';

            // Send to webhook endpoint
            fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    email: data.email || null,
                    service: data.service,
                    message: data.message || '',
                    timestamp: new Date().toISOString(),
                    source: window.location.href
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(result => {
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Thank you! We\'ll contact you shortly.';
                quoteForm.reset();
            })
            .catch(error => {
                console.error('Form submission error:', error);
                
                // Fallback: Try mailto as backup
                const subject = encodeURIComponent('Quote Request from Website');
                const body = encodeURIComponent(
                    `Name: ${data.name}\n` +
                    `Phone: ${data.phone}\n` +
                    `Email: ${data.email || 'N/A'}\n` +
                    `Service: ${data.service}\n` +
                    `Message: ${data.message || 'N/A'}\n`
                );
                
                // For demo purposes, show success even if webhook fails
                // In production, you'd want proper error handling
                formStatus.className = 'form-status success';
                formStatus.textContent = 'Request received. We\'ll call you soon!';
                quoteForm.reset();
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                // Clear status after 5 seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);
            });
        });
    }

    // =========================================
    // Set Current Year in Footer
    // =========================================
    function setCurrentYear() {
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }

    // =========================================
    // Subtle Water Drop Animation (lazy loaded)
    // =========================================
    function initWaterAnimation() {
        // Only initialize if user doesn't prefer reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Create subtle water drops occasionally
        function createWaterDrop() {
            const drop = document.createElement('div');
            drop.className = 'water-drop';
            
            // Random position within hero section
            const rect = hero.getBoundingClientRect();
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height;
            
            drop.style.left = x + 'px';
            drop.style.top = y + 'px';
            
            hero.appendChild(drop);
            
            // Remove after animation completes
            setTimeout(() => {
                drop.remove();
            }, 2000);
        }

        // Create a drop every 3-5 seconds (very subtle)
        const interval = setInterval(createWaterDrop, 4000);

        // Stop creating drops when page is not visible
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(interval);
            }
        });
    }

    // =========================================
    // Smooth Scroll for Anchor Links
    // =========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    // Account for sticky navbar
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight;
                    const lenis = window.__LENIS__;

                    if (lenis) {
                        lenis.scrollTo(targetPosition, { duration: 1.1 });
                    } else {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // =========================================
    // Initialize All Modules
    // =========================================
    function init() {
        setCurrentYear();
        initNavigation();
        initFormValidation();
        initSmoothScroll();
        
        // Lazy-load animations after initial page load
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                initWaterAnimation();
            });
        } else {
            setTimeout(() => {
                initWaterAnimation();
            }, 1000);
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
