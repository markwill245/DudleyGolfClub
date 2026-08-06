const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync(
    "./data/museum-collection-certified.json",
    "utf8"
  )
);

const html = fs.readFileSync(
  "./museum-collection.html",
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
    "Museum Collection JSON is not certified."
  );
}

if (!Array.isArray(data.items)) {
  fail(
    "Certified collection items are missing."
  );
}

if (
  Number(data.totalItems) !==
  data.items.length
) {
  fail(
    `Collection total mismatch: ${data.totalItems} versus ${data.items.length}`
  );
}

const ids = new Set();
let recordOnlyItems = 0;
let photographedItems = 0;
let boardPhotoItems = 0;

for (
  const [index, item] of
  data.items.entries()
) {
  const expectedNumber =
    "DGC-MC-" +
    String(index + 1)
      .padStart(4, "0");

  if (!item.id) {
    fail(
      `Collection item ${index + 1} has no ID.`
    );
  }

  if (ids.has(item.id)) {
    fail(
      `Duplicate collection ID: ${item.id}`
    );
  }

  ids.add(item.id);

  if (
    Number(item.displayOrder) !==
    index + 1
  ) {
    fail(
      `${item.id} display-order mismatch.`
    );
  }

  if (
    item.catalogueNumber !==
    expectedNumber
  ) {
    fail(
      `${item.id} catalogue-number mismatch.`
    );
  }

  if (item.recordOnly) {
    recordOnlyItems++;
  }

  if (item.photo) {
    photographedItems++;
  }

  if (item.boardPhoto) {
    boardPhotoItems++;
  }

  if (
    !item.statusLabel ||
    !item.displayDescription ||
    !item.archiveUrl ||
    !item.searchText
  ) {
    fail(
      `${item.id} is missing certified display fields.`
    );
  }
}

if (
  recordOnlyItems !==
  Number(data.recordOnlyItems)
) {
  fail(
    `Record-only count mismatch: ${recordOnlyItems} versus ${data.recordOnlyItems}`
  );
}

if (
  photographedItems !==
  Number(data.photographedItems)
) {
  fail(
    `Photograph count mismatch: ${photographedItems} versus ${data.photographedItems}`
  );
}

if (
  boardPhotoItems !==
  Number(data.boardPhotoItems)
) {
  fail(
    `Board photograph count mismatch: ${boardPhotoItems} versus ${data.boardPhotoItems}`
  );
}

const required = [
  "data/museum-collection-certified.json",
  "collectionData.items",
  "item.catalogueNumber",
  "item.statusLabel",
  "item.displayDescription",
  "item.competitionUrl",
  "item.archiveUrl",
  "item.searchText"
];

for (const marker of required) {
  if (!html.includes(marker)) {
    fail(
      `Missing renderer marker: ${marker}`
    );
  }
}

if (
  !/collectionData\s*[\r\n\s]*\.\s*certificationStatus/.test(html)
) {
  fail(
    "Missing Museum Collection certification-status check."
  );
}

const forbidden = [
  "data/museum-collection.json",
  "function collectionNumber",
  ".findIndex(",
  'item.recordOnly === true',
  'item.status === "Record Only"',
  "Museum catalogue record awaiting further historical notes.",
  "This verified competition record forms part of the Dudley Golf Club heritage archive."
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
    "MUSEUM COLLECTION WEBSITE CERTIFICATION FAILED"
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
  "Museum Collection Website Certification"
);
console.log(
  "---------------------------------------"
);
console.log(
  `[PASS] Collection items checked: ${data.items.length}`
);
console.log(
  `[PASS] Record-only items: ${recordOnlyItems}`
);
console.log(
  `[PASS] Items with photographs: ${photographedItems}`
);
console.log(
  `[PASS] Items with board photographs: ${boardPhotoItems}`
);
console.log(
  "[PASS] No duplicate collection IDs"
);
console.log(
  "[PASS] Certified catalogue numbering preserved"
);
console.log(
  "[PASS] Certified descriptions and statuses preserved"
);
console.log(
  "[PASS] One certified JSON source"
);
console.log(
  "[PASS] Search remains presentation-only"
);
console.log(
  "[PASS] No browser-side collection authority"
);
console.log("");
console.log(
  "Overall status: CERTIFIED"
);
