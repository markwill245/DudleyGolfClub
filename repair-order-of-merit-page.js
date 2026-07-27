const fs = require("fs");

const file = "./order-of-merit.html";
const backup = "./order-of-merit.before-museum-json.html";

if (!fs.existsSync(file)) {
  throw new Error("order-of-merit.html was not found.");
}

let html = fs.readFileSync(file, "utf8");

if (!fs.existsSync(backup)) {
  fs.copyFileSync(file, backup);
  console.log("Backup created:", backup);
}

const oldMain = `  <main class="max-w-7xl mx-auto px-6 py-16">
    <div id="oom">Loading Order of Merit...</div>
  </main>`;

const newMain = `  <main class="max-w-7xl mx-auto px-6 py-16">
    <div class="flex flex-wrap gap-3 mb-10">
      <button
        type="button"
        class="oom-button bg-[#132419] text-white px-6 py-3 uppercase tracking-[0.2em] text-xs font-bold rounded"
        data-section="mens">
        Men's Order of Merit
      </button>

      <button
        type="button"
        class="oom-button bg-white text-[#132419] border border-[#132419]/20 px-6 py-3 uppercase tracking-[0.2em] text-xs font-bold rounded"
        data-section="seniors">
        Seniors Order of Merit
      </button>
    </div>

    <div id="oom">Loading Order of Merit...</div>
  </main>`;

if (!html.includes("class=\"oom-button")) {
  const mainPattern =
    /<main\s+class=["']max-w-7xl mx-auto px-6 py-16["']>[\s\S]*?<\/main>/;

  if (!mainPattern.test(html)) {
    throw new Error("The Order of Merit main section was not found.");
  }

  html = html.replace(mainPattern, newMain.trim());
}

html = html.replace(
  "A live leaderboard built from Player Intelligence and recorded competition results.",
  "Separate Men's and Seniors leaderboards generated from verified Museum competition results and their approved scoring systems."
);

const scriptStart = html.indexOf("  <script>");
const scriptEnd = html.indexOf("  </script>", scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  throw new Error("The existing page script was not found.");
}

const replacementScript = `  <script>
    const state = {
      activeSection: "mens",
      mens: null,
      seniors: null
    };

    function num(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number : 0;
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function medal(rank) {
      if (rank === 1) return "🥇";
      if (rank === 2) return "🥈";
      if (rank === 3) return "🥉";
      return rank;
    }

    function makeSlug(value) {
      return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function latestSeason(data) {
      const entries = Object.entries(data || {});

      if (!entries.length) {
        return {
          season: "",
          leaderboard: []
        };
      }

      entries.sort((a, b) =>
        String(b[0]).localeCompare(String(a[0]))
      );

      const [seasonKey, seasonValue] = entries[0];

      if (Array.isArray(seasonValue)) {
        return {
          season: seasonKey,
          leaderboard: seasonValue
        };
      }

      return {
        ...seasonValue,
        season: seasonValue?.season || seasonKey,
        leaderboard: seasonValue?.leaderboard || []
      };
    }

    function normalisePlayer(player, index) {
      const name =
        player.player ||
        player.playerName ||
        player.name ||
        "Unknown Player";

      return {
        rank: num(player.rank) || index + 1,
        player: name,
        slug:
          player.slug ||
          player.playerSlug ||
          makeSlug(name),
        points:
          num(player.points) ||
          num(player.orderOfMeritPoints),
        competitionsPlayed:
          num(player.competitionsPlayed) ||
          num(player.competitions),
        wins: num(player.wins),
        top10:
          num(player.top10) ||
          num(player.topTen)
      };
    }

    function updateButtons() {
      document.querySelectorAll(".oom-button").forEach(button => {
        const active =
          button.dataset.section === state.activeSection;

        button.classList.toggle("bg-[#132419]", active);
        button.classList.toggle("text-white", active);
        button.classList.toggle("bg-white", !active);
        button.classList.toggle("text-[#132419]", !active);
        button.classList.toggle("border", !active);
        button.classList.toggle(
          "border-[#132419]/20",
          !active
        );
      });
    }

    function render(section) {
      state.activeSection = section;

      const season = state[section] || {
        season: "",
        leaderboard: []
      };

      const players = (season.leaderboard || [])
        .map(normalisePlayer)
        .sort((a, b) =>
          b.points - a.points ||
          b.wins - a.wins ||
          a.player.localeCompare(b.player)
        )
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));

      const leader = players[0] || null;

      const totalWins = players.reduce(
        (sum, player) => sum + player.wins,
        0
      );

      const sectionName =
        section === "seniors" ? "Seniors" : "Men's";

      document.getElementById("oom").innerHTML = \`
        <section class="grid md:grid-cols-4 gap-6 mb-14">
          <div class="bg-white border border-[#C5A367]/30 p-6 rounded shadow">
            <p class="text-xs uppercase tracking-[0.25em] text-[#C5A367] mb-2">
              Current Season
            </p>
            <p class="serif text-3xl">
              \${escapeHtml(season.season || "—")}
            </p>
          </div>

          <div class="bg-white border border-[#C5A367]/30 p-6 rounded shadow">
            <p class="text-xs uppercase tracking-[0.25em] text-[#C5A367] mb-2">
              Current Leader
            </p>
            <p class="serif text-3xl">
              \${leader ? escapeHtml(leader.player) : "—"}
            </p>
          </div>

          <div class="bg-white border border-[#C5A367]/30 p-6 rounded shadow">
            <p class="text-xs uppercase tracking-[0.25em] text-[#C5A367] mb-2">
              Players Ranked
            </p>
            <p class="serif text-5xl">
              \${players.length}
            </p>
          </div>

          <div class="bg-white border border-[#C5A367]/30 p-6 rounded shadow">
            <p class="text-xs uppercase tracking-[0.25em] text-[#C5A367] mb-2">
              Wins Recorded
            </p>
            <p class="serif text-5xl">
              \${totalWins}
            </p>
          </div>
        </section>

        <section class="bg-white border border-[#C5A367]/30 rounded shadow overflow-hidden">
          <div class="p-8 border-b border-[#C5A367]/20">
            <p class="text-xs uppercase tracking-[0.35em] text-[#C5A367] mb-3">
              \${sectionName} Leaderboard
            </p>

            <h2 class="serif text-5xl">
              Current Standings
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-[#132419] text-white">
                <tr>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Pos</th>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Player</th>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Points</th>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Comps</th>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Wins</th>
                  <th class="p-4 text-xs uppercase tracking-[0.2em]">Top 10</th>
                </tr>
              </thead>

              <tbody>
                \${
                  players.length
                    ? players.map(player => \`
                      <tr class="border-b border-gray-200 hover:bg-[#F9F7F2] transition">
                        <td class="p-4 serif text-3xl">
                          \${medal(player.rank)}
                        </td>

                        <td class="p-4">
                          <a
                            href="player-profile.html?player=\${encodeURIComponent(player.slug)}"
                            class="font-semibold hover:text-[#C5A367] transition">
                            \${escapeHtml(player.player)}
                          </a>
                        </td>

                        <td class="p-4 font-bold">
                          \${player.points}
                        </td>

                        <td class="p-4">
                          \${player.competitionsPlayed}
                        </td>

                        <td class="p-4">
                          \${player.wins}
                        </td>

                        <td class="p-4">
                          \${player.top10}
                        </td>
                      </tr>
                    \`).join("")
                    : \`
                      <tr>
                        <td colspan="6" class="p-10 text-center text-gray-500">
                          No qualifying results are currently recorded for this season.
                        </td>
                      </tr>
                    \`
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-[#132419] text-white p-8 md:p-10 rounded shadow mt-12">
          <p class="text-xs uppercase tracking-[0.35em] text-[#C5A367] mb-4">
            Scoring System
          </p>

          <h2 class="serif text-4xl mb-4">
            \${sectionName} Order of Merit
          </h2>

          <p class="text-white/75 max-w-4xl">
            \${
              section === "seniors"
                ? "The Seniors leaderboard uses the approved Seniors scoring system. Qualifying medals, cups and trophies award one winner point, while Harrington competitions award two winner points."
                : "The Men's leaderboard uses the approved positional Order of Merit scoring system for qualifying competitions."
            }
          </p>
        </section>
      \`;

      updateButtons();
    }

    async function loadOrderOfMerit() {
      try {
        const [mensResponse, seniorsResponse] =
          await Promise.all([
            fetch("data/order-of-merit-mens-seasons.json"),
            fetch("data/order-of-merit-seniors-seasons.json")
          ]);

        if (!mensResponse.ok) {
          throw new Error(
            "Men's Order of Merit returned " +
            mensResponse.status
          );
        }

        if (!seniorsResponse.ok) {
          throw new Error(
            "Seniors Order of Merit returned " +
            seniorsResponse.status
          );
        }

        const [mensData, seniorsData] =
          await Promise.all([
            mensResponse.json(),
            seniorsResponse.json()
          ]);

        state.mens = latestSeason(mensData);
        state.seniors = latestSeason(seniorsData);

        render("mens");
      } catch (error) {
        console.error(
          "Order of Merit failed to load",
          error
        );

        document.getElementById("oom").innerHTML = \`
          <div class="bg-white border border-red-200 p-8 rounded shadow">
            <h2 class="serif text-3xl mb-4">
              Order of Merit unavailable
            </h2>

            <p class="text-gray-600">
              The Museum Order of Merit files could not be loaded.
            </p>
          </div>
        \`;
      }
    }

    document
      .querySelectorAll(".oom-button")
      .forEach(button => {
        button.addEventListener("click", () => {
          render(button.dataset.section);
        });
      });

    loadOrderOfMerit();
  </script>`;

html =
  html.slice(0, scriptStart) +
  replacementScript +
  html.slice(scriptEnd + "  </script>".length);

fs.writeFileSync(file, html, "utf8");

console.log("Order of Merit page upgraded.");
console.log("Old Sanity query removed.");
console.log("Men's and Seniors views added.");

