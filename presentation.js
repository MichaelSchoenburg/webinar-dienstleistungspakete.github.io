document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const navLinks = document.querySelectorAll('.slide-nav a');

    // Options for the observer
    const observerOptions = {
        root: document.querySelector('.presentation-container'), // The scroll container
        threshold: 0.5 // Trigger when 50% of the slide is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add active class to the slide for CSS animations
                entry.target.classList.add('active');

                // Update navigation dots
                const id = entry.target.getAttribute('id');
                updateNavigation(id);

                // Additional logic for specific slides
                if (id === 'slide-security-stats') {
                    animateChart();
                }
            }
        });
    }, observerOptions);

    // Observe all slides
    slides.forEach(slide => {
        observer.observe(slide);
    });

    let chartAnimated = false;

    function animateChart() {
        if (chartAnimated) return;
        chartAnimated = true;

        const chart = document.querySelector('.donut-chart');
        const valueDisplay = document.querySelector('.chart-value');

        if (!chart || !valueDisplay) return;

        const targetValue = 78;
        const duration = 2000; // 2 seconds
        const frameRate = 60;
        const totalFrames = Math.round((duration / 1000) * frameRate);
        const increment = targetValue / totalFrames;

        let currentValue = 0;
        let currentFrame = 0;

        const interval = setInterval(() => {
            currentFrame++;
            currentValue = easeOutCubic(currentFrame, 0, targetValue, totalFrames);

            if (currentFrame >= totalFrames) {
                currentValue = targetValue;
                clearInterval(interval);
            }

            // Update Chart with raspberry color
            chart.style.background = `conic-gradient(#D9486C 0% ${currentValue}%, #ddd ${currentValue}% 100%)`;

            // Update Text
            valueDisplay.textContent = `Ø ${Math.round(currentValue)}%`;

        }, 1000 / frameRate);
    }

    // Easing function for smooth animation
    // t: current time, b: start value, c: change in value, d: duration
    function easeOutCubic(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    }

    function updateNavigation(activeId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    // Smooth scroll for nav links (overriding default to ensure it works in the snap container)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSlide = document.getElementById(targetId);

            if (targetSlide) {
                targetSlide.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // Lightbox Functionality
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery img');
    const contentWrapper = document.querySelector('.lightbox-content-wrapper');

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

    // Progressive Reveal for Agenda Timeline
    const agendaSlide = document.getElementById('slide-agenda');
    if (agendaSlide) {
        const timelineItems = agendaSlide.querySelectorAll('.timeline-item');

        // Track which items have been revealed
        const revealed = new Array(timelineItems.length).fill(false);
        revealed[0] = true; // First item always revealed

        // Add initial class to first item
        if (timelineItems[0]) {
            timelineItems[0].classList.add('revealed');
        }

        // Hide all items except the first one initially
        timelineItems.forEach((item, index) => {
            if (index > 0) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }
        });

        // Proximity threshold in pixels
        const proximityThreshold = 150;

        function handleMouseMove(e) {
            // Only check if we're on the agenda slide
            if (!agendaSlide.classList.contains('active')) return;

            timelineItems.forEach((item, index) => {
                // Skip first item (always visible) and already revealed items
                if (index === 0 || revealed[index]) return;

                // Check if previous item has been revealed
                if (!revealed[index - 1]) return;

                // Get item position
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const itemCenterY = rect.top + rect.height / 2;

                // Calculate distance from cursor to item center
                const distance = Math.sqrt(
                    Math.pow(e.clientX - itemCenterX, 2) +
                    Math.pow(e.clientY - itemCenterY, 2)
                );

                // Reveal if cursor is close enough
                if (distance < proximityThreshold) {
                    revealed[index] = true;
                    item.classList.add('revealed');
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }
            });
        }

        // Add mouse move listener to the slide
        agendaSlide.addEventListener('mousemove', handleMouseMove);
    }
});
