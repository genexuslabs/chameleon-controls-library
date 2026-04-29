import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChainOfThought } from "../chain-of-thought.lit";
import "../chain-of-thought.lit.js";

describe("[ch-chain-of-thought][edge-cases]", () => {
  afterEach(cleanup);

  describe("empty arrays", () => {
    it("should render without errors when steps is empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${[]}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      expect(stepsContainer).toBeFalsy();
    });

    it("should render without errors when searchResults is empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${[]}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
      const searchResults = componentRef.shadowRoot!.querySelector(".search-results");
      expect(searchResults).toBeFalsy();
    });

    it("should render without errors when images is empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${[]}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");
      expect(imagesContainer).toBeFalsy();
    });

    it("should render accordion even with all empty arrays", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[]}
          .searchResults=${[]}
          .images=${[]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      expect(accordion).toBeTruthy();
    });
  });

  describe("undefined and null values", () => {
    it("should handle undefined steps gracefully", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${undefined as any}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
    });

    it("should handle undefined searchResults gracefully", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${undefined as any}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
    });

    it("should handle undefined images gracefully", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${undefined as any}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef).toBeTruthy();
    });
  });

  describe("optional properties", () => {
    it("should render step without description", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[
            { id: "s1", label: "Step without description", status: "complete" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const label = componentRef.shadowRoot!.querySelector(".step-label");
      expect(label!.textContent).toBe("Step without description");
      
      const description = componentRef.shadowRoot!.querySelector(".step-description");
      expect(description).toBeFalsy();
    });

    it("should render step without icon", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[
            { id: "s1", label: "Step without icon", status: "active" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const icon = componentRef.shadowRoot!.querySelector(".step-icon");
      expect(icon).toBeTruthy(); // Icon container should exist
      expect(icon!.textContent?.trim()).toBe(""); // But should be empty
    });

    it("should render search result without label", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .searchResults=${[
            { id: "r1", url: "https://example.com" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const link = componentRef.shadowRoot!.querySelector("a") as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.textContent).toBe("https://example.com"); // Should fall back to URL
    });

    it("should render image without caption", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .images=${[
            { id: "i1", src: "https://via.placeholder.com/150", alt: "Image" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const img = componentRef.shadowRoot!.querySelector("img");
      expect(img).toBeTruthy();
      
      const caption = componentRef.shadowRoot!.querySelector(".image-caption");
      expect(caption).toBeFalsy();
    });
  });

  describe("mixed content scenarios", () => {
    it("should render only steps when other arrays are empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[
            { id: "s1", label: "Only step", status: "complete" }
          ]}
          .searchResults=${[]}
          .images=${[]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      const searchResults = componentRef.shadowRoot!.querySelector(".search-results");
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");

      expect(stepsContainer).toBeTruthy();
      expect(searchResults).toBeFalsy();
      expect(imagesContainer).toBeFalsy();
    });

    it("should render only search results when other arrays are empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[]}
          .searchResults=${[
            { id: "r1", url: "https://example.com", label: "Result" }
          ]}
          .images=${[]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      const searchResults = componentRef.shadowRoot!.querySelector(".search-results");
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");

      expect(stepsContainer).toBeFalsy();
      expect(searchResults).toBeTruthy();
      expect(imagesContainer).toBeFalsy();
    });

    it("should render only images when other arrays are empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[]}
          .searchResults=${[]}
          .images=${[
            { id: "i1", src: "https://via.placeholder.com/150", alt: "Image" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      const searchResults = componentRef.shadowRoot!.querySelector(".search-results");
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");

      expect(stepsContainer).toBeFalsy();
      expect(searchResults).toBeFalsy();
      expect(imagesContainer).toBeTruthy();
    });
  });

  describe("large data sets", () => {
    it("should handle many steps", async () => {
      const manySteps = Array.from({ length: 50 }, (_, i) => ({
        id: `step-${i}`,
        label: `Step ${i}`,
        status: (i % 3 === 0 ? "complete" : i % 3 === 1 ? "active" : "pending") as any
      }));

      const result = await render(
        html`<ch-chain-of-thought .steps=${manySteps}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepElements = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepElements.length).toBe(50);
    });

    it("should handle many search results", async () => {
      const manyResults = Array.from({ length: 30 }, (_, i) => ({
        id: `result-${i}`,
        url: `https://example.com/${i}`,
        label: `Result ${i}`
      }));

      const result = await render(
        html`<ch-chain-of-thought .searchResults=${manyResults}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const resultElements = componentRef.shadowRoot!.querySelectorAll("[part~='search-result']");
      expect(resultElements.length).toBe(30);
    });

    it("should handle many images", async () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => ({
        id: `img-${i}`,
        src: `https://via.placeholder.com/150?text=Image${i}`,
        alt: `Image ${i}`
      }));

      const result = await render(
        html`<ch-chain-of-thought .images=${manyImages}></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const imageElements = componentRef.shadowRoot!.querySelectorAll("[part~='image']");
      expect(imageElements.length).toBe(20);
    });
  });

  describe("dynamic updates", () => {
    it("should update rendering when steps array is replaced", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[
            { id: "s1", label: "Step 1", status: "complete" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      let stepElements = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepElements.length).toBe(1);

      componentRef.steps = [
        { id: "s1", label: "Step 1", status: "complete" },
        { id: "s2", label: "Step 2", status: "active" },
        { id: "s3", label: "Step 3", status: "pending" }
      ];
      await componentRef.updateComplete;

      stepElements = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepElements.length).toBe(3);
    });

    it("should update rendering when arrays are cleared", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${[
            { id: "s1", label: "Step 1", status: "complete" }
          ]}
          .searchResults=${[
            { id: "r1", url: "https://example.com", label: "Result" }
          ]}
        ></ch-chain-of-thought>`
      );
      const componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      expect(componentRef.shadowRoot!.querySelector(".steps-container")).toBeTruthy();
      expect(componentRef.shadowRoot!.querySelector(".search-results")).toBeTruthy();

      componentRef.steps = [];
      componentRef.searchResults = [];
      await componentRef.updateComplete;

      expect(componentRef.shadowRoot!.querySelector(".steps-container")).toBeFalsy();
      expect(componentRef.shadowRoot!.querySelector(".search-results")).toBeFalsy();
    });
  });
});
