import { newSpecPage } from "@stencil/core/testing";
import { IntersectionObserverControl } from "../intersection-observer";
// import { IntersectionObserverMock } from "./mock";

describe("ch-intersection-observer", () => {
  // let intersectionObserverMock: IntersectionObserverMock;

  // TODO: Find a way to mock the IntersectionObserver
  // window.IntersectionObserver = intersectionObserverMock;
  it.only("renders", async () => {
    const page = await newSpecPage({
      components: [IntersectionObserverControl],
      html: `<ch-intersection-observer></ch-intersection-observer>`
    });

    expect(page.root).toEqualHtml(`
      <ch-intersection-observer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ch-intersection-observer>
    `);
  });

  it("sets the root prop correctly", async () => {
    const page = await newSpecPage({
      components: [IntersectionObserverControl],
      html: `<ch-intersection-observer root="root-id"></ch-intersection-observer>`
    });
    expect(page.rootInstance.root).toEqual("root-id");
  });

  it("sets the margin props correctly", async () => {
    const page = await newSpecPage({
      components: [IntersectionObserverControl],
      html: `<ch-intersection-observer top-margin="10dip" left-margin="20dip" bottom-margin="30dip" right-margin="40dip"></ch-intersection-observer>`
    });
    expect(page.rootInstance.topMargin).toEqual("10dip");
    expect(page.rootInstance.leftMargin).toEqual("20dip");
    expect(page.rootInstance.bottomMargin).toEqual("30dip");
    expect(page.rootInstance.rightMargin).toEqual("40dip");
  });

  it("sets the active props correctly", async () => {
    const page = await newSpecPage({
      components: [IntersectionObserverControl],
      html: `<ch-intersection-observer active="true" active-class="active-class"></ch-intersection-observer>`
    });
    expect(page.rootInstance.active).toEqual(true);
    expect(page.root.getAttribute("class")).toContain("active-class");
  });

  it("sets the threshold prop correctly", async () => {
    const page = await newSpecPage({
      components: [IntersectionObserverControl],
      html: `<ch-intersection-observer threshold="10% 30% 40%"></ch-intersection-observer>`
    });
    expect(page.rootInstance.threshold).toEqual("10% 30% 40%");
  });

  // TODO: Make public parseThreshold?
  // it("parses the threshold string correctly", () => {
  //   const component = new IntersectionObserverControl();
  //   const threshold = component.parseThreshold("10% 30% 40%");
  //   expect(threshold).toEqual([0.1, 0.3, 0.4]);
  // });

  // it("checks valid percent value correctly", () => {
  //   const component = new IntersectionObserverControl();
  //   const validPercent = component.checkValidPercentValue("10%");
  //   expect(validPercent).toEqual("10%");

  //   const invalidPercent = component.checkValidPercentValue("invalid");
  //   expect(invalidPercent).toEqual("0px");
  // });
});
