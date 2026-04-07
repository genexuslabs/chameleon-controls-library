import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChTool } from "../tool.lit";
import "../tool.lit.js";
import type { ToolApproveEvent, ToolRejectEvent } from "../types";

describe("[ch-tool][events]", () => {
  let toolRef: ChTool;

  afterEach(cleanup);

  describe("approve event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool
          tool-name="dangerous-operation"
          state="approval-requested"
          tool-call-id="call-123"
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should emit approve event when confirmation is approved", async () => {
      const handler = vi.fn();
      toolRef.addEventListener("approve", handler);

      // Find the ch-confirmation component and trigger approve
      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      expect(confirmation).toBeTruthy();

      // Simulate approve event from ch-confirmation
      confirmation!.dispatchEvent(new CustomEvent("approve"));
      await toolRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);

      const event = handler.mock.calls[0][0] as CustomEvent<ToolApproveEvent>;
      expect(event.detail).toEqual({ toolCallId: "call-123" });
    });

    it("should include correct toolCallId in approve event", async () => {
      const handler = vi.fn();
      toolRef.addEventListener("approve", handler);

      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      confirmation!.dispatchEvent(new CustomEvent("approve"));
      await toolRef.updateComplete;

      const event = handler.mock.calls[0][0] as CustomEvent<ToolApproveEvent>;
      expect(event.detail.toolCallId).toBe("call-123");
    });
  });

  describe("reject event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool
          tool-name="dangerous-operation"
          state="approval-requested"
          tool-call-id="call-456"
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should emit reject event when confirmation is rejected", async () => {
      const handler = vi.fn();
      toolRef.addEventListener("reject", handler);

      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      expect(confirmation).toBeTruthy();

      // Simulate reject event from ch-confirmation
      confirmation!.dispatchEvent(new CustomEvent("reject"));
      await toolRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);

      const event = handler.mock.calls[0][0] as CustomEvent<ToolRejectEvent>;
      expect(event.detail).toEqual({ toolCallId: "call-456" });
    });

    it("should include correct toolCallId in reject event", async () => {
      const handler = vi.fn();
      toolRef.addEventListener("reject", handler);

      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      confirmation!.dispatchEvent(new CustomEvent("reject"));
      await toolRef.updateComplete;

      const event = handler.mock.calls[0][0] as CustomEvent<ToolRejectEvent>;
      expect(event.detail.toolCallId).toBe("call-456");
    });
  });

  describe("expandedChange event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool tool-name="test-tool" .defaultOpen=${false}></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should emit expandedChange when accordion is toggled", async () => {
      const handler = vi.fn();
      toolRef.addEventListener("expandedChange", handler);

      // Find the accordion and trigger expandedChange
      const accordion = toolRef.shadowRoot!.querySelector(
        "ch-accordion-render"
      );
      expect(accordion).toBeTruthy();

      // Simulate expandedChange event from accordion
      accordion!.dispatchEvent(
        new CustomEvent("expandedChange", {
          detail: { id: "tool-item", expanded: true }
        })
      );
      await toolRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.expanded).toBe(true);
    });
  });

  describe("events should not fire when not in approval state", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test-tool"
          state="output-available"
          tool-call-id="call-789"
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should not render confirmation component when not in approval state", async () => {
      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      expect(confirmation).toBeNull();
    });
  });

  describe("multiple event listeners", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-tool
          tool-name="test-tool"
          state="approval-requested"
          tool-call-id="call-multiple"
        ></ch-tool>`
      );
      toolRef = result.container.querySelector("ch-tool")!;
      await toolRef.updateComplete;
    });

    it("should call all registered approve event handlers", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      toolRef.addEventListener("approve", handler1);
      toolRef.addEventListener("approve", handler2);

      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      confirmation!.dispatchEvent(new CustomEvent("approve"));
      await toolRef.updateComplete;

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should call all registered reject event handlers", async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      toolRef.addEventListener("reject", handler1);
      toolRef.addEventListener("reject", handler2);

      const confirmation = toolRef.shadowRoot!.querySelector("ch-confirmation");
      confirmation!.dispatchEvent(new CustomEvent("reject"));
      await toolRef.updateComplete;

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
