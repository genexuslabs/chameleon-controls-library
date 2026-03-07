#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Set of component paths to exclude from export
 * Format: 'component-name' or 'folder/component-name'
 * Easy to add/remove exclusions here
 */
const EXCLUDED_COMPONENTS = new Set([
  "rowset",
  "tabular-grid-rowset",
  "tabular-grid/rowset",
  "notifications",
  "notifications-item",
  "tabular-grid-render",
  "timer"
]);

/**
 * Set of folder paths to exclude from traversal
 * Format: 'folder-name'
 */
const EXCLUDED_FOLDERS = new Set([
  "internals",
  "gx-grid",
  "alert",
  "notifications",
  "next",
  "paginator",
  "test",
  "tabular-grid-render"
]);

/**
 * Extracts component tag name from .tsx file
 * @param {string} filePath - Path to the .tsx file
 * @returns {string|null} Component tag name (e.g., 'ch-accordion-render')
 */
function extractComponentTag(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Match @Component({ tag: "ch-..." })
    const tagMatch = content.match(/tag:\s*["']([^"']+)["']/);
    return tagMatch ? tagMatch[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Converts kebab-case to space-separated readable name
 * @param {string} componentName - The component name in kebab-case
 * @returns {string} Readable name
 */
function getReadableComponentName(componentName) {
  // Remove 'ch-' prefix if present for display
  const name = componentName.startsWith("ch-")
    ? componentName.slice(3)
    : componentName;
  return name
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if a directory contains a .tsx component file
 * @param {string} dir - Directory to check
 * @returns {boolean} True if directory contains a .tsx component
 */
function isComponentDirectory(dir) {
  const files = fs.readdirSync(dir);
  return files.some(f => f.endsWith(".tsx"));
}

/**
 * Check if a path is inside an internal folder (should be excluded)
 * @param {string} relativePath - Relative path to check
 * @returns {boolean} True if path contains 'internal' as a folder name
 */
function isInsideInternalFolder(relativePath) {
  return relativePath.split("/").includes("internal");
}

/**
 * Recursively find all component directories (those containing readme.md and .tsx file)
 * @param {string} dir - Directory to search in
 * @param {string} relativePath - Relative path for display/exclusion purposes
 * @returns {Array<{path: string, relativeId: string}>} List of component directories
 */
function findComponentDirectories(dir, relativePath = "") {
  const components = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const relativeId = relativePath
      ? `${relativePath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      // Skip excluded folders
      if (EXCLUDED_FOLDERS.has(entry.name)) {
        continue;
      }

      // Skip components inside internal folders
      if (isInsideInternalFolder(relativeId)) {
        continue;
      }

      // Check if this directory is a component (has readme.md AND .tsx file)
      const readmePath = path.join(entryPath, "readme.md");
      if (fs.existsSync(readmePath) && isComponentDirectory(entryPath)) {
        // Skip excluded components
        if (
          !EXCLUDED_COMPONENTS.has(relativeId) &&
          !EXCLUDED_COMPONENTS.has(entry.name)
        ) {
          components.push({
            path: entryPath,
            relativeId: relativeId,
            displayName: entry.name
          });
        }
      }

      // Always recurse into subdirectories to find nested components (e.g., color-picker/color-field)
      // But skip recursion if we're inside an internal folder
      if (!isInsideInternalFolder(relativeId)) {
        const subComponents = findComponentDirectories(entryPath, relativeId);
        components.push(...subComponents);
      }
    }
  }

  return components;
}

/**
 * Fixes links in "Used by" and "Depends on" sections
 * Maps relative paths to exported README filenames and removes broken links
 * Removes section headers if they have no valid items
 * Also removes Graph section and "Built with" footer
 * @param {string} content - README content to process
 * @param {Set<string>} exportedComponentTags - Set of exported component tags (e.g., 'ch-accordion-render')
 * @returns {string} Processed content with fixed links
 */
function fixDependencyLinks(content, exportedComponentTags) {
  // Remove "### Graph" section with mermaid diagram
  content = content.replace(/\n### Graph\n```[\s\S]*?```\n/g, '\n');

  // Remove Stencil footer separator and "Built with" line
  content = content.replace(/\n----------------------------------------------\n\n\*Built with \[StencilJS\]\([^)]*\)\*\n*/g, '\n');
  content = content.replace(/\n\*Built with \[StencilJS\]\([^)]*\)\*\n*/g, '\n');

  // Process "Used by" and "Depends on" sections
  const dependencyPattern = /(### (?:Used by|Depends on)\s*\n)([\s\S]*?)(?=\n###|$)/g;

  content = content.replace(dependencyPattern, (match, header, items) => {
    const lines = items.split('\n').filter(line => line.trim());
    const validLines = [];

    for (const line of lines) {
      // Match markdown links: [text](path)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const [, linkText] = linkMatch;
        // Extract the component name from the link text (e.g., "ch-tabular-grid-render" from "[ch-tabular-grid-render](../tabular-grid-render)")
        const componentMatch = linkText.match(/ch-[\w-]+/);

        if (componentMatch && exportedComponentTags.has(componentMatch[0])) {
          // Link to exported component folder
          validLines.push(` - [${linkText}](../${componentMatch[0]}/README.md)`);
        }
        // If component tag not found in exported tags, skip this line (broken link)
      } else if (line.trim()) {
        // Keep non-link lines as-is
        validLines.push(line);
      }
    }

    // Return the header and processed items, or nothing if no valid items
    if (validLines.length > 0) {
      return header + validLines.join('\n') + '\n';
    } else {
      // Remove the entire section if there are no valid items
      return '';
    }
  });

  // Remove "## Dependencies" section if it's empty (only whitespace after it)
  content = content.replace(/## Dependencies\s*\n\n+/g, '');

  // Clean up excessive blank lines
  content = content.replace(/\n\n+/g, '\n\n');

  // Clean up excessive blank lines at the end
  content = content.replace(/\n\n+$/, '\n');

  return content;
}

/**
 * Main function - exports component READMEs
 * @param {string} outputDir - Directory to export READMEs to
 */
function exportComponentDocs(outputDir) {
  const componentsDir = path.join(__dirname, "src", "components");

  // Clean output directory if it exists
  if (fs.existsSync(outputDir)) {
    console.log(`🗑️  Cleaning existing output directory: ${outputDir}`);
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created output directory: ${outputDir}`);

  if (!fs.existsSync(componentsDir)) {
    console.error(`❌ Components directory not found: ${componentsDir}`);
    process.exit(1);
  }

  let exportedCount = 0;
  let skippedCount = 0;
  const exportedFiles = [];
  const exportedComponentTags = new Set();

  // Find all component directories (including nested ones)
  const components = findComponentDirectories(componentsDir);

  // First pass: collect all exported component tags
  for (const component of components) {
    const readmePath = path.join(component.path, "readme.md");

    try {
      // Try to find the .tsx file and extract component tag
      const files = fs.readdirSync(component.path);
      const tsxFile = files.find(
        f => f.endsWith(".tsx") && !f.includes("render")
      );
      const renderTsxFile = files.find(
        f => f.endsWith(".tsx") && f.includes("render")
      );
      const mainTsxFile = tsxFile || renderTsxFile;

      let componentTag = null;
      if (mainTsxFile) {
        const tsxPath = path.join(component.path, mainTsxFile);
        componentTag = extractComponentTag(tsxPath);
      }

      // Fallback to directory name if tag extraction fails
      if (!componentTag) {
        componentTag = `ch-${component.displayName}`;
      }

      exportedComponentTags.add(componentTag);
    } catch (error) {
      // Ignore errors in first pass
    }
  }

  // Second pass: process and export files
  for (const component of components) {
    const readmePath = path.join(component.path, "readme.md");

    try {
      // Try to find the .tsx file and extract component tag
      const files = fs.readdirSync(component.path);
      const tsxFile = files.find(
        f => f.endsWith(".tsx") && !f.includes("render")
      );
      const renderTsxFile = files.find(
        f => f.endsWith(".tsx") && f.includes("render")
      );
      const mainTsxFile = tsxFile || renderTsxFile;

      let componentTag = null;
      if (mainTsxFile) {
        const tsxPath = path.join(component.path, mainTsxFile);
        componentTag = extractComponentTag(tsxPath);
      }

      // Fallback to directory name if tag extraction fails
      if (!componentTag) {
        componentTag = `ch-${component.displayName}`;
      }

      // Read the README file
      let readmeContent = fs.readFileSync(readmePath, "utf8");

      // Fix dependency links (folder-based: ../tag/README.md)
      readmeContent = fixDependencyLinks(readmeContent, exportedComponentTags);

      // Create output folder: exported-docs/ch-component-name/
      const componentFolder = path.join(outputDir, componentTag);
      fs.mkdirSync(componentFolder, { recursive: true });

      // Fix styling link: ./docs/styling.md → ./styling.md (now siblings in export folder)
      readmeContent = readmeContent.replace(
        /\(\.\/docs\/styling\.md\)/g,
        "(./styling.md)"
      );

      // Write README.md inside the component folder
      fs.writeFileSync(path.join(componentFolder, "README.md"), readmeContent, "utf8");

      // Copy styling.md if it exists
      const stylingPath = path.join(component.path, "docs", "styling.md");
      if (fs.existsSync(stylingPath)) {
        fs.copyFileSync(stylingPath, path.join(componentFolder, "styling.md"));
      }

      exportedFiles.push({
        component: componentTag,
        readable: getReadableComponentName(componentTag),
        file: `${componentTag}/README.md`
      });

      console.log(`✓ ${component.relativeId}: exported as ${componentTag}/README.md`);
      exportedCount++;
    } catch (error) {
      console.error(
        `✗ Error processing ${component.relativeId}: ${error.message}`
      );
      skippedCount++;
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log(`📊 Export Summary`);
  console.log("=".repeat(60));
  console.log(`✓ Exported: ${exportedCount} components`);
  console.log(`⊘ Skipped: ${skippedCount} items`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log("=".repeat(60));

  // Print exported components list
  if (exportedFiles.length > 0) {
    console.log("\n📄 Exported Components:");
    exportedFiles.forEach(({ component, readable, file }) => {
      console.log(`  • ${component.padEnd(25)} → ${file}`);
    });
  }
}

// Get output directory from command line or use default
const outputDir = process.argv[2] || path.join(__dirname, "exported-docs");

console.log(`\n🚀 Starting component documentation export...\n`);
exportComponentDocs(outputDir);
console.log(`\n✨ Export completed!`);
