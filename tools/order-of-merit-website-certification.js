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
let playersChecked = 0;
let transactionsChecked = 0;

function fail(message) {
  failures.push(message);
}

if (data.certificationStatus !== "CERTIFIED") {
  fail("Order of Merit JSON is not certified.");
}

for (const sectionName of ["mens", "seniors"]) {
  const section = data[sectionName];

  if (!section || !Array.isArray(section.leaderboard)) {
    fail(`${sectionName} leaderboard is missing.`);
    continue;
  }

  if (
    Number(section.playersRanked) !==
    section.leaderboard.length
  ) {
    fail(`${sectionName} player count mismatch.`);
  }

  const firstPlayer =
    section.leaderboard[0]?.player ||
    section.leaderboard[0]?.playerName ||
    section.leaderboard[0]?.name;

  if (section.leader?.player !== firstPlayer) {
    fail(`${sectionName} leader mismatch.`);
  }

  for (const [index, player] of section.leaderboard.entries()) {
    playersChecked++;

    const playerName =
      player.player ||
      player.playerName ||
      player.name ||
      "Unknown";

    if (Number(player.rank) !== index + 1) {
      fail(`${sectionName}: invalid rank for ${playerName}.`);
    }

    const results =
      Array.isArray(player.results)
        ? player.results
        : [];

    transactionsChecked += results.length;

    const breakdown = results.reduce(
      (total, result) =>
        total + Number(result.points || 0),
      0
    );

    if (Number(player.points || 0) !== breakdown) {
      fail(`${sectionName}: ${playerName} point total mismatch.`);
    }

    const competitions =
      Number(
        player.competitionsPlayed ??
        player.competitions ??
        0
      );

    if (competitions !== results.length) {
      fail(`${sectionName}: ${playerName} competition-count mismatch.`);
    }
  }
}

const required = [
  "data/order-of-merit-certified.json",
  "certifiedData.mens",
  "certifiedData.seniors",
  "season.leaderboard",
  "player.results",
  "toggleBreakdown",
  "Certified Points Breakdown"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(`Missing renderer marker: ${marker}`);
  }
}

if (
  !/certifiedData\s*[\r\n\s]*\.\s*certificationStatus/.test(html)
) {
  fail("Missing Order of Merit certification-status check.");
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
    fail(`Forbidden browser authority found: ${marker}`);
  }
}

const fetchCount =
  (html.match(/fetch\(/g) || []).length;

if (fetchCount !== 1) {
  fail(`Expected one fetch, found ${fetchCount}.`);
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
  `[PASS] Mens season: ${data.mens.season}`
);
console.log(
  `[PASS] Seniors season: ${data.seniors.season}`
);
console.log(
  `[PASS] Players checked: ${playersChecked}`
);
console.log(
  `[PASS] Point transactions checked: ${transactionsChecked}`
);
console.log(
  "[PASS] Every player total matches the breakdown"
);
console.log(
  "[PASS] Competition counts match breakdown rows"
);
console.log(
  "[PASS] Certified ranks preserved"
);
console.log(
  "[PASS] Current seasons selected by admin output"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side season or ranking authority"
);
console.log(
  "[PASS] Expandable player breakdown present"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
