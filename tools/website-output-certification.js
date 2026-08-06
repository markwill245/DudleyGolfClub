const fs = require("fs");

const html = fs.readFileSync(
  "./statistics-centre.html",
  "utf8"
);

const records = JSON.parse(
  fs.readFileSync(
    "./data/records-centre.json",
    "utf8"
  )
);

const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

const forbidden = [
  "competition-results.json",
  "player-profiles.json",
  "player-page-data.json",
  "competition-catalog.json",
  "buildModernSectionRecords",
  "getResultScore",
  "nett-plus-handicap",
  "buildProfileTotals",
  "mergeSectionRecords",
  "topBy("
];

for (const value of forbidden) {
  assert(
    !html.includes(value),
    `Forbidden browser calculation remains: ${value}`
  );
}

const fetches = [
  ...html.matchAll(/fetch\s*\(\s*["']([^"']+)["']/g)
].map(match => match[1]);

assert(
  fetches.length === 1,
  `Expected exactly one data fetch; found ${fetches.length}`
);

assert(
  fetches[0] === "data/records-centre.json",
  `Unexpected fetch target: ${fetches[0] || "none"}`
);

assert(
  records?.mens?.career?.mostWins?.leaders?.length > 0,
  "Mens Most Wins is missing"
);

assert(
  records?.seniors?.career?.mostWins?.leaders?.length > 0,
  "Seniors Most Wins is missing"
);

assert(
  records?.mens?.career?.mostPlayed?.leaders?.length > 0,
  "Mens appearances leaderboard is missing"
);

assert(
  records?.seniors?.career?.mostPlayed?.leaders?.length > 0,
  "Seniors appearances leaderboard is missing"
);

const gross18 =
  records?.museum?.lowest18HoleGross;

const nett18 =
  records?.museum?.lowest18HoleNett;

const gross36 =
  records?.museum?.lowest36HoleGross;

const nett36 =
  records?.museum?.lowest36HoleNett;

assert(
  gross18?.holder?.player === "Mark Dando" &&
  gross18?.holder?.value === 68,
  "Incorrect 18-hole gross holder"
);

assert(
  gross18?.leaders?.some(item =>
    item.player === "Lee Roger Grainger" &&
    item.value === 69 &&
    item.verificationBasis ===
      "explicit-recorded-gross"
  ),
  "Lee Roger Grainger's certified 69 is missing"
);

assert(
  nett18?.holder?.player ===
    "Mark Andrew Poulding" &&
  nett18?.holder?.value === 60,
  "Incorrect 18-hole nett holder"
);

assert(
  gross36?.holder?.value === 149 &&
  gross36?.holders?.some(item =>
    item.player === "Lee Roger Grainger"
  ) &&
  gross36?.holders?.some(item =>
    item.player === "Stuart Baker"
  ),
  "Incorrect joint 36-hole gross record"
);

assert(
  nett36?.holder?.player === "James Stevens" &&
  nett36?.holder?.value === 135,
  "Incorrect 36-hole nett holder"
);

if (failures.length) {
  console.error("");
  console.error("WEBSITE OUTPUT CERTIFICATION FAILED");
  console.error("-----------------------------------");

  failures.forEach(failure =>
    console.error(`[FAIL] ${failure}`)
  );

  process.exit(1);
}

console.log("");
console.log("Website Output Certification");
console.log("----------------------------");
console.log("[PASS] Display-only renderer");
console.log("[PASS] One certified JSON source");
console.log("[PASS] Mens and Seniors outputs present");
console.log("[PASS] Appearances outputs present");
console.log("[PASS] Mark Dando gross 68");
console.log("[PASS] Lee Roger Grainger gross 69");
console.log("[PASS] Mark Andrew Poulding nett 60");
console.log("[PASS] Joint 36-hole gross 149");
console.log("[PASS] James Stevens 36-hole nett 135");
console.log("");
console.log("Overall status: CERTIFIED");
