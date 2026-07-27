const fs = require("fs");

const file = "./museum-captains.html";
let html = fs.readFileSync(file, "utf8");

const oldSearch = `String(item.year || "")
                            .includes(term)`;

const newSearch = `String(item.yearLabel || item.year || "")
                            .toLowerCase()
                            .includes(term) ||
                        (
                            /^\\d{4}$/.test(term) &&
                            Number(term) >= Number(
                                item.startYear ?? item.year
                            ) &&
                            Number(term) <= Number(
                                item.endYear ?? item.year
                            )
                        )`;

if (!html.includes(oldSearch)) {
    throw new Error(
        "Existing year-search code was not found. No changes made."
    );
}

html = html.replace(oldSearch, newSearch);

fs.writeFileSync(file, html, "utf8");

console.log("Leadership range search fixed.");
