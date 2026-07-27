const fs = require("fs");

const file = "./museum-captains.html";
let html = fs.readFileSync(file, "utf8");

const oldButtonsPattern =
  /<div class="inline-flex flex-wrap gap-3" role="group" aria-label="Captain section">[\s\S]*?<\/div>\s*<p id="active-section-title"/;

const newButtons = `<div class="flex flex-wrap gap-3" role="group" aria-label="Leadership section">
                    <button id="show-mens" type="button"
                        data-section="mens"
                        class="leadership-section-button bg-[#132419] text-white px-5 py-3 uppercase tracking-[0.16em] text-xs font-bold transition">
                        Club Captains
                    </button>

                    <button id="show-seniors" type="button"
                        data-section="seniors"
                        class="leadership-section-button bg-white text-[#132419] border border-[#132419]/20 px-5 py-3 uppercase tracking-[0.16em] text-xs font-bold transition hover:border-[#C5A367]">
                        Senior Captains
                    </button>

                    <button id="show-ladies" type="button"
                        data-section="ladies"
                        class="leadership-section-button bg-white text-[#132419] border border-[#132419]/20 px-5 py-3 uppercase tracking-[0.16em] text-xs font-bold transition hover:border-[#C5A367]">
                        Ladies' Captains
                    </button>

                    <button id="show-lady-presidents" type="button"
                        data-section="ladyPresidents"
                        class="leadership-section-button bg-white text-[#132419] border border-[#132419]/20 px-5 py-3 uppercase tracking-[0.16em] text-xs font-bold transition hover:border-[#C5A367]">
                        Lady Presidents
                    </button>

                    <button id="show-presidents" type="button"
                        data-section="presidents"
                        class="leadership-section-button bg-white text-[#132419] border border-[#132419]/20 px-5 py-3 uppercase tracking-[0.16em] text-xs font-bold transition hover:border-[#C5A367]">
                        Club Presidents
                    </button>
                </div>

                <p id="active-section-title"`;

if (!oldButtonsPattern.test(html)) {
  throw new Error("Existing leadership button block was not found.");
}

html = html.replace(oldButtonsPattern, newButtons);

const oldUpdatePattern =
  /function updateSectionButtons\(\) \{[\s\S]*?\n        \}\n\n        function renderTimeline/;

const newUpdate = `function updateSectionButtons() {
            const buttons = document.querySelectorAll(
                ".leadership-section-button"
            );

            for (const button of buttons) {
                const isActive =
                    button.dataset.section === activeSectionKey;

                button.classList.toggle(
                    "bg-[#132419]",
                    isActive
                );

                button.classList.toggle(
                    "text-white",
                    isActive
                );

                button.classList.toggle(
                    "bg-white",
                    !isActive
                );

                button.classList.toggle(
                    "text-[#132419]",
                    !isActive
                );

                button.classList.toggle(
                    "border",
                    !isActive
                );

                button.classList.toggle(
                    "border-[#132419]/20",
                    !isActive
                );

                button.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            }
        }

        function renderTimeline`;

if (!oldUpdatePattern.test(html)) {
  throw new Error("Existing button update function was not found.");
}

html = html.replace(oldUpdatePattern, newUpdate);

html = html.replace(
  "${item.year}",
  "${item.yearLabel || item.year}"
);

const oldListenersPattern =
  /document\.getElementById\("show-mens"\)[\s\S]*?showCaptainSection\("seniors"\);\s*\}\);/;

const newListeners = `document.querySelectorAll(
            ".leadership-section-button"
        ).forEach(button => {
            button.addEventListener("click", () => {
                showCaptainSection(
                    button.dataset.section
                );
            });
        });`;

if (!oldListenersPattern.test(html)) {
  throw new Error("Existing section button listeners were not found.");
}

html = html.replace(oldListenersPattern, newListeners);

html = html.replace(
  'data/captains-summary.json?v=4',
  'data/captains-summary.json?v=5'
);

fs.writeFileSync(file, html, "utf8");

console.log("Five-section Leadership page completed.");
console.log("Leadership ranges now display using yearLabel.");
