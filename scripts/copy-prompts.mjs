import fs from "fs";

fs.cpSync("src/prompts", "build/prompts", { recursive: true });
console.log("Copied src/prompts → build/prompts");

fs.cpSync("src/templates", "build/templates", { recursive: true });
console.log("Copied src/templates → build/templates");
