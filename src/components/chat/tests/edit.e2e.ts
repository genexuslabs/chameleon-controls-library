import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";

const EDIT_EMPTY_PARTS = "ch-edit--empty-value send-input";
const EDIT_WITH_VALUE_PARTS = "send-input";

describe("[ch-chat][ch-edit]", () => {
  let page: E2EPage;
  let chatRef: E2EElement;
  let editRef: E2EElement;
  let textareaRef: E2EElement;

  const setChatRef = async () => {
    chatRef = await page.find("ch-chat");
  };
  const setEditRef = async () => {
    editRef = await page.find("ch-chat >>> ch-edit");
  };
  const setTextareaRef = async () => {
    textareaRef = await page.find("ch-chat >>> ch-edit >>> textarea");
  };

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: `<ch-chat></ch-chat>`
    });
    await setChatRef();
    await setEditRef();
    await setTextareaRef();
  });

  it(`the ch-edit should have the "${EDIT_EMPTY_PARTS}" parts by default`, () => {
    expect(editRef).toEqualAttribute("part", EDIT_EMPTY_PARTS);
  });

  it(`the ch-edit should have the "${EDIT_WITH_VALUE_PARTS}" part after pressing a key`, async () => {
    await textareaRef.press("h");
    await page.waitForChanges();
    await setEditRef();

    expect(editRef).toEqualAttribute("part", EDIT_WITH_VALUE_PARTS);
  });

  it(`the ch-edit should have again the "${EDIT_EMPTY_PARTS}" parts after sending a message`, async () => {
    chatRef.setProperty("loadingState", "all-records-loaded");
    await textareaRef.press("h");
    await page.waitForChanges();

    await textareaRef.press("Enter");
    await page.waitForChanges();
    await setEditRef();

    expect(editRef).toEqualAttribute("part", EDIT_EMPTY_PARTS);
  });
});
