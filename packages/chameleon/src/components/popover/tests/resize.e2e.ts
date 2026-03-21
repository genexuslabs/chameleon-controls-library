import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import "../popover.lit.js";
import type { ChPopover } from "../popover.lit.js";

describe("[ch-popover][resize]", () => {
  afterEach(cleanup);

  it("should render resize edges when resizable=true and show=true", async () => {
    render(html`
      <button id="trigger" type="button">Open</button>
      <ch-popover popover="manual" .resizable=${true} .show=${true}>
        <p>Content</p>
      </ch-popover>
    `);
    const popoverRef = document.querySelector("ch-popover")! as ChPopover;
    const triggerBtn = document.querySelector("#trigger") as HTMLButtonElement;
    popoverRef.actionElement = triggerBtn;
    await popoverRef.updateComplete;

    const shadowRoot = popoverRef.shadowRoot!;

    // Check all 4 edges exist
    expect(shadowRoot.querySelector(".edge__block-start")).toBeTruthy();
    expect(shadowRoot.querySelector(".edge__inline-end")).toBeTruthy();
    expect(shadowRoot.querySelector(".edge__block-end")).toBeTruthy();
    expect(shadowRoot.querySelector(".edge__inline-start")).toBeTruthy();

    // Check all 4 corners exist
    expect(
      shadowRoot.querySelector(".corner__block-start-inline-start")
    ).toBeTruthy();
    expect(
      shadowRoot.querySelector(".corner__block-start-inline-end")
    ).toBeTruthy();
    expect(
      shadowRoot.querySelector(".corner__block-end-inline-start")
    ).toBeTruthy();
    expect(
      shadowRoot.querySelector(".corner__block-end-inline-end")
    ).toBeTruthy();

    // Check the resize layer exists
    expect(shadowRoot.querySelector(".resize-layer")).toBeTruthy();
  });

  it("should NOT render resize edges when resizable=false", async () => {
    render(html`
      <button id="trigger" type="button">Open</button>
      <ch-popover popover="manual" .resizable=${false} .show=${true}>
        <p>Content</p>
      </ch-popover>
    `);
    const popoverRef = document.querySelector("ch-popover")! as ChPopover;
    const triggerBtn = document.querySelector("#trigger") as HTMLButtonElement;
    popoverRef.actionElement = triggerBtn;
    await popoverRef.updateComplete;

    const shadowRoot = popoverRef.shadowRoot!;

    expect(shadowRoot.querySelector(".edge__block-start")).toBeNull();
    expect(shadowRoot.querySelector(".edge__inline-end")).toBeNull();
    expect(shadowRoot.querySelector(".edge__block-end")).toBeNull();
    expect(shadowRoot.querySelector(".edge__inline-start")).toBeNull();
    expect(shadowRoot.querySelector(".resize-layer")).toBeNull();
  });

  it("should NOT render resize edges when resizable=true but show=false", async () => {
    render(html`
      <ch-popover popover="manual" .resizable=${true} .show=${false}>
        <p>Content</p>
      </ch-popover>
    `);
    const popoverRef = document.querySelector("ch-popover")! as ChPopover;
    await popoverRef.updateComplete;

    const shadowRoot = popoverRef.shadowRoot!;

    expect(shadowRoot.querySelector(".edge__block-start")).toBeNull();
    expect(shadowRoot.querySelector(".resize-layer")).toBeNull();
  });

  it("should render resize edges when resizable and show become true dynamically", async () => {
    render(html`
      <button id="trigger" type="button">Open</button>
      <ch-popover popover="manual">
        <p>Content</p>
      </ch-popover>
    `);
    const popoverRef = document.querySelector("ch-popover")! as ChPopover;
    const triggerBtn = document.querySelector("#trigger") as HTMLButtonElement;
    popoverRef.actionElement = triggerBtn;
    await popoverRef.updateComplete;

    // Initially no resize edges
    expect(popoverRef.shadowRoot!.querySelector(".edge__block-start")).toBeNull();

    // Enable resizable and show
    popoverRef.resizable = true;
    popoverRef.show = true;
    await popoverRef.updateComplete;

    expect(
      popoverRef.shadowRoot!.querySelector(".edge__block-start")
    ).toBeTruthy();
    expect(
      popoverRef.shadowRoot!.querySelector(".resize-layer")
    ).toBeTruthy();
  });
});
