import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChPlan } from "../plan.lit";
import "../plan.lit.js";
import type { PlanStepModel } from "../types";

const SIMPLE_STEPS: PlanStepModel[] = [
  {
    id: "step-1",
    title: "Setup environment",
    description: "Install dependencies",
    subtasks: ["Install Node.js", "Install npm packages"],
    status: "completed"
  },
  {
    id: "step-2",
    title: "Implement feature",
    subtasks: ["Create component"],
    status: "in-progress"
  }
];

describe("[ch-plan][parts]", () => {
  let planRef: ChPlan;

  afterEach(cleanup);

  describe("plan parts", () => {
    it("should expose 'plan' part on root container", async () => {
      const result = await render(html`<ch-plan title="Test"></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const planElement = planRef.shadowRoot!.querySelector(".plan");
      expect(planElement?.getAttribute("part")).toContain("plan");
    });
  });

  describe("header parts", () => {
    it("should expose 'header' part on header section", async () => {
      const result = await render(
        html`<ch-plan title="Test" description="Description"></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const headerElement = planRef.shadowRoot!.querySelector(".plan-header");
      expect(headerElement?.getAttribute("part")).toContain("header");
    });

    it("should expose 'title' part on title element", async () => {
      const result = await render(html`<ch-plan title="Test Title"></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const titleElement = planRef.shadowRoot!.querySelector(".plan-title");
      expect(titleElement?.getAttribute("part")).toContain("title");
    });

    it("should expose 'description' part on description element", async () => {
      const result = await render(
        html`<ch-plan title="Test" description="Test Description"></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const descriptionElement = planRef.shadowRoot!.querySelector(".plan-description");
      expect(descriptionElement?.getAttribute("part")).toContain("description");
    });
  });

  describe("content parts", () => {
    it("should expose 'content' part on content area", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const contentElement = planRef.shadowRoot!.querySelector(".plan-content");
      expect(contentElement?.getAttribute("part")).toContain("content");
    });
  });

  describe("step parts", () => {
    it("should expose 'step' part on step elements", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepElements = planRef.shadowRoot!.querySelectorAll(".step");
      expect(stepElements.length).toBeGreaterThan(0);

      stepElements.forEach((step) => {
        expect(step.getAttribute("part")).toContain("step");
      });
    });

    it("should expose status-based parts on step elements", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepElements = planRef.shadowRoot!.querySelectorAll(".step");

      // First step is completed
      expect(stepElements[0].getAttribute("part")).toContain("step-completed");

      // Second step is in-progress
      expect(stepElements[1].getAttribute("part")).toContain("step-in-progress");
    });

    it("should expose 'step-title' part on step title elements", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepTitles = planRef.shadowRoot!.querySelectorAll(".step-title");
      expect(stepTitles.length).toBeGreaterThan(0);

      stepTitles.forEach((title) => {
        expect(title.getAttribute("part")).toContain("step-title");
      });
    });

    it("should expose 'step-description' part on step description elements", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepDescriptions = planRef.shadowRoot!.querySelectorAll(".step-description");
      expect(stepDescriptions.length).toBeGreaterThan(0);

      stepDescriptions.forEach((description) => {
        expect(description.getAttribute("part")).toContain("step-description");
      });
    });
  });

  describe("substep parts", () => {
    it("should expose 'substep' part on subtask list items", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const substeps = planRef.shadowRoot!.querySelectorAll(".substep");
      expect(substeps.length).toBeGreaterThan(0);

      substeps.forEach((substep) => {
        expect(substep.getAttribute("part")).toContain("substep");
      });
    });
  });

  describe("shimmer parts", () => {
    it("should expose 'shimmer' part on shimmer elements when streaming", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBeGreaterThan(0);

      shimmerElements.forEach((shimmer) => {
        expect(shimmer.getAttribute("part")).toContain("shimmer");
      });
    });
  });

  describe("CSS parts customization", () => {
    it("should allow targeting plan part with ::part() selector", async () => {
      const result = await render(html`<ch-plan title="Test"></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Add custom style
      const style = document.createElement("style");
      style.textContent = `
        ch-plan::part(plan) {
          background-color: rgb(255, 0, 0);
        }
      `;
      document.head.appendChild(style);

      const planElement = planRef.shadowRoot!.querySelector(".plan") as HTMLElement;
      expect(planElement).toBeTruthy();

      // Cleanup
      document.head.removeChild(style);
    });

    it("should allow targeting step parts with status-based selectors", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Test", status: "completed" }
      ];
      const result = await render(
        html`<ch-plan title="Test" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Add custom style
      const style = document.createElement("style");
      style.textContent = `
        ch-plan::part(step-completed) {
          opacity: 0.5;
        }
      `;
      document.head.appendChild(style);

      const stepElement = planRef.shadowRoot!.querySelector(".step");
      expect(stepElement?.getAttribute("part")).toContain("step-completed");

      // Cleanup
      document.head.removeChild(style);
    });
  });
});
