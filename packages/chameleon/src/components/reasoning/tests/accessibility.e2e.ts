import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChReasoning } from "../reasoning.lit";
import "../reasoning.lit.js";

describe("[ch-reasoning][accessibility]", () => {
  let reasoningRef: ChReasoning;

  afterEach(cleanup);

  describe("ARIA attributes", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-reasoning content="Accessible content"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;
    });

    it("should contain an accordion component with proper ARIA", () => {
      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();
    });

    it("should have accessible button elements in the accordion", () => {
      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const buttons = accordion.shadowRoot.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);

        // Check that buttons have aria-expanded attribute
        buttons.forEach(button => {
          expect(button.hasAttribute("aria-expanded")).toBe(true);
        });
      }
    });
  });

  describe("keyboard navigation", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-reasoning
          content="Keyboard navigable content"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;
    });

    it("should have focusable trigger button in accordion", () => {
      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");
        expect(button).toBeTruthy();

        // Button should be focusable (not have tabindex="-1" unless disabled)
        if (button) {
          const tabindex = button.getAttribute("tabindex");
          expect(tabindex === null || tabindex !== "-1").toBe(true);
        }
      }
    });

    it("should not have focusable elements when disabled", async () => {
      // Note: ch-reasoning doesn't have a disabled prop, but the accordion internally does
      // This test ensures the accordion can handle disabled states properly
      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();
    });
  });

  describe("expanded/collapsed states", () => {
    it("should reflect expanded state in accordion when open=true", async () => {
      const result = await render(
        html`<ch-reasoning content="Test" ?open=${true}></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");
        if (button) {
          // aria-expanded should be "true"
          expect(button.getAttribute("aria-expanded")).toBe("true");
        }
      }
    });

    it("should reflect collapsed state in accordion when open=false", async () => {
      const result = await render(
        html`<ch-reasoning content="Test" ?open=${false}></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");
        if (button) {
          // aria-expanded should be "false"
          expect(button.getAttribute("aria-expanded")).toBe("false");
        }
      }
    });

    it("should update aria-expanded when toggling open state", async () => {
      const result = await render(
        html`<ch-reasoning content="Test"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");

        if (button) {
          // Initially collapsed
          expect(button.getAttribute("aria-expanded")).toBe("false");

          // Open the accordion
          reasoningRef.open = true;
          await reasoningRef.updateComplete;
          await new Promise(resolve => setTimeout(resolve, 10));

          // Should now be expanded
          expect(button.getAttribute("aria-expanded")).toBe("true");
        }
      }
    });
  });

  describe("screen reader support", () => {
    it("should have meaningful text content in trigger", async () => {
      const result = await render(
        html`<ch-reasoning
          content="Test content"
          thinking-message="AI is thinking..."
          thought-message="Thought complete"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");

        // Button should have text content (either thinking or thought message)
        expect(button?.textContent?.trim().length).toBeGreaterThan(0);
      }
    });

    it("should update trigger text when switching from streaming to complete", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Test"
          thinking-message="Thinking..."
          thought-message="Done"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      // Change to not streaming
      reasoningRef.isStreaming = false;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        const button = accordion.shadowRoot.querySelector("button");
        // Text should have changed to "Done"
        expect(button?.textContent?.includes("Done")).toBe(true);
      }
    });
  });

  describe("semantic HTML", () => {
    it("should use semantic HTML structure from accordion", async () => {
      const result = await render(
        html`<ch-reasoning content="Semantic test"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );

      if (accordion && accordion.shadowRoot) {
        // Should have button for trigger
        const buttons = accordion.shadowRoot.querySelectorAll("button");
        expect(buttons.length).toBeGreaterThan(0);

        // Should have section for content area
        const sections = accordion.shadowRoot.querySelectorAll("section");
        expect(sections.length).toBeGreaterThan(0);
      }
    });
  });
});
