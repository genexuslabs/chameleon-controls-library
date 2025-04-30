import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";

await copyFile(
  "./src/framework-integrations.ts",
  "./dist/collection/framework-integrations.ts"
).catch(err => {
  if (err) {
    throw err;
  }
});

if (!existsSync("./dist/react/")) {
  await mkdir("./dist/react/");
}

await copyFile("./src/copy-react.js", "./dist/react/copy-react.js").catch(
  err => {
    if (err) {
      throw err;
    }
  }
);
