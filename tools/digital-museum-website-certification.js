const fs = require("fs");

const summary = JSON.parse(
  fs.readFileSync(
    "./data/digital-museum-summary.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./digital-museum.html",
  "utf8"
);

const failures = [];

function fail(message) {
  failures.push(message);
}

if (summary.certificationStatus !== "CERTIFIED") {
  fail("Summary is not certified.");
}

if (summary.playersRecorded !== 758) {
  fail(
    `Unexpected player total: ${summary.playersRecorded}`
  );
}

if (summary.competitions !== 155) {
  fail(
    `Unexpected competition total: ${summary.competitions}`
  );
}

if (summary.recordedResultRows !== 10584) {
  fail(
    `Unexpected recorded-result total: ${summary.recordedResultRows}`
  );
}

if (
  summary.lifetimeLeader?.player !== "M. Hickman" ||
  Number(summary.lifetimeLeader?.wins) !== 28
) {
  fail("Certified lifetime leader does not match.");
}

const required = [
  'fetch(',
  'data/digital-museum-summary.json',
  'summary.playersRecorded',
  'summary.competitions',
  'summary.recordedResultRows',
  'summary.lifetimeLeader'
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(`Missing renderer marker: ${marker}`);
  }
}

const forbidden = [
  "player-page-data.json",
  "competition-profiles.json",
  "players.reduce(",
  "[...players].sort(",
  "headlineStats?.wins"
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(`Forbidden browser calculation/source: ${marker}`);
  }
}

const fetchCount =
  (html.match(/fetch\(/g) || []).length;

if (fetchCount !== 1) {
  fail(
    `Expected one fetch, found ${fetchCount}`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "DIGITAL MUSEUM WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "-----------------------------------------"
  );

  for (const message of failures) {
    console.error(`[FAIL] ${message}`);
  }

  process.exit(1);
}

console.log("");
console.log(
  "Digital Museum Website Certification"
);
console.log(
  "------------------------------------"
);
console.log(
  `[PASS] Players recorded: ${summary.playersRecorded}`
);
console.log(
  `[PASS] Competitions: ${summary.competitions}`
);
console.log(
  `[PASS] Recorded result rows: ${summary.recordedResultRows}`
);
console.log(
  `[PASS] Lifetime leader: ${summary.lifetimeLeader.player} — ${summary.lifetimeLeader.wins}`
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side totals or ranking"
);
console.log("");
console.log("Overall status: CERTIFIED");
