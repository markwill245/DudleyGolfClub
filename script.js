// ==========================================
// 1. SANITY REAL-TIME DATA FETCH (CHARITY)
// ==========================================
async function fetchSanityData() {
    if (!window.SanityClient || !window.SanityClient.createClient) {
        console.warn("Sanity library engine is still loading or unavailable.");
        return;
    }

    const client = window.SanityClient.createClient({
        projectId: 'c54r3a5t',
        dataset: 'production',
        useCdn: false, // Ensures updates show instantly on hit publish!
        apiVersion: '2024-03-01'
    });

    try {
        const query = `*[_type == "charity"][0].amount`;
        const liveTotal = await client.fetch(query);
        const charityElement = document.getElementById('charity-total');

        if (charityElement && liveTotal !== undefined) {
            charityElement.innerText = liveTotal;
            console.log("Charity total updated from Sanity: £" + liveTotal);
        }
    } catch (err) {
        console.error("Sanity Charity Fetch Error:", err);
    }
}

// ==========================================
// 2. MOBILE MENU SLIDER & JUMP-GLITCH FIX
// ==========================================
function initNavigation() {
    const menuBtn = document.getElementById('menu-btn');
    const navLinksContainer = document.getElementById('nav-links');

    if (menuBtn && navLinksContainer) {
        // Toggle mobile drawer layout smoothly
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinksContainer.classList.toggle('translate-x-full');
            navLinksContainer.classList.toggle('translate-x-0');
        });
    }

    // Fixes the "Hospitality opens History first" link glitch
    const links = document.querySelectorAll('#nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetHref = this.getAttribute('href');

            // Only intercept local anchor links (e.g., #hospitality)
            if (targetHref && targetHref.startsWith('#')) {
                e.preventDefault();

                // 1. Instantly hide the mobile drawer menu first so it can't conflict
                if (navLinksContainer) {
                    navLinksContainer.classList.add('translate-x-full');
                    navLinksContainer.classList.remove('translate-x-0');
                }

                // 2. Short pause allows the drawer layout to close cleanly before calculating positions
                setTimeout(() => {
                    const targetSection = document.querySelector(targetHref);
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 200); // 200ms delay stops the viewport math from breaking
            }
        });
    });
}

// Initialise scripts when the site structure is loaded
window.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    fetchSanityData();
});