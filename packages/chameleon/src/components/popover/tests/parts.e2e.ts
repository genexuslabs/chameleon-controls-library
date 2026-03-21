import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import "../popover.lit.js";
import type { ChPopover } from "../popover.lit.js";

describe("[ch-popover][parts]", () => {
  afterEach(cleanup);

  describe("header part", () => {
    it("should render a header part when allowDrag is 'header'", async () => {
      render(html`
        <button id="trigger" type="button">Open</button>
        <ch-popover popover="manual" allow-drag="header">
          <span slot="header">Header content</span>
          <p>Body content</p>
        </ch-popover>
      `);
      const popoverRef = document.querySelector("ch-popover")! as ChPopover;
      await popoverRef.updateComplete;

      const headerPart = popoverRef.shadowRoot!.querySelector("[part='header']");
      expect(headerPart).toBeTruthy();
    });

    it("should render a header slot when allowDrag is 'header'", async () => {
      render(html`
        <ch-popover popover="manual" allow-drag="header">
          <span slot="header">Header</span>
        </ch-popover>
      `);
      const popoverRef = document.querySelector("ch-popover")! as ChPopover;
      await popoverRef.updateComplete;

      const headerSlot = popoverRef.shadowRoot!.querySelector(
        "slot[name='header']"
      );
      expect(headerSlot).toBeTruthy();
    });

    it("should NOT render a header part when allowDrag is 'no'", async () => {
      render(html`<ch-popover popover="manual" allow-drag="no"></ch-popover>`);
      const popoverRef = document.querySelector("ch-popover")! as ChPopover;
      await popoverRef.updateComplete;

      const headerPart = popoverRef.shadowRoot!.querySelector("[part='header']");
      expect(headerPart).toBeNull();
    });

    it("should NOT render a header part when allowDrag is 'box'", async () => {
      render(html`<ch-popover popover="manual" allow-drag="box"></ch-popover>`);
      const popoverRef = document.querySelector("ch-popover")! as ChPopover;
      await popoverRef.updateComplete;

      const headerPart = popoverRef.shadowRoot!.querySelector("[part='header']");
      expect(headerPart).toBeNull();
    });

    it("should NOT render a header part by default (allowDrag defaults to 'no')", async () => {
      render(html`<ch-popover></ch-popover>`);
      const popoverRef = document.querySelector("ch-popover")! as ChPopover;
      await popoverRef.updateComplete;

      const headerPart = popoverRef.shadowRoot!.querySelector("[part='header']");
      expect(headerPart).toBeNull();
    });
  });
});
