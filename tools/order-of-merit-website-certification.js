const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/order-of-merit-certified.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./order-of-merit.html",
  "utf8"
);

const failures = [];

let seasonsChecked = 0;
let playersChecked = 0;
let transactionsChecked = 0;

function fail(message) {
  failures.push(message);
}

if (
  data.certificationStatus !==
  "CERTIFIED"
) {
  fail(
    "Order of Merit JSON is not certified."
  );
}

for (const sectionName of ["mens", "seniors"]) {
  const section = data[sectionName];

  if (
    !section ||
    !Array.isArray(section.seasonOrder) ||
    !section.seasons
  ) {
    fail(
      `${sectionName} season archive is missing.`
    );
    continue;
  }

  if (
    !section.seasonOrder.includes(
      section.currentSeason
    )
  ) {
    fail(
      `${sectionName} current season is not in its archive.`
    );
  }

  for (const seasonName of section.seasonOrder) {
    seasonsChecked++;

    const season =
      section.seasons[seasonName];

    if (
      !season ||
      !Array.isArray(season.leaderboard)
    ) {
      fail(
        `${sectionName} ${seasonName} leaderboard is missing.`
      );
      continue;
    }

    if (
      Number(season.playersRanked) !==
      season.leaderboard.length
    ) {
      fail(
        `${sectionName} ${seasonName} player-count mismatch.`
      );
    }

    for (
      const [index, player] of
      season.leaderboard.entries()
    ) {
      playersChecked++;

      const playerName =
        player.player ||
        player.playerName ||
        player.name ||
        "Unknown";

      if (
        Number(player.rank) !==
        index + 1
      ) {
        fail(
          `${sectionName} ${seasonName}: invalid rank for ${playerName}.`
        );
      }

      const results =
        Array.isArray(player.results)
          ? player.results
          : [];

      transactionsChecked +=
        results.length;

      const breakdown =
        results.reduce(
          (sum, result) =>
            sum + Number(result.points || 0),
          0
        );

      if (
        Number(player.points || 0) !==
        breakdown
      ) {
        fail(
          `${sectionName} ${seasonName}: ${playerName} point mismatch.`
        );
      }
    }
  }
}

const required = [
  "data/order-of-merit-certified.json",
  "sectionData.seasonOrder",
  "sectionData.seasons",
  "sectionData.currentSeason",
  "seasonSelector(",
  'id="seasonSelector"',
  "changeSeason(",
  "Certified Points Breakdown"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

const forbidden = [
  "data/order-of-merit-mens-seasons.json",
  "data/order-of-merit-seniors-seasons.json",
  "function seasonSortValue",
  "function latestSeason",
  ".sort("
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(
      `Forbidden browser authority found: ${marker}`
    );
  }
}

const fetchCount =
  (html.match(/fetch\(/g) || []).length;

if (fetchCount !== 1) {
  fail(
    `Expected one fetch, found ${fetchCount}.`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "ORDER OF MERIT WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "------------------------------------------"
  );

  for (const message of failures) {
    console.error(`[FAIL] ${message}`);
  }

  process.exit(1);
}

console.log("");
console.log(
  "Order of Merit Website Certification"
);
console.log(
  "------------------------------------"
);
console.log(
  `[PASS] Seasons checked: ${seasonsChecked}`
);
console.log(
  `[PASS] Players checked: ${playersChecked}`
);
console.log(
  `[PASS] Point transactions checked: ${transactionsChecked}`
);
console.log(
  "[PASS] Every historical season is available"
);
console.log(
  "[PASS] Current seasons supplied by admin output"
);
console.log(
  "[PASS] Season switching is presentation-only"
);
console.log(
  "[PASS] Certified ranks and point breakdowns preserved"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side season selection or calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
