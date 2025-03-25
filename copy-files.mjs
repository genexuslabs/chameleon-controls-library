import fs from "fs";

fs.copyFile(
  "./src/framework-integrations.ts",
  "./dist/collection/framework-integrations.ts",
  err => {
    if (err) {
      throw err;
    }
  }
);

fs.copyFile("./src/copy-react.js", "./dist/react/copy-react.js", err => {
  if (err) {
    throw err;
  }
});
