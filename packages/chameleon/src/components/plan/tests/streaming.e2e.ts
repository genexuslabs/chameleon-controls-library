import { html } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChPlan } from "../plan.lit";
import "../plan.lit.js";
import type { PlanStepModel } from "../types";

describe("[ch-plan][streaming]", () => {
  let planRef: ChPlan;

  afterEach(cleanup);

  describe("shimmer to content transitions", () => {
    it("should show shimmer when isStreaming is true and no content", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBeGreaterThan(0);

      const realTitle = planRef.shadowRoot!.querySelector(".plan-title");
      expect(realTitle).toBeFalsy();
    });

    it("should transition from shimmer to real title when title is set", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have shimmer initially
      let titleShimmer = planRef.shadowRoot!.querySelector(".shimmer-line--title");
      expect(titleShimmer).toBeTruthy();

      // Update with real title
      planRef.title = "Real Plan Title";
      await planRef.updateComplete;

      // Should now have real title
      const realTitle = planRef.shadowRoot!.querySelector(".plan-title");
      expect(realTitle).toBeTruthy();
      expect(realTitle!.textContent).toBe("Real Plan Title");
    });

    it("should transition from shimmer to real description when description is set", async () => {
      const result = await render(
        html`<ch-plan title="Test" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have description shimmer initially
      let descriptionShimmer = planRef.shadowRoot!.querySelector(
        ".shimmer-line--description"
      );
      expect(descriptionShimmer).toBeTruthy();

      // Update with real description
      planRef.description = "Real description content";
      await planRef.updateComplete;

      // Should now have real description
      const realDescription = planRef.shadowRoot!.querySelector(".plan-description");
      expect(realDescription).toBeTruthy();
      expect(realDescription!.textContent).toBe("Real description content");

      // Shimmer should still be there if streaming continues
      descriptionShimmer = planRef.shadowRoot!.querySelector(
        ".shimmer-line--description"
      );
      expect(descriptionShimmer).toBeFalsy();
    });

    it("should show shimmer container when isStreaming is true and no steps", async () => {
      const result = await render(
        html`<ch-plan
          title="Test"
          .isStreaming=${true}
          .steps=${[]}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();

      const stepShimmers = shimmerContainer!.querySelectorAll(".shimmer-line--step");
      expect(stepShimmers.length).toBeGreaterThan(0);
    });

    it("should transition from shimmer to real steps when steps are added", async () => {
      const result = await render(
        html`<ch-plan
          title="Test"
          .isStreaming=${true}
          .steps=${[]}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have shimmer initially
      let shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();

      // Add real steps
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "First step", subtasks: ["Task 1"] }
      ];
      planRef.steps = steps;
      await planRef.updateComplete;

      // Should now have real steps
      const realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      expect(realSteps.length).toBe(1);

      // Shimmer should still be present since streaming is still active
      shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();
    });

    it("should show both real content and shimmer when partially loaded", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Loaded step", subtasks: ["Task 1"] }
      ];
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          description="Test description"
          .steps=${steps}
          .isStreaming=${true}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have real content
      const realTitle = planRef.shadowRoot!.querySelector(".plan-title");
      const realDescription = planRef.shadowRoot!.querySelector(".plan-description");
      const realSteps = planRef.shadowRoot!.querySelectorAll(".step");

      expect(realTitle).toBeTruthy();
      expect(realDescription).toBeTruthy();
      expect(realSteps.length).toBe(1);

      // Should also have shimmer for loading content
      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();
    });

    it("should remove all shimmer when isStreaming changes to false", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Step 1", subtasks: ["Task 1"] }
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

      // Should have shimmer initially
      let shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBeGreaterThan(0);

      // Stop streaming
      planRef.isStreaming = false;
      await planRef.updateComplete;

      // Shimmer should be removed
      shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBe(0);

      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeFalsy();
    });
  });

  describe("progressive loading simulation", () => {
    it("should handle progressive step additions during streaming", async () => {
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          .isStreaming=${true}
          .steps=${[]}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Add first step
      planRef.steps = [
        { id: "step-1", title: "Step 1", subtasks: ["Task 1"] }
      ];
      await planRef.updateComplete;

      let realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      expect(realSteps.length).toBe(1);

      // Add second step
      planRef.steps = [
        { id: "step-1", title: "Step 1", subtasks: ["Task 1"] },
        { id: "step-2", title: "Step 2", subtasks: ["Task 2"] }
      ];
      await planRef.updateComplete;

      realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      expect(realSteps.length).toBe(2);

      // Add third step
      planRef.steps = [
        { id: "step-1", title: "Step 1", subtasks: ["Task 1"] },
        { id: "step-2", title: "Step 2", subtasks: ["Task 2"] },
        { id: "step-3", title: "Step 3", subtasks: ["Task 3"] }
      ];
      await planRef.updateComplete;

      realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      expect(realSteps.length).toBe(3);

      // Shimmer should still be present while streaming
      const shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");
      expect(shimmerContainer).toBeTruthy();
    });

    it("should complete loading when isStreaming is set to false", async () => {
      const steps: PlanStepModel[] = [
        { id: "step-1", title: "Step 1", subtasks: ["Task 1"] },
        { id: "step-2", title: "Step 2", subtasks: ["Task 2"] }
      ];
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          description="Plan description"
          .steps=${steps}
          .isStreaming=${true}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      // Should have content and shimmer
      let realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      let shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");

      expect(realSteps.length).toBe(2);
      expect(shimmerContainer).toBeTruthy();

      // Complete streaming
      planRef.isStreaming = false;
      await planRef.updateComplete;

      // Should have only real content, no shimmer
      realSteps = planRef.shadowRoot!.querySelectorAll(".step");
      shimmerContainer = planRef.shadowRoot!.querySelector(".shimmer-container");

      expect(realSteps.length).toBe(2);
      expect(shimmerContainer).toBeFalsy();
    });
  });

  describe("shimmer animation", () => {
    it("should apply shimmer animation to shimmer elements", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const shimmerElements = planRef.shadowRoot!.querySelectorAll(".shimmer-line");
      expect(shimmerElements.length).toBeGreaterThan(0);

      // Check that shimmer elements have the shimmer-line class
      shimmerElements.forEach((shimmer) => {
        expect(shimmer.classList.contains("shimmer-line")).toBe(true);
      });
    });

    it("should have different shimmer line variants", async () => {
      const result = await render(
        html`<ch-plan title="" .isStreaming=${true}></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;

      const titleShimmer = planRef.shadowRoot!.querySelector(".shimmer-line--title");
      const descriptionShimmer = planRef.shadowRoot!.querySelector(
        ".shimmer-line--description"
      );

      expect(titleShimmer).toBeTruthy();
      expect(descriptionShimmer).toBeTruthy();
    });
  });
});
