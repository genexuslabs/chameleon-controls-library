import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { getDialogPartRect, CustomDOMRect } from "../_utils";

const viewPortWidth = 1920;
const viewPortHeight = 1080;
let dialogDOMRect: CustomDOMRect;

describe("[ch-dialog][modal]", () => {
  let page: E2EPage;
  let chDialogRef: E2EElement;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `<ch-dialog>Dialog Content</ch-dialog>`,
      failOnConsoleError: true
    });
    await page.setViewport({ width: viewPortWidth, height: viewPortHeight });

    chDialogRef = await page.find("ch-dialog");
  });

  it.skip("should be centered on the viewport", async () => {
    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    dialogDOMRect = await getDialogPartRect(page);

    const estimatedXPosition = viewPortWidth / 2 - dialogDOMRect.width / 2;
    const estimatedYPosition = viewPortHeight / 2 - dialogDOMRect.height / 2;
    const threshold = 0; // 0 means compare integers, not decimal places.

    expect(dialogDOMRect.x).toBeCloseTo(estimatedXPosition, threshold);
    expect(dialogDOMRect.y).toBeCloseTo(estimatedYPosition, threshold);
  });

  it.skip("should consider '--ch-dialog-block-start' and '--ch-dialog-inline-start' in the initial position", async () => {
    const chDialogBlockStart = 50;
    const chDialogInlineStart = 50;
    const threshold = 0; // 0 means compare integers, not decimal places.

    await page.evaluate(
      (x, y) => {
        const style = document.createElement("style");
        style.textContent = `
          ch-dialog {
            --ch-dialog-inline-start: ${x}px;
            --ch-dialog-block-start: ${y}px;
          }
        `;
        document.head.appendChild(style);
      },
      chDialogInlineStart,
      chDialogBlockStart
    );

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    dialogDOMRect = await getDialogPartRect(page);

    expect(dialogDOMRect.x).toBeCloseTo(chDialogBlockStart, threshold);
    expect(dialogDOMRect.y).toBeCloseTo(chDialogInlineStart, threshold);
  });

  it.skip("should mantain position after close", async () => {
    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    dialogDOMRect = await getDialogPartRect(page);

    const estimatedXPosition = viewPortWidth / 2 - dialogDOMRect.width / 2;
    const estimatedYPosition = viewPortHeight / 2 - dialogDOMRect.height / 2;
    const threshold = 0; // 0 means compare integers, not decimal places.

    expect(dialogDOMRect.x).toBeCloseTo(estimatedXPosition, threshold);
    expect(dialogDOMRect.y).toBeCloseTo(estimatedYPosition, threshold);
  });
});
