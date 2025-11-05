import { copyFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const KaTeXFontsDir = "node_modules/katex/dist/fonts";

export function copyKaTeXWoff2Files(destinationDir: string) {
  try {
    if (!existsSync(destinationDir)) {
      mkdirSync(destinationDir, { recursive: true });
    }

    const files = readdirSync(KaTeXFontsDir);

    for (const file of files) {
      if (file.endsWith(".woff2")) {
        const src = join(KaTeXFontsDir, file);
        const dest = join(destinationDir, file);
        copyFileSync(src, dest);
      }
    }

    console.log("🎉 KaTeX woff2 fonts copied successfully!");
  } catch (error) {
    console.error("Error copying KaTeX woff2 fonts:", error);
  }
}

copyKaTeXWoff2Files("www/assets/fonts");
