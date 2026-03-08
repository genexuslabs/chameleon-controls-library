#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Extracts the @remarks content from JSDoc comments
 * @param {string} fileContent - The content of a .tsx file
 * @returns {string|null} The remarks content without the @remarks marker
 */
function extractRemarksFromJSDoc(fileContent) {
  // Match the JSDoc comment block with @remarks
  const jsdocRegex = /\/\*\*\s*([\s\S]*?)\*\//;
  const match = fileContent.match(jsdocRegex);

  if (!match) return null;

  const jsdocContent = match[1];

  // Find the @remarks section - look for lines starting with * @remarks
  const remarksStartIdx = jsdocContent.indexOf("@remarks");
  if (remarksStartIdx === -1) return null;

  // Find the end of @remarks section - next line starting with * @ (except for @remarks itself)
  // We need to handle @ symbols in URLs and code blocks gracefully
  let remarksEndIdx = jsdocContent.length;

  // Look for the next @tag (like @status, @part, @slot, @deprecated, etc.)
  // These appear at the start of a line with * @ pattern
  const afterRemarks = jsdocContent.substring(remarksStartIdx);
  const nextTagMatch = afterRemarks.match(/\n\s*\*\s*@(?!remarks\s)/);

  if (nextTagMatch) {
    remarksEndIdx = remarksStartIdx + nextTagMatch.index;
  }

  let remarksContent = jsdocContent.substring(remarksStartIdx, remarksEndIdx);

  // Remove the @remarks marker itself
  remarksContent = remarksContent.replace(/^@remarks\s*\n/, "");

  // Clean up the markdown comment formatting (* at the start of each line)
  remarksContent = remarksContent
    .split("\n")
    .map((line) => {
      // Remove leading * and spaces
      return line.replace(/^\s*\*\s?/, "");
    })
    .join("\n")
    .trim();

  return remarksContent;
}

/**
 * Processes a component .tsx file and returns the component name and remarks
 * @param {string} filePath - Path to the .tsx file
 * @returns {{componentName: string, remarks: string|null}}
 */
function processComponentFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");

  // Extract component name from filename
  const filename = path.basename(filePath, ".tsx");
  // Convert kebab-case to PascalCase for tag naming
  const componentName = filename
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const remarks = extractRemarksFromJSDoc(fileContent);

  return { componentName, remarks, filename };
}

/**
 * Injects the remarks into the README.md file
 * @param {string} readmeFilePath - Path to the readme.md file
 * @param {string} remarks - The remarks content to inject
 */
function injectRemarksIntoReadme(readmeFilePath, remarks) {
  if (!fs.existsSync(readmeFilePath)) return;

  let content = fs.readFileSync(readmeFilePath, "utf8");

  // Find the insertion point (after Overview section, or after title if no Overview)
  const overviewMatch = content.match(
    /## Overview\n([\s\S]*?)\n+(?=\n## |\n<!-- Auto Generated Below -->)/
  );

  let overviewEndPos;

  if (overviewMatch) {
    // If Overview section exists, insert after it
    overviewEndPos = content.indexOf(overviewMatch[0]) + overviewMatch[0].length - 1;
  } else {
    // If no Overview section, find the auto-generated marker and insert before it
    const autoGenMarker = content.match(/\n<!-- Auto Generated Below -->/);
    if (!autoGenMarker) {
      console.warn(
        `Could not find insertion point in ${readmeFilePath}, skipping`
      );
      return;
    }
    overviewEndPos = content.indexOf(autoGenMarker[0]);
  }

  // Check if remarks were already injected by looking for the ## Features pattern
  // If found, replace the existing remarks section instead of adding a new one
  const existingRemarksMatch = content.match(
    /\n## Features[\s\S]*?(?=\n## Properties|\n## Shadow Parts|\n## Methods|\n---)/
  );

  // Ensure remarks end with a trailing newline for proper spacing before the next section
  const remarksSection = `\n\n${remarks}\n`;

  if (existingRemarksMatch) {
    // Replace the existing remarks section
    content = content.replace(existingRemarksMatch[0], remarksSection);
  } else {
    // Insert new remarks section after Overview
    const beforeRemarks = content.slice(0, overviewEndPos);
    const afterRemarks = content.slice(overviewEndPos);

    // Remove trailing newlines from before and leading newlines from after
    const cleanedBefore = beforeRemarks.replace(/\n+$/, "");
    const cleanedAfter = afterRemarks.replace(/^\n+/, "");

    content = cleanedBefore + "\n\n" + remarks + "\n\n" + cleanedAfter;
  }

  // Clean up any excessive blank lines (more than 2 consecutive newlines)
  // This handles cases where Stencil generates extra whitespace
  content = content.replace(/\n\n\n\n+/g, "\n\n");

  fs.writeFileSync(readmeFilePath, content, "utf8");
}

// ─── Styling extraction ──────────────────────────────────────────────

/**
 * Extracts a markdown section (## heading + content) from content.
 * Returns { text, startIndex, endIndex } or null if not found.
 */
function extractSection(content, sectionHeading) {
  // Match the section heading and everything until the next ## heading or end of file
  const escapedHeading = sectionHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(\\n## ${escapedHeading}\\n[\\s\\S]*?)(?=\\n## |\\n------|$)`
  );
  const match = content.match(regex);
  if (!match) return null;

  return {
    text: match[1],
    startIndex: match.index,
    endIndex: match.index + match[0].length
  };
}

/**
 * Generates a GitHub-style anchor link from a heading text
 */
function toAnchorLink(headingText) {
  return headingText
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // strip special chars except hyphens
    .replace(/\s+/g, "-")     // spaces to hyphens
    .replace(/-+/g, "-")      // collapse multiple hyphens
    .replace(/^-|-$/g, "");   // trim leading/trailing hyphens
}

/**
 * Generates a table of contents from markdown headings (h2 and h3)
 * @param {string} content - Markdown content
 * @param {string} skipTitle - The h1 title to skip
 * @returns {string} TOC markdown
 */
function generateTOC(content) {
  const lines = content.split("\n");
  const tocEntries = [];

  for (const line of lines) {
    // Match h2 headings
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      const heading = h2Match[1];
      // Skip the TOC heading itself
      if (heading === "Table of Contents") continue;
      tocEntries.push({ level: 2, text: heading });
      continue;
    }

    // Match h3 headings
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      let text = h3Match[1];

      // For method signatures like `methodName(params) => ReturnType`, show only `methodName`
      const methodMatch = text.match(/^`(\w+)\(/);
      if (methodMatch) {
        text = `\`${methodMatch[1]}\``;
      }

      tocEntries.push({ level: 3, text: text });
    }
  }

  if (tocEntries.length === 0) return null;

  const tocLines = ["## Table of Contents", ""];
  for (const entry of tocEntries) {
    const anchor = toAnchorLink(entry.text);
    const indent = entry.level === 3 ? "  " : "";
    tocLines.push(`${indent}- [${entry.text}](#${anchor})`);
  }

  return tocLines.join("\n");
}

/**
 * Extracts Shadow Parts and CSS Custom Properties from readme.md,
 * removes them, and writes docs/styling.md combining with layout.md
 * @param {string} componentDir - Path to the component directory
 * @param {string} readmeFilePath - Path to the readme.md file
 * @returns {boolean} True if styling.md was generated
 */
function extractStylingDocs(componentDir, readmeFilePath) {
  if (!fs.existsSync(readmeFilePath)) return false;

  let content = fs.readFileSync(readmeFilePath, "utf8");

  // Extract the h1 title to get the component tag name
  const titleMatch = content.match(/^# (.+)$/m);
  const componentTag = titleMatch ? titleMatch[1] : "component";

  // Extract Shadow Parts and CSS Custom Properties sections from readme.md
  const shadowPartsSection = extractSection(content, "Shadow Parts");
  const cssPropsSection = extractSection(content, "CSS Custom Properties");

  // Read existing styling.md to preserve the Shadow DOM Layout section
  const stylingPath = path.join(componentDir, "docs", "styling.md");
  const existingStyling = fs.existsSync(stylingPath)
    ? fs.readFileSync(stylingPath, "utf8")
    : "";

  // Extract existing layout section from styling.md (everything from "## Shadow DOM Layout" onwards)
  const layoutMatch = existingStyling.match(/\n(## Shadow DOM Layout\n[\s\S]*)$/);
  const layoutText = layoutMatch ? layoutMatch[1].trim() : "";

  // Only generate styling.md if there's at least one source of content
  if (!shadowPartsSection && !cssPropsSection && !layoutText) {
    return false;
  }

  // Build styling.md content
  const stylingParts = [];
  stylingParts.push(`# ${componentTag}: Styling`);

  // Collect sections for TOC
  const sectionsForTOC = [];

  let shadowPartsText = "";
  if (shadowPartsSection) {
    shadowPartsText = shadowPartsSection.text.trim();
    sectionsForTOC.push({ level: 2, text: "Shadow Parts" });
  }

  let cssPropsText = "";
  if (cssPropsSection) {
    cssPropsText = cssPropsSection.text.trim();
    sectionsForTOC.push({ level: 2, text: "CSS Custom Properties" });
  }

  if (layoutText) {
    sectionsForTOC.push({ level: 2, text: "Shadow DOM Layout" });

    // Extract h2 subheadings from layout content for TOC (Case headers)
    const layoutLines = layoutText.split("\n");
    for (const line of layoutLines) {
      const h2Match = line.match(/^## (Case .+)$/);
      if (h2Match) {
        sectionsForTOC.push({ level: 3, text: h2Match[1] });
      }
    }
  }

  // Generate TOC for styling.md
  const tocLines = ["## Table of Contents", ""];
  for (const entry of sectionsForTOC) {
    const anchor = toAnchorLink(entry.text);
    const indent = entry.level === 3 ? "  " : "";
    tocLines.push(`${indent}- [${entry.text}](#${anchor})`);
  }
  stylingParts.push(tocLines.join("\n"));

  // Add sections
  if (shadowPartsText) {
    stylingParts.push(shadowPartsText);
  }

  if (cssPropsText) {
    stylingParts.push(cssPropsText);
  }

  if (layoutText) {
    stylingParts.push(layoutText);
  }

  const stylingContent = stylingParts.join("\n\n") + "\n";

  // Write styling.md
  const docsDir = path.join(componentDir, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(docsDir, "styling.md"), stylingContent, "utf8");

  // Remove extracted sections from readme.md
  // Process from end to start so indices remain valid
  const sectionsToRemove = [cssPropsSection, shadowPartsSection].filter(Boolean);
  sectionsToRemove.sort((a, b) => b.startIndex - a.startIndex);

  for (const section of sectionsToRemove) {
    content = content.slice(0, section.startIndex) + content.slice(section.endIndex);
  }

  // Clean up excessive blank lines after removal
  content = content.replace(/\n\n\n+/g, "\n\n");

  fs.writeFileSync(readmeFilePath, content, "utf8");

  return true;
}

/**
 * Inserts TOC into readme.md after h1 title, before <!-- Auto Generated Below -->
 * @param {string} readmeFilePath - Path to the readme.md file
 * @param {boolean} hasStyling - Whether styling.md was generated
 */
function insertTOCIntoReadme(readmeFilePath, hasStyling) {
  if (!fs.existsSync(readmeFilePath)) return;

  let content = fs.readFileSync(readmeFilePath, "utf8");

  // Remove existing TOC if present
  content = content.replace(
    /\n## Table of Contents\n[\s\S]*?(?=\n## |\n<!-- Auto Generated Below -->)/,
    "\n"
  );

  // Generate TOC from the current content
  const toc = generateTOC(content);
  if (!toc) return;

  // Add Styling link to TOC if styling.md was generated
  let tocContent = toc;
  if (hasStyling) {
    tocContent += `\n- [Styling](./docs/styling.md)`;
  }

  // Find insertion point: after h1 title, before <!-- Auto Generated Below -->
  const autoGenMarker = "<!-- Auto Generated Below -->";
  const autoGenIndex = content.indexOf(autoGenMarker);
  if (autoGenIndex === -1) return;

  // Split content at the auto-gen marker
  const beforeAutoGen = content.slice(0, autoGenIndex).replace(/\n+$/, "");
  const afterAutoGen = content.slice(autoGenIndex);

  // Find the h1 line end
  const h1Match = beforeAutoGen.match(/^# .+$/m);
  if (!h1Match) return;

  const h1End = beforeAutoGen.indexOf(h1Match[0]) + h1Match[0].length;
  const h1Part = beforeAutoGen.slice(0, h1End);

  content = h1Part + "\n\n" + tocContent + "\n\n" + afterAutoGen + "\n";

  // Clean up excessive blank lines
  content = content.replace(/\n\n\n+/g, "\n\n");
  // Clean trailing whitespace
  content = content.replace(/\n+$/, "\n");

  fs.writeFileSync(readmeFilePath, content, "utf8");
}

// ─── Main processing ────────────────────────────────────────────────

/**
 * Recursively find and process component directories
 * @param {string} dir - Directory to search in
 * @param {string} relativePath - Relative path for display purposes
 * @returns {{processedCount: number, skippedCount: number}}
 */
function processComponentsRecursively(dir, relativePath = "") {
  let processedCount = 0;
  let skippedCount = 0;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const entryPath = path.join(dir, entry.name);
    const displayPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    // Check if this directory contains a readme.md and component .tsx file
    const readmePath = path.join(entryPath, "readme.md");
    const files = fs.readdirSync(entryPath);
    const hasReadme = fs.existsSync(readmePath);
    const hasComponentFile = files.some(f => f.endsWith(".tsx"));

    if (hasReadme && hasComponentFile) {
      // This is a component directory - try to process it
      const componentFile = files.find((file) => {
        const baseName = path.basename(file, ".tsx");
        return (
          file === `${entry.name}.tsx` ||
          file === `${entry.name}-render.tsx` ||
          file.endsWith(".tsx")
        );
      });

      if (componentFile) {
        const componentPath = path.join(entryPath, componentFile);

        try {
          const { remarks, filename } = processComponentFile(componentPath);

          // Step 1: Inject remarks
          if (remarks) {
            injectRemarksIntoReadme(readmePath, remarks);
            console.log(`✓ ${displayPath}: remarks injected`);
            processedCount++;
          } else {
            console.log(`⊘ ${displayPath}: no @remarks found`);
            skippedCount++;
          }

          // Step 2: Extract styling docs (Shadow Parts + CSS Custom Properties + layout.md)
          const hasStyling = extractStylingDocs(entryPath, readmePath);
          if (hasStyling) {
            console.log(`  ✓ ${displayPath}: styling.md generated`);
          }

          // Step 3: Insert TOC into readme.md
          insertTOCIntoReadme(readmePath, hasStyling);
          console.log(`  ✓ ${displayPath}: TOC inserted`);

        } catch (error) {
          console.error(`✗ Error processing ${displayPath}: ${error.message}`);
        }
      }
    }

    // Always recurse into subdirectories to find nested components
    const subResults = processComponentsRecursively(entryPath, displayPath);
    processedCount += subResults.processedCount;
    skippedCount += subResults.skippedCount;
  }

  return { processedCount, skippedCount };
}

/**
 * Main function - processes all components
 */
function main() {
  const componentsDir = path.join(__dirname, "src", "components");

  if (!fs.existsSync(componentsDir)) {
    console.error(`Components directory not found: ${componentsDir}`);
    process.exit(1);
  }

  const { processedCount, skippedCount } = processComponentsRecursively(componentsDir);

  console.log(
    `\nProcessed: ${processedCount} components, Skipped: ${skippedCount}`
  );
}

main();
