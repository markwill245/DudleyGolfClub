const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/captains-certified.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./captains.html",
  "utf8"
);

const failures = [];

function fail(message) {
  failures.push(message);
}

if (
  data.certificationStatus !==
  "CERTIFIED"
) {
  fail(
    "Captains JSON is not certified."
  );
}

if (
  Number(data.season) !== 2026
) {
  fail(
    `Unexpected current season: ${data.season}`
  );
}

const captains = [
  data.current?.clubCaptain,
  data.current?.seniorsCaptain
];

for (const captain of captains) {
  if (
    !captain?.name ||
    !captain?.role ||
    !captain?.seasonLabel ||
    !captain?.portrait ||
    !captain?.description
  ) {
    fail(
      "A current captain record is incomplete."
    );
  }
}

if (
  data.current
    ?.clubCaptain?.name !==
  "Keith Woodall"
) {
  fail(
    "Certified Club Captain is not Keith Woodall."
  );
}

if (
  data.current
    ?.seniorsCaptain?.name !==
  "Keith Woodall"
) {
  fail(
    "Certified Seniors Captain is not Keith Woodall."
  );
}

const required = [
  "data/captains-certified.json",
  "data.current.clubCaptain",
  "data.current.seniorsCaptain",
  "captain.name",
  "captain.role",
  "captain.seasonLabel",
  "captain.portrait",
  "captain.description"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

if (
  !/data\s*[\r\n\s]*\.\s*certificationStatus/.test(html)
) {
  fail(
    "Missing Captains certification-status check."
  );
}

const forbidden = [
  "Kieth Woodall",
  ">Keith Woodall<",
  'src="cap/capt1.webp"',
  'src="cap/capt2.webp"',
  ">2026 Season<"
];

for (const marker of forbidden) {
  if (html.includes(marker)) {
    fail(
      `Hard-coded captain authority found: ${marker}`
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
    "CAPTAINS WEBSITE CERTIFICATION FAILED"
  );
  console.error(
    "-------------------------------------"
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
  "Captains Website Certification"
);
console.log(
  "------------------------------"
);
console.log(
  `[PASS] Season: ${data.season}`
);
console.log(
  `[PASS] Club Captain: ${data.current.clubCaptain.name}`
);
console.log(
  `[PASS] Seniors Captain: ${data.current.seniorsCaptain.name}`
);
console.log(
  "[PASS] Portraits supplied by certified JSON"
);
console.log(
  "[PASS] Descriptions supplied by certified JSON"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No hard-coded captain authority"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
