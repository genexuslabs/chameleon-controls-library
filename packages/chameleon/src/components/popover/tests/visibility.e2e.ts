import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import "../popover.lit.js";
import type { ChPopover } from "../popover.lit.js";

describe("[ch-popover][visibility]", () => {
  let popoverRef: ChPopover;

  afterEach(cleanup);

  describe("default state (hidden)", () => {
    beforeEach(async () => {
      render(html`<ch-popover></ch-popover>`);
      popoverRef = document.querySelector("ch-popover")!;
      await popoverRef.updateComplete;
    });

    it("should be hidden by default", () => {
      // The native popover API hides elements that haven't been shown
      // The 'show' property should be false
      expect(popoverRef.show).toBe(false);
    });

    it("should not have the 'show' attribute by default", () => {
      expect(popoverRef.hasAttribute("show")).toBe(false);
    });
  });

  describe("visible state (show=true)", () => {
    beforeEach(async () => {
      render(html`
        <button id="trigger" type="button">Open</button>
        <ch-popover popover="manual">
          <p>Content</p>
        </ch-popover>
      `);
      popoverRef = document.querySelector("ch-popover")!;
      const triggerBtn = document.querySelector("#trigger") as HTMLButtonElement;
      popoverRef.actionElement = triggerBtn;
      await popoverRef.updateComplete;
    });

    it("should be visible when show is set to true", async () => {
      popoverRef.show = true;
      await popoverRef.updateComplete;

      expect(popoverRef.show).toBe(true);
      expect(popoverRef.hasAttribute("show")).toBe(true);
    });

    it("should hide when show is set back to false", async () => {
      popoverRef.show = true;
      await popoverRef.updateComplete;

      popoverRef.show = false;
      await popoverRef.updateComplete;

      expect(popoverRef.show).toBe(false);
      expect(popoverRef.hasAttribute("show")).toBe(false);
    });
  });

  describe("mode attribute", () => {
    it("should set the 'popover' attribute to 'auto' by default", async () => {
      render(html`<ch-popover></ch-popover>`);
      popoverRef = document.querySelector("ch-popover")!;
      await popoverRef.updateComplete;

      expect(popoverRef.getAttribute("popover")).toBe("auto");
    });

    it("should set the 'popover' attribute to 'manual' when mode is 'manual'", async () => {
      render(html`<ch-popover popover="manual"></ch-popover>`);
      popoverRef = document.querySelector("ch-popover")!;
      await popoverRef.updateComplete;

      expect(popoverRef.getAttribute("popover")).toBe("manual");
    });

    it("should update the 'popover' attribute when mode changes dynamically", async () => {
      render(html`<ch-popover></ch-popover>`);
      popoverRef = document.querySelector("ch-popover")!;
      await popoverRef.updateComplete;

      popoverRef.mode = "manual";
      await popoverRef.updateComplete;

      expect(popoverRef.getAttribute("popover")).toBe("manual");
    });
  });
});
