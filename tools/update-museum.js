console.log("🏛 Dudley Golf Club Museum Update");
console.log("--------------------------------");

require("./parser-v1")();
require("./competition-catalog-builder")();
require("./import-engine")();
require("./museum-validator")();
require("./add-missing-players")();
require("./museum-brain-v3")();

console.log("--------------------------------");
console.log("✅ Museum update complete.");