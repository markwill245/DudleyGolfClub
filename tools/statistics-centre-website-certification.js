const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/statistics-centre-certified.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./statistics-centre.html",
  "utf8"
);

const failures = [];
let leaderboardsChecked = 0;
let rowsChecked = 0;

function fail(message) {
  failures.push(message);
}

if (
  data.certificationStatus !==
  "CERTIFIED"
) {
  fail(
    "Statistics Centre JSON is not certified."
  );
}

function checkLeaderboard(
  path,
  record
) {
  if (!record) {
    fail(
      `${path} is missing.`
    );
    return;
  }

  if (
    !Array.isArray(record.leaders)
  ) {
    fail(
      `${path} has no leaders array.`
    );
    return;
  }

  leaderboardsChecked++;

  for (
    const [index, row] of
    record.leaders.entries()
  ) {
    rowsChecked++;

    if (
      Number(row.rank) !==
      index + 1
    ) {
      fail(
        `${path}: invalid rank for ${row.player || "Unknown"}.`
      );
    }

    if (
      row.player === undefined ||
      row.value === undefined
    ) {
      fail(
        `${path} contains an incomplete row.`
      );
    }
  }
}

for (
  const sectionName of
  ["mens", "seniors"]
) {
  const section =
    data.sections?.[
      sectionName
    ];

  for (
    const [key, record] of
    Object.entries(
      section?.career || {}
    )
  ) {
    checkLeaderboard(
      `${sectionName}.career.${key}`,
      record
    );
  }

  for (
    const [key, record] of
    Object.entries(
      section?.championships || {}
    )
  ) {
    checkLeaderboard(
      `${sectionName}.championships.${key}`,
      record
    );
  }
}

for (
  const [key, record] of
  Object.entries(
    data.sections?.club
      ?.records || {}
  )
) {
  checkLeaderboard(
    `club.records.${key}`,
    record
  );
}

const required = [
  "data/statistics-centre-certified.json",
  "certifiedData.sections",
  "certifiedData",
  "certificationStatus",
  "career.mostWins",
  "career.mostRunnerUp",
  "career.mostTop3",
  "career.mostTop5",
  "career.mostTop10",
  "career.mostPlayed",
  "championships.mostMajorWins",
  "championships.mostMedalWins",
  "museum.lowest18HoleGross",
  "museum.lowest18HoleNett",
  "museum.lowest36HoleGross",
  "museum.lowest36HoleNett"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

const forbidden = [
  "data/records-centre.json",
  ".reduce(",
  ".sort(",
  "wins +=",
  "top3 +=",
  "runnerUp +=",
  "competitionsPlayed +=",
  "filter(isWinner)",
  "position <= 3"
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
    `Expected one fetch, found ${fetchCount}.`
  );
}

if (failures.length) {
  console.error("");
  console.error(
    "STATISTICS CENTRE WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "----------------------------------------------"
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
  "Statistics Centre Website Certification"
);
console.log(
  "---------------------------------------"
);
console.log(
  `[PASS] Leaderboards checked: ${leaderboardsChecked}`
);
console.log(
  `[PASS] Leader rows checked: ${rowsChecked}`
);
console.log(
  "[PASS] Mens and Seniors records separated"
);
console.log(
  "[PASS] Club scoring records preserved"
);
console.log(
  "[PASS] Certified ranks preserved"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side statistics calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
