const fs = require("fs");

const file = "./museum-captains.html";
let html = fs.readFileSync(file, "utf8");

const statsMarker = `        <section class="py-14 px-6 bg-[#F9F7F2]">`;

const switcher = `        <section class="bg-[#F9F7F2] px-6 pt-10">
            <div class="max-w-7xl mx-auto">
                <div class="inline-flex flex-wrap gap-3" role="group" aria-label="Captain section">
                    <button id="show-mens" type="button"
                        class="captain-section-button bg-[#132419] text-white px-6 py-3 uppercase tracking-[0.2em] text-xs font-bold transition">
                        Men's Captains
                    </button>

                    <button id="show-seniors" type="button"
                        class="captain-section-button bg-white text-[#132419] border border-[#132419]/20 px-6 py-3 uppercase tracking-[0.2em] text-xs font-bold transition hover:border-[#C5A367]">
                        Senior Captains
                    </button>
                </div>

                <p id="active-section-title"
                    class="mt-5 text-sm uppercase tracking-[0.25em] text-[#C5A367] font-bold">
                    Club Captains
                </p>
            </div>
        </section>

`;

if (!html.includes('id="show-mens"')) {
    if (!html.includes(statsMarker)) {
        throw new Error("Statistics section marker was not found.");
    }

    html = html.replace(statsMarker, switcher + statsMarker);
}

const scriptPattern =
    /    <script>\s*let captainsData = \[\];[\s\S]*?loadCaptains\(\);\s*<\/script>/;

const newScript = `    <script>
        let captainsSummary = null;
        let captainsData = [];
        let activeSectionKey = "mens";

        async function loadCaptains() {
            try {
                const response = await fetch("data/captains-summary.json?v=4");

                if (!response.ok) {
                    throw new Error(
                        \`Captains data request failed: \${response.status}\`
                    );
                }

                captainsSummary = await response.json();

                showCaptainSection("mens");

            } catch (error) {
                console.error(error);

                document.getElementById("timeline").innerHTML =
                    \`<p class="text-red-700">Unable to load captains data.</p>\`;
            }
        }

        function getSection(sectionKey) {
            if (!captainsSummary) {
                return null;
            }

            const directSection = captainsSummary[sectionKey];

            if (directSection) {
                return directSection;
            }

            return Array.isArray(captainsSummary.sections)
                ? captainsSummary.sections.find(section =>
                    String(section.section || "").toLowerCase() === sectionKey
                )
                : null;
        }

        function showCaptainSection(sectionKey) {
            const section = getSection(sectionKey);

            if (!section) {
                console.error(
                    \`Captain section not found: \${sectionKey}\`
                );
                return;
            }

            activeSectionKey = sectionKey;

            captainsData = Array.isArray(section.timeline)
                ? section.timeline
                : [];

            document.getElementById("years-covered").textContent =
                \`\${section.firstYear}–\${section.lastYear}\`;

            document.getElementById("total-records").textContent =
                section.totalRecords ?? captainsData.length;

            document.getElementById("unique-captains").textContent =
                section.totalCaptains ?? 0;

            document.getElementById("active-section-title").textContent =
                section.title ||
                (sectionKey === "seniors"
                    ? "Senior Section Captains"
                    : "Club Captains");

            document.getElementById("search-box").value = "";

            renderTimeline(captainsData);
            renderLongestServing(section.longestServing || []);
            updateSectionButtons();
        }

        function updateSectionButtons() {
            const mensButton =
                document.getElementById("show-mens");

            const seniorsButton =
                document.getElementById("show-seniors");

            const activeClasses = [
                "bg-[#132419]",
                "text-white"
            ];

            const inactiveClasses = [
                "bg-white",
                "text-[#132419]",
                "border",
                "border-[#132419]/20"
            ];

            for (const button of [mensButton, seniorsButton]) {
                button.classList.remove(
                    ...activeClasses,
                    ...inactiveClasses
                );
            }

            const activeButton =
                activeSectionKey === "seniors"
                    ? seniorsButton
                    : mensButton;

            const inactiveButton =
                activeSectionKey === "seniors"
                    ? mensButton
                    : seniorsButton;

            activeButton.classList.add(...activeClasses);
            inactiveButton.classList.add(...inactiveClasses);
        }

        function renderTimeline(items) {
            const container =
                document.getElementById("timeline");

            if (!items.length) {
                container.innerHTML = \`
                    <div class="bg-white border border-[#C5A367]/25 p-8 shadow-sm">
                        <h3 class="serif text-3xl mb-3">No captains found</h3>
                        <p class="text-gray-600">
                            Try searching by captain name or year.
                        </p>
                    </div>
                \`;
                return;
            }

            container.innerHTML = items.map(item => \`
                <div class="bg-white border border-[#C5A367]/25 p-5 flex justify-between gap-6 items-center shadow-sm">
                    <div>
                        <p class="text-xs uppercase tracking-[0.25em] text-gray-400">
                            \${item.source || "Captains Board"}
                        </p>
                        <h3 class="serif text-2xl">\${item.name}</h3>
                    </div>

                    <div class="text-right">
                        <p class="serif text-3xl text-[#C5A367]">
                            \${item.year}
                        </p>
                        <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
                            \${item.verified ? "Verified" : "Check"}
                        </p>
                    </div>
                </div>
            \`).join("");
        }

        function renderLongestServing(items) {
            const container =
                document.getElementById("longest-serving");

            if (!items.length) {
                container.innerHTML =
                    \`<p class="text-white/60">No captaincy notes available.</p>\`;
                return;
            }

            container.innerHTML = items.map((item, index) => \`
                <div class="border-b border-white/10 pb-4">
                    <p class="text-[#C5A367] text-sm">
                        #\${index + 1}
                    </p>
                    <h4 class="serif text-xl text-white">
                        \${item.name}
                    </h4>
                    <p class="text-sm">
                        \${item.totalYears} years
                    </p>
                    <p class="text-xs text-white/50">
                        \${(item.years || []).join(", ")}
                    </p>
                </div>
            \`).join("");
        }

        document.getElementById("show-mens")
            .addEventListener("click", () => {
                showCaptainSection("mens");
            });

        document.getElementById("show-seniors")
            .addEventListener("click", () => {
                showCaptainSection("seniors");
            });

        document.getElementById("search-box")
            .addEventListener("input", function () {
                const term =
                    this.value.toLowerCase().trim();

                const filtered =
                    captainsData.filter(item =>
                        (item.name || "")
                            .toLowerCase()
                            .includes(term) ||
                        String(item.year || "")
                            .includes(term)
                    );

                renderTimeline(filtered);
            });

        loadCaptains();
    </script>`;

if (!scriptPattern.test(html)) {
    throw new Error(
        "Existing Captains JavaScript block was not found. No changes made."
    );
}

html = html.replace(scriptPattern, newScript);

fs.writeFileSync(file, html, "utf8");

console.log("Men's and Senior Captains switch added successfully.");
