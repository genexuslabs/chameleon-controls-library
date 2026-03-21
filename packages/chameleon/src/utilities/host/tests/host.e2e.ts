import { html } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import { Host } from "../host";

// Minimal custom element for testing
class TestHostElement extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
  }

  get updateComplete() {
    return Promise.resolve(true);
  }
}

if (!customElements.get("test-host-el")) {
  customElements.define("test-host-el", TestHostElement);
}

describe("[Host utility]", () => {
  let el: TestHostElement;

  afterEach(cleanup);

  // - - - - - - - - - - - - - - - - - - - - - - - -
  //                    Events
  // - - - - - - - - - - - - - - - - - - - - - - - -
  describe("events", () => {
    it("should add an event listener on the first call", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;
      const handler = vi.fn();

      Host(el as any, { events: { click: handler } });
      el.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should keep the event listener across multiple Host calls with the same handler reference", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;
      const handler = vi.fn();

      // First render
      Host(el as any, { events: { click: handler } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(1);

      // Second render (simulates re-render with same handler)
      Host(el as any, { events: { click: handler } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(2);

      // Third render
      Host(el as any, { events: { click: handler } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(3);
    });

    it("should swap event handlers when the handler reference changes", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      Host(el as any, { events: { click: handler1 } });
      el.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(0);

      // Swap handler
      Host(el as any, { events: { click: handler2 } });
      el.click();
      expect(handler1).toHaveBeenCalledTimes(1); // Not called again
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it("should remove an event listener when events become undefined", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;
      const handler = vi.fn();

      Host(el as any, { events: { click: handler } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(1);

      // Remove events
      Host(el as any, {});
      el.click();
      expect(handler).toHaveBeenCalledTimes(1); // Not called again
    });

    it("should handle conditional event listeners (null handler)", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;
      const handler = vi.fn();

      // With handler
      Host(el as any, { events: { click: handler } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(1);

      // Without handler (null/falsy value)
      Host(el as any, { events: { click: null as any } });
      el.click();
      expect(handler).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  // - - - - - - - - - - - - - - - - - - - - - - - -
  //                   Classes
  // - - - - - - - - - - - - - - - - - - - - - - - -
  describe("classes", () => {
    it("should add classes based on truthy values", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { class: { active: true, disabled: false } });

      expect(el.classList.contains("active")).toBe(true);
      expect(el.classList.contains("disabled")).toBe(false);
    });

    it("should toggle classes across renders", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { class: { active: true, disabled: false } });
      expect(el.classList.contains("active")).toBe(true);

      Host(el as any, { class: { active: false, disabled: true } });
      expect(el.classList.contains("active")).toBe(false);
      expect(el.classList.contains("disabled")).toBe(true);
    });

    it("should remove all classes when class becomes undefined", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { class: { active: true } });
      expect(el.classList.contains("active")).toBe(true);

      Host(el as any, {});
      expect(el.classList.contains("active")).toBe(false);
    });

    it("should preserve unchanged classes across renders", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { class: { active: true, primary: true } });
      Host(el as any, { class: { active: true, primary: true } });

      expect(el.classList.contains("active")).toBe(true);
      expect(el.classList.contains("primary")).toBe(true);
    });
  });

  // - - - - - - - - - - - - - - - - - - - - - - - -
  //                   Styles
  // - - - - - - - - - - - - - - - - - - - - - - - -
  describe("styles", () => {
    it("should set CSS custom properties", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { style: { "--my-var": "10px" } });
      expect(el.style.getPropertyValue("--my-var")).toBe("10px");
    });

    it("should update style values across renders", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { style: { "--my-var": "10px" } });
      expect(el.style.getPropertyValue("--my-var")).toBe("10px");

      Host(el as any, { style: { "--my-var": "20px" } });
      expect(el.style.getPropertyValue("--my-var")).toBe("20px");
    });

    it("should remove styles when style becomes undefined", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { style: { "--my-var": "10px" } });
      expect(el.style.getPropertyValue("--my-var")).toBe("10px");

      Host(el as any, {});
      expect(el.style.getPropertyValue("--my-var")).toBe("");
    });

    it("should preserve unchanged styles across renders", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, {
        style: { "--var-a": "1px", "--var-b": "2px" }
      });

      Host(el as any, {
        style: { "--var-a": "1px", "--var-b": "2px" }
      });

      expect(el.style.getPropertyValue("--var-a")).toBe("1px");
      expect(el.style.getPropertyValue("--var-b")).toBe("2px");
    });
  });

  // - - - - - - - - - - - - - - - - - - - - - - - -
  //                  Properties
  // - - - - - - - - - - - - - - - - - - - - - - - -
  describe("properties", () => {
    it("should set ARIA properties", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, {
        properties: { ariaLabel: "My label" }
      });
      expect(el.ariaLabel).toBe("My label");
    });

    it("should update properties across renders", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { properties: { ariaLabel: "Label 1" } });
      expect(el.ariaLabel).toBe("Label 1");

      Host(el as any, { properties: { ariaLabel: "Label 2" } });
      expect(el.ariaLabel).toBe("Label 2");
    });

    it("should remove properties when properties become undefined", () => {
      render(html`<test-host-el></test-host-el>`);
      el = document.querySelector("test-host-el")! as TestHostElement;

      Host(el as any, { properties: { ariaLabel: "My label" } });
      expect(el.ariaLabel).toBe("My label");

      Host(el as any, {});
      expect(el.ariaLabel).toBeNull();
    });
  });
});
