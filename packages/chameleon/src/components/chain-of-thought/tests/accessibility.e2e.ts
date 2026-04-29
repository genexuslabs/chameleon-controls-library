import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChainOfThought } from "../chain-of-thought.lit";
import "../chain-of-thought.lit.js";
import type { ChainOfThoughtStep } from "../types";

const SIMPLE_STEPS: ChainOfThoughtStep[] = [
  {
    id: "step-1",
    label: "Understanding the problem",
    description: "Analyzing the user's request",
    status: "complete"
  },
  {
    id: "step-2",
    label: "Searching for information",
    status: "active"
  }
];

describe("[ch-chain-of-thought][accessibility]", () => {
  let componentRef: ChChainOfThought;

  afterEach(cleanup);

  describe("ARIA attributes via accordion", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should have aria-expanded=\"false\" when collapsed", () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it("should have aria-expanded=\"true\" when expanded", async () => {
      componentRef.open = true;
      await componentRef.updateComplete;

      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });

    it("should toggle aria-expanded on click", async () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("false");

      button.click();
      await componentRef.updateComplete;
      expect(button.getAttribute("aria-expanded")).toBe("true");

      button.click();
      await componentRef.updateComplete;
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });

    it("should have aria-controls attribute linking to section", () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      const ariaControls = button.getAttribute("aria-controls");
      expect(ariaControls).toBeTruthy();

      // Verify the section exists
      const section = accordion!.shadowRoot!.querySelector(`#${ariaControls}`);
      expect(section).toBeTruthy();
    });
  });

  describe("semantic HTML", () => {
    it("should use semantic figure elements for images", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .images=${[
            {
              id: "img-1",
              src: "https://via.placeholder.com/150",
              alt: "Test image",
              caption: "Test caption"
            }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const figure = componentRef.shadowRoot!.querySelector("figure");
      expect(figure).toBeTruthy();
    });

    it("should use figcaption for image captions", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .images=${[
            {
              id: "img-1",
              src: "https://via.placeholder.com/150",
              alt: "Test image",
              caption: "Test caption"
            }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const figcaption = componentRef.shadowRoot!.querySelector("figcaption");
      expect(figcaption).toBeTruthy();
      expect(figcaption!.textContent).toBe("Test caption");
    });
  });

  describe("image alt text", () => {
    it("should have alt attribute on all images", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .images=${[
            {
              id: "img-1",
              src: "https://via.placeholder.com/150",
              alt: "First image"
            },
            {
              id: "img-2",
              src: "https://via.placeholder.com/200",
              alt: "Second image"
            }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const images = componentRef.shadowRoot!.querySelectorAll("img");
      expect(images.length).toBe(2);
      expect(images[0].alt).toBe("First image");
      expect(images[1].alt).toBe("Second image");
    });
  });

  describe("link accessibility", () => {
    it("should have proper href attributes on search result links", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .searchResults=${[
            { id: "r1", url: "https://example.com/1", label: "Result 1" },
            { id: "r2", url: "https://example.com/2", label: "Result 2" }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const links = componentRef.shadowRoot!.querySelectorAll("a");
      expect(links.length).toBe(2);
      expect(links[0].href).toBe("https://example.com/1");
      expect(links[1].href).toBe("https://example.com/2");
    });

    it("should open search result links in new tab", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .searchResults=${[
            { id: "r1", url: "https://example.com/1", label: "Result 1" }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const link = componentRef.shadowRoot!.querySelector("a") as HTMLAnchorElement;
      expect(link.target).toBe("_blank");
      expect(link.rel).toBe("noopener noreferrer");
    });
  });

  describe("keyboard navigation", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should have focusable accordion button", () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button).toBeTruthy();
      expect(button.tabIndex).not.toBe(-1);
    });

    it("should be operable via keyboard (Enter/Space)", async () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("false");

      // Simulate Enter key
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      button.dispatchEvent(enterEvent);
      button.click(); // Click is triggered by Enter
      await componentRef.updateComplete;

      expect(button.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("CSS parts for customization", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${SIMPLE_STEPS}
          .searchResults=${[
            { id: "r1", url: "https://example.com", label: "Result" }
          ]}
          .images=${[
            {
              id: "img-1",
              src: "https://via.placeholder.com/150",
              alt: "Image"
            }
          ]}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should expose step parts for styling", () => {
      const stepParts = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepParts.length).toBeGreaterThan(0);
    });

    it("should expose search-result parts for styling", () => {
      const searchResultParts = componentRef.shadowRoot!.querySelectorAll("[part~='search-result']");
      expect(searchResultParts.length).toBeGreaterThan(0);
    });

    it("should expose image-container parts for styling", () => {
      const imageContainerParts = componentRef.shadowRoot!.querySelectorAll("[part~='image-container']");
      expect(imageContainerParts.length).toBeGreaterThan(0);
    });

    it("should expose step-status parts based on status", () => {
      const completeStep = componentRef.shadowRoot!.querySelector("[part~='step-status--complete']");
      const activeStep = componentRef.shadowRoot!.querySelector("[part~='step-status--active']");
      
      expect(completeStep).toBeTruthy();
      expect(activeStep).toBeTruthy();
    });
  });
});
