import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  paginatorRenderNumericModel,
  paginatorRenderHyperlinkModel
} from "../../../showcase/assets/components/paginator-render/models";
import { PaginatorTranslations } from "../translations";

const GO_TO_INPUT_ARIA_LABEL = "goToInput-Test";
const GO_TO_INPUT_LABEL = "goToInputLabel-test";

const translationsMock: PaginatorTranslations = {
  accessibleName: {
    goToInput: "goToInput-Test",
    itemsPerPageOptions: "itemsPerPageOptions-test"
  },
  text: {
    goToButton: "goToButton-test",
    itemsPerPage: "itemsPerPage-test",
    of: "of-test",
    ellipsis: "ellipsis-test",
    first: "first-test",
    prev: "prev-test",
    next: "next-test",
    last: "last-test",
    unknownPages: "unknownPages-test",
    unknownItems: "unknownItems-test",
    showingItems: "showingItems-test",
    goToInputLabel: "goToInputLabel-test",
    showingPage: "showingPage-test"
  }
};

describe("[ch-paginator-render][accessibility] - Paginator Numeric Model]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });

    paginatorRenderRef = await page.find("ch-paginator-render");
  });

  it('should have an ordered list with role="navigation"', async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    await page.waitForChanges();

    const navigationOrderedList = await page.find(
      "ch-paginator-render >>> ol[part*='pages']"
    );

    expect(navigationOrderedList).toEqualAttribute("role", "navigation");
  });

  it("should have aria-label with accessible name,  when goToInputLabel is not defined", async () => {
    const translationsMockWithoutGoToInputLabel: PaginatorTranslations = {
      ...translationsMock,
      text: {
        ...translationsMock.text,
        goToInputLabel: ""
      }
    };
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty(
      "translations",
      translationsMockWithoutGoToInputLabel
    );

    await page.waitForChanges();

    const navigationGoToInput = await page.find(
      "ch-paginator-render >>> input[part*='go-to__input']"
    );

    expect(navigationGoToInput).toEqualAttribute(
      "aria-label",
      GO_TO_INPUT_ARIA_LABEL
    );
  });

  it("should not render a label tag on navigation go to, when goToInputLabel is not defined", async () => {
    const translationsMockWithoutGoToInputLabel: PaginatorTranslations = {
      ...translationsMock,
      text: {
        ...translationsMock.text,
        goToInputLabel: ""
      }
    };
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty(
      "translations",
      translationsMockWithoutGoToInputLabel
    );

    await page.waitForChanges();

    const navigationGoToLabel = await page.find(
      "ch-paginator-render >>> label[part*='go-to__label']"
    );

    expect(navigationGoToLabel).toBeNull();
  });

  it("should render label tag on navigation go to, when goToInputLabel is defined", async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();

    const navigationGoToLabel = await page.find(
      "ch-paginator-render >>> label[part*='go-to__label']"
    );

    expect(navigationGoToLabel.innerText).toEqualText(GO_TO_INPUT_LABEL);
  });

  it("should not have aria-label on navigation go to input, when goToInputLabel is defined", async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();

    const navigationGoToInput = await page.find(
      "ch-paginator-render >>> input[part*='go-to__input']"
    );

    expect(navigationGoToInput).not.toHaveAttribute("aria-label");
  });
});

describe("[ch-paginator-render][accessibility] - Paginator Hyperlink Model]", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });

    paginatorRenderRef = await page.find("ch-paginator-render");
  });

  it('should have an ordered list with role="navigation"', async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    await page.waitForChanges();

    const navigationOrderedList = await page.find(
      "ch-paginator-render >>> ol[part*='pages']"
    );

    expect(navigationOrderedList).toEqualAttribute("role", "navigation");
  });

  it("should have aria-label with accessible name,  when goToInputLabel is not defined", async () => {
    const translationsMockWithoutGoToInputLabel: PaginatorTranslations = {
      ...translationsMock,
      text: {
        ...translationsMock.text,
        goToInputLabel: ""
      }
    };
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty(
      "translations",
      translationsMockWithoutGoToInputLabel
    );

    await page.waitForChanges();

    const navigationGoToInput = await page.find(
      "ch-paginator-render >>> input[part*='go-to__input']"
    );

    expect(navigationGoToInput).toEqualAttribute(
      "aria-label",
      GO_TO_INPUT_ARIA_LABEL
    );
  });

  it("should not render a label tag on navigation go to, when goToInputLabel is not defined", async () => {
    const translationsMockWithoutGoToInputLabel: PaginatorTranslations = {
      ...translationsMock,
      text: {
        ...translationsMock.text,
        goToInputLabel: ""
      }
    };
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty(
      "translations",
      translationsMockWithoutGoToInputLabel
    );

    await page.waitForChanges();

    const navigationGoToLabel = await page.find(
      "ch-paginator-render >>> label[part*='go-to__label']"
    );

    expect(navigationGoToLabel).toBeNull();
  });

  it("should render label tag on navigation go to, when goToInputLabel is defined", async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();

    const navigationGoToLabel = await page.find(
      "ch-paginator-render >>> label[part*='go-to__label']"
    );

    expect(navigationGoToLabel.innerText).toEqualText(GO_TO_INPUT_LABEL);
  });

  it("should not have aria-label on navigation go to input, when goToInputLabel is defined", async () => {
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();

    const navigationGoToInput = await page.find(
      "ch-paginator-render >>> input[part*='go-to__input']"
    );

    expect(navigationGoToInput).not.toHaveAttribute("aria-label");
  });
});
