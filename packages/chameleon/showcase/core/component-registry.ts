/**
 * Central registry for querying component metadata from library-summary.ts.
 * Provides lookup functions used across the showcase.
 */
import { librarySummary } from "../../src/library-summary";

export type ComponentDefinition = (typeof librarySummary)[number];

/**
 * Returns all public components from the library summary.
 */
export function getPublicComponents(): ComponentDefinition[] {
  return librarySummary.filter(c => c.access === "public");
}

/**
 * Returns a single component definition by its tag name.
 */
export function getComponentDefinition(
  tagName: string
): ComponentDefinition | undefined {
  return librarySummary.find(
    c => c.tagName === tagName && c.access === "public"
  );
}

/**
 * Returns the display name for a component tag (strips "ch-" prefix and
 * "-render" suffix, capitalizes words).
 */
export function getComponentDisplayName(tagName: string): string {
  return tagName
    .replace(/^ch-/, "")
    .replace(/-render$/, "")
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns the URL-friendly slug for a component tag.
 * e.g., "ch-checkbox" → "checkbox", "ch-navigation-list-render" → "navigation-list"
 */
export function getComponentSlug(tagName: string): string {
  return tagName.replace(/^ch-/, "").replace(/-render$/, "");
}

/**
 * Returns the tag name from a URL slug.
 * Checks both with and without "-render" suffix.
 */
export function getTagNameFromSlug(slug: string): string | undefined {
  const directTag = `ch-${slug}`;
  const renderTag = `ch-${slug}-render`;

  const found = librarySummary.find(
    c =>
      c.access === "public" &&
      (c.tagName === directTag || c.tagName === renderTag)
  );

  return found?.tagName;
}
