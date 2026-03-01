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

  // Find the insertion point (after Overview section, before Properties or Auto Generated marker)
  const overviewEndMatch = content.match(
    /## Overview\n([\s\S]*?)(?=\n## |\n<!-- Auto Generated Below -->)/
  );

  if (!overviewEndMatch) {
    console.warn(
      `Could not find insertion point in ${readmeFilePath}, skipping`
    );
    return;
  }

  // Find the position to insert (right after Overview section ends)
  const overviewEndPos = content.indexOf(overviewEndMatch[0]) + overviewEndMatch[0].length;

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
    content = content.slice(0, overviewEndPos) + remarksSection + content.slice(overviewEndPos);
  }

  fs.writeFileSync(readmeFilePath, content, "utf8");
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

  let processedCount = 0;
  let skippedCount = 0;

  // Get all subdirectories in src/components/
  const dirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dir of dirs) {
    const componentDir = path.join(componentsDir, dir);

    // Look for the main component .tsx file
    const files = fs.readdirSync(componentDir);

    // Try to find the component file that matches the directory name
    const componentFile = files.find((file) => {
      return (
        file === `${dir}.tsx` || file === `${dir}-render.tsx`
      );
    });

    if (!componentFile) {
      continue;
    }

    const componentPath = path.join(componentDir, componentFile);
    const readmePath = path.join(componentDir, "readme.md");

    try {
      const { remarks, filename } = processComponentFile(componentPath);

      if (remarks) {
        injectRemarksIntoReadme(readmePath, remarks);
        console.log(`✓ ${filename}: remarks injected`);
        processedCount++;
      } else {
        console.log(`⊘ ${filename}: no @remarks found`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${dir}: ${error.message}`);
    }
  }

  console.log(
    `\nProcessed: ${processedCount} components, Skipped: ${skippedCount}`
  );
}

main();
