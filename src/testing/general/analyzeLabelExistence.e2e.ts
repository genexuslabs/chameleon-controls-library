import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChameleonControlsTagName } from "../../common/types";
import {
  allLabelsAreEmpty,
  externalLabelAndAccessibleNameIsSet,
  noLabelsAreSet
} from "../../common/analysis/accessibility";

const VISIBLE_LABEL_CAPTION = "Label for the element";
const ACCESSIBLE_NAME = "Accessible name for the element";
const NODE_REF_MOCK = " JSHandle@node";

const testLabelExistence = (tag: ChameleonControlsTagName) =>
  describe(`[analysis][label existence][${tag}]`, () => {
    let page: E2EPage;
    let consoleMessages = [];

    beforeEach(async () => {
      page = await newE2EPage({ failOnConsoleError: true });
      consoleMessages = [];

      page.on("console", message => {
        if (message.type() === "warn") {
          consoleMessages.push(message.text());
        }
      });
    });

    const checkErrorCode = (description: string) => {
      expect(consoleMessages.length).toBe(1);
      expect(consoleMessages[0]).toBe(description + NODE_REF_MOCK);
    };

    it(`should throw a console.warn because it doesn't have a valid label`, async () => {
      await page.setContent(`<${tag}></${tag}>`);

      checkErrorCode(noLabelsAreSet(tag));
    });

    it(`should throw a console.warn because the visible label doesn't have the for attribute`, async () => {
      await page.setContent(
        `<label>${VISIBLE_LABEL_CAPTION}</label><${tag} id="unique-id"></${tag}>`
      );

      checkErrorCode(noLabelsAreSet(tag));
    });

    it(`should throw a console.warn because the visible label has the for attribute but the component doesn't have the id`, async () => {
      await page.setContent(
        `<label>${VISIBLE_LABEL_CAPTION}</label><${tag}></${tag}>`
      );

      checkErrorCode(noLabelsAreSet(tag));
    });

    it(`should throw a console.warn because the only label (visible label with for) is empty`, async () => {
      await page.setContent(
        `<label for="unique-id"></label><${tag} id="unique-id"></${tag}>`
      );

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because the only label (visible label as a parent of the ${tag}) is empty`, async () => {
      await page.setContent(`<label><${tag}></${tag}></label>`);

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because the only label (visible label with for) only contain spaces`, async () => {
      await page.setContent(
        `<label for="unique-id">   </label><${tag} id="unique-id"></${tag}>`
      );

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because the only label (visible label as a parent of the ${tag}) only contain spaces`, async () => {
      await page.setContent(`<label>   <${tag}></${tag}></label>`);

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because the only label (accessibleName) only contain spaces`, async () => {
      await page.setContent(`<${tag} accessible-name="  "></${tag}>`);

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because all labels (visible with for and accessibleName) only contain spaces`, async () => {
      await page.setContent(
        `<label for="unique-id">   </label><${tag} id="unique-id" accessible-name="  "></${tag}>`
      );

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because all labels (visible label as a parent of the ${tag} and accessibleName) only contain spaces`, async () => {
      await page.setContent(
        `<label>   <${tag} accessible-name="  "></${tag}></label>`
      );

      checkErrorCode(allLabelsAreEmpty(tag));
    });

    it(`should throw a console.warn because a visible label (with for) and the accessibleName is set at the same time`, async () => {
      await page.setContent(
        `<label for="unique-id">${VISIBLE_LABEL_CAPTION}</label><${tag} id="unique-id" accessible-name="${ACCESSIBLE_NAME}"></${tag}>`
      );

      checkErrorCode(
        externalLabelAndAccessibleNameIsSet(
          tag,
          VISIBLE_LABEL_CAPTION,
          ACCESSIBLE_NAME
        )
      );
    });

    it(`should throw a console.warn because a visible label (as a parent of the ${tag}) and the accessibleName is set at the same time`, async () => {
      await page.setContent(
        `<label>${VISIBLE_LABEL_CAPTION}<${tag} accessible-name="${ACCESSIBLE_NAME}"></${tag}></label>`
      );

      checkErrorCode(
        externalLabelAndAccessibleNameIsSet(
          tag,
          VISIBLE_LABEL_CAPTION,
          ACCESSIBLE_NAME
        )
      );
    });

    it(`should not throw any error because only a visible label (with for) is set`, async () => {
      await page.setContent(
        `<label for="unique-id">${VISIBLE_LABEL_CAPTION}</label><${tag} id="unique-id"></${tag}>`
      );

      expect(consoleMessages.length).toBe(0);
    });

    it(`should not throw any error because only a visible label (as a parent of the ${tag}) is set`, async () => {
      await page.setContent(
        `<label>${VISIBLE_LABEL_CAPTION}<${tag} id="unique-id"></${tag}></label>`
      );

      expect(consoleMessages.length).toBe(0);
    });

    it(`should not throw any error because only a visible label (as a parent of the ${tag}) is set`, async () => {
      await page.setContent(
        `<${tag} accessible-name="${ACCESSIBLE_NAME}"></${tag}>`
      );

      expect(consoleMessages.length).toBe(0);
    });
  });

// TODO: It should take into account the caption property
// testLabelExistence("ch-checkbox");
testLabelExistence("ch-combo-box-render");
testLabelExistence("ch-edit");
testLabelExistence("ch-progress");
testLabelExistence("ch-rating");
testLabelExistence("ch-slider");

// TODO: Something similar as the checkbox happens two for the ch-switch
// testLabelExistence("ch-switch");
