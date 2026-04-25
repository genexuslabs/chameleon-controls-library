import { html, nothing } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChameleonControls } from "../../../typings/chameleon-components";

import "../custom-render.lit";

const THEME_RED = ".swatch { color: rgb(255, 0, 0); }";
const THEME_BLUE = ".swatch { color: rgb(0, 0, 255); }";
const THEME_GREEN = ".swatch { color: rgb(0, 128, 0); }";

const swatchContent = (text = "Hello") =>
  html`<span class="swatch">${text}</span>`;

let element!: ChameleonControls["ch-custom-render"];
let container: HTMLElement;

const mount = async (
  template: ReturnType<typeof html> = html`<ch-custom-render
    .content=${swatchContent()}
  ></ch-custom-render>`
) => {
  document.body.innerHTML = "";
  const result = await render(template);
  container = result.container;
  element = container.querySelector("ch-custom-render")!;
  await element.updateComplete;
  return result;
};

const getSwatch = (
  el: ChameleonControls["ch-custom-render"] = element
): HTMLElement | null => el.shadowRoot!.querySelector(".swatch");

const themeSheets = (el: ChameleonControls["ch-custom-render"] = element) => {
  // Filter out the component's own styles (adopted by Lit's `adoptStyles`) so
  // the assertion only sees stylesheets that were adopted via the `theme`
  // prop. Lit unwraps CSSResult into its `.styleSheet` before adopting, so we
  // do the same here to match identities.
  const own =
    ((el.constructor as { elementStyles?: Array<CSSStyleSheet | { styleSheet: CSSStyleSheet }> })
      .elementStyles ?? []).map(s =>
      s instanceof CSSStyleSheet ? s : s.styleSheet
    );
  return el.shadowRoot!.adoptedStyleSheets.filter(s => !own.includes(s));
};

const sheetText = (sheet: CSSStyleSheet) =>
  Array.from(sheet.cssRules)
    .map(r => r.cssText)
    .join("\n");

beforeEach(async () => {
  await mount();
});

afterEach(cleanup);

describe("[ch-custom-render][structure]", () => {
  it("should attach an open shadow root", () => {
    expect(element.shadowRoot).toBeTruthy();
    expect((element.shadowRoot as ShadowRoot).mode).toBe("open");
  });

  it("should render the provided content inside the shadow root", () => {
    expect(getSwatch()?.textContent).toBe("Hello");
  });

  it("should reflect exportParts to the exportparts attribute", async () => {
    element.exportParts = "foo bar";
    await element.updateComplete;
    expect(element.getAttribute("exportparts")).toBe("foo bar");
  });
});

describe("[ch-custom-render][content]", () => {
  it("should re-render when content changes", async () => {
    element.content = swatchContent("World");
    await element.updateComplete;
    expect(getSwatch()?.textContent).toBe("World");
  });

  it("should render nothing when content is undefined", async () => {
    element.content = undefined;
    await element.updateComplete;
    expect(getSwatch()).toBeNull();
  });

  it("should render nothing when content is null", async () => {
    element.content = null;
    await element.updateComplete;
    expect(getSwatch()).toBeNull();
  });

  it("should render the `nothing` sentinel as no content", async () => {
    element.content = nothing;
    await element.updateComplete;
    expect(getSwatch()).toBeNull();
  });

  it("should render plain string content as text", async () => {
    element.content = "plain text";
    await element.updateComplete;
    expect(element.shadowRoot!.textContent?.trim()).toBe("plain text");
  });
});

describe("[ch-custom-render][theme — defaults]", () => {
  it("should not adopt any theme stylesheet when theme is undefined", () => {
    expect(element.theme).toBeUndefined();
    expect(themeSheets()).toHaveLength(0);
  });

  it("should not emit an inline <style> when wasServerSideRendered is false", () => {
    // No SSR in vitest-browser-lit → the inline branch must be skipped.
    expect(element.shadowRoot!.querySelector("style")).toBeNull();
  });
});

describe("[ch-custom-render][theme — initial set]", () => {
  it("should adopt the theme stylesheet when set on first render", async () => {
    cleanup();
    await mount(
      html`<ch-custom-render
        .content=${swatchContent()}
        .theme=${THEME_RED}
      ></ch-custom-render>`
    );

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(255, 0, 0)");
  });

  it("should apply the adopted styles to the rendered content", async () => {
    cleanup();
    await mount(
      html`<ch-custom-render
        .content=${swatchContent()}
        .theme=${THEME_RED}
      ></ch-custom-render>`
    );

    const swatch = getSwatch()!;
    expect(getComputedStyle(swatch).color).toBe("rgb(255, 0, 0)");
  });
});

describe("[ch-custom-render][theme — transitions]", () => {
  it("should swap the adopted sheet when theme changes (A → B)", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    expect(themeSheets()).toHaveLength(1);
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(255, 0, 0)");

    element.theme = THEME_BLUE;
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(0, 0, 255)");
    expect(sheetText(sheets[0])).not.toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(0, 0, 255)");
  });

  it("should remove the adopted sheet when theme changes to undefined", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    expect(themeSheets()).toHaveLength(1);

    element.theme = undefined;
    await element.updateComplete;

    expect(themeSheets()).toHaveLength(0);
    expect(getComputedStyle(getSwatch()!).color).not.toBe("rgb(255, 0, 0)");
  });

  it("should adopt the sheet when theme changes from undefined to a value", async () => {
    expect(themeSheets()).toHaveLength(0);

    element.theme = THEME_GREEN;
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(0, 128, 0)");
  });

  it("should be a no-op when assigning the same theme string", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    const sheetA = themeSheets()[0];

    element.theme = THEME_RED; // same value
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheets[0]).toBe(sheetA); // same identity, no churn
  });

  it("should chain multiple transitions correctly (A → B → undefined → A)", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    element.theme = THEME_BLUE;
    await element.updateComplete;
    element.theme = undefined;
    await element.updateComplete;
    expect(themeSheets()).toHaveLength(0);

    element.theme = THEME_RED;
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(255, 0, 0)");
  });
});

describe("[ch-custom-render][theme — sharing across instances]", () => {
  it("should share a single CSSStyleSheet across instances using the same theme string", async () => {
    cleanup();
    const result = await render(
      html`
        <ch-custom-render
          id="a"
          .content=${swatchContent("A")}
          .theme=${THEME_RED}
        ></ch-custom-render>
        <ch-custom-render
          id="b"
          .content=${swatchContent("B")}
          .theme=${THEME_RED}
        ></ch-custom-render>
      `
    );

    const a = result.container.querySelector(
      "#a"
    ) as ChameleonControls["ch-custom-render"];
    const b = result.container.querySelector(
      "#b"
    ) as ChameleonControls["ch-custom-render"];
    await a.updateComplete;
    await b.updateComplete;

    const sheetsA = themeSheets(a);
    const sheetsB = themeSheets(b);

    expect(sheetsA).toHaveLength(1);
    expect(sheetsB).toHaveLength(1);
    // Same constructable stylesheet identity → cached and shared.
    expect(sheetsA[0]).toBe(sheetsB[0]);
  });

  it("should adopt distinct sheets for distinct theme strings", async () => {
    cleanup();
    const result = await render(
      html`
        <ch-custom-render
          id="a"
          .content=${swatchContent("A")}
          .theme=${THEME_RED}
        ></ch-custom-render>
        <ch-custom-render
          id="b"
          .content=${swatchContent("B")}
          .theme=${THEME_BLUE}
        ></ch-custom-render>
      `
    );

    const a = result.container.querySelector(
      "#a"
    ) as ChameleonControls["ch-custom-render"];
    const b = result.container.querySelector(
      "#b"
    ) as ChameleonControls["ch-custom-render"];
    await a.updateComplete;
    await b.updateComplete;

    expect(themeSheets(a)[0]).not.toBe(themeSheets(b)[0]);
    expect(getComputedStyle(getSwatch(a)!).color).toBe("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch(b)!).color).toBe("rgb(0, 0, 255)");
  });
});

describe("[ch-custom-render][theme — disconnect / reconnect]", () => {
  it("should drop the adopted sheet on disconnect", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    expect(themeSheets()).toHaveLength(1);

    const parent = element.parentElement!;
    parent.removeChild(element);
    expect(element.isConnected).toBe(false);

    // disconnectedCallback removed the sheet from adoptedStyleSheets so the
    // refcount on this shadowRoot is back to zero.
    expect(themeSheets()).toHaveLength(0);
  });

  it("should re-adopt the current theme on reconnect", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;

    const parent = element.parentElement!;
    parent.removeChild(element);
    expect(themeSheets()).toHaveLength(0);

    parent.appendChild(element);
    await element.updateComplete;
    expect(element.isConnected).toBe(true);

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(255, 0, 0)");
  });

  it("should keep refcount balanced across a DOM move", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;

    // A move = disconnect + connect synchronously. After it, the sheet must
    // be adopted exactly once (no churn / no double-add).
    const otherParent = document.createElement("div");
    document.body.appendChild(otherParent);
    otherParent.appendChild(element);
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(255, 0, 0)");

    // Move back. Still exactly one sheet adopted.
    container.appendChild(element);
    await element.updateComplete;
    expect(themeSheets()).toHaveLength(1);
  });

  it("should swap themes normally after a detach + reattach cycle", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;

    const parent = element.parentElement!;
    parent.removeChild(element);
    parent.appendChild(element);
    await element.updateComplete;

    element.theme = THEME_BLUE;
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(0, 0, 255)");
    expect(sheetText(sheets[0])).not.toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(0, 0, 255)");
  });

  it("should adopt the new theme when it changes while disconnected", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;

    const parent = element.parentElement!;
    parent.removeChild(element);
    // Property change while detached: Lit defers the update until reconnect.
    element.theme = THEME_BLUE;

    parent.appendChild(element);
    await element.updateComplete;

    const sheets = themeSheets();
    expect(sheets).toHaveLength(1);
    expect(sheetText(sheets[0])).toContain("rgb(0, 0, 255)");
    expect(sheetText(sheets[0])).not.toContain("rgb(255, 0, 0)");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(0, 0, 255)");
  });

  it("should not affect sibling instances when one disconnects", async () => {
    cleanup();
    const result = await render(
      html`
        <ch-custom-render
          id="a"
          .content=${swatchContent("A")}
          .theme=${THEME_RED}
        ></ch-custom-render>
        <ch-custom-render
          id="b"
          .content=${swatchContent("B")}
          .theme=${THEME_RED}
        ></ch-custom-render>
      `
    );
    const a = result.container.querySelector(
      "#a"
    ) as ChameleonControls["ch-custom-render"];
    const b = result.container.querySelector(
      "#b"
    ) as ChameleonControls["ch-custom-render"];
    await a.updateComplete;
    await b.updateComplete;

    // Disconnect A; B must still have the shared sheet adopted.
    a.parentElement!.removeChild(a);

    expect(themeSheets(a)).toHaveLength(0);
    expect(themeSheets(b)).toHaveLength(1);
    expect(getComputedStyle(getSwatch(b)!).color).toBe("rgb(255, 0, 0)");
  });
});

describe("[ch-custom-render][theme — edge cases]", () => {
  it("should treat an empty string theme as no theme", async () => {
    element.theme = "";
    await element.updateComplete;
    // The `if (newTheme)` guard short-circuits empty strings, so no sheet
    // is adopted (and there is nothing to adopt anyway).
    expect(themeSheets()).toHaveLength(0);
  });

  it("should not interact with the inline <style> branch on the client", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    // wasServerSideRendered is false on a fresh client-only element, so the
    // inline <style> tag must never appear in the shadow root.
    expect(element.shadowRoot!.querySelector("style")).toBeNull();
  });

  it("should keep working when content updates after the theme is set", async () => {
    element.theme = THEME_RED;
    await element.updateComplete;
    element.content = swatchContent("Updated");
    await element.updateComplete;

    expect(getSwatch()?.textContent).toBe("Updated");
    expect(getComputedStyle(getSwatch()!).color).toBe("rgb(255, 0, 0)");
  });
});
