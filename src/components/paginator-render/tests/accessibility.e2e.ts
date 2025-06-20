import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import {
  paginatorRenderNumericModel,
  paginatorRenderNumericModelWithoutUrlMapping,
  paginatorRenderHyperlinkModel
} from "../../../showcase/assets/components/paginator-render/models";
import { PaginatorTranslations } from "../translations";

const GO_TO_INPUT_ARIA_LABEL = "goToInput-Test";
const GO_TO_INPUT_LABEL = "goToInputLabel-test";

const translationsMock: PaginatorTranslations = {
  accessibleName: {
    currentPage: "current page, page ",
    goToPage: "go to page ",
    goToInput: GO_TO_INPUT_ARIA_LABEL,
    itemsPerPageOptions: "itemsPerPageOptions-test",
    firstButton: "go-to-first-page-test",
    nextButton: "go-to-next-page-test",
    lastButton: "go-to-last-page-test",
    previousButton: "go-to-previous-page-test"
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
    goToInputLabel: GO_TO_INPUT_LABEL,
    showingPage: "showingPage-test"
  }
};

type PartialTranslations = {
  accessibleName?: Partial<
    Pick<PaginatorTranslations["accessibleName"], "goToInput">
  >;
  text?: Partial<Pick<PaginatorTranslations["text"], "goToInputLabel">>;
};

const runAccessibilityAriaLabelTests = (
  description: string,
  model: HTMLChPaginatorRenderElement["model"],
  anchorLabelsToTest: string[],
  buttonLabelsToTest: string[]
) => {
  describe(description, () => {
    let page: E2EPage;
    let paginatorRenderRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-paginator-render></ch-paginator-render>`,
        failOnConsoleError: true
      });
      paginatorRenderRef = await page.find("ch-paginator-render");
      paginatorRenderRef.setProperty("model", model);
      paginatorRenderRef.setProperty("showFirstControl", true);
      paginatorRenderRef.setProperty("showItemsPerPage", true);
      paginatorRenderRef.setProperty("showItemsPerPageInfo", true);
      paginatorRenderRef.setProperty("showLastControl", true);
      paginatorRenderRef.setProperty("showNavigationControls", true);
      paginatorRenderRef.setProperty("showNavigationControlsInfo", true);
      paginatorRenderRef.setProperty("showNavigationGoTo", true);
      paginatorRenderRef.setProperty("showNextControl", true);
      paginatorRenderRef.setProperty("showPrevControl", true);

      await page.waitForChanges();
    });

    it("should test all anchors to have aria-label", async () => {
      const anchors = await page.findAll("ch-paginator-render >>> a");

      anchors.forEach((anchor, index) => {
        expect(anchor).toHaveAttribute("aria-label");
        expect(anchor).toEqualAttribute(
          "aria-label",
          anchorLabelsToTest[index]
        );
      });
    });

    it("should test all buttons to have aria-label if no text is displayed", async () => {
      const buttons = await page.findAll("ch-paginator-render >>> button");

      buttons.forEach((button, index) => {
        !button.textContent && expect(button).toHaveAttribute("aria-label");
        !button.textContent &&
          expect(button).toEqualAttribute(
            "aria-label",
            buttonLabelsToTest[index]
          );
      });
    });
  });
};

runAccessibilityAriaLabelTests(
  "ch-paginator-render][accessibility] - Paginator Numeric Model",
  paginatorRenderNumericModel,
  [
    "current page, page 1",
    "go to page 2",
    "go to page 3",
    "go to page 4",
    "go to page 30"
  ],
  [
    "Go to first page",
    "Go to previous page",
    "Go to next page",
    "Go to last page"
  ]
);

runAccessibilityAriaLabelTests(
  "ch-paginator-render][accessibility] - Paginator Numeric Model without urlMapping",
  paginatorRenderNumericModelWithoutUrlMapping,
  [
    "current page, page 1",
    "go to page 2",
    "go to page 3",
    "go to page 4",
    "go to page 20"
  ],
  [
    "Go to first page",
    "Go to previous page",
    "Go to next page",
    "Go to last page"
  ]
);

runAccessibilityAriaLabelTests(
  "ch-paginator-render][accessibility] - Paginator Numeric Model without totalPages",
  paginatorRenderNumericModelWithoutUrlMapping,
  ["current page, page 1"],
  [
    "Go to first page",
    "Go to previous page",
    "Go to next page",
    "Go to last page"
  ]
);

runAccessibilityAriaLabelTests(
  "ch-paginator-render][accessibility] - Paginator Hyperlink Model",
  paginatorRenderHyperlinkModel,
  [
    "current page, page 1",
    "go to page 2",
    "go to page 3",
    "go to page 4",
    "go to page 10"
  ],
  [
    "Go to first page",
    "Go to previous page",
    "Go to next page",
    "Go to last page"
  ]
);

const runAccessibilityLabelTests = (
  description: string,
  model: HTMLChPaginatorRenderElement["model"],
  inputSelector: string,
  labelSelector: string,
  translationWithVisibleLabel: PartialTranslations,
  translationWithAriaLabel: PartialTranslations,
  translationWithoutLabelAndAriaLabelData: PartialTranslations,
  translationWithBothHavingLabel: PartialTranslations,
  translationWithSameLabelText: PartialTranslations
) => {
  describe(`${description}`, () => {
    let page: E2EPage;
    let paginatorRenderRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-paginator-render></ch-paginator-render>`,
        failOnConsoleError: true
      });
      paginatorRenderRef = await page.find("ch-paginator-render");
      paginatorRenderRef.setProperty("model", model);
      paginatorRenderRef.setProperty("showNavigationGoTo", true);

      await page.waitForChanges();
    });

    it(`should render visible label on ${labelSelector} when text.goToInputLabel is only defined`, async () => {
      paginatorRenderRef.setProperty("translations", {
        ...translationsMock,
        ...translationWithVisibleLabel
      });
      await page.waitForChanges();
      const labelRef = await page.find(
        `ch-paginator-render >>> label[part*=${labelSelector}]`
      );
      const inputRef = await page.find(
        `ch-paginator-render >>> input[part*=${inputSelector}]`
      );

      expect(inputRef).toBeTruthy();
      expect(inputRef).not.toHaveAttribute("aria-label");
      expect(labelRef).toBeTruthy();
      expect(labelRef.textContent).toBe(GO_TO_INPUT_LABEL);
      expect(labelRef).toHaveAttribute("for");
      expect(labelRef).toEqualAttribute("for", inputRef.getAttribute("id"));
    });

    it(`should render input with aria-label when ${inputSelector} when accessibleName.goToInput is only defined`, async () => {
      paginatorRenderRef.setProperty("translations", {
        ...translationsMock,
        ...translationWithAriaLabel
      });
      await page.waitForChanges();
      const labelRef = await page.find(
        `ch-paginator-render >>> label[part*=${labelSelector}]`
      );
      const inputRef = await page.find(
        `ch-paginator-render >>> input[part*=${inputSelector}]`
      );

      expect(labelRef).toBeNull();
      expect(inputRef).toBeTruthy();
      expect(inputRef).toHaveAttribute("aria-label");
      expect(inputRef).toEqualAttribute("aria-label", GO_TO_INPUT_ARIA_LABEL);
    });

    it(`should not render visible label and render input without aria-label when accessibleName.goToInput and text.goToInputLabel are not defined`, async () => {
      paginatorRenderRef.setProperty("translations", {
        ...translationsMock,
        ...translationWithoutLabelAndAriaLabelData
      });
      await page.waitForChanges();
      const labelRef = await page.find(
        `ch-paginator-render >>> label[part*=${labelSelector}]`
      );
      const inputRef = await page.find(
        `ch-paginator-render >>> input[part*=${inputSelector}]`
      );

      expect(labelRef).toBeNull();
      expect(inputRef).toBeTruthy();
      expect(inputRef).not.toHaveAttribute("aria-label");
    });

    it("should render visible label and the aria-label when accessibleName.goToInput and text.goToInputLabel differ", async () => {
      paginatorRenderRef.setProperty("translations", {
        ...translationsMock,
        ...translationWithBothHavingLabel
      });
      await page.waitForChanges();
      const labelRef = await page.find(
        `ch-paginator-render >>> label[part*=${labelSelector}]`
      );
      const inputRef = await page.find(
        `ch-paginator-render >>> input[part*=${inputSelector}]`
      );

      expect(inputRef).toBeTruthy();
      expect(inputRef).toHaveAttribute("aria-label");
      expect(inputRef).toEqualAttribute("aria-label", GO_TO_INPUT_ARIA_LABEL);
      expect(labelRef).toBeTruthy();
      expect(labelRef.textContent).toBe(GO_TO_INPUT_LABEL);
      expect(labelRef).toHaveAttribute("for");
      expect(labelRef).toEqualAttribute("for", inputRef.getAttribute("id"));
    });

    it("should render label and skip aria-label when accessibleName.goToInput and text.goToInputLabel are the same", async () => {
      paginatorRenderRef.setProperty("translations", {
        ...translationsMock,
        ...translationWithSameLabelText
      });
      await page.waitForChanges();
      const labelRef = await page.find(
        `ch-paginator-render >>> label[part*=${labelSelector}]`
      );
      const inputRef = await page.find(
        `ch-paginator-render >>> input[part*=${inputSelector}]`
      );

      expect(inputRef).toBeTruthy();
      expect(inputRef).not.toHaveAttribute("aria-label");
      expect(labelRef).toBeTruthy();
      expect(labelRef.textContent).toBe(GO_TO_INPUT_LABEL);
      expect(labelRef).toHaveAttribute("for");
      expect(labelRef).toEqualAttribute("for", inputRef.getAttribute("id"));
    });
  });
};

runAccessibilityLabelTests(
  "[ch-paginator-render][accessibility] - Paginator Numeric Model",
  paginatorRenderNumericModel,
  "go-to__input",
  "go-to__label",
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: "" }
  }, // Case 1: only input label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 2: only aria label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: "" }
  }, // Case 3: no label data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 4: both have diff data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_LABEL }
  } // Case 5: both have same data
);

runAccessibilityLabelTests(
  "[ch-paginator-render][accessibility] - Paginator Numeric Model without urlMapping",
  paginatorRenderNumericModelWithoutUrlMapping,
  "go-to__input",
  "go-to__label",
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: "" }
  }, // Case 1: only input label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 2: only aria label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: "" }
  }, // Case 3: no label data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 4: both have diff data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_LABEL }
  } // Case 5: both have same data
);

runAccessibilityLabelTests(
  "[ch-paginator-render][accessibility] - Paginator Hyperlink Model",
  paginatorRenderHyperlinkModel,
  "go-to__input",
  "go-to__label",
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: "" }
  }, // Case 1: only input label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 2: only aria label data
  {
    text: { goToInputLabel: "" },
    accessibleName: { goToInput: "" }
  }, // Case 3: no label data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_ARIA_LABEL }
  }, // Case 4: both have diff data
  {
    text: { goToInputLabel: GO_TO_INPUT_LABEL },
    accessibleName: { goToInput: GO_TO_INPUT_LABEL }
  } // Case 5: both have same data
);

const runAccessibilityAriaCurrentTest = (
  description: string,
  model: HTMLChPaginatorRenderElement["model"],
  selector: string
) => {
  describe(`${description}`, () => {
    let page: E2EPage;
    let paginatorRenderRef: E2EElement;

    beforeEach(async () => {
      page = await newE2EPage({
        html: `<ch-paginator-render></ch-paginator-render>`,
        failOnConsoleError: true
      });
      paginatorRenderRef = await page.find("ch-paginator-render");
      paginatorRenderRef.setProperty("model", model);
      paginatorRenderRef.setProperty("showNavigationGoTo", true);
      paginatorRenderRef.setProperty("translations", translationsMock);

      await page.waitForChanges();
    });

    it(`sets selectedPage and verifies aria-current="page" is only on the selected item using selector "${selector}"`, async () => {
      const navigationOrderedListItems = await page.findAll(selector);

      // Iterate over each anchor and set selectedPage
      for (let index = 0; index < navigationOrderedListItems.length; index++) {
        paginatorRenderRef.setProperty("selectedPage", index + 1);
        await page.waitForChanges();

        // Update the list
        const updatedNavigationOrderedListItems =
          await paginatorRenderRef.findAll(selector);

        // Verify that only the selected page has aria-current="page"
        updatedNavigationOrderedListItems.forEach((anchor, i) => {
          if (i === index) {
            expect(anchor).toHaveAttribute("aria-current");
            expect(anchor).toEqualAttribute("aria-current", "page");
          } else {
            expect(anchor).not.toHaveAttribute("aria-current");
          }
        });
      }
    });
  });
};

runAccessibilityAriaCurrentTest(
  "[ch-paginator-render][accessibility] - Paginator Numeric Model",
  paginatorRenderNumericModel,
  "ch-paginator-render >>> nav[part*='pages'] a"
);

runAccessibilityAriaCurrentTest(
  "[ch-paginator-render][accessibility] - Paginator Numeric Model without urlMapping",
  paginatorRenderNumericModelWithoutUrlMapping,
  "ch-paginator-render >>> nav[part*='pages'] button"
);

runAccessibilityAriaCurrentTest(
  "[ch-paginator-render][accessibility] - Paginator Hyperlink Model",
  paginatorRenderHyperlinkModel,
  "ch-paginator-render >>> nav[part*='pages'] a"
);

describe("[ch-paginator-render][accessibility] - Paginator Numeric Model", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
    paginatorRenderRef.setProperty("model", paginatorRenderNumericModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();
  });

  it("should have an ordered list when using the Paginator Numeric Model", async () => {
    const navigationOrderedList = await page.find(
      "ch-paginator-render >>> ol[part*='pages']"
    );
    expect(navigationOrderedList).toBeTruthy();
  });
});

describe("[ch-paginator-render][accessibility] - Paginator Numeric Model without urlMapping", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
    paginatorRenderRef.setProperty(
      "model",
      paginatorRenderNumericModelWithoutUrlMapping
    );
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();
  });

  it("should have an ordered list", async () => {
    const navigationOrderedList = await page.find(
      "ch-paginator-render >>> ol[part*='pages']"
    );
    expect(navigationOrderedList).toBeTruthy();
  });
});

describe("[ch-paginator-render][accessibility] - Paginator Hyperlink Model", () => {
  let page: E2EPage;
  let paginatorRenderRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-paginator-render></ch-paginator-render>`,
      failOnConsoleError: true
    });
    paginatorRenderRef = await page.find("ch-paginator-render");
    paginatorRenderRef.setProperty("model", paginatorRenderHyperlinkModel);
    paginatorRenderRef.setProperty("showNavigationGoTo", true);
    paginatorRenderRef.setProperty("translations", translationsMock);

    await page.waitForChanges();
  });

  it("should have an ordered list with a nav tag", async () => {
    const navigationOrderedList = await page.find(
      "ch-paginator-render >>> nav[part*='pages']"
    );
    expect(navigationOrderedList).toBeTruthy();
  });
});
