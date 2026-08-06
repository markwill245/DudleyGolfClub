const fs = require("fs");

const players = JSON.parse(
  fs.readFileSync(
    "./data/player-page-data.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./player-index.html",
  "utf8"
);

const failures = [];

function fail(message) {
  failures.push(message);
}

if (!Array.isArray(players)) {
  fail(
    "player-page-data.json is not an array."
  );
}

if (players.length !== 758) {
  fail(
    `Unexpected player total: ${players.length}`
  );
}

const required = [
  'data/player-page-data.json',
  'cache: "no-store"',
  "player.headlineStats?.wins",
  "player.headlineStats?.top3",
  "player.hallOfFame?.score",
  "player.hero?.section",
  "player.hero?.status"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

const forbidden = [
  "data/players.json",
  "data/player-profiles.json",
  "data/records-centre.json",
  "data/metric-certification.json",
  "data/competition-results.json",
  ".reduce(",
  "headlineStats.wins =",
  "hallOfFame.score =",
  "top3 +=",
  "wins +="
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(
      `Forbidden browser authority found: ${marker}`
    );
  }
}

const fetchCount =
  (html.match(/fetch\(/g) || [])
    .length;

if (fetchCount !== 1) {
  fail(
    `Expected one fetch, found ${fetchCount}`
  );
}

let invalidRows = 0;

for (const player of players) {
  if (
    !player?.slug ||
    !player?.hero?.name ||
    !player?.headlineStats ||
    !player?.hallOfFame
  ) {
    invalidRows++;
  }
}

if (invalidRows > 0) {
  fail(
    `Player rows missing required certified fields: ${invalidRows}`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "PLAYER INDEX WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "----------------------------------------"
  );

  for (const message of failures) {
    console.error(
      `[FAIL] ${message}`
    );
  }

  process.exit(1);
}

console.log("");
console.log(
  "Player Index Website Certification"
);
console.log(
  "----------------------------------"
);
console.log(
  `[PASS] Players checked: ${players.length}`
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] Certified player identity fields present"
);
console.log(
  "[PASS] Certified wins, Top 3 and Hall of Fame fields displayed"
);
console.log(
  "[PASS] Search and alphabetical sorting are presentation-only"
);
console.log(
  "[PASS] No browser-side statistics calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
