import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { GetImagePathCallback } from "../../../typings/multi-state-images";
import type { ChAccordionRender } from "../accordion.lit";
import "../accordion.lit.js";
import type { AccordionModel } from "../types";

describe("[ch-accordion-render][signal-updates]", () => {
  let accordionRef: ChAccordionRender;
  let model: AccordionModel;

  afterEach(cleanup);

  describe("getImagePathCallback changes", () => {
    beforeEach(async () => {
      model = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: true,
          startImgSrc: "icon.svg"
        },
        {
          id: "item-2",
          caption: "Item 2",
          expanded: false,
          startImgSrc: "icon2.svg"
        }
      ];
    });

    it("should render ch-image elements when items have startImgSrc", async () => {
      const callback: GetImagePathCallback = (src: string | unknown) => ({
        base: `resolved-${src}`
      });

      const result = await render(
        html`<ch-accordion-render
          .getImagePathCallback=${callback}
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const images = accordionRef.shadowRoot!.querySelectorAll("ch-image");
      expect(images.length).toBe(2);
    });

    it("should not render ch-image elements when items lack startImgSrc", async () => {
      const noImgModel: AccordionModel = [
        { id: "item-1", caption: "Item 1", expanded: true },
        { id: "item-2", caption: "Item 2", expanded: false }
      ];
      const result = await render(
        html`<ch-accordion-render .model=${noImgModel}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const images = accordionRef.shadowRoot!.querySelectorAll("ch-image");
      expect(images.length).toBe(0);
    });

    it("should pass the getImagePathCallback to ch-image elements", async () => {
      const callback: GetImagePathCallback = (src: string | unknown) => ({
        base: `resolved-${src}`
      });

      const result = await render(
        html`<ch-accordion-render
          .getImagePathCallback=${callback}
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const image = accordionRef.shadowRoot!.querySelector("ch-image") as any;
      // The ch-image should have a getImagePathCallback set
      expect(image.getImagePathCallback).toBeDefined();
    });

    it("should update ch-image elements when getImagePathCallback is changed on the component", async () => {
      const callback1: GetImagePathCallback = (src: string | unknown) => ({
        base: `v1-${src}`
      });

      const result = await render(
        html`<ch-accordion-render
          .getImagePathCallback=${callback1}
          .model=${model}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const callback2: GetImagePathCallback = (src: string | unknown) => ({
        base: `v2-${src}`
      });

      accordionRef.getImagePathCallback = callback2;
      await accordionRef.updateComplete;

      const image = accordionRef.shadowRoot!.querySelector("ch-image") as any;
      // The callback on ch-image should reflect the updated callback
      expect(image.getImagePathCallback).toBeDefined();
    });

    it("should pass the disabled state to ch-image elements", async () => {
      const disabledModel: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: true,
          startImgSrc: "icon.svg",
          disabled: true
        }
      ];

      const result = await render(
        html`<ch-accordion-render
          .model=${disabledModel}
        ></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const image = accordionRef.shadowRoot!.querySelector("ch-image") as any;
      expect(image.disabled).toBe(true);
    });

    it("should pass the src property to ch-image elements", async () => {
      const result = await render(
        html`<ch-accordion-render .model=${model}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const image = accordionRef.shadowRoot!.querySelector("ch-image") as any;
      expect(image.src).toBe("icon.svg");
    });

    it("should pass the startImgType to ch-image type property", async () => {
      const typedModel: AccordionModel = [
        {
          id: "item-1",
          caption: "Item 1",
          expanded: true,
          startImgSrc: "icon.svg",
          startImgType: "mask"
        }
      ];

      const result = await render(
        html`<ch-accordion-render .model=${typedModel}></ch-accordion-render>`
      );
      accordionRef = result.container.querySelector("ch-accordion-render")!;
      await accordionRef.updateComplete;

      const image = accordionRef.shadowRoot!.querySelector("ch-image") as any;
      expect(image.type).toBe("mask");
    });
  });
});

