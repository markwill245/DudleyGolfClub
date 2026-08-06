const fs = require("fs");

const players = JSON.parse(
  fs.readFileSync(
    "./data/player-page-data.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./player-profile.html",
  "utf8"
);

const failures = [];

function fail(message) {
  failures.push(message);
}

if (!Array.isArray(players)) {
  fail("player-page-data.json is not an array.");
}

const slugs = new Set();

for (const player of players) {
  if (!player.slug) {
    fail("A player profile has no slug.");
    continue;
  }

  if (slugs.has(player.slug)) {
    fail(`Duplicate player slug: ${player.slug}`);
  }

  slugs.add(player.slug);

  if (
    !player.hero?.name ||
    !player.headlineStats ||
    !Array.isArray(player.timeline)
  ) {
    fail(
      `${player.slug} is missing required certified profile fields.`
    );
  }

  if (
    Number(player.headlineStats.wins || 0) < 0 ||
    Number(player.headlineStats.top3 || 0) < 0 ||
    Number(player.headlineStats.competitionsPlayed || 0) < 0
  ) {
    fail(`${player.slug} contains an invalid headline statistic.`);
  }
}

const required = [
  "data/player-page-data.json",
  'params.get("player")',
  "players.find(",
  "player.headlineStats.competitionsPlayed",
  "player.headlineStats.wins",
  "player.headlineStats.runnerUp",
  "player.headlineStats.top3",
  "player.divisionHonours",
  "player.timeline"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(`Missing renderer marker: ${marker}`);
  }
}

const forbidden = [
  ".reduce(",
  ".sort(",
  "wins +=",
  "runnerUp +=",
  "top3 +=",
  "competitionsPlayed +=",
  "position <= 3"
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
    "PLAYER PROFILE WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "-------------------------------------------"
  );

  for (const message of failures) {
    console.error(`[FAIL] ${message}`);
  }

  process.exit(1);
}

console.log("");
console.log(
  "Player Profile Website Certification"
);
console.log(
  "------------------------------------"
);
console.log(
  `[PASS] Player profiles checked: ${players.length}`
);
console.log(
  `[PASS] Unique player slugs: ${slugs.size}`
);
console.log(
  "[PASS] Headline statistics rendered from generated JSON"
);
console.log(
  "[PASS] Division honours rendered from generated JSON"
);
console.log(
  "[PASS] Career timeline rendered from generated JSON"
);
console.log(
  "[PASS] One player-data source"
);
console.log(
  "[PASS] No browser-side statistics calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
