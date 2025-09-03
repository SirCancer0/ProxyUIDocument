// Main JavaScript functionality for Proxy UI Documentation

/**
 * Show specific content section and update navigation
 * @param {string} sectionId - The ID of the section to show
 * @param {HTMLElement} element - The navigation element that was clicked
 */
function showSection(sectionId, element) {
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Smooth scroll to top of content
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
    
    // Update URL hash without triggering scroll
    if (history.replaceState) {
        history.replaceState(null, null, `#${sectionId}`);
    }
}

/**
 * Toggle mobile sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
        
        // Add/remove body scroll lock when sidebar is open on mobile
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Copy code block content to clipboard
 * @param {HTMLElement} button - The copy button that was clicked
 */
async function copyCode(button) {
    try {
        // Find the code block within the same container
        const codeContainer = button.closest('.code-container');
        const codeBlock = codeContainer.querySelector('code');
        
        if (!codeBlock) {
            console.error('Code block not found');
            return;
        }
        
        const codeText = codeBlock.textContent || codeBlock.innerText;
        
        // Use modern clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(codeText);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = codeText;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            textArea.style.pointerEvents = 'none';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        // Visual feedback
        showCopyFeedback(button);
        
    } catch (error) {
        console.error('Failed to copy code:', error);
        showCopyError(button);
    }
}

/**
 * Show visual feedback when code is successfully copied
 * @param {HTMLElement} button - The copy button
 */
function showCopyFeedback(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;
    
    // Update button appearance
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.classList.add('copied', 'copying');
    
    // Reset after 2 seconds
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClass;
    }, 2000);
}

/**
 * Show error feedback when copy fails
 * @param {HTMLElement} button - The copy button
 */
function showCopyError(button) {
    const originalHTML = button.innerHTML;
    const originalClass = button.className;
    
    button.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    button.style.color = '#ff6b6b';
    button.style.borderColor = '#ff6b6b';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClass;
        button.style.color = '';
        button.style.borderColor = '';
    }, 2000);
}

/**
 * Handle initial page load and URL hash
 */
function handleInitialLoad() {
    const hash = window.location.hash.substring(1);
    
    if (hash) {
        const targetElement = document.querySelector(`[onclick*="${hash}"]`);
        if (targetElement) {
            showSection(hash, targetElement);
        }
    }
}

/**
 * Close sidebar when clicking outside on mobile
 * @param {Event} event - Click event
 */
function handleOutsideClick(event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        sidebar && 
        !sidebar.contains(event.target) && 
        !toggleButton.contains(event.target) &&
        sidebar.classList.contains('open')) {
        
        sidebar.classList.remove('open');
        document.body.style.overflow = '';
    }
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardNavigation(event) {
    // Close sidebar with Escape key on mobile
    if (event.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
    }
    
    // Toggle sidebar with Alt + M
    if (event.altKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        toggleSidebar();
    }
}

/**
 * Add smooth scrolling behavior for internal links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize intersection observer for navigation highlighting
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const sectionId = entry.target.id;
                    const correspondingNav = document.querySelector(`[onclick*="${sectionId}"]`);
                    
                    if (correspondingNav) {
                        navItems.forEach(nav => nav.classList.remove('active'));
                        correspondingNav.classList.add('active');
                        
                        // Update URL hash
                        if (history.replaceState) {
                            history.replaceState(null, null, `#${sectionId}`);
                        }
                    }
                }
            });
        },
        {
            threshold: [0.5],
            rootMargin: '-20% 0px -70% 0px'
        }
    );
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Add animation classes when elements come into view
 */
function initAnimationObserver() {
    const animatedElements = document.querySelectorAll('.feature, .param, .code-container');
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
                    entry.target.classList.add('animate-in');
                }
            });
        },
        { threshold: 0.1 }
    );
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Handle window resize events
 */
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    
    // Reset sidebar state on desktop
    if (window.innerWidth > 768) {
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        document.body.style.overflow = '';
    }
}

/**
 * Initialize all functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Handle initial page load
    handleInitialLoad();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize scroll spy for navigation
    if (window.IntersectionObserver) {
        initScrollSpy();
        initAnimationObserver();
    }
    
    // Add event listeners
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyboardNavigation);
    window.addEventListener('resize', handleResize);
    
    // Add loading class removal after content is ready
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    console.log('🚀 Proxy UI Documentation loaded successfully!');
});

// Add error handling for missing elements
window.addEventListener('error', function(event) {
    console.warn('Proxy UI Docs: An error occurred:', event.error);
});

// Export functions for global access
window.ProxyUIDocs = {
    showSection,
    toggleSidebar,
    copyCode
};
