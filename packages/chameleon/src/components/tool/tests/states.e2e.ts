import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChTool } from "../tool.lit";
import "../tool.lit.js";
import type { ToolState } from "../types";

describe("[ch-tool][states]", () => {
  let toolRef: ChTool;

  afterEach(cleanup);

  describe("badge rendering for each state", () => {
    const states: Array<{ state: ToolState; expectedLabel: string }> = [
      { state: "input-streaming", expectedLabel: "Pending" },
      { state: "input-available", expectedLabel: "Running" },
      { state: "approval-requested", expectedLabel: "Awaiting Approval" },
      { state: "approval-responded", expectedLabel: "Responded" },
      { state: "output-available", expectedLabel: "Completed" },
      { state: "output-error", expectedLabel: "Error" },
      { state: "output-denied", expectedLabel: "Denied" }
    ];

    states.forEach(({ state, expectedLabel }) => {
      it(`should render "${expectedLabel}" badge for state "${state}"`, async () => {
        const result = await render(
          html`<ch-tool tool-name="test" state=${state}></ch-tool>`
        );
        toolRef = result.container.querySelector("ch-tool")!;
        await toolRef.updateComplete;

        expect(toolRef.state).toBe(state);

        const badge = toolRef.shadowRoot!.querySelector(".tool__badge");
        expect(badge).toBeTruthy();
        expect(badge?.textContent?.trim()).toBe(expectedLabel);
      });

      it(`should have correct CSS class for state "${state}"`, async () => {
        const result = await render(
          html`<ch-tool tool-name="test" state=${state}></ch-tool>`
        );
        toolRef = result.container.querySelector("ch-tool")!;
        await toolRef.updateComplete;

        const badge = toolRef.shadowRoot!.querySelector(".tool__badge");
        expect(badge).toBeTruthy();
        
        // Check that the badge has the state-specific class
        const badgeClasses = badge?.className || "";
        expect(badgeClasses).toContain("tool__badge");
      });
    });
  });

  describe("state-specific content rendering", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool tool-name="test-tool"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should render input section for input-streaming state", async () => {
      const input = { param: "value" };
      toolRef.state = "input-streaming";
      toolRef.input = input;
      await toolRef.updateComplete;

      const parametersSection = toolRef.shadowRoot!.querySelector(
        ".tool__section"
      );
      expect(parametersSection).toBeTruthy();
    });

    it("should render input section for input-available state", async () => {
      const input = { query: "test" };
      toolRef.state = "input-available";
      toolRef.input = input;
      await toolRef.updateComplete;

      const codeElement = toolRef.shadowRoot!.querySelector("ch-code");
      expect(codeElement).toBeTruthy();
    });

    it("should render confirmation for approval-requested state", async () => {
      toolRef.state = "approval-requested";
      await toolRef.updateComplete;

      const confirmation = toolRef.shadowRoot!.querySelector(
        "ch-confirmation"
      );
      expect(confirmation).toBeTruthy();
    });

    it("should not render confirmation for approval-responded state", async () => {
      toolRef.state = "approval-responded";
      await toolRef.updateComplete;

      const confirmation = toolRef.shadowRoot!.querySelector(
        "ch-confirmation"
      );
      expect(confirmation).toBeNull();
    });

    it("should render output section for output-available state", async () => {
      const output = { result: "success" };
      toolRef.state = "output-available";
      toolRef.output = output;
      await toolRef.updateComplete;

      const codeElements = toolRef.shadowRoot!.querySelectorAll("ch-code");
      // Should have at least one ch-code element for output
      expect(codeElements.length).toBeGreaterThan(0);
    });

    it("should render error section for output-error state", async () => {
      const errorText = "Something went wrong";
      toolRef.state = "output-error";
      toolRef.errorText = errorText;
      await toolRef.updateComplete;

      const errorElement = toolRef.shadowRoot!.querySelector(
        ".tool__error-text"
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement?.textContent?.trim()).toBe(errorText);
    });

    it("should render error message for output-denied state", async () => {
      const errorText = "Access denied";
      toolRef.state = "output-denied";
      toolRef.errorText = errorText;
      await toolRef.updateComplete;

      // Should show error text when denied
      const errorElement = toolRef.shadowRoot!.querySelector(
        ".tool__error-text"
      );
      expect(errorElement).toBeTruthy();
    });
  });

  describe("state transitions", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool tool-name="test-tool"></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should update from input-streaming to input-available", async () => {
      toolRef.state = "input-streaming";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("input-streaming");

      toolRef.state = "input-available";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("input-available");
    });

    it("should update from input-available to approval-requested", async () => {
      toolRef.state = "input-available";
      await toolRef.updateComplete;

      toolRef.state = "approval-requested";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("approval-requested");
      const confirmation = toolRef.shadowRoot!.querySelector(
        "ch-confirmation"
      );
      expect(confirmation).toBeTruthy();
    });

    it("should update from approval-requested to approval-responded", async () => {
      toolRef.state = "approval-requested";
      await toolRef.updateComplete;

      toolRef.state = "approval-responded";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("approval-responded");
    });

    it("should update from approval-responded to output-available", async () => {
      toolRef.state = "approval-responded";
      await toolRef.updateComplete;

      toolRef.state = "output-available";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("output-available");
    });

    it("should transition to output-error from any state", async () => {
      toolRef.state = "input-available";
      await toolRef.updateComplete;

      toolRef.state = "output-error";
      toolRef.errorText = "Error occurred";
      await toolRef.updateComplete;

      expect(toolRef.state).toBe("output-error");
      const badge = toolRef.shadowRoot!.querySelector(".tool__badge");
      expect(badge?.textContent?.trim()).toBe("Error");
    });
  });
});
