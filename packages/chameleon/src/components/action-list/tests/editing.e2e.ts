import {
  E2EElement,
  E2EPage,
  EventSpy,
  newE2EPage
} from "@stencil/core/testing";
import { GxEAIRecentChats } from "../../../showcase/assets/components/action-list/models";

const testEditing = (selection: HTMLChActionListRenderElement["selection"]) => {
  const eventDescription =
    selection === "none" ? "itemClick" : "selectedItemsChange";

  describe(`[ch-action-list-render][editing][selection="${selection}"]`, () => {
    let page: E2EPage;
    let actionListRef: E2EElement;
    let itemClickEventSpy: EventSpy;
    let selectedItemsChangeEventSpy: EventSpy;

    const checkReceivedEventTimes = (
      selectedItemsChangeDispatchedCount: number,
      itemClickDispatchedCount: number
    ) => {
      expect(selectedItemsChangeEventSpy).toHaveReceivedEventTimes(
        selectedItemsChangeDispatchedCount
      );
      expect(itemClickEventSpy).toHaveReceivedEventTimes(
        itemClickDispatchedCount
      );
    };

    beforeEach(async () => {
      page = await newE2EPage({
        failOnConsoleError: true,
        html: `<ch-action-list-render selection="${selection}"></ch-action-list-render>`
      });
      actionListRef = await page.find("ch-action-list-render");
      actionListRef.setProperty("model", GxEAIRecentChats);
      itemClickEventSpy = await actionListRef.spyOnEvent("itemClick");
      selectedItemsChangeEventSpy = await actionListRef.spyOnEvent(
        "selectedItemsChange"
      );
      await page.waitForChanges();
    });

    it(`should trigger ${eventDescription} when the item is not being edited`, async () => {
      const actionListItemRef = await page.find(
        "ch-action-list-render >>> [id='2022 employee contracts'] >>> button"
      );

      // TODO: Add "Enter" and "Click" cases
      await actionListItemRef.press("Space");

      if (selection === "none") {
        checkReceivedEventTimes(0, 1);
      } else {
        checkReceivedEventTimes(1, 0);
      }
    });

    it(`should trigger not trigger ${eventDescription} when the item is being edited`, async () => {
      const actionListItemRef = await page.find(
        "ch-action-list-render >>> [id='2022 employee contracts'] >>> button"
      );

      // TODO: Add "Enter" and "Click" cases
      await actionListItemRef.press("F2");
      await page.waitForChanges();
      await actionListItemRef.press("Space");

      checkReceivedEventTimes(0, 0);
    });

    it(`should trigger ${eventDescription} when the item is not being edited, but others are`, async () => {
      const actionListItem1Ref = await page.find(
        "ch-action-list-render >>> [id='2022 employee contracts'] >>> button"
      );
      const actionListItem2Ref = await page.find(
        "ch-action-list-render >>> [id='Investors reports'] >>> button"
      );

      // TODO: Add "Enter" and "Click" cases
      await actionListItem1Ref.press("F2");
      await page.waitForChanges();
      await actionListItem2Ref.press("Space");
      await page.waitForChanges();

      if (selection === "none") {
        checkReceivedEventTimes(0, 1);
      } else {
        checkReceivedEventTimes(1, 0);
      }
    });
  });
};

testEditing("none");
testEditing("single");
testEditing("multiple");
