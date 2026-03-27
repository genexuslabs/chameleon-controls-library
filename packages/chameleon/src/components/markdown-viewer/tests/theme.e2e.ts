import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../markdown-viewer.lit.js";
import type { ChMarkdownViewer } from "../markdown-viewer.lit";

const DUMMY_VALUE = "Hello world";

describe("[ch-markdown-viewer][theme]", () => {
  let markdownViewerRef: ChMarkdownViewer;

  beforeEach(async () => {
    render(html`<ch-markdown-viewer></ch-markdown-viewer>`);
    markdownViewerRef = document.querySelector("ch-markdown-viewer")!;
    await markdownViewerRef.updateComplete;
  });

  afterEach(cleanup);

  // TODO: Is this okay?
  it("should not render the ch-theme by default (no value set)", () => {
    const themeEl = markdownViewerRef.shadowRoot!.querySelector("ch-theme");
    expect(themeEl).toBeFalsy();
  });

  it("should render the ch-theme if the value is set", async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector("ch-theme");
    expect(themeEl).toBeTruthy();
  });

  it("should not render the ch-theme when theme = undefined and the value is set", async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    markdownViewerRef.theme = undefined;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector("ch-theme");
    expect(themeEl).toBeFalsy();
  });

  it('should not render the ch-theme when theme = "" and the value is set', async () => {
    markdownViewerRef.theme = "";
    markdownViewerRef.value = DUMMY_VALUE;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector("ch-theme");
    expect(themeEl).toBeFalsy();
  });

  it("should render the ch-theme when theme = [] and the value is set", async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    markdownViewerRef.theme = [];
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector("ch-theme");
    expect(themeEl).toBeTruthy();
  });

  it("should render the ch-theme with avoidFlashOfUnstyledContent = false by default when the value is set", async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector(
      "ch-theme"
    ) as HTMLElement & { avoidFlashOfUnstyledContent: boolean };
    expect(themeEl).toBeTruthy();
    expect(themeEl!.avoidFlashOfUnstyledContent).toBe(false);
  });

  it("should set avoidFlashOfUnstyledContent = true in the ch-theme, if the markdown-viewer has avoidFlashOfUnstyledContent = true and the value is set", async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    markdownViewerRef.avoidFlashOfUnstyledContent = true;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector(
      "ch-theme"
    ) as HTMLElement & { avoidFlashOfUnstyledContent: boolean };
    expect(themeEl).toBeTruthy();
    expect(themeEl!.avoidFlashOfUnstyledContent).toBe(true);
  });

  it('should bind the "theme" property to the ch-theme "model" when defined and the value is set', async () => {
    markdownViewerRef.value = DUMMY_VALUE;
    markdownViewerRef.theme = "dummy theme";
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector(
      "ch-theme"
    ) as HTMLElement & { model: unknown };
    expect(themeEl).toBeTruthy();
    expect(themeEl!.model).toBe("dummy theme");
  });

  it('should bind an array "theme" property to the ch-theme "model"', async () => {
    const themeArray = ["dummy theme", "dummy theme 2"];
    markdownViewerRef.value = DUMMY_VALUE;
    markdownViewerRef.theme = themeArray;
    await markdownViewerRef.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));
    await markdownViewerRef.updateComplete;

    const themeEl = markdownViewerRef.shadowRoot!.querySelector(
      "ch-theme"
    ) as HTMLElement & { model: unknown };
    expect(themeEl).toBeTruthy();
    expect(themeEl!.model).toEqual(themeArray);
  });
});
