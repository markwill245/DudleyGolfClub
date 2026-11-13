(function () {
  "use strict";

  const START = "2026-04-01";
  const END = "2026-10-31";

  function validScore(value) {
    return value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 40 &&
      Number(value) <= 130;
  }

  function getName(result) {
    return String(
      result.playerName ||
      result.players?.[0]?.name ||
      ""
    ).trim();
  }

  function qualifyingCompetition(comp, start, end) {
    const name = String(comp.competitionName || "");

    return comp.date >= start &&
      comp.date <= end &&
      comp.section === "Mens" &&
      Number(comp.teamSize) === 1 &&
      /medal|club championship/i.test(name) &&
      !/par\s*\/\s*bogey/i.test(name);
  }

  function calculate(competitions, year = 2026) {
    const start = `${year}-04-01`;
    const end = `${year}-10-31`;
    const rounds = [];

    for (const comp of competitions) {
      if (!qualifyingCompetition(comp, start, end)) continue;

      for (const result of comp.results || []) {
        if (/DQ|NR|NS|DISQ|WITHDRAW/i.test(
          String(result.status || "")
        )) continue;

        const player = getName(result);
        if (!player) continue;

        const base = {
          player,
          date: comp.date,
          competition: comp.competitionName
        };

        if (Array.isArray(result.rounds) &&
            result.rounds.length) {
          for (const round of result.rounds) {
            if (validScore(round.nettScore)) {
              rounds.push({
                ...base,
                type: "nett",
                score: Number(round.nettScore),
                round: round.round
              });
            }

            if (validScore(round.grossScore)) {
              rounds.push({
                ...base,
                type: "gross",
                score: Number(round.grossScore),
                round: round.round
              });
            }
          }
          continue;
        }

        const handicap =
          result.handicap ??
          result.players?.[0]?.handicap;

        const nett =
          result.nettScore ??
          (result.scoreType === "Nett"
            ? result.totalScore
            : null);

        const gross = result.grossScore ??
          (validScore(nett) &&
           handicap !== null &&
           handicap !== undefined &&
           handicap !== "" &&
           Number.isFinite(Number(handicap))
            ? Number(nett) + Number(handicap)
            : null);

        if (validScore(nett)) {
          rounds.push({
            ...base,
            type: "nett",
            score: Number(nett),
            round: 1
          });
        }

        if (validScore(gross)) {
          rounds.push({
            ...base,
            type: "gross",
            score: Number(gross),
            round: 1
          });
        }
      }
    }

    function leaderboard(type) {
      const players = new Map();

      for (const round of rounds) {
        if (round.type !== type) continue;

        if (!players.has(round.player)) {
          players.set(round.player, []);
        }
        players.get(round.player).push(round);
      }

      const standings = [];

      for (const [player, scores] of players) {
        if (scores.length < 6) continue;

        const best = scores
          .sort((a, b) =>
            a.score - b.score ||
            a.date.localeCompare(b.date)
          )
          .slice(0, 6);

        standings.push({
          player,
          total: best.reduce(
            (sum, round) => sum + round.score, 0
          ),
          rounds: best
        });
      }

      standings.sort((a, b) =>
        a.total - b.total ||
        a.player.localeCompare(b.player)
      );

      return standings.map((entry, index) => ({
        ...entry,
        position: standings.findIndex(
          item => item.total === entry.total
        ) + 1
      })).slice(0, 10);
    }

    return {
      nett: leaderboard("nett"),
      gross: leaderboard("gross")
    };
  }

  window.DGCBestSix = {
    calculate,
    start: START,
    end: END
  };
})();
