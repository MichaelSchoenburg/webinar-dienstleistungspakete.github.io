document.addEventListener('DOMContentLoaded', () => {
    console.log('Bechtle Webinar Site Loaded');

    // Parallax Effect for Hero
    const hero = document.getElementById('hero');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        if (scrollPosition < 800) { // Optimization
            hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        }
    });

    // Intersection Observer for Fade-in Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Select elements to animate
    const animatedElements = document.querySelectorAll('.service-card, h2, h3, .poster-image, .cta-box, .timeline-item, .feature-list li, .feature-card, .takeaway-card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    // Dramatic Parallax for Security Diagram
    const securityContainer = document.querySelector('.stats-container');
    const chartStage = document.getElementById('security-chart-stage');

    if (securityContainer && chartStage) {
        securityContainer.addEventListener('mousemove', (e) => {
            const rect = securityContainer.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse position x within element
            const y = e.clientY - rect.top;  // Mouse position y within element

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate distance from center (-1 to 1)
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;

            // Max rotation angles
            const maxRotateX = 20; // degrees
            const maxRotateY = 20; // degrees

            // Calculate rotation (inverted for natural tilt)
            const rotateX = maxRotateX * percentY * -1;
            const rotateY = maxRotateY * percentX;

            // Apply rotation to stage
            // We include translateZ(50px) to match the CSS baseline and keep it above the background
            chartStage.style.transform = `perspective(1000px) translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // Parallax for inner layers
            const layers = chartStage.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                const depth = layer.getAttribute('data-depth') || 0.2;
                const moveX = percentX * 40 * depth; // max movement pixels
                const moveY = percentY * 40 * depth;
                const zIndex = depth * 50; // Add some Z translation based on depth

                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, ${zIndex}px)`;
            });
        });

        securityContainer.addEventListener('mouseleave', () => {
            // Reset transforms
            chartStage.style.transform = 'perspective(1000px) translateZ(50px) rotateX(0) rotateY(0)';
            const layers = chartStage.querySelectorAll('.parallax-layer');
            layers.forEach(layer => {
                layer.style.transform = 'translate3d(0, 0, 0)'; // Reset, but keep original if any
                // Re-apply specific static transforms if needed, but for now we reset to 0
                if (layer.classList.contains('chart-center-text')) {
                    layer.style.transform = 'translateZ(20px)'; // Restore initial Z
                }
            });
        });
    }

    // Lightbox Functionality
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery img');
    const contentWrapper = document.querySelector('.lightbox-content-wrapper');

    if (modal && modalImg && galleryImages.length > 0) {
        // Open Modal
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('show'), 10); // Fade in
                modalImg.src = img.src;
                modalImg.classList.remove('zoomed'); // Reset zoom
                resetPan();
            });
        });

        // Close Modal
        function closeModal() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                modalImg.classList.remove('zoomed');
                resetPan();
            }, 300); // Wait for transition
        }

        closeBtn.addEventListener('click', closeModal);

        // Close on click outside image (but not when dragging)
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === contentWrapper) {
                closeModal();
            }
        });

        // Zoom and Pan Logic
        let isZoomed = false;
        let isDragging = false;
        let startX, startY, translateX = 0,
            translateY = 0;

        modalImg.addEventListener('click', (e) => {
            if (isDragging) return; // Don't toggle zoom if we were dragging

            isZoomed = !isZoomed;
            if (isZoomed) {
                modalImg.classList.add('zoomed');
            } else {
                modalImg.classList.remove('zoomed');
                resetPan();
            }
        });

        function resetPan() {
            translateX = 0;
            translateY = 0;
            modalImg.style.transform = '';
            isZoomed = false;
        }

        // Panning
        modalImg.addEventListener('mousedown', (e) => {
            if (!isZoomed) return;
            isDragging = false;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            modalImg.style.cursor = 'grabbing';

            // Add listeners to document to handle drag outside image
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isZoomed) return;
            e.preventDefault();
            isDragging = true;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            modalImg.style.transform = `scale(2.5) translate(${translateX / 2.5}px, ${translateY / 2.5}px)`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            modalImg.style.cursor = 'grab';
            // Cleanup flag after a short delay to distinguish click from drag
            setTimeout(() => isDragging = false, 50);
        }
    }

});
