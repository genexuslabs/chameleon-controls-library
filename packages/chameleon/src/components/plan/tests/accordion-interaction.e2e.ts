import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import { page } from "vitest/browser";
import type { ChPlan } from "../plan.lit";
import "../plan.lit.js";
import type { PlanStepModel } from "../types";

const SIMPLE_STEPS: PlanStepModel[] = [
  {
    id: "step-1",
    title: "Setup environment",
    subtasks: ["Install Node.js", "Install npm packages"]
  },
  {
    id: "step-2",
    title: "Implement feature",
    subtasks: ["Create component", "Add tests"]
  }
];

describe("[ch-plan][accordion-interaction]", () => {
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

  describe("accordion expand/collapse", () => {
    beforeEach(async () => {
      const steps = structuredClone(SIMPLE_STEPS);
      const result = await render(
        html`<ch-plan
          title="Test Plan"
          description="Testing accordion behavior"
          .steps=${steps}
          .defaultOpen=${false}
        ></ch-plan>`
      );
      planRef = result.container.querySelector("ch-plan")!;
      await planRef.updateComplete;
    });

    it("should start collapsed when defaultOpen is false", async () => {
      const accordion = await getAccordionWithShadowRoot();
      expect(accordion).toBeTruthy();
      expect(accordion.shadowRoot).toBeTruthy();
      
      const panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("collapsed");
      expect(panel?.getAttribute("part")).not.toContain("expanded");
    });

    it("should expand when clicking the trigger button", async () => {
      const accordion = await getAccordionWithShadowRoot();
      const button = accordion.shadowRoot!.querySelector("button");

      expect(button).toBeTruthy();

      // Click the button to expand
      await button!.click();
      await planRef.updateComplete;

      const panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("expanded");
      expect(panel?.getAttribute("part")).not.toContain("collapsed");
    });

    it("should collapse when clicking the trigger button again", async () => {
      const accordion = await getAccordionWithShadowRoot();
      const button = accordion.shadowRoot!.querySelector("button");

      // Expand
      await button!.click();
      await planRef.updateComplete;

      let panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("expanded");

      // Collapse
      await button!.click();
      await planRef.updateComplete;

      panel = accordion.shadowRoot!.querySelector(".panel");
      expect(panel?.getAttribute("part")).toContain("collapsed");
    });

    it("should toggle between expanded and collapsed states", async () => {
      const accordion = await getAccordionWithShadowRoot();
      const button = accordion.shadowRoot!.querySelector("button");

      for (let i = 0; i < 3; i++) {
        // Expand
        await button!.click();
        await planRef.updateComplete;

        let panel = accordion.shadowRoot!.querySelector(".panel");
        expect(panel?.getAttribute("part")).toContain("expanded");

        // Collapse
        await button!.click();
        await planRef.updateComplete;

        panel = accordion.shadowRoot!.querySelector(".panel");
        expect(panel?.getAttribute("part")).toContain("collapsed");
      }
    });
  });

  describe("expandedChange event", () => {
    it("should emit expandedChange event when accordion expands", async () => {
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

      let eventFired = false;
      let eventDetail: any = null;

      planRef.addEventListener("expandedChange", ((event: CustomEvent) => {
        eventFired = true;
        eventDetail = event.detail;
      }) as EventListener);

      const accordion = await getAccordionWithShadowRoot();
      const button = accordion.shadowRoot!.querySelector("button");

      await button!.click();
      await planRef.updateComplete;

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.expanded).toBe(true);
    });

    it("should emit expandedChange event when accordion collapses", async () => {
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

      let eventFired = false;
      let eventDetail: any = null;

      planRef.addEventListener("expandedChange", ((event: CustomEvent) => {
        eventFired = true;
        eventDetail = event.detail;
      }) as EventListener);

      const accordion = await getAccordionWithShadowRoot();
      const button = accordion.shadowRoot!.querySelector("button");

      await button!.click();
      await planRef.updateComplete;

      expect(eventFired).toBe(true);
      expect(eventDetail).toBeTruthy();
      expect(eventDetail.expanded).toBe(false);
    });
  });

  describe("content visibility", () => {
    it("should hide steps content when collapsed", async () => {
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
      const panel = accordion.shadowRoot!.querySelector(".panel");

      // Panel should be collapsed
      expect(panel?.getAttribute("part")).toContain("collapsed");
    });

    it("should show steps content when expanded", async () => {
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
      const panel = accordion.shadowRoot!.querySelector(".panel");

      // Panel should be expanded
      expect(panel?.getAttribute("part")).toContain("expanded");
    });
  });
});
