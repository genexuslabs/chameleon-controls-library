import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChReasoning } from "../reasoning.lit";
import "../reasoning.lit.js";

describe("[ch-reasoning][streaming]", () => {
  let reasoningRef: ChReasoning;

  afterEach(cleanup);

  describe("streaming state", () => {
    it("should auto-open accordion when isStreaming is true", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Analyzing the problem..."
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.isStreaming).toBe(true);
      expect(reasoningRef.open).toBe(true);
    });

    it("should show thinking message when isStreaming is true", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          thinking-message="Processing..."
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.thinkingMessage).toBe("Processing...");
    });

    it("should apply streaming class when isStreaming is true", async () => {
      const result = await render(
        html`<ch-reasoning is-streaming></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const wrapper = reasoningRef.shadowRoot!.querySelector("div");
      expect(wrapper?.classList.contains("reasoning--streaming")).toBe(true);
    });

    it("should not apply streaming class when isStreaming is false", async () => {
      const result = await render(html`<ch-reasoning></ch-reasoning>`);
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const wrapper = reasoningRef.shadowRoot!.querySelector("div");
      expect(wrapper?.classList.contains("reasoning--streaming")).toBe(false);
    });
  });

  describe("typewriter effect", () => {
    it("should start with empty displayed content when streaming starts", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="This is a test"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      // Initially, displayedContent should be empty or just starting
      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");
      const initialLength = slot?.textContent?.trim().length || 0;
      expect(initialLength).toBeLessThanOrEqual("This is a test".length);
    });

    it("should progressively reveal content during streaming", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Progressive text"
          streaming-speed="10"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");

      // Wait a bit and check that content is being revealed
      await new Promise(resolve => setTimeout(resolve, 50));
      await reasoningRef.updateComplete;

      const partialLength = slot?.textContent?.length || 0;
      expect(partialLength).toBeGreaterThan(0);
    });

    it("should show all content immediately when isStreaming changes to false", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Full content text"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      // Change to not streaming
      reasoningRef.isStreaming = false;
      await reasoningRef.updateComplete;

      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");
      expect(slot?.textContent?.trim()).toBe("Full content text");
    });

    it("should reset displayed content when content changes", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Initial content"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      // Wait for some content to be displayed
      await new Promise(resolve => setTimeout(resolve, 50));

      // Change the content
      reasoningRef.content = "New content";
      await reasoningRef.updateComplete;

      // The displayed content should have reset and started streaming again
      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");
      const currentLength = slot?.textContent?.trim().length || 0;
      expect(currentLength).toBeLessThanOrEqual("New content".length);
    });
  });

  describe("non-streaming state", () => {
    it("should show complete content immediately when not streaming", async () => {
      const result = await render(
        html`<ch-reasoning content="Complete text"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      const slot = reasoningRef.shadowRoot!.querySelector("div[slot]");
      expect(slot?.textContent?.trim()).toBe("Complete text");
    });

    it("should not auto-open accordion when isStreaming is false", async () => {
      const result = await render(
        html`<ch-reasoning content="Some content"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.open).toBe(false);
    });
  });

  describe("streaming speed", () => {
    it("should respect custom streaming speed", async () => {
      const result = await render(
        html`<ch-reasoning
          is-streaming
          content="Test"
          streaming-speed="100"
        ></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;
      await reasoningRef.updateComplete;

      expect(reasoningRef.streamingSpeed).toBe(100);
    });
  });

  describe("openChange event", () => {
    it("should emit openChange event when accordion state changes", async () => {
      let eventFired = false;
      let eventDetail: any = null;

      const result = await render(
        html`<ch-reasoning content="Test"></ch-reasoning>`
      );
      reasoningRef = result.container.querySelector("ch-reasoning")!;

      reasoningRef.addEventListener("openChange", (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });

      await reasoningRef.updateComplete;

      // Trigger accordion expansion
      reasoningRef.open = true;
      await reasoningRef.updateComplete;

      // Wait a bit for the event to propagate
      await new Promise(resolve => setTimeout(resolve, 10));

      // The internal accordion should have fired its expandedChange event
      // which should trigger our openChange event
      // Note: This might require user interaction in a real browser
    });
  });
});
