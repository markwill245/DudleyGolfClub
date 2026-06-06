// ==========================================
// 1. SANITY REAL-TIME DATA FETCH (CHARITY)
// ==========================================
import { createClient } from 'https://esm.sh/@sanity/client';

async function fetchSanityData() {
    const client = createClient({
        projectId: 'c54r3a5t',
        dataset: 'production',
        useCdn: false, // Ensures updates show instantly upon publish
        apiVersion: '2026-05-29' // Updated to current version
    });

    try {
        // Fetch the amount directly
        const liveTotal = await client.fetch(`*[_type == "charity"][0].amount`);
        const charityElement = document.getElementById('charity-total');

        if (charityElement) {
            // Check if liveTotal exists, fallback to £0 if missing
            const displayValue = liveTotal !== undefined ? liveTotal : "0";
            charityElement.innerText = displayValue;
            console.log("Charity total updated from Sanity: £" + displayValue);
        }
    } catch (err) {
        console.error("Sanity Charity Fetch Error:", err);
    }
}

// Initialise scripts when the site structure is loaded
window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    fetchSanityData();
});

// ==========================================
// 2. MOBILE MENU SLIDER & JUMP-GLITCH FIX
// ==========================================
function initNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const navLinksContainer = document.getElementById('nav-links');

    if (menuBtn && navLinksContainer) {
        // Toggle mobile drawer
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Using classList.toggle is fine, but we ensure state consistency
            const isOpen = navLinksContainer.classList.contains('translate-x-0');
            navLinksContainer.classList.toggle('translate-x-full', isOpen);
            navLinksContainer.classList.toggle('translate-x-0', !isOpen);
        });
    }

    // Intercept local anchor links
    const links = document.querySelectorAll('#nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');

            // Only intercept local anchor links (e.g., #hospitality)
            if (targetHref && targetHref.startsWith('#')) {
                e.preventDefault();

                // 1. Force close the menu drawer immediately
                if (navLinksContainer) {
                    navLinksContainer.classList.add('translate-x-full');
                    navLinksContainer.classList.remove('translate-x-0');
                }

                // 2. Scroll to section
                const targetSection = document.querySelector(targetHref);
                if (targetSection) {
                    // Use a slightly shorter delay for snappier mobile feel
                    setTimeout(() => {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 150);
                }
            }
        });
    });
}

// Initialise scripts when the site structure is loaded
window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    fetchSanityData();
});