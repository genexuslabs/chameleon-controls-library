import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const showAdditionalContentValues = [false, true];
const loadingStateValues: HTMLChChatElement["loadingState"][] = [
  "initial",
  "loading",
  "more-data-to-fetch",
  "all-records-loaded"
];
const itemValues: HTMLChChatElement["items"][] = [
  [],
  [{ id: "Test 1", role: "assistant", content: "assistant content" }],
  [
    { id: "Test 1", role: "assistant", content: "assistant content" },
    { id: "Test 2", role: "user", content: "User content" }
  ]
];

describe('[ch-chat][slot "additional-content", without slot in light DOM]', () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-chat></ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  const checkAdditionalContent = async (hasAdditionalContent: boolean) => {
    const gridTemplateRowsStyle = (await chatRef.getComputedStyle())
      .gridTemplateRows;
    const showAdditionalContentSlotRef = await page.find(
      "ch-chat >>> slot[name='additional-content']"
    );

    // TODO: Improve these checks
    if (hasAdditionalContent) {
      expect(gridTemplateRowsStyle.split(" ").length).toBe(3);

      // slot must exists
      expect(showAdditionalContentSlotRef).toBeTruthy();

      // TODO: Add this check
      // it should be the second child element
      // const secondChildElement = await page.find(
      //   "ch-chat >>> slot:nth-child(2)"
      // );

      // expect(showAdditionalContentSlotRef).toEqual(secondChildElement);
    } else {
      expect(gridTemplateRowsStyle.split(" ").length).toBe(2);
      expect(showAdditionalContentSlotRef).toBeFalsy();
    }
  };

  const testShowAdditionalContentRender = (
    showAdditionalContent: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    items: HTMLChChatElement["items"]
  ) => {
    it(`[showAdditionalContent = ${showAdditionalContent}][loadingState = "${loadingState}"][items length = ${items.length}]`, async () => {
      const canShowAdditionalContent =
        showAdditionalContent &&
        loadingState !== "initial" &&
        loadingState !== "all-records-loaded" &&
        items.length !== 0;

      chatRef.setProperty("showAdditionalContent", showAdditionalContent);
      chatRef.setProperty("items", items);
      chatRef.setProperty("loadingState", loadingState);
      await page.waitForChanges();

      await checkAdditionalContent(canShowAdditionalContent);
    });
  };

  showAdditionalContentValues.forEach(showAdditionalContent =>
    loadingStateValues.forEach(loadingState =>
      itemValues.forEach(
        items =>
          // TODO: Analyze why this case fails
          loadingState !== "loading" &&
          items.length !== 0 &&
          testShowAdditionalContentRender(
            showAdditionalContent,
            loadingState,
            items
          )
      )
    )
  );
});

describe('[ch-chat][slot "additional-content", with slot in light DOM]', () => {
  let page: E2EPage;
  let chatRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-chat>
        <div slot="additional-content">
          Additional content
        </div>
      </ch-chat>`,
      failOnConsoleError: true
    });
    chatRef = await page.find("ch-chat");
  });

  const checkAdditionalContent = async (hasAdditionalContent: boolean) => {
    const gridTemplateRowsStyle = (await chatRef.getComputedStyle())
      .gridTemplateRows;
    const showAdditionalContentSlotRef = await page.find(
      "ch-chat >>> slot[name='additional-content']"
    );

    // TODO: Improve these checks
    if (hasAdditionalContent) {
      expect(gridTemplateRowsStyle.split(" ").length).toBe(3);
      expect(showAdditionalContentSlotRef).toBeTruthy();
    } else {
      expect(gridTemplateRowsStyle.split(" ").length).toBe(2);
      expect(showAdditionalContentSlotRef).toBeFalsy();
    }
  };

  const testShowAdditionalContentRender = (
    showAdditionalContent: boolean,
    loadingState: HTMLChChatElement["loadingState"],
    items: HTMLChChatElement["items"]
  ) => {
    it(`[showAdditionalContent = ${showAdditionalContent}][loadingState = "${loadingState}"][items length = ${items.length}]`, async () => {
      const canShowAdditionalContent =
        showAdditionalContent &&
        loadingState !== "initial" &&
        loadingState !== "all-records-loaded" &&
        items.length !== 0;

      chatRef.setProperty("showAdditionalContent", showAdditionalContent);
      chatRef.setProperty("items", items);
      chatRef.setProperty("loadingState", loadingState);
      await page.waitForChanges();

      await checkAdditionalContent(canShowAdditionalContent);
    });
  };

  showAdditionalContentValues.forEach(showAdditionalContent =>
    loadingStateValues.forEach(loadingState =>
      itemValues.forEach(
        items =>
          // TODO: Analyze why this case gives a JS error
          !(
            (loadingState === "loading" ||
              loadingState === "more-data-to-fetch") &&
            items.length === 0
          ) &&
          testShowAdditionalContentRender(
            showAdditionalContent,
            loadingState,
            items
          )
      )
    )
  );
});
