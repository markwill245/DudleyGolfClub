const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/hall-of-fame-certified.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./hall-of-fame.html",
  "utf8"
);

const failures = [];
let playersChecked = 0;
let evidenceChecked = 0;

function fail(message) {
  failures.push(message);
}

if (
  data.certificationStatus !==
  "CERTIFIED"
) {
  fail(
    "Hall of Fame JSON is not certified."
  );
}

for (const key of ["mens", "seniors"]) {
  const section = data[key];

  if (!section) {
    fail(
      `Missing section: ${key}`
    );
    continue;
  }

  if (
    !Array.isArray(
      section.leaderboard
    )
  ) {
    fail(
      `${key} leaderboard is missing.`
    );
    continue;
  }

  if (
    section.playersAssessed !==
    section.leaderboard.length
  ) {
    fail(
      `${key} player count mismatch.`
    );
  }

  if (
    section.leader?.name !==
    section.leaderboard[0]?.name
  ) {
    fail(
      `${key} leader mismatch.`
    );
  }

  if (
    Number(section.topScore) !==
    Number(
      section.leaderboard[0]?.score || 0
    )
  ) {
    fail(
      `${key} top score mismatch.`
    );
  }

  for (
    const [index, player] of
    section.leaderboard.entries()
  ) {
    playersChecked++;

    if (
      player.rank !==
      index + 1
    ) {
      fail(
        `${key}: ${player.name} rank mismatch.`
      );
    }

    const evidence =
      Array.isArray(
        player.winEvidence
      )
        ? player.winEvidence
        : [];

    evidenceChecked +=
      evidence.length;

    if (
      Number(player.wins) !==
      evidence.length
    ) {
      fail(
        `${key}: ${player.name} win evidence mismatch.`
      );
    }
  }
}

const required = [
  "data/hall-of-fame-certified.json",
  "data-hof-section",
  "section.leaderboard",
  "player.rank",
  "player.majorWins",
  "player.wins"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

if (
  !/data-hof-section\s*=\s*["']mens["']/.test(html)
) {
  fail(
    "Missing Mens Hall of Fame control."
  );
}

if (
  !/data-hof-section\s*=\s*["']seniors["']/.test(html)
) {
  fail(
    "Missing Seniors Hall of Fame control."
  );
}

if (
  !/hallOfFameData\s*[\r\n\s]*\.\s*certificationStatus/.test(html)
) {
  fail(
    "Missing Hall of Fame certification-status check."
  );
}

const forbidden = [
  "data/player-page-data.json",
  "allPlayers.sort(",
  "players[0]",
  "updateStats(allPlayers)",
  "player.hallOfFame?.score",
  "player.achievements.majorWins",
  "player.headlineStats.wins"
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

if (failures.length) {
  console.error("");
  console.error(
    "HALL OF FAME WEBSITE CERTIFICATION FAILED"
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
  "Hall of Fame Website Certification"
);
console.log(
  "---------------------------------"
);
console.log(
  `[PASS] Mens players assessed: ${data.mens.playersAssessed}`
);
console.log(
  `[PASS] Seniors players assessed: ${data.seniors.playersAssessed}`
);
console.log(
  `[PASS] Players checked: ${playersChecked}`
);
console.log(
  `[PASS] Win evidence rows checked: ${evidenceChecked}`
);
console.log(
  "[PASS] Mens and Seniors rankings separated"
);
console.log(
  "[PASS] Certified ranks preserved"
);
console.log(
  "[PASS] Every win total matches evidence"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side Hall of Fame calculation"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
