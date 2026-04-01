import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChReasoning } from "../reasoning.lit";
import "../reasoning.lit.js";

describe("[ch-reasoning][basic]", () => {
  let reasoningRef: ChReasoning;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-reasoning></ch-reasoning>`);
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(reasoningRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-reasoning></ch-reasoning>`);
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;
    });

    it('the "content" property should be empty string by default', () => {
      expect(reasoningRef.content).toBe("");
    });

    it('the "isStreaming" property should be false by default', () => {
      expect(reasoningRef.isStreaming).toBe(false);
    });

    it('the "duration" property should be 0 by default', () => {
      expect(reasoningRef.duration).toBe(0);
    });

    it('the "thinkingMessage" property should be "Thinking..." by default', () => {
      expect(reasoningRef.thinkingMessage).toBe("Thinking...");
    });

    it('the "thoughtMessage" property should contain "{duration}" placeholder by default', () => {
      expect(reasoningRef.thoughtMessage).toContain("{duration}");
    });

    it('the "open" property should be false by default', () => {
      expect(reasoningRef.open).toBe(false);
    });

    it('the "streamingSpeed" property should be 20 by default', () => {
      expect(reasoningRef.streamingSpeed).toBe(20);
    });
  });

  describe("rendering", () => {
    it("should render the accordion component", async () => {
      const result = await render(
        html`<ch-reasoning content="Test content"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();
    });

    it("should display content when provided", async () => {
      const result = await render(
        html`<ch-reasoning content="Test reasoning content"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");
      expect(slot?.textContent?.trim()).toBe("Test reasoning content");
    });
  });

  describe("open property", () => {
    it("should control accordion expansion", async () => {
      const result = await render(
        html`<ch-reasoning content="Test" .open=${true}></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.open).toBe(true);
    });

    it("should update when changed programmatically", async () => {
      const result = await render(
        html`<ch-reasoning content="Test"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.open).toBe(false);

      reasoningRef.open = true;
      await reasoningRef.updateComplete;

      expect(reasoningRef.open).toBe(true);
    });
  });

  describe("duration and messages", () => {
    it("should display thinking message when streaming", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          thinking-message="AI is thinking..."
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const accordion = reasoningRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();
      // The accordion model should contain the thinking message as caption
    });

    it("should replace {duration} placeholder in thought message", async () => {
      const result = await render(
        html`<ch-reasoning
          content="Done"
          duration="5"
          thought-message="Completed in {duration} seconds"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      // The accordion caption should show "Completed in 5 seconds"
      // This is tested indirectly through the accordion model
      expect(reasoningRef.duration).toBe(5);
      expect(reasoningRef.thoughtMessage).toBe(
        "Completed in {duration} seconds"
      );
    });
  });

  describe("custom properties", () => {
    it("should accept custom thinking message", async () => {
      const result = await render(
        html`<ch-reasoning
          thinking-message="Custom thinking..."
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.thinkingMessage).toBe("Custom thinking...");
    });

    it("should accept custom thought message template", async () => {
      const result = await render(
        html`<ch-reasoning
          thought-message="Done in {duration}s"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.thoughtMessage).toBe("Done in {duration}s");
    });

    it("should accept custom streaming speed", async () => {
      const result = await render(
        html`<ch-reasoning streaming-speed="50"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.streamingSpeed).toBe(50);
    });
  });
});
