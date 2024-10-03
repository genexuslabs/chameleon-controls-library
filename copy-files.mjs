import fs from "fs";

fs.copyFile(
  "./src/framework-integrations.ts",
  "./dist/collection/framework-integrations.ts",
  err => {
    if (err) throw err;
  }
);
