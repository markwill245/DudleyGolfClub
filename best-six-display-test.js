(function () {
  "use strict";

  const section = document.getElementById("best-six-section");
  const content = document.getElementById("best-six-content");

  if (!section || !content || !window.DGCBestSix) {
    console.error("Best 6 display dependencies missing");
    return;
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function table(title, players) {
    return `
      <div style="margin:24px 0;overflow-x:auto">
        <h3 style="background:#132419;color:white;padding:15px">
          ${escapeHTML(title)}
        </h3>
        <table style="width:100%;border-collapse:collapse;background:white">
          <thead>
            <tr style="background:#F9F7F2">
              <th style="padding:12px;text-align:left">Pos</th>
              <th style="padding:12px;text-align:left">Player</th>
              <th style="padding:12px;text-align:left">Total</th><th style="padding:12px;text-align:left">OOM Pts</th>
              <th style="padding:12px;text-align:left">Six rounds</th>
            </tr>
          </thead>
          <tbody>
            ${players.map(p => `
              <tr style="border-bottom:1px solid #ddd">
                <td style="padding:12px">${players.filter(x => x.total === p.total).length > 1 ? p.position + "=" : p.position}</td>
                <td style="padding:12px">${escapeHTML(p.player)}</td>
                <td style="padding:12px;font-weight:bold">${p.total}</td><td style="padding:12px">${({1:10,2:8,3:6,4:5,5:4,6:3,7:2,8:1,9:1,10:1})[p.position] || 0}</td>
                <td style="padding:12px">
                  <details>
                    <summary style="cursor:pointer;color:#132419">
                      View six scores
                    </summary>
                    ${p.rounds.map(r => `
                      <div style="padding:7px 0;border-bottom:1px solid #eee">
                        <strong>${r.score}</strong>
                        - ${escapeHTML(r.date)}
                        - ${escapeHTML(r.competition)}
                        ${r.round > 1 ? `(Round ${r.round})` : ""}
                      </div>
                    `).join("")}
                  </details>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  async function load() {
    try {
      const response = await fetch(
        "data/competition-results.json",
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Results unavailable");

      const data = await response.json();
      const selector = document.createElement("select");
      selector.id = "best-six-year";
      selector.setAttribute("aria-label", "Select Best Six year");
      selector.style.cssText = "padding:10px;margin:12px 0;font-size:16px;";

      for (let year = new Date().getFullYear(); year >= 2021; year--) {
        const option = document.createElement("option");
        option.value = String(year);
        option.textContent = String(year);
        selector.appendChild(option);
      }

      const heading = document.createElement("h3");
      heading.textContent = "Select Best Six Year";

      function render() {
        const year = Number(selector.value);
        const results = window.DGCBestSix.calculate(data, year);
        content.innerHTML =
          table("Best 6 Nett - " + year, results.nett) +
          table("Best 6 Gross - " + year, results.gross);
      }

      section.insertBefore(heading, content);
      section.insertBefore(selector, content);
      selector.addEventListener("change", render);
      render();

    } catch (error) {
      console.error(error);
      content.textContent = "Best 6 standings unavailable.";
    }
  }

  load();
})();
