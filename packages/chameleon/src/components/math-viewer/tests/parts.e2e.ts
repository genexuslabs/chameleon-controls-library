import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../math-viewer.lit.js";
import type { ChMathViewer } from "../math-viewer.lit.js";

describe("[ch-math-viewer][parts]", () => {
  afterEach(cleanup);

  describe("error part", () => {
    it("should expose an error part when KaTeX fails to parse", async () => {
      const result = render(
        html`<ch-math-viewer
          .value=${"\\invalidcommandthatdoesnotexist{"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorPart = ref.shadowRoot!.querySelector('[part="error"]');
      expect(errorPart).toBeTruthy();
      expect(errorPart!.tagName.toLowerCase()).toBe("span");
    });

    it("should not expose any error part when LaTeX is valid", async () => {
      const result = render(
        html`<ch-math-viewer .value=${"x^2"}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorPart = ref.shadowRoot!.querySelector('[part="error"]');
      expect(errorPart).toBeNull();
    });

    it("should render multiple error parts for multiple invalid blocks", async () => {
      const multiInvalid =
        "\\invalidcommandthatdoesnotexist{\n\n\\anotherinvalidcmd{";
      const result = render(
        html`<ch-math-viewer .value=${multiInvalid}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorParts = ref.shadowRoot!.querySelectorAll('[part="error"]');
      expect(errorParts.length).toBe(2);
    });

    it("should only render error part on the failed block in a mixed scenario", async () => {
      const mixedValue = "a + b\n\n\\invalidcommandthatdoesnotexist{";
      const result = render(
        html`<ch-math-viewer .value=${mixedValue}></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorParts = ref.shadowRoot!.querySelectorAll('[part="error"]');
      expect(errorParts.length).toBe(1);

      // The valid block should be rendered in a div
      const divs = ref.shadowRoot!.querySelectorAll("div");
      expect(divs.length).toBe(1);
    });

    it("error part span should have the katex class for styling", async () => {
      const result = render(
        html`<ch-math-viewer
          .value=${"\\invalidcommandthatdoesnotexist{"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorPart = ref.shadowRoot!.querySelector('[part="error"]');
      expect(errorPart!.classList.contains("katex")).toBe(true);
    });

    it("error part should carry accessibility attributes", async () => {
      const result = render(
        html`<ch-math-viewer
          .value=${"\\invalidcommandthatdoesnotexist{"}
        ></ch-math-viewer>`
      );
      const ref = result.container.querySelector(
        "ch-math-viewer"
      )! as ChMathViewer;
      await ref.updateComplete;

      const errorPart = ref.shadowRoot!.querySelector('[part="error"]');

      // Both aria-description and title should be set to the error message
      expect(errorPart!.hasAttribute("aria-description")).toBe(true);
      expect(errorPart!.hasAttribute("title")).toBe(true);
      expect(errorPart!.getAttribute("aria-description")).toBe(
        errorPart!.getAttribute("title")
      );
    });
  });
});
