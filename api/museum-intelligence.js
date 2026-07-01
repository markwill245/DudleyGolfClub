const projectId = "c54r3a5t";
const dataset = "production";
const apiVersion = "2024-03-01";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function validScore(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

function topBy(players, field, limit = 10, lowest = false) {
  return [...players]
    .filter(p => {
      if (lowest) return validScore(p[field]);
      return p[field] !== null && p[field] !== undefined;
    })
    .sort((a, b) =>
      lowest ? num(a[field]) - num(b[field]) : num(b[field]) - num(a[field])
    )
    .slice(0, limit)
    .map((p, i) => ({
      position: i + 1,
      player: p.playerName,
      value: p[field],
      slug: p.playerSlug?.current || ""
    }));
}

export default async function handler(req, res) {
  try {
    const query = encodeURIComponent(`
{
  "players": *[_type == "playerIntelligence"] | order(playerName asc) {
    playerName,
    playerSlug,
    competitionsPlayed,
    wins,
    runnerUp,
    thirdPlace,
    topTen,
    averageGross,
    averageNett,
    lowestGross,
    lowestNett,
    orderOfMeritPoints,
    orderOfMeritPosition,
    museumSummary,
    lastUpdated
  },

  "results": *[_type == "competitionResult"] {
    playerName,
    competitionName,
    competitionDate,
    date,
    gross,
    nett,
    position,
    points
  }
}
`);

    const sanityUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${query}`;

    const response = await fetch(sanityUrl);
    const data = await response.json();

    const players = data.result.players || [];
    const results = data.result.results || [];

    const competitions = [
      ...new Set(
        results
          .map(r => r.competitionName)
          .filter(Boolean)
      )
    ];

    const museumIntelligence = {
      archiveSummary: {
        players: players.length,
        results: results.length,
        competitions: competitions.length,
        totalWins: players.reduce((sum, p) => sum + num(p.wins), 0),
        totalTopTens: players.reduce((sum, p) => sum + num(p.topTen), 0),
        lastUpdated: new Date().toISOString()
      },

      leaderboards: {
        mostCompetitions: topBy(players, "competitionsPlayed"),
        mostWins: topBy(players, "wins"),
        mostRunnerUps: topBy(players, "runnerUp"),
        mostTopTens: topBy(players, "topTen"),
        lowestGross: topBy(players, "lowestGross", 10, true),
        lowestNett: topBy(players, "lowestNett", 10, true),
        orderOfMerit: topBy(players, "orderOfMeritPoints")
      },

      players
    };

    res.status(200).json(museumIntelligence);
  } catch (error) {
    console.error("Museum Intelligence API failed:", error);

    res.status(500).json({
      error: "Museum Intelligence API failed"
    });
  }
}