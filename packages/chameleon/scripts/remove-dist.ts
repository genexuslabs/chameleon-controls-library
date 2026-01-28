import fs from "fs/promises";
import path from "path";

try {
  await fs.rm(path.resolve(__dirname, "dist"), { recursive: true });
} catch {
  //
}
