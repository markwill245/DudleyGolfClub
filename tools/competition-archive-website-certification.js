const fs = require("fs");

const archive = JSON.parse(
  fs.readFileSync(
    "./data/competition-archive.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./competition-index.html",
  "utf8"
);

const failures = [];
let categoryMemberships = 0;

function fail(message) {
  failures.push(message);
}

if (
  archive.certificationStatus !==
  "CERTIFIED"
) {
  fail("Archive JSON is not certified.");
}

if (
  Number(
    archive.totalUniqueCompetitions
  ) !== 151
) {
  fail(
    `Unexpected unique competition total: ${archive.totalUniqueCompetitions}`
  );
}

const categorisedIds = new Set();

for (const category of archive.categories || []) {
  const competitions =
    Array.isArray(category.competitions)
      ? category.competitions
      : [];

  categoryMemberships +=
    competitions.length;

  if (
    Number(category.competitionCount) !==
    competitions.length
  ) {
    fail(
      `${category.title} count mismatch.`
    );
  }

  const localIds = new Set();

  for (const competition of competitions) {
    if (!competition.id) {
      fail(
        `${category.title} contains a competition without an ID.`
      );

      continue;
    }

    if (localIds.has(competition.id)) {
      fail(
        `${category.title} contains duplicate ${competition.id}.`
      );
    }

    localIds.add(
      competition.id
    );

    categorisedIds.add(
      competition.id
    );
  }

  for (
    let index = 1;
    index < competitions.length;
    index++
  ) {
    const previous =
      competitions[index - 1].name || "";

    const current =
      competitions[index].name || "";

    if (
      previous.localeCompare(
        current,
        "en-GB",
        {
          sensitivity: "base"
        }
      ) > 0
    ) {
      fail(
        `${category.title} is not alphabetically ordered.`
      );
    }
  }
}

if (
  categorisedIds.size !==
  Number(
    archive.totalUniqueCompetitions
  )
) {
  fail(
    `Category coverage mismatch: ${categorisedIds.size} of ${archive.totalUniqueCompetitions}`
  );
}

if (
  categoryMemberships !==
  Number(
    archive.totalCategoryMemberships
  )
) {
  fail(
    `Category membership mismatch: ${categoryMemberships} versus ${archive.totalCategoryMemberships}`
  );
}

const required = [
  "data/competition-archive.json",
  "archiveData.categories",
  "competition.searchText",
  "competition.profileUrl",
  "category.competitionCount",
  "archiveData.certificationStatus"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

const forbidden = [
  "competition-profiles.json",
  "categoryDefinitions",
  "removeDuplicates",
  "sortCompetitions",
  "displayInArchive",
  "catalogueStatus",
  'recordType !== "Competition Family"',
  ".filter(category.matches)"
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
    "COMPETITION ARCHIVE WEBSITE CERTIFICATION FAILED"
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
  "Competition Archive Website Certification"
);
console.log(
  "-----------------------------------------"
);
console.log(
  `[PASS] Unique competitions: ${archive.totalUniqueCompetitions}`
);
console.log(
  `[PASS] Categories displayed: ${archive.categories.length}`
);
console.log(
  `[PASS] Category memberships: ${categoryMemberships}`
);
console.log(
  `[PASS] Category coverage: ${categorisedIds.size}/${archive.totalUniqueCompetitions}`
);
console.log(
  "[PASS] No duplicates within categories"
);
console.log(
  "[PASS] Certified alphabetical ordering preserved"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] No browser-side category authority"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
