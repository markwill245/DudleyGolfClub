const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/records-centre.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./records-centre.html",
  "utf8"
);

const failures = [];
let winRowsChecked = 0;
let evidenceRowsChecked = 0;

function fail(message) {
  failures.push(message);
}

for (const section of ["mens", "seniors"]) {
  for (const group of ["career", "championships"]) {
    for (const [key, record] of Object.entries(
      data?.[section]?.[group] || {}
    )) {
      if (!/wins/i.test(record?.label || "")) {
        continue;
      }

      for (const row of record?.leaders || []) {
        winRowsChecked++;

        const wins = Array.isArray(row?.wins)
          ? row.wins
          : [];

        evidenceRowsChecked += wins.length;

        if (Number(row.value) !== wins.length) {
          fail(
            `${section}.${group}.${key}: ${row.player} displays ${row.value}, evidence has ${wins.length}`
          );
        }
      }
    }
  }
}

const required = [
  "createWinBreakdown",
  "toggleWinBreakdown",
  "Certified Win Breakdown",
  "item?.wins",
  'fetch("data/records-centre.json"'
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(`Missing renderer marker: ${marker}`);
  }
}

const forbidden = [
  "competition-results.json",
  "player-profiles.json",
  "player-page-data.json",
  "players.reduce(",
  ".sort((a, b) => b.value",
  "divisionWinners"
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(`Forbidden browser calculation/source found: ${marker}`);
  }
}

const fetchCount =
  (html.match(/fetch\(/g) || []).length;

if (fetchCount !== 1) {
  fail(
    `Expected exactly one fetch, found ${fetchCount}`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "RECORDS CENTRE WEBSITE CERTIFICATION FAILED"
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
  "Records Centre Website Certification"
);
console.log(
  "------------------------------------"
);
console.log(
  `[PASS] Win rows checked: ${winRowsChecked}`
);
console.log(
  `[PASS] Evidence rows checked: ${evidenceRowsChecked}`
);
console.log(
  "[PASS] Every displayed win total matches wins[]"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] Expandable win breakdown present"
);
console.log(
  "[PASS] No raw browser-side win calculation"
);
console.log("");
console.log("Overall status: CERTIFIED");
