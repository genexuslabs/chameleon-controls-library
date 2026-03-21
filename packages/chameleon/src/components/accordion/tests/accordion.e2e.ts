import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { accordionSimpleModel } from "../../../showcase/assets/components/accordion/models";

describe("[ch-accordion-render]", () => {
  let page: E2EPage;
  let accordionRef: E2EElement;

  const getAccordionRenderedContent = () =>
    page.evaluate(() =>
      document
        .querySelector("ch-accordion-render")
        .shadowRoot.innerHTML.toString()
    );

  const getAccordionRenderedChildren = () =>
    page.evaluate(
      () =>
        [
          ...document
            .querySelector("ch-accordion-render")
            .shadowRoot.querySelectorAll(".panel")
        ] as HTMLDivElement[]
    );

  const checkComputedStyle = async (options: {
    duration?: string;
    timingFunction?: string;
  }) => {
    const accordionComputedStyle = await accordionRef.getComputedStyle();

    expect(accordionComputedStyle.transition).toEqual(
      `grid-template-rows ${options.duration ?? "0s"} ${
        options.timingFunction ?? "linear"
      } 0s`
    );

    const panelRef = await page.find("ch-accordion-render >>> .panel");
    const panelComputedStyle = await panelRef.getComputedStyle();

    expect(panelComputedStyle.transition).toEqual(
      `grid-template-rows ${options.duration ?? "0s"} ${
        options.timingFunction ?? "linear"
      } 0s`
    );

    const headerRef = await page.find("ch-accordion-render >>> .header");
    const headerAfterPseudoComputedStyle = await headerRef.getComputedStyle(
      "::after"
    );

    expect(headerAfterPseudoComputedStyle.transition).toEqual(
      `transform ${options.duration ?? "0s"} ${
        options.timingFunction ?? "linear"
      } 0s`
    );

    const sectionRef = await page.find("ch-accordion-render >>> section");
    const sectionComputedStyle = await sectionRef.getComputedStyle();

    expect(sectionComputedStyle.transition).toEqual(
      `visibility ${options.duration ?? "0s"} ease 0s allow-discrete`
    );
  };

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-accordion-render></ch-accordion-render>`,
      failOnConsoleError: true
    });
    accordionRef = await page.find("ch-accordion-render");
  });

  it("should have Shadow DOM", () => {
    expect(accordionRef.shadowRoot).toBeDefined();
  });

  it("should render empty if the model is not set", async () => {
    expect(await getAccordionRenderedContent()).toEqual("");
  });

  it("should render empty if the model is undefined", async () => {
    accordionRef.setProperty("model", undefined);
    await page.waitForChanges();
    expect(await getAccordionRenderedContent()).toEqual("");
  });

  it("should render empty if the model is null", async () => {
    accordionRef.setProperty("model", null);
    await page.waitForChanges();
    expect(await getAccordionRenderedContent()).toEqual("");
  });

  it("should render 4 items when using a model with 4 items", async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    await page.waitForChanges();
    const renderedChildren = await getAccordionRenderedChildren();

    expect(renderedChildren.length).toBe(4);
  });

  it('should have "transition-behavior: allow-discrete" to delay the "visibility: hidden" application', async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    await page.waitForChanges();
    const section = await page.find("ch-accordion-render >>> section");

    const computedStyle = await section.getComputedStyle();

    expect(computedStyle.transition).toEqual(
      "visibility 0s ease 0s allow-discrete"
    );
  });

  it("should not have animations by default", async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    await page.waitForChanges();
    await checkComputedStyle({ duration: "0s", timingFunction: "linear" });
  });

  it('should support setting "--ch-accordion-expand-collapse-duration to increase" to change the animation duration', async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    accordionRef.setAttribute(
      "style",
      "--ch-accordion-expand-collapse-duration: 0.25s"
    );
    await page.waitForChanges();
    await checkComputedStyle({ duration: "0.25s" });
  });

  it('should support setting "--ch-accordion-expand-collapse-timing-function" to change the animation timing function', async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    accordionRef.setAttribute(
      "style",
      "--ch-accordion-expand-collapse-timing-function: linear"
    );
    await page.waitForChanges();
    await checkComputedStyle({ timingFunction: "linear" });
  });

  it('should support setting "--ch-accordion-expand-collapse-duration to increase" and "--ch-accordion-expand-collapse-timing-function" at the same time', async () => {
    accordionRef.setProperty("model", accordionSimpleModel);
    accordionRef.setAttribute(
      "style",
      "--ch-accordion-expand-collapse-duration: 0.25s; --ch-accordion-expand-collapse-timing-function: linear"
    );
    await page.waitForChanges();
    await checkComputedStyle({ duration: "0.25s", timingFunction: "linear" });
  });
});
