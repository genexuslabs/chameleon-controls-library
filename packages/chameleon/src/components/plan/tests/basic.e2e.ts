import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChPlan } from "../plan.lit";
import "../plan.lit.js";
import type { PlanStepModel } from "../types";

const SIMPLE_STEPS: PlanStepModel[] = [
  {
    id: "step-1",
    title: "Setup environment",
    description: "Install dependencies and configure tools",
    subtasks: ["Install Node.js", "Install npm packages", "Configure editor"],
    status: "completed"
  },
  {
    id: "step-2",
    title: "Implement feature",
    description: "Write the core functionality",
    subtasks: ["Create component", "Add tests", "Update documentation"],
    status: "in-progress"
  },
  {
    id: "step-3",
    title: "Review and deploy",
    subtasks: ["Code review", "Run CI/CD", "Deploy to production"],
    status: "pending"
  }
];

describe("[ch-plan][basic]", () => {
  let planRef: ChPlan;

  // Helper to get accordion and wait for its shadowRoot to be ready
  async function getAccordionWithShadowRoot() {
    const accordion = planRef.shadowRoot!.querySelector("ch-accordion-render") as any;
    if (!accordion) return null;
    
    // Wait for updateComplete
    if (accordion.updateComplete) {
      await accordion.updateComplete;
    }
    
    // Wait for shadowRoot to be available (with timeout)
    let attempts = 0;
    while (!accordion.shadowRoot && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
    
    return accordion;
  }

  afterEach(cleanup);

  describe("shadow DOM", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-plan></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;
    });

    it("should have a shadow root", () => {
      expect(planRef.shadowRoot).toBeTruthy();
    });
  });

  describe("default properties", () => {
    beforeEach(async () => {
      const result = await render(html`<ch-plan></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;
    });

    it('the "title" property should be empty string by default', () => {
      expect(planRef.title).toBe("");
    });

    it('the "description" property should be undefined by default', () => {
      expect(planRef.description).toBeUndefined();
    });

    it('the "steps" property should be empty array by default', () => {
      expect(planRef.steps).toEqual([]);
    });

    it('the "isStreaming" property should be false by default', () => {
      expect(planRef.isStreaming).toBe(false);
    });

    it('the "defaultOpen" property should be false by default', () => {
      expect(planRef.defaultOpen).toBe(false);
    });
  });

  describe("component rendering", () => {
    it("should render with title and description", async () => {
      const result = await render(
        html`<ch-plan
          title="Implementation Plan"
          description="Complete implementation of the feature"
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const title = planRef.shadowRoot!.querySelector(".plan-title");
      const description = planRef.shadowRoot!.querySelector(".plan-description");

      expect(title).toBeTruthy();
      expect(title!.textContent).toBe("Implementation Plan");
      expect(description).toBeTruthy();
      expect(description!.textContent).toBe("Complete implementation of the feature");
    });

    it("should render without description when not provided", async () => {
      const result = await render(html`<ch-plan title="Simple Plan"></ch-plan>`);
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const title = planRef.shadowRoot!.querySelector(".plan-title");
      const description = planRef.shadowRoot!.querySelector(".plan-description");

      expect(title).toBeTruthy();
      expect(title!.textContent).toBe("Simple Plan");
      expect(description).toBeFalsy();
    });

    it("should render all steps with correct structure", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepElements = planRef.shadowRoot!.querySelectorAll(".step");
      expect(stepElements.length).toBe(3);

      // Check first step
      const stepTitles = planRef.shadowRoot!.querySelectorAll(".step-title");
      expect(stepTitles[0].textContent).toContain("Setup environment");
      expect(stepTitles[1].textContent).toContain("Implement feature");
      expect(stepTitles[2].textContent).toContain("Review and deploy");
    });

    it("should render step descriptions when provided", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const descriptions = planRef.shadowRoot!.querySelectorAll(".step-description");
      expect(descriptions.length).toBe(2); // Only first two steps have descriptions

      expect(descriptions[0].textContent).toBe("Install dependencies and configure tools");
      expect(descriptions[1].textContent).toBe("Write the core functionality");
    });

    it("should render subtasks as list items", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const substepLists = planRef.shadowRoot!.querySelectorAll(".substeps");
      expect(substepLists.length).toBe(3); // All steps have subtasks

      // Check first step subtasks
      const firstStepSubtasks = substepLists[0].querySelectorAll(".substep");
      expect(firstStepSubtasks.length).toBe(3);
      expect(firstStepSubtasks[0].textContent).toBe("Install Node.js");
      expect(firstStepSubtasks[1].textContent).toBe("Install npm packages");
      expect(firstStepSubtasks[2].textContent).toBe("Configure editor");
    });

    it("should render without subtasks when not provided", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Simple step without subtasks" }
      ];
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const substepLists = planRef.shadowRoot!.querySelectorAll(".substeps");
      expect(substepLists.length).toBe(0);
    });
  });

  describe("defaultOpen behavior", () => {
    it("should render collapsed accordion when defaultOpen is false", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          .steps=${steps}
          .defaultOpen=${false}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const accordion = await getAccordionWithShadowRoot();
      expect(accordion).toBeTruthy();
      expect(accordion.shadowRoot).toBeTruthy();

      // Check that the accordion item is collapsed
      const panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("collapsed");
    });

    it("should render expanded accordion when defaultOpen is true", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          .steps=${steps}
          .defaultOpen=${true}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const accordion = await getAccordionWithShadowRoot();
      expect(accordion).toBeTruthy();
      expect(accordion.shadowRoot).toBeTruthy();

      // Check that the accordion item is expanded
      const panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("expanded");
    });
  });

  describe("isStreaming behavior", () => {
    it("should show shimmer placeholders when isStreaming is true and no content", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBeGreaterThan(0);
    });

    it("should show title shimmer when isStreaming is true and no title", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const titleShimmer = planRef.shadowRoot!.querySelector(".shimmer-line--title");
      expect(titleShimmer).toBeTruthy();
    });

    it("should show description shimmer when isStreaming is true and no description", async () => {
      const result = await render(
        html`<ch-plan title="Test" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const descriptionShimmer = planRef.shadowRoot!.querySelector(
        ".shimmer-line--description"
      );
      expect(descriptionShimmer).toBeTruthy();
    });

    it("should show step shimmer when isStreaming is true and no steps", async () => {
      const result = await render(
        html`<ch-plan title="Test" .isStreaming=${true} .steps=${[]}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();

      const stepShimmers = shimmerContainer!.querySelectorAll(".shimmer-line--step");
      expect(stepShimmers.length).toBeGreaterThan(0);
    });

    it("should show both content and shimmer when isStreaming is true with partial content", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "First step", subtasks: ["Subtask 1"] }
      ];
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          .steps=${steps}
          .isStreaming=${true}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have both real steps and shimmer placeholders
      const realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");

      expect(realSteps.length).toBe(1);
      expect(shimmerContainer).toBeTruthy();
    });

    it("should not show shimmer when isStreaming is false", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          .steps=${steps}
          .isStreaming=${false}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBe(0);
    });
  });

  describe("step status rendering", () => {
    it("should add status-based CSS part to step elements", async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepElements = planRef.shadowRoot!.querySelectorAll(".step");

      // First step is completed
      expect(stepElements[0].getAttribute("part")).toContain("step-completed");

      // Second step is in-progress
      expect(stepElements[1].getAttribute("part")).toContain("step-in-progress");

      // Third step is pending
      expect(stepElements[2].getAttribute("part")).toContain("step-pending");
    });

    it("should not add status part when step has no status", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Step without status", subtasks: ["Task 1"] }
      ];
      const result = await render(
        html`<ch-plan title="Test Plan" .steps=${steps}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const stepElement = planRef.shadowRoot!.querySelector(".step");
      const partAttr = stepElement!.getAttribute("part");

      expect(partAttr).toContain("step");
      expect(partAttr).not.toContain("step-completed");
      expect(partAttr).not.toContain("step-pending");
      expect(partAttr).not.toContain("step-in-progress");
      expect(partAttr).not.toContain("step-failed");
    });
  });
});
