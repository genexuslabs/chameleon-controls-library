import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { ticketList } from "../../../showcase/assets/components/action-list/models";
import {
  ActionListItemModel,
  ActionListItemType,
  ActionListModel
} from "../types";

const FIRST_ITEM_ID = "2023 employee contracts";

const actionListModelSimple: ActionListModel = [
  {
    id: FIRST_ITEM_ID,
    type: "actionable",
    caption: "2023 employee contracts"
  },
  {
    id: "Investors reports",
    type: "actionable",
    caption: "Investors reports",
    selected: true
  }
];

const actionListModelSimpleEventSpyDetail = [
  {
    item: {
      caption: "2023 employee contracts",
      id: FIRST_ITEM_ID,
      selected: true,
      type: "actionable"
    },
    root: [
      {
        caption: "2023 employee contracts",
        id: FIRST_ITEM_ID,
        selected: true,
        type: "actionable"
      },
      {
        caption: "Investors reports",
        id: "Investors reports",
        selected: false,
        type: "actionable"
      }
    ]
  }
];

describe("[ch-action-list-render][selection]", () => {
  let page: E2EPage;
  let actionListRef: E2EElement;
  let selectedItemsChangeEventSpy: EventSpy;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-action-list-render></ch-action-list-render>`
    });
    actionListRef = await page.find("ch-action-list-render");
    actionListRef.setProperty("model", ticketList);
    selectedItemsChangeEventSpy = await actionListRef.spyOnEvent(
      "selectedItemsChange"
    );
    await page.waitForChanges();
  });

  it("should have a shadowRoot", () => {
    expect(actionListRef.shadowRoot).toBeTruthy();
  });

  it('should work with selection="single" by default', async () => {
    await page.setContent(
      `<ch-action-list-render selection="single"></ch-action-list-render>`
    );
    actionListRef = await page.find("ch-action-list-render");
    actionListRef.setProperty("model", ticketList);
    await page.waitForChanges();

    await page.click("ch-action-list-render >>> ch-action-list-item");
  });

  const selectionTests = (modelFirst: boolean) => {
    const descriptionPrefix = modelFirst
      ? '[set model and then set selection="single"]'
      : '[set selection="single" and then set model]';

    it(`${descriptionPrefix} should work selection="single" when there is a selected item and the user selects other item`, async () => {
      if (modelFirst) {
        actionListRef.setProperty("model", actionListModelSimple);
        actionListRef.setProperty("selection", "single");
      } else {
        actionListRef.setProperty("selection", "single");
        actionListRef.setProperty("model", actionListModelSimple);
      }
      await page.waitForChanges();

      const actionListItemRef = await page.find(
        `ch-action-list-render >>> [id='${FIRST_ITEM_ID}'] >>> button`
      );
      await actionListItemRef.press("Space");
      await page.waitForChanges();
      expect(selectedItemsChangeEventSpy).toHaveReceivedEventDetail(
        actionListModelSimpleEventSpyDetail
      );
    });

    it(`${descriptionPrefix} should work selection="single" when there is a selected item and updateItemProperties selects other item`, async () => {
      if (modelFirst) {
        actionListRef.setProperty("model", actionListModelSimple);
        actionListRef.setProperty("selection", "single");
      } else {
        actionListRef.setProperty("selection", "single");
        actionListRef.setProperty("model", actionListModelSimple);
      }
      await page.waitForChanges();

      await actionListRef.callMethod("updateItemProperties", FIRST_ITEM_ID, {
        type: "actionable",
        selected: true
      } satisfies Partial<ActionListItemModel> & { type: ActionListItemType });
      await page.waitForChanges();
      expect(selectedItemsChangeEventSpy).toHaveReceivedEventDetail(
        actionListModelSimpleEventSpyDetail
      );
    });
  };

  selectionTests(true);
  selectionTests(false);
});
