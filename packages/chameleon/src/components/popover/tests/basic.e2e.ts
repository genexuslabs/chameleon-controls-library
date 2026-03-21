import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import "../popover.lit.js";
import type { ChPopover } from "../popover.lit.js";

describe("[ch-popover][basic]", () => {
  let popoverRef: ChPopover;

  afterEach(cleanup);

  beforeEach(async () => {
    render(html`<ch-popover></ch-popover>`);
    popoverRef = document.querySelector("ch-popover")!;
    await popoverRef.updateComplete;
  });

  it("should have Shadow DOM", () => {
    expect(popoverRef.shadowRoot).toBeTruthy();
  });

  // Default property values
  it("should have 'actionById' default to false", () => {
    expect(popoverRef.actionById).toBe(false);
  });

  it("should have 'actionElement' default to undefined", () => {
    expect(popoverRef.actionElement).toBeUndefined();
  });

  it("should have 'allowDrag' default to 'no'", () => {
    expect(popoverRef.allowDrag).toBe("no");
  });

  it("should have 'blockAlign' default to 'center'", () => {
    expect(popoverRef.blockAlign).toBe("center");
  });

  it("should have 'blockSizeMatch' default to 'content'", () => {
    expect(popoverRef.blockSizeMatch).toBe("content");
  });

  it("should have 'closeOnClickOutside' default to false", () => {
    expect(popoverRef.closeOnClickOutside).toBe(false);
  });

  it("should have 'firstLayer' default to true", () => {
    expect(popoverRef.firstLayer).toBe(true);
  });

  it("should have 'inlineAlign' default to 'center'", () => {
    expect(popoverRef.inlineAlign).toBe("center");
  });

  it("should have 'inlineSizeMatch' default to 'content'", () => {
    expect(popoverRef.inlineSizeMatch).toBe("content");
  });

  it("should have 'mode' default to 'auto'", () => {
    expect(popoverRef.mode).toBe("auto");
  });

  it("should have 'overflowBehavior' default to 'overflow'", () => {
    expect(popoverRef.overflowBehavior).toBe("overflow");
  });

  it("should have 'positionTry' default to 'none'", () => {
    expect(popoverRef.positionTry).toBe("none");
  });

  it("should have 'resizable' default to false", () => {
    expect(popoverRef.resizable).toBe(false);
  });

  it("should have 'show' default to false", () => {
    expect(popoverRef.show).toBe(false);
  });

  // popover attribute reflects mode value
  it("should set the 'popover' attribute to match the 'mode' property", () => {
    expect(popoverRef.getAttribute("popover")).toBe("auto");
  });

  it("should update the 'popover' attribute when 'mode' changes", async () => {
    popoverRef.mode = "manual";
    await popoverRef.updateComplete;
    expect(popoverRef.getAttribute("popover")).toBe("manual");
  });

  // Default CSS custom properties
  it("should have correct default CSS custom property for '--ch-popover-block-size'", () => {
    const computedStyle = getComputedStyle(popoverRef);
    expect(computedStyle.getPropertyValue("--ch-popover-block-size").trim()).toBe("max-content");
  });

  it("should have correct default CSS custom property for '--ch-popover-inline-size'", () => {
    const computedStyle = getComputedStyle(popoverRef);
    expect(computedStyle.getPropertyValue("--ch-popover-inline-size").trim()).toBe("max-content");
  });

  it("should have correct default CSS custom property for '--ch-popover-separation-x'", () => {
    const computedStyle = getComputedStyle(popoverRef);
    expect(computedStyle.getPropertyValue("--ch-popover-separation-x").trim()).toBe("0px");
  });

  it("should have correct default CSS custom property for '--ch-popover-separation-y'", () => {
    const computedStyle = getComputedStyle(popoverRef);
    expect(computedStyle.getPropertyValue("--ch-popover-separation-y").trim()).toBe("0px");
  });

  it("should render a default slot", () => {
    const slot = popoverRef.shadowRoot!.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });
});
