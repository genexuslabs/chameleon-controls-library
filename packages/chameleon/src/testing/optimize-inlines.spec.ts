import { describe, expect, it } from "vitest";
import { optimizeInlinesPlugin } from "../../optimize-inlines";

/**
 * Simulates the plugin's generateBundle hook by creating a fake bundle
 * with a single chunk containing the given code, then returning the
 * (possibly modified) code.
 */
function applyPlugin(code: string): string {
  const plugin = optimizeInlinesPlugin();

  // Build a minimal OutputBundle with one chunk
  const chunk = { type: "chunk" as const, code };
  const bundle = { "test.js": chunk };

  // Call the generateBundle hook
  const generateBundle = plugin.generateBundle as (
    options: unknown,
    bundle: Record<string, { type: string; code: string }>
  ) => void;

  generateBundle.call(undefined as never, {}, bundle);

  return chunk.code;
}

// ================================================================
//  Optimization 1 — Leading string concatenation
//  ${"prefix" + expr}  →  prefix${expr}
// ================================================================

describe("[optimizeInlinesPlugin] leading string concatenation", () => {
  it('should extract leading string: ${"section-"+t} → section-${t}', () => {
    // Actual pattern from accordion.lit.js build output
    const input = 'i`<section id=${"section-"+t}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<section id=section-${t}>`");
    expect(result.length).toBeLessThan(input.length);
  });

  it('should extract leading string with parenthesized rest: ${"track"+(expr)}', () => {
    // Actual pattern from slider.lit.js build output
    const input = 'i`<div part=${"track"+(this.disabled?" disabled":"")}>`';
    const result = applyPlugin(input);
    expect(result).toBe('i`<div part=track${(this.disabled?" disabled":"")}>`');
    expect(result.length).toBeLessThan(input.length);
  });

  it("should handle multiple leading-string patterns in one chunk", () => {
    // Actual patterns from slider.lit.js (4 occurrences)
    const input = [
      'i`<div part=${"track"+(this.disabled?" disabled":"")}>',
      '<div part=${"track__selected"+(this.disabled?" disabled":"")}>',
      '<div part=${"track__unselected"+(this.disabled?" disabled":"")}>',
      '<div part=${"thumb"+(this.disabled?" disabled":"")}>`'
    ].join("");
    const result = applyPlugin(input);
    expect(result).toBe(
      [
        'i`<div part=track${(this.disabled?" disabled":"")}>',
        '<div part=track__selected${(this.disabled?" disabled":"")}>',
        '<div part=track__unselected${(this.disabled?" disabled":"")}>',
        '<div part=thumb${(this.disabled?" disabled":"")}>`'
      ].join("")
    );
    expect(result.length).toBeLessThan(input.length);
  });

  it('should remove empty leading string: ${""+expr} → ${expr}', () => {
    // Actual pattern from action-list-group.lit.js
    const input = 'i`<ul aria-busy=${""+!!this.downloading}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<ul aria-busy=${!!this.downloading}>`");
    expect(result.length).toBeLessThan(input.length);
  });

  it("should work with single-quoted leading strings", () => {
    const input = "i`<section id=${'section-'+t}>`";
    const result = applyPlugin(input);
    expect(result).toBe("i`<section id=section-${t}>`");
  });

  it("should handle two leading-concat expressions on the same line", () => {
    const input = 'i`<div id=${"a-"+x} class=${"b-"+y}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<div id=a-${x} class=b-${y}>`");
  });
});

// ================================================================
//  Optimization 2 — Pure string literal expressions
//  ${"text"}  →  text
// ================================================================

describe("[optimizeInlinesPlugin] pure string literals", () => {
  it('should inline double-quoted: ${"panel"} → panel', () => {
    const input = 'i`<div part=${"panel"}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<div part=panel>`");
    expect(result.length).toBeLessThan(input.length);
  });

  it("should inline single-quoted: ${'panel'} → panel", () => {
    const input = "i`<div part=${'panel'}>`";
    const result = applyPlugin(input);
    expect(result).toBe("i`<div part=panel>`");
  });

  it("should inline backtick (no interpolation): ${`panel`} → panel", () => {
    const input = "i`<div part=${`panel`}>`";
    const result = applyPlugin(input);
    expect(result).toBe("i`<div part=panel>`");
  });

  it("should handle multiple pure strings in one chunk", () => {
    const input = 'i`<div part=${"panel"} class=${"header"}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<div part=panel class=header>`");
  });

  it("should handle adjacent pure-string expressions", () => {
    const input = 'i`${"a"}${"b"}`';
    const result = applyPlugin(input);
    expect(result).toBe("i`ab`");
  });

  it('should handle empty string: ${""} → (nothing)', () => {
    const input = 'i`<div class=${""}>`';
    const result = applyPlugin(input);
    expect(result).toBe("i`<div class=>`");
  });
});

// ================================================================
//  MUST NOT TRANSFORM — code that must remain unchanged
// ================================================================

describe("[optimizeInlinesPlugin] does not transform", () => {
  it("should NOT touch variable expressions", () => {
    const input = "i`<div part=${myVar}>`";
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch property access expressions", () => {
    // Actual pattern: dict property access after Terser (e.g., c.PANEL)
    const input = "i`<div part=${c.PANEL}>`";
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch ternary expressions", () => {
    // Actual pattern from accordion build output
    const input = 'i`<div class=${e.expanded?"panel panel--expanded":"panel"}>`';
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch ternary with leading string in a branch", () => {
    // Actual pattern from combo-box build: the ""+!! is inside a ternary
    // branch, NOT at the top level of the expression
    const input = 'i`<div aria-expanded=${f.expandable?""+!!f.expanded:t}>`';
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch function call expressions (tokenMap)", () => {
    // Actual pattern from accordion build output
    const input =
      "i`<div part=${l({[e.id]:!0,[c.PANEL]:!0,[c.DISABLED]:a,[c.EXPANDED]:e.expanded,[c.COLLAPSED]:!e.expanded})}>`";
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch logical-or fallbacks", () => {
    const input = 'i`<div class=${a||"fallback"}>`';
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch template literals with interpolation inside backticks", () => {
    // Actual pattern: nested template literal with variable
    const input =
      "i`<div class=${`header--expand-button-${this.expandableButtonPosition}`}>`";
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch string concat inside ternary false branch", () => {
    // Actual pattern from navigation-list build
    const input = 'i`<div style=${o?a:"--level: "+this.level}>`';
    expect(applyPlugin(input)).toBe(input);
  });

  it("should NOT touch string concat inside ternary true branch", () => {
    // Actual pattern from combo-box build
    const input = 'i`<div aria-controls=${f.expandable?v+"__content":t}>`';
    expect(applyPlugin(input)).toBe(input);
  });

  it("should not modify code when nothing matches", () => {
    const input = "const x = 42;";
    expect(applyPlugin(input)).toBe(input);
  });
});

// ================================================================
//  REALISTIC — snippets from actual Chameleon build output
// ================================================================

describe("[optimizeInlinesPlugin] realistic build output snippets", () => {
  it("should optimize accordion snippet (2x section- concat)", () => {
    // Extracted from accordion.lit.js minified output
    const input =
      'i`<button id=${e.id} aria-controls=${"section-"+t} aria-label=${e.accessibleName||o}></button>' +
      '<section id=${"section-"+t} aria-label=${e.accessibleName||o}></section>`';

    const result = applyPlugin(input);

    expect(result).toBe(
      "i`<button id=${e.id} aria-controls=section-${t} aria-label=${e.accessibleName||o}></button>" +
        "<section id=section-${t} aria-label=${e.accessibleName||o}></section>`"
    );
    expect(result.length).toBeLessThan(input.length);
  });

  it("should optimize slider snippet (4x part concat)", () => {
    // Extracted from slider.lit.js minified output
    const input =
      'i`<div part=${"track"+(this.disabled?" disabled":"")} style=${"--slider-selected-value: "+a+"%"}></div>' +
      '<div part=${"track__selected"+(this.disabled?" disabled":"")}></div>' +
      '<div part=${"track__unselected"+(this.disabled?" disabled":"")}></div>' +
      '<div part=${"thumb"+(this.disabled?" disabled":"")}></div>`';

    const result = applyPlugin(input);

    expect(result).not.toContain('${"track"');
    expect(result).not.toContain('${"thumb"');
    expect(result).toContain("part=track${");
    expect(result).toContain("part=track__selected${");
    expect(result).toContain("part=track__unselected${");
    expect(result).toContain("part=thumb${");
    expect(result.length).toBeLessThan(input.length);
  });

  it("should optimize action-list snippet (empty string coercion)", () => {
    // Extracted from action-list-group.lit.js minified output
    const input = 'i`<ul aria-busy=${""+!!this.downloading} role=group></ul>`';
    const result = applyPlugin(input);
    expect(result).toBe(
      "i`<ul aria-busy=${!!this.downloading} role=group></ul>`"
    );
    expect(result.length).toBeLessThan(input.length);
  });

  it("should NOT modify tokenMap calls (actual accordion pattern)", () => {
    // Real Chameleon pattern — must be preserved exactly
    const input =
      "i`<div class=${e.expanded?\"panel panel--expanded\":\"panel\"} " +
      "part=${l({[e.id]:!0,[c.PANEL]:!0,[c.DISABLED]:a,[c.EXPANDED]:e.expanded,[c.COLLAPSED]:!e.expanded})}>`";
    expect(applyPlugin(input)).toBe(input);
  });

  it("should handle mixed patterns: some optimizable, some not", () => {
    const input =
      'i`<section id=${"section-"+t} aria-label=${e.accessibleName||o} ' +
      "class=${e.expanded?o:\"section--hidden\"} " +
      "part=${l({[e.id]:!0,[c.SECTION]:!0})}>`";
    const result = applyPlugin(input);

    // Only the leading-string concat should change
    expect(result).toContain("id=section-${t}");
    // Everything else is untouched
    expect(result).toContain("aria-label=${e.accessibleName||o}");
    expect(result).toContain('class=${e.expanded?o:"section--hidden"}');
    expect(result).toContain("part=${l({[e.id]:!0,[c.SECTION]:!0})}");
  });
});

// ================================================================
//  SIZE REDUCTION — verify the plugin actually saves bytes
// ================================================================

describe("[optimizeInlinesPlugin] size reduction", () => {
  it("should reduce byte count for leading string concat patterns", () => {
    // Each ${"prefix"+expr} → prefix${expr} saves at least 2 bytes
    const input = 'i`<div id=${"section-"+t} class=${"panel-"+v}>`';
    const result = applyPlugin(input);
    // "${ "prefix" + saves 3 bytes per occurrence (" and + removed, ${ restructured)
    expect(result.length).toBeLessThan(input.length);
    expect(input.length - result.length).toBeGreaterThanOrEqual(4);
  });

  it("should reduce byte count for pure string patterns", () => {
    // Each ${"text"} → text saves 4 bytes ($, {, ", ", })
    const input = 'i`<div part=${"panel"} class=${"active"}>`';
    const result = applyPlugin(input);
    expect(result.length).toBeLessThan(input.length);
    expect(input.length - result.length).toBe(10); // 5 bytes × 2 occurrences
  });

  it("should reduce byte count for empty string coercion", () => {
    // ${""+expr} → ${expr} saves 3 bytes
    const input = 'i`<div busy=${""+!!x}>`';
    const result = applyPlugin(input);
    expect(result.length).toBeLessThan(input.length);
    expect(input.length - result.length).toBe(3);
  });

  it("should accumulate savings across a realistic chunk", () => {
    // Simulates a chunk with multiple optimizable patterns
    const input = [
      // 2x accordion pattern (4 bytes saved each = 8)
      'i`<button aria-controls=${"section-"+t}></button>',
      '<section id=${"section-"+t}></section>`',
      // 4x slider pattern (~5 bytes saved each = ~20)
      ';i`<div part=${"track"+(d?" disabled":"")}>',
      '<div part=${"track__selected"+(d?" disabled":"")}>',
      '<div part=${"track__unselected"+(d?" disabled":"")}>',
      '<div part=${"thumb"+(d?" disabled":"")}>`',
      // 1x action-list pattern (3 bytes saved)
      ';i`<ul busy=${""+!!z}>`'
    ].join("");

    const result = applyPlugin(input);

    const savedBytes = input.length - result.length;
    expect(savedBytes).toBeGreaterThan(0);
    // Verify meaningful savings across the chunk
    expect(savedBytes).toBeGreaterThanOrEqual(20);
  });
});
