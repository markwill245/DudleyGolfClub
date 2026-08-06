const fs = require("fs");

const files = [
  {
    section: "Mens",
    file: "./data/order-of-merit-mens-seasons.json"
  },
  {
    section: "Seniors",
    file: "./data/order-of-merit-seniors-seasons.json"
  }
];

const failures = [];
let playersChecked = 0;
let seasonsChecked = 0;
let transactionsChecked = 0;

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fail(message) {
  failures.push(message);
}

for (const source of files) {
  const data = JSON.parse(
    fs.readFileSync(source.file, "utf8")
  );

  for (const [season, seasonValue] of Object.entries(data)) {
    const leaderboard = Array.isArray(seasonValue)
      ? seasonValue
      : seasonValue?.leaderboard || [];

    seasonsChecked++;

    let previousRank = 0;

    for (const player of leaderboard) {
      playersChecked++;

      const name =
        player.player ||
        player.playerName ||
        player.name ||
        "Unknown Player";

      const rank = number(player.rank);
      const certifiedTotal = number(
        player.points ??
        player.orderOfMeritPoints
      );

      const results = Array.isArray(player.results)
        ? player.results
        : [];

      const transactionTotal = results.reduce(
        (sum, result) => {
          transactionsChecked++;
          return sum + number(result.points);
        },
        0
      );

      if (!rank) {
        fail(
          `${source.section} ${season}: ${name} has no certified rank`
        );
      }

      if (rank < previousRank) {
        fail(
          `${source.section} ${season}: leaderboard rank order is invalid at ${name}`
        );
      }

      previousRank = rank;

      if (transactionTotal !== certifiedTotal) {
        fail(
          `${source.section} ${season}: ${name} total is ${certifiedTotal}, but breakdown adds to ${transactionTotal}`
        );
      }

      if (
        results.length !==
        number(
          player.competitionsPlayed ??
          player.competitions
        )
      ) {
        fail(
          `${source.section} ${season}: ${name} competitions count does not match breakdown rows`
        );
      }
    }
  }
}

const html = fs.readFileSync(
  "./order-of-merit.html",
  "utf8"
);

const forbidden = [
  ".sort((a, b) =>\n          b.points",
  "rank: index + 1",
  "players.reduce",
  "totalWins"
];

for (const value of forbidden) {
  if (html.includes(value)) {
    fail(
      `Forbidden leaderboard recalculation remains: ${value}`
    );
  }
}

if (!html.includes("pointsBreakdown(player)")) {
  fail("Points breakdown renderer is missing");
}

if (!html.includes("toggleBreakdown")) {
  fail("Player breakdown control is missing");
}

if (failures.length) {
  console.error("");
  console.error("ORDER OF MERIT CERTIFICATION FAILED");
  console.error("----------------------------------");

  failures.forEach(message =>
    console.error(`[FAIL] ${message}`)
  );

  process.exit(1);
}

console.log("");
console.log("Order of Merit Website Certification");
console.log("-----------------------------------");
console.log(`[PASS] Seasons checked: ${seasonsChecked}`);
console.log(`[PASS] Players checked: ${playersChecked}`);
console.log(`[PASS] Point transactions checked: ${transactionsChecked}`);
console.log("[PASS] Every player total matches the breakdown");
console.log("[PASS] Competition counts match breakdown rows");
console.log("[PASS] Certified ranks preserved");
console.log("[PASS] Browser re-ranking removed");
console.log("[PASS] Expandable player breakdown present");
console.log("");
console.log("Overall status: CERTIFIED");
