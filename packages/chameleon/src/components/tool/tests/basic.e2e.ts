import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChTool } from "../tool.lit";
import "../tool.lit.js";

describe("[ch-tool][basic]", () => {
  let toolRef: ChTool;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-tool></ch-tool>`);
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(toolRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-tool></ch-tool>`);
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it('the "toolName" property should be empty string by default', () => {
      expect(toolRef.toolName).toBe("");
    });

    it('the "type" property should be empty string by default', () => {
      expect(toolRef.type).toBe("");
    });

    it('the "state" property should be "input-available" by default', () => {
      expect(toolRef.state).toBe("input-available");
    });

    it('the "input" property should be null by default', () => {
      expect(toolRef.input).toBeNull();
    });

    it('the "output" property should be null by default', () => {
      expect(toolRef.output).toBeNull();
    });

    it('the "errorText" property should be empty string by default', () => {
      expect(toolRef.errorText).toBe("");
    });

    it('the "defaultOpen" property should be false by default', () => {
      expect(toolRef.defaultOpen).toBe(false);
    });

    it('the "toolCallId" property should be empty string by default', () => {
      expect(toolRef.toolCallId).toBe("");
    });
  });

  describe("rendering", () => {
    it("should render the accordion component", async () => {
      const result = await render(
        html`<ch-tool tool-name="test-tool"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      const accordion = toolRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();
    });

    it("should display tool name", async () => {
      const result = await render(
        html`<ch-tool tool-name="web_search"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.toolName).toBe("web_search");
    });

    it("should render input parameters when provided", async () => {
      const input = { query: "test search", maxResults: 10 };
      const result = await render(
        html`<ch-tool tool-name="search" .input=${input}></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.input).toEqual(input);
      // ch-code component should be rendered
      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
    });

    it("should render output when provided", async () => {
      const output = { results: ["result1", "result2"] };
      const result = await render(
        html`<ch-tool
          tool-name="search"
          state="output-available"
          .output=${output}
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.output).toEqual(output);
      // ch-code component should be rendered
      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      expect(codeElements.length).toBeGreaterThan(0);
    });

    it("should render error text when in error state", async () => {
      const errorText = "Connection timeout";
      const result = await render(
        html`<ch-tool
          tool-name="api-call"
          state="output-error"
          error-text=${errorText}
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.errorText).toBe(errorText);
      const errorElement = toolRef.shadowRoot!.querySelector(
        ".tool__error-text"
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent?.trim()).toBe(errorText);
    });
  });

  describe("defaultOpen property", () => {
    it("should start collapsed when defaultOpen is false", async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test"
          .defaultOpen=${false}
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.defaultOpen).toBe(false);
    });

    it("should start expanded when defaultOpen is true", async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test"
          .defaultOpen=${true}
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.defaultOpen).toBe(true);
    });
  });

  describe("state changes", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool tool-name="test-tool"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should update badge when state changes", async () => {
      expect(toolRef.state).toBe("input-available");

      toolRef.state = "output-available";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("output-available");
    });

    it("should render confirmation when state is approval-requested", async () => {
      toolRef.state = "approval-requested";
      await toolRef.updateComplete;

      const confirmation = toolRef.shadowRoot!.querySelector(
        "ch-confirmation"
      );
      expect(confirmation).toBeTruthy();
    });

    it("should not render confirmation when state is not approval-requested", async () => {
      toolRef.state = "output-available";
      await toolRef.updateComplete;

      const confirmation = toolRef.shadowRoot!.querySelector(
        "ch-confirmation"
      );
      expect(confirmation).toBeNull();
    });
  });

  describe("type property", () => {
    it("should accept custom type", async () => {
      const result = await render(
        html`<ch-tool tool-name="test" type="function"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;

      expect(toolRef.type).toBe("function");
    });
  });
});
