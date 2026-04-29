import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChChainOfThought } from "../chain-of-thought.lit";
import "../chain-of-thought.lit.js";
import type {
  ChainOfThoughtStep,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage
} from "../types";

const SIMPLE_STEPS: ChainOfThoughtStep[] = [
  {
    id: "step-1",
    label: "Understanding the problem",
    description: "Analyzing the user's request",
    icon: "🔍",
    status: "complete"
  },
  {
    id: "step-2",
    label: "Searching for information",
    description: "Looking for relevant data",
    status: "active"
  },
  {
    id: "step-3",
    label: "Generating response",
    status: "pending"
  }
];

const SEARCH_RESULTS: ChainOfThoughtSearchResult[] = [
  { id: "result-1", url: "https://example.com/1", label: "Example 1" },
  { id: "result-2", url: "https://example.com/2", label: "Example 2" }
];

const IMAGES: ChainOfThoughtImage[] = [
  {
    id: "img-1",
    src: "https://via.placeholder.com/150",
    alt: "Placeholder image",
    caption: "Figure 1: Example diagram"
  }
];

describe("[ch-chain-of-thought][basic]", () => {
  let componentRef: ChChainOfThought;

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-chain-of-thought></ch-chain-of-thought>`);
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(componentRef.shadowRoot).toBeTruthy();
    });

    it("should render ch-accordion-render internally", () => {
      const accordion = componentRef.shadowRoot!.querySelector("ch-accordion-render");
      expect(accordion).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-chain-of-thought></ch-chain-of-thought>`);
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it('the "open" property should be false by default', () => {
      expect(componentRef.open).toBe(false);
    });

    it('the "defaultOpen" property should be false by default', () => {
      expect(componentRef.defaultOpen).toBe(false);
    });

    it('the "steps" property should be an empty array by default', () => {
      expect(componentRef.steps).toEqual([]);
    });

    it('the "searchResults" property should be an empty array by default', () => {
      expect(componentRef.searchResults).toEqual([]);
    });

    it('the "images" property should be an empty array by default', () => {
      expect(componentRef.images).toEqual([]);
    });
  });

  describe("steps rendering", () => {
    it("should render steps when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      expect(stepsContainer).toBeTruthy();

      const stepElements = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepElements.length).toBe(3);
    });

    it("should render step labels correctly", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const labels = componentRef.shadowRoot!.querySelectorAll(".step-label");
      expect(labels[0].textContent).toBe("Understanding the problem");
      expect(labels[1].textContent).toBe("Searching for information");
      expect(labels[2].textContent).toBe("Generating response");
    });

    it("should render step descriptions when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const descriptions = componentRef.shadowRoot!.querySelectorAll(".step-description");
      expect(descriptions.length).toBe(2); // Only first two steps have descriptions
      expect(descriptions[0].textContent).toBe("Analyzing the user's request");
      expect(descriptions[1].textContent).toBe("Looking for relevant data");
    });

    it("should render step icons when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const icons = componentRef.shadowRoot!.querySelectorAll(".step-icon");
      expect(icons.length).toBe(3);
      expect(icons[0].textContent).toContain("🔍");
    });

    it("should apply correct status part attributes", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const steps = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(steps[0].getAttribute("part")).toContain("step-status--complete");
      expect(steps[1].getAttribute("part")).toContain("step-status--active");
      expect(steps[2].getAttribute("part")).toContain("step-status--pending");
    });
  });

  describe("search results rendering", () => {
    it("should render search results when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${SEARCH_RESULTS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const searchResultsContainer = componentRef.shadowRoot!.querySelector(".search-results");
      expect(searchResultsContainer).toBeTruthy();

      const searchResultElements = componentRef.shadowRoot!.querySelectorAll("[part~='search-result']");
      expect(searchResultElements.length).toBe(2);
    });

    it("should render search result links with correct URLs", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${SEARCH_RESULTS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const links = componentRef.shadowRoot!.querySelectorAll("a[part~='search-result']");
      expect(links[0].getAttribute("href")).toBe("https://example.com/1");
      expect(links[1].getAttribute("href")).toBe("https://example.com/2");
    });

    it("should render search result labels", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${SEARCH_RESULTS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const links = componentRef.shadowRoot!.querySelectorAll("a[part~='search-result']");
      expect(links[0].textContent).toBe("Example 1");
      expect(links[1].textContent).toBe("Example 2");
    });

    it("should not render search results container when empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought .searchResults=${[]}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const searchResultsContainer = componentRef.shadowRoot!.querySelector(".search-results");
      expect(searchResultsContainer).toBeFalsy();
    });
  });

  describe("images rendering", () => {
    it("should render images when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${IMAGES}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");
      expect(imagesContainer).toBeTruthy();

      const imageContainers = componentRef.shadowRoot!.querySelectorAll("[part~='image-container']");
      expect(imageContainers.length).toBe(1);
    });

    it("should render image with correct src and alt attributes", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${IMAGES}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const img = componentRef.shadowRoot!.querySelector("img[part~='image']") as HTMLImageElement;
      expect(img.src).toBe("https://via.placeholder.com/150");
      expect(img.alt).toBe("Placeholder image");
    });

    it("should render image caption when provided", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${IMAGES}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const caption = componentRef.shadowRoot!.querySelector(".image-caption");
      expect(caption).toBeTruthy();
      expect(caption!.textContent).toBe("Figure 1: Example diagram");
    });

    it("should not render images container when empty", async () => {
      const result = await render(
        html`<ch-chain-of-thought .images=${[]}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");
      expect(imagesContainer).toBeFalsy();
    });
  });

  describe("mixed content scenarios", () => {
    it("should render all content types together", async () => {
      const result = await render(
        html`<ch-chain-of-thought
          .steps=${SIMPLE_STEPS}
          .searchResults=${SEARCH_RESULTS}
          .images=${IMAGES}
        ></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      const searchResultsContainer = componentRef.shadowRoot!.querySelector(".search-results");
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");

      expect(stepsContainer).toBeTruthy();
      expect(searchResultsContainer).toBeTruthy();
      expect(imagesContainer).toBeTruthy();
    });

    it("should render correctly with only steps", async () => {
      const result = await render(
        html`<ch-chain-of-thought .steps=${SIMPLE_STEPS}></ch-chain-of-thought>`
      );
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;

      const stepsContainer = componentRef.shadowRoot!.querySelector(".steps-container");
      const searchResultsContainer = componentRef.shadowRoot!.querySelector(".search-results");
      const imagesContainer = componentRef.shadowRoot!.querySelector(".images-container");

      expect(stepsContainer).toBeTruthy();
      expect(searchResultsContainer).toBeFalsy();
      expect(imagesContainer).toBeFalsy();
    });
  });

  describe("property updates", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-chain-of-thought></ch-chain-of-thought>`);
      componentRef = result.container.querySelector("ch-chain-of-thought")!;
      await componentRef.updateComplete;
    });

    it("should update steps when property changes", async () => {
      componentRef.steps = SIMPLE_STEPS;
      await componentRef.updateComplete;

      const stepElements = componentRef.shadowRoot!.querySelectorAll("[part~='step']");
      expect(stepElements.length).toBe(3);
    });

    it("should update search results when property changes", async () => {
      componentRef.searchResults = SEARCH_RESULTS;
      await componentRef.updateComplete;

      const searchResultElements = componentRef.shadowRoot!.querySelectorAll("[part~='search-result']");
      expect(searchResultElements.length).toBe(2);
    });

    it("should update images when property changes", async () => {
      componentRef.images = IMAGES;
      await componentRef.updateComplete;

      const imageElements = componentRef.shadowRoot!.querySelectorAll("[part~='image']");
      expect(imageElements.length).toBe(1);
    });
  });
});
