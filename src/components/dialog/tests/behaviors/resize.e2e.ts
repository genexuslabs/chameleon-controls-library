import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { getDialogPartRect, CustomDOMRect } from "../_utils";

// Note: Some issues have been experienced after doing more than one drag
// on a single "it" test. To avoid this issues, dragging tests have been
// done in separate "it" tests.

const viewPortWidth = 1920;
const viewPortHeight = 1080;

describe("[ch-dialog][resize]", () => {
  let page: E2EPage;
  let chDialogRef: E2EElement;

  const dialogSelector = "dialog";

  // Corners
  const cornerBlockStartInlineStartSelector =
    "[part~='corner-block-start-inline-start']";
  const cornerBlockStartInlineEndSelector =
    "[part~='corner-block-start-inline-end']";
  const cornerBlockEndInlineStartSelector =
    "[part~='corner-block-end-inline-start']";
  const cornerBlockEndInlineEndSelector =
    "[part~='corner-block-end-inline-end']";

  // Edges
  const edgeBlockEndSelector = "[part~='edge-block-end']";
  const edgeBlockStartSelector = "[part~='edge-block-start']";
  const edgeInlineEndSelector = "[part~='edge-inline-end']";
  const edgeInlineStartSelector = "[part~='edge-inline-start']";
  const chDialogBlockStart = 100;
  const chDialogInlineStart = 100;
  const threshold = 0;
  const resizeBlockValue = 20;
  const resizeInlineValue = 20;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-dialog>
        Dialog Content
      </ch-dialog>`,
      failOnConsoleError: true
    });
    await page.setViewport({ width: viewPortWidth, height: viewPortHeight });
    chDialogRef = await page.find("ch-dialog");

    chDialogRef.setProperty("resizable", true);
    await page.waitForChanges();

    // Set the dialog x and y on 0, to make it easier to evaluate drag changes.
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
  });

  // Inline Edges

  it.skip("should resize by dragging from 'edge-inline-start' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const edgeInlineStartRect: CustomDOMRect = await getDialogPartRect(
      page,
      edgeInlineStartSelector
    );

    const resizeTo = edgeInlineStartRect.x - resizeInlineValue;
    // resize
    await page.mouse.move(edgeInlineStartRect.x, edgeInlineStartRect.y);
    await page.mouse.down();
    await page.mouse.move(resizeTo, 0);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.width).toBeCloseTo(
      dialogRectBeforeResize.width + resizeInlineValue,
      threshold
    );
  });

  it.skip("should resize by dragging from 'edge-inline-end' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const edgeInlineEndRect: CustomDOMRect = await getDialogPartRect(
      page,
      edgeInlineEndSelector
    );

    const resizeTo = edgeInlineEndRect.x + resizeInlineValue;
    // resize
    await page.mouse.move(edgeInlineEndRect.x, edgeInlineEndRect.y);
    await page.mouse.down();
    await page.mouse.move(resizeTo, edgeInlineEndRect.y);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.width).toBeCloseTo(
      dialogRectBeforeResize.width + resizeInlineValue,
      threshold
    );
  });

  // Block Edges

  it.skip("should resize by dragging from 'edge-block-start' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const edgeBlockStartRect: CustomDOMRect = await getDialogPartRect(
      page,
      edgeBlockStartSelector
    );

    const resizeTo = edgeBlockStartRect.y - resizeBlockValue;

    // resize
    await page.mouse.move(edgeBlockStartRect.x, edgeBlockStartRect.y);
    await page.mouse.down();
    await page.mouse.move(edgeBlockStartRect.x, resizeTo);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });

  it.skip("should resize by dragging from 'edge-block-end' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const edgeBlockEndRect: CustomDOMRect = await getDialogPartRect(
      page,
      edgeBlockEndSelector
    );

    const resizeTo = edgeBlockEndRect.y + resizeBlockValue;

    // resize
    await page.mouse.move(edgeBlockEndRect.x, edgeBlockEndRect.y);
    await page.mouse.down();
    await page.mouse.move(edgeBlockEndRect.x, resizeTo);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });

  // Corner "top-left"

  it.skip("should resize by dragging from 'corner-block-start-inline-start' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const cornerBlockStartInlineStartRect: CustomDOMRect =
      await getDialogPartRect(page, cornerBlockStartInlineStartSelector);

    const resizeToX = cornerBlockStartInlineStartRect.x - resizeBlockValue;
    const resizeToY = cornerBlockStartInlineStartRect.y - resizeInlineValue;

    // resize
    await page.mouse.move(
      cornerBlockStartInlineStartRect.x,
      cornerBlockStartInlineStartRect.y
    );
    await page.mouse.down();
    await page.mouse.move(resizeToX, resizeToY);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });

  // Corner "top-right"

  it.skip("should resize by dragging from 'corner-block-start-inline-end' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const cornerBlockStartInlineEndRect: CustomDOMRect =
      await getDialogPartRect(page, cornerBlockStartInlineEndSelector);

    const resizeToX = cornerBlockStartInlineEndRect.x + resizeBlockValue;
    const resizeToY = cornerBlockStartInlineEndRect.y - resizeInlineValue;

    // resize
    await page.mouse.move(
      cornerBlockStartInlineEndRect.x,
      cornerBlockStartInlineEndRect.y
    );
    await page.mouse.down();
    await page.mouse.move(resizeToX, resizeToY);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });

  // Corner "bottom-left"

  it.skip("should resize by dragging from 'corner-block-end-inline-start' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const cornerBlockEndInlineStartRect: CustomDOMRect =
      await getDialogPartRect(page, cornerBlockEndInlineStartSelector);

    const resizeToX = cornerBlockEndInlineStartRect.x - resizeBlockValue;
    const resizeToY = cornerBlockEndInlineStartRect.y + resizeInlineValue;

    // resize
    await page.mouse.move(
      cornerBlockEndInlineStartRect.x,
      cornerBlockEndInlineStartRect.y
    );
    await page.mouse.down();
    await page.mouse.move(resizeToX, resizeToY);
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });

  // Corner "bottom-right"

  it("should resize by dragging from 'corner-block-end-inline-end' part", async () => {
    // get parts coordinates
    const dialogRectBeforeResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    const cornerBlockEndInlineEndRect: CustomDOMRect = await getDialogPartRect(
      page,
      cornerBlockEndInlineEndSelector
    );

    const resizeToX = cornerBlockEndInlineEndRect.x + resizeBlockValue;
    const resizeToY = cornerBlockEndInlineEndRect.y + resizeInlineValue;

    // resize
    await page.mouse.move(
      cornerBlockEndInlineEndRect.x,
      cornerBlockEndInlineEndRect.y
    );
    await page.mouse.down();
    await page.mouse.move(resizeToX, resizeToY, { steps: 10 });
    await page.mouse.up();

    const dialogRectAfterResize: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterResize.height).toBeCloseTo(
      dialogRectBeforeResize.height + resizeBlockValue,
      threshold
    );
  });
});
