import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChThemeCustomEvent } from "../../../components";
import { ChThemeLoadedEvent } from "../theme-types";
import { delayTest } from "../../../testing/utils.e2e";

describe("[ch-theme]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage();
  });

  it("should always be hidden", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect((await themeRef.getComputedStyle()).display).toEqual("none");
  });

  it("should not have Shadow DOM", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect(themeRef.shadowRoot).toBe(null);
  });

  it("should hide the root node if avoidFlashOfUnstyledContent is set", async () => {
    await page.setContent(`<ch-theme model="dummy"></ch-theme>`);
    const themeRef = await page.find("ch-theme");

    expect(themeRef.innerHTML).toBe(
      "<style>:host,html{visibility:hidden !important}</style>"
    );
  });

  it("should not hide the root node if avoidFlashOfUnstyledContent is false", async () => {
    await page.setContent(
      `<ch-theme avoid-flash-of-unstyled-content="false" model="url"></ch-theme>`
    );
    const themeRef = await page.find("ch-theme");

    expect(themeRef.innerHTML).toBe("");
  });

  it("should fire the themeLoaded event when setting a valid model", async () => {
    await page.setContent(`<ch-theme></ch-theme>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedEvent = themeRef.waitForEvent("themeLoaded");

    themeRef.setProperty("model", {
      name: "chameleon/scrollbar",
      url: "showcase/scrollbar.css"
    });

    await page.waitForChanges();
    const eventDetail: ChThemeCustomEvent<ChThemeLoadedEvent> =
      await themeLoadedEvent;

    expect(themeLoadedEvent).toBeTruthy();
    expect(eventDetail.detail.success.length).toEqual(1);
  });

  it("should timeout if the model does not have a mapped URL", async () => {
    const consoleMessages = [];

    page.on("console", message => {
      if (message.type() === "error") {
        consoleMessages.push(message.text());
      }
    });
    await page.setContent(`<ch-theme model="dummy" timeout="1000"></ch-theme>`);

    const themeRef = await page.find("ch-theme");
    const themeLoadedSpy = await themeRef.spyOnEvent("themeLoaded");

    await delayTest(1500);

    expect(themeLoadedSpy).toHaveReceivedEventDetail({
      success: []
    } satisfies ChThemeLoadedEvent);

    expect(consoleMessages[0]).toContain("Failed to load themes:");
  });
});
