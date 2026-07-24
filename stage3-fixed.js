const fs = require("fs");

const file = "competition-index.html";
let html = fs.readFileSync(file, "utf8");

/*
 * 1. Add the footer directly before </main>.
 */
if (!html.includes('id="total-shown"')) {

    const mainClose = `
    </main>`;

    if (!html.includes(mainClose)) {
        console.error("Closing </main> tag not found. No changes made.");
        process.exit(1);
    }

    const footer = `
        <footer
            class="soft-strip rounded-lg px-4 py-3 mt-8 mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm text-[#132419]/70">

            <p class="flex items-start md:items-center gap-2">

                <span class="w-5 h-5 rounded-full border border-[#132419]/35 flex items-center justify-center text-xs shrink-0">
                    ✓
                </span>

                <span>
                    Only competitions with recorded results are shown.
                    This page updates automatically when Museum data is published.
                </span>

            </p>

            <p
                id="total-shown"
                class="font-semibold text-[#132419] whitespace-nowrap">
            </p>

        </footer>

    </main>`;

    html = html.replace(mainClose, footer);
}

/*
 * 2. Add the floating Back to Top button before <script>.
 */
if (!html.includes('id="back-to-top"')) {

    const scriptTag = `
    <script>`;

    if (!html.includes(scriptTag)) {
        console.error("Opening <script> tag not found. No changes made.");
        process.exit(1);
    }

    const button = `
    <button
        id="back-to-top"
        type="button"
        aria-label="Back to top"
        class="fixed right-5 bottom-5 z-50 w-16 h-16 rounded-full bg-[#132419] text-white shadow-xl opacity-0 pointer-events-none transition duration-200 hover:-translate-y-1">

        <span class="block text-xl leading-none">↑</span>
        <span class="block text-[10px] tracking-widest mt-1">TOP</span>

    </button>

    <script>`;

    html = html.replace(scriptTag, button);
}

/*
 * 3. Add a reliable total-count function before loadCompetitions().
 */
if (!html.includes("function updateArchiveTotal")) {

    const loadFunction = `        async function loadCompetitions() {`;

    if (!html.includes(loadFunction)) {
        console.error("loadCompetitions function not found. No changes made.");
        process.exit(1);
    }

    const totalFunction = `        function updateArchiveTotal(categories) {

            const totalElement =
                document.getElementById("total-shown");

            if (!totalElement) {
                return;
            }

            const uniqueCompetitions = new Set();

            categories.forEach(category => {

                category.competitions.forEach(competition => {

                    uniqueCompetitions.add(
                        getId(competition) ||
                        normalise(getName(competition))
                    );

                });

            });

            totalElement.textContent =
                \`Total competitions shown: \${uniqueCompetitions.size}\`;
        }

        async function loadCompetitions() {`;

    html = html.replace(loadFunction, totalFunction);
}

/*
 * 4. Add controls and total update at the end of successful renderArchive().
 *
 * The category HTML finishes immediately before setExpanded().
 */
if (!html.includes("updateArchiveTotal(categories);")) {

    const renderEndPattern =
        /(\s*archive\.innerHTML = categories\.map\(category => `[\s\S]*?`\)\.join\(""\);)(\s*\n\s*}\s*\n\s*\n\s*function setExpanded)/;

    if (!renderEndPattern.test(html)) {
        console.error("End of renderArchive not found. No changes made.");
        process.exit(1);
    }

    html = html.replace(
        renderEndPattern,
        `$1

            wireArchiveControls();
            updateArchiveTotal(categories);
$2`
    );
}

/*
 * 5. Set total to zero when a search has no results.
 */
if (!html.includes('totalElement.textContent = "Total competitions shown: 0"')) {

    const noResultsMarker = `            if (!categories.length) {

                archive.innerHTML = \``;

    if (!html.includes(noResultsMarker)) {
        console.error("No-results block not found. No changes made.");
        process.exit(1);
    }

    const noResultsReplacement = `            if (!categories.length) {

                const totalElement =
                    document.getElementById("total-shown");

                if (totalElement) {
                    totalElement.textContent = "Total competitions shown: 0";
                }

                archive.innerHTML = \``;

    html = html.replace(
        noResultsMarker,
        noResultsReplacement
    );
}

/*
 * 6. Add Back to Top behaviour immediately before loadCompetitions().
 */
if (!html.includes('window.scrollTo({')) {

    const loadCall = `        loadCompetitions();`;

    if (!html.includes(loadCall)) {
        console.error("loadCompetitions call not found. No changes made.");
        process.exit(1);
    }

    const backToTopCode = `        const backToTop =
            document.getElementById("back-to-top");

        window.addEventListener("scroll", () => {

            const shouldShow =
                window.scrollY > 450;

            backToTop.classList.toggle(
                "opacity-0",
                !shouldShow
            );

            backToTop.classList.toggle(
                "pointer-events-none",
                !shouldShow
            );

        });

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        loadCompetitions();`;

    html = html.replace(loadCall, backToTopCode);
}

fs.writeFileSync(file, html, "utf8");

console.log("Stage 3 fixed patch applied successfully.");
console.log("Footer, archive total and Back to Top button added.");
