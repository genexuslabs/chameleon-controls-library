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

  // Ensure remarks end with proper spacing before next section
  const remarksSection = remarks.endsWith("```")
    ? `\n\n${remarks}\n`
    : `\n\n${remarks}`;

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

          if (remarks) {
            injectRemarksIntoReadme(readmePath, remarks);
            console.log(`✓ ${displayPath}: remarks injected`);
            processedCount++;
          } else {
            console.log(`⊘ ${displayPath}: no @remarks found`);
            skippedCount++;
          }
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
