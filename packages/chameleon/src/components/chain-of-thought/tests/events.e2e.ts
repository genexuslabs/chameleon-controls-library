import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChainOfThought } from "../chain-of-thought.lit";
import "../chain-of-thought.lit.js";
import type { ChainOfThoughtStep, ChainOfThoughtOpenChangeEvent } from "../types";

const SIMPLE_STEPS: ChainOfThoughtStep[] = [
  {
    id: "step-1",
    label: "Step 1",
    status: "complete"
  }
];

describe("[ch-chain-of-thought][events]", () => {
  let componentRef: ChChainOfThought;

  afterEach(cleanup);

  describe("openChange event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should fire openChange event when accordion expands", async () => {
      const handler = vi.fn();
      componentRef.addEventListener("openChange", handler);

      // Find the accordion button and click it to expand
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      button.click();
      await componentRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<ChainOfThoughtOpenChangeEvent>;
      expect(event.detail.open).toBe(true);
    });

    it("should fire openChange event when accordion collapses", async () => {
      // First expand the accordion
      componentRef.open = true;
      await componentRef.updateComplete;

      const handler = vi.fn();
      componentRef.addEventListener("openChange", handler);

      // Find the accordion button and click it to collapse
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      button.click();
      await componentRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<ChainOfThoughtOpenChangeEvent>;
      expect(event.detail.open).toBe(false);
    });

    it("should update open property when openChange fires", async () => {
      expect(componentRef.open).toBe(false);

      // Find the accordion button and click it
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      button.click();
      await componentRef.updateComplete;

      expect(componentRef.open).toBe(true);
    });
  });

  describe("open property changes", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should expand accordion when open property is set to true", async () => {
      componentRef.open = true;
      await componentRef.updateComplete;

      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });

    it("should collapse accordion when open property is set to false", async () => {
      componentRef.open = true;
      await componentRef.updateComplete;

      componentRef.open = false;
      await componentRef.updateComplete;

      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("defaultOpen property", () => {
    it("should initialize with accordion expanded when defaultOpen is true", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${SIMPLE_STEPS}
          .defaultOpen=${true}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef.open).toBe(true);
      
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });

    it("should initialize with accordion collapsed when defaultOpen is false", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${SIMPLE_STEPS}
          .defaultOpen=${false}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef.open).toBe(false);
      
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      const button = accordion!.shadowRoot!.querySelector("button") as HTMLButtonElement;
      
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("open attribute reflection", () => {
    it("should reflect open property to attribute", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef.hasAttribute("open")).toBe(false);

      componentRef.open = true;
      await componentRef.updateComplete;

      expect(componentRef.hasAttribute("open")).toBe(true);
    });
  });
});
