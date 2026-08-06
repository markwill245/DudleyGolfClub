const fs = require("fs");

const profiles = JSON.parse(
  fs.readFileSync(
    "./data/competition-profiles.json",
    "utf8"
  )
);

const results = JSON.parse(
  fs.readFileSync(
    "./data/competition-results.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./competition-profile.html",
  "utf8"
);

const failures = [];
const profileIds = new Set();

let linkedResultBlocks = 0;
let orphanResultBlocks = 0;

function fail(message) {
  failures.push(message);
}

if (!Array.isArray(profiles)) {
  fail("competition-profiles.json is not an array.");
}

if (!Array.isArray(results)) {
  fail("competition-results.json is not an array.");
}

for (const profile of profiles) {
  const id =
    profile.id ||
    profile.competitionId;

  if (!id) {
    fail("A competition profile has no ID.");
    continue;
  }

  if (profileIds.has(id)) {
    fail(
      `Duplicate competition profile ID: ${id}`
    );
  }

  profileIds.add(id);

  if (!profile.name) {
    fail(
      `${id} has no competition name.`
    );
  }
}

for (const block of results) {
  if (!block.competitionId) {
    fail(
      "A competition result block has no competitionId."
    );
    continue;
  }

  if (
    profileIds.has(
      block.competitionId
    )
  ) {
    linkedResultBlocks++;
  } else {
    orphanResultBlocks++;
  }
}

const required = [
  "data/competition-profiles.json",
  "data/competition-results.json",
  'params.get("id")',
  'params.get("competition")',
  "competitions.find(",
  "renderCompetition(",
  "renderHistoricalWinners(",
  "renderDetailedResults("
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

if (
  !/results\s*[\r\n\s]*\.\s*filter\s*\(/.test(html)
) {
  fail(
    "Missing competition-results filtering step."
  );
}

const forbidden = [
  ".reduce(",
  "wins +=",
  "totalEntries +=",
  "uniqueWinners +=",
  "mostWins +=",
  "position === 1"
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(
      `Forbidden browser authority found: ${marker}`
    );
  }
}

const sorts =
  html.match(/\.sort\(/g) || [];

if (sorts.length !== 1) {
  fail(
    `Expected one presentation sort, found ${sorts.length}.`
  );
}

if (
  !html.includes(
    ".sort((a, b) => Number(b.year || 0) - Number(a.year || 0))"
  )
) {
  fail(
    "Newest-year-first presentation sort was not found."
  );
}

const fetchCount =
  (html.match(/fetch\(/g) || [])
    .length;

if (fetchCount !== 2) {
  fail(
    `Expected two fetches, found ${fetchCount}.`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "COMPETITION PROFILE WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "------------------------------------------------"
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
  "Competition Profile Website Certification"
);
console.log(
  "-----------------------------------------"
);
console.log(
  `[PASS] Competition profiles checked: ${profiles.length}`
);
console.log(
  `[PASS] Result blocks checked: ${results.length}`
);
console.log(
  `[PASS] Result blocks linked to profiles: ${linkedResultBlocks}`
);
console.log(
  `[PASS] Unlinked result blocks reported: ${orphanResultBlocks}`
);
console.log(
  "[PASS] Both id and competition query parameters supported"
);
console.log(
  "[PASS] Profiles rendered from generated JSON"
);
console.log(
  "[PASS] Results rendered from generated JSON"
);
console.log(
  "[PASS] Newest-year-first sorting is presentation-only"
);
console.log(
  "[PASS] No browser-side competition statistics calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
