import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { SCROLLABLE_CLASS } from "../../../common/reserved-names";

describe("[ch-code][styles]", () => {
  let page: E2EPage;
  let codeRef: E2EElement;
  let internalCodeRef: E2EElement;
  let computedStyle: CSSStyleDeclaration;
  let internalCodeComputedStyle: CSSStyleDeclaration;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-code language="typescript"></ch-code>`
    });
    codeRef = await page.find("ch-code");
    internalCodeRef = await page.find("ch-code >>> code");

    computedStyle = await codeRef.getComputedStyle();
    internalCodeComputedStyle = await internalCodeRef.getComputedStyle();
  });

  it('should have "font-family: monospace" to properly display the content', () =>
    expect(computedStyle.fontFamily).toBe("monospace"));

  it('should have "white-space: pre" to properly display the content', () =>
    expect(computedStyle.whiteSpace).toBe("pre"));

  it('should have "overflow: auto" to properly display the content', () =>
    expect(computedStyle.overflow).toBe("auto"));

  // TODO: This test should be in a generic test file for the scrollbar styles
  it(`should have the ${SCROLLABLE_CLASS} class to properly style the scrollbars`, () =>
    expect(codeRef.className).toContain(SCROLLABLE_CLASS));

  it('the internal <code> should inherit the font styles ("font: inherit")', async () => {
    const cssRules = await page.evaluate(() =>
      [
        ...document.querySelector("ch-code").shadowRoot.adoptedStyleSheets[0]
          .cssRules
      ].map(rule => rule.cssText)
    );

    expect(cssRules).toContain("code { font: inherit; contain: inline-size; }");
    expect(internalCodeComputedStyle.font).toContain("monospace");
  });

  it('the internal <code> should have "contain: inline-size" to avoid overflowing the x-axis', () =>
    expect(internalCodeComputedStyle.contain).toBe("inline-size"));
});
