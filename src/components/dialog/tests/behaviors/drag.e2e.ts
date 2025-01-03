import { E2EElement, E2EPage, newE2EPage } from "@stencil/core/testing";
import { getDialogPartRect, CustomDOMRect } from "../_utils";

// Note: Some issues have been experienced after doing more than one drag
// on a single "it" test. To avoid this issues, dragging tests have been
// done in separate "it" tests.

const viewPortWidth = 1920;
const viewPortHeight = 1080;

describe("[ch-dialog][allowDrag]", () => {
  let page: E2EPage;
  let chDialogRef: E2EElement;
  let headerPart: E2EElement;
  let contentPart: E2EElement;
  let footerPart: E2EElement;
  const dialogSelector = "dialog";
  const headerSelector = "[part='header']";
  const contentSelector = "[part='content']";
  const footerSelector = "[part='footer']";
  const chDialogBlockStart = 50;
  const chDialogInlineStart = 50;
  const threshold = 0;
  const dragBlockValue = 10;
  const dragInlineValue = 10;

  beforeEach(async () => {
    page = await newE2EPage({
      html: `
      <ch-dialog>
        Dialog Content
        <div slot="footer">
          <button type="button" class="button-primary">Save</button>
        </div>
      </ch-dialog>`,
      failOnConsoleError: true
    });
    await page.setViewport({ width: viewPortWidth, height: viewPortHeight });
    chDialogRef = await page.find("ch-dialog");

    chDialogRef.setProperty("caption", "Caption that appears on the header");
    await page.waitForChanges();
    chDialogRef.setProperty("showHeader", true);
    await page.waitForChanges();
    chDialogRef.setProperty("showFooter", true);
    await page.waitForChanges();

    headerPart = await page.find(`ch-dialog >>> ${headerSelector}`);
    contentPart = await page.find(`ch-dialog >>> ${contentSelector}`);
    footerPart = await page.find(`ch-dialog >>> ${footerSelector}`);

    if (!headerPart || !contentPart || !footerPart) {
      throw new Error("header part of footer part not found.");
    }

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
  });

  // Drag from header

  it("should allow drag from the header only", async () => {
    chDialogRef.setProperty("allowDrag", "header");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDrag: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const headerRectBeforeDrag: CustomDOMRect = await getDialogPartRect(
      page,
      headerSelector
    );

    expect(dialogRectBeforeDrag.x).toBeCloseTo(chDialogInlineStart, threshold);
    expect(dialogRectBeforeDrag.y).toBeCloseTo(chDialogBlockStart, threshold);

    // then drag
    await page.mouse.move(headerRectBeforeDrag.x, headerRectBeforeDrag.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDrag: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterDrag.x).toBeCloseTo(dragInlineValue, threshold);
    expect(dialogRectAfterDrag.y).toBeCloseTo(dragBlockValue, threshold);
  });

  it("should not allow drag from the content (header only)", async () => {
    chDialogRef.setProperty("allowDrag", "header");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const contentRect: CustomDOMRect = await getDialogPartRect(
      page,
      contentSelector
    );

    expect(dialogRectBeforeDragFromContent.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromContent.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    // then try to drag from the content
    await page.mouse.move(contentRect.x, contentRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from content
    expect(dialogRectAfterDragFromContent.x).toBeCloseTo(
      dialogRectBeforeDragFromContent.x,
      threshold
    );
    expect(dialogRectAfterDragFromContent.y).toBeCloseTo(
      dialogRectBeforeDragFromContent.y,
      threshold
    );
  });

  it("should not allow drag from the footer (header only)", async () => {
    chDialogRef.setProperty("allowDrag", "header");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDragFromFooter: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const footerRect: CustomDOMRect = await getDialogPartRect(
      page,
      footerSelector
    );

    expect(dialogRectBeforeDragFromFooter.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromFooter.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    // then try to drag from the footer
    await page.mouse.move(footerRect.x, footerRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromFooter: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from content
    expect(dialogRectAfterDragFromFooter.x).toBeCloseTo(
      dialogRectBeforeDragFromFooter.x,
      threshold
    );
    expect(dialogRectAfterDragFromFooter.y).toBeCloseTo(
      dialogRectBeforeDragFromFooter.y,
      threshold
    );
  });

  // Drag from footer

  it("should allow drag from the footer only", async () => {
    chDialogRef.setProperty("allowDrag", "footer");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDrag: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );
    const footerRectBeforeDrag: CustomDOMRect = await getDialogPartRect(
      page,
      footerSelector
    );

    expect(dialogRectBeforeDrag.x).toBeCloseTo(chDialogInlineStart, threshold);
    expect(dialogRectBeforeDrag.y).toBeCloseTo(chDialogBlockStart, threshold);

    // then drag
    await page.mouse.move(footerRectBeforeDrag.x, footerRectBeforeDrag.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDrag: CustomDOMRect = await getDialogPartRect(
      page,
      dialogSelector
    );

    expect(dialogRectAfterDrag.x).toBeCloseTo(
      dialogRectBeforeDrag.x,
      threshold
    );
    expect(dialogRectAfterDrag.y).toBeCloseTo(
      dialogRectBeforeDrag.y,
      threshold
    );
  });

  it("should not allow drag from the content (footer only)", async () => {
    chDialogRef.setProperty("allowDrag", "footer");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const contentRect: CustomDOMRect = await getDialogPartRect(
      page,
      contentSelector
    );

    expect(dialogRectBeforeDragFromContent.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromContent.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    // then try to drag from the content
    await page.mouse.move(contentRect.x, contentRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from content
    expect(dialogRectAfterDragFromContent.x).toBeCloseTo(
      dialogRectBeforeDragFromContent.x,
      threshold
    );
    expect(dialogRectAfterDragFromContent.y).toBeCloseTo(
      dialogRectBeforeDragFromContent.y,
      threshold
    );
  });

  it("should not allow drag from the header (footer only)", async () => {
    chDialogRef.setProperty("allowDrag", "footer");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // get parts coordinates
    const dialogRectBeforeDragFromHeader: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const headerRect: CustomDOMRect = await getDialogPartRect(
      page,
      headerSelector
    );

    expect(dialogRectBeforeDragFromHeader.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromHeader.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    // then try to drag from the header
    await page.mouse.move(headerRect.x, headerRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromHeader: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from header
    expect(dialogRectAfterDragFromHeader.x).toBeCloseTo(
      dialogRectBeforeDragFromHeader.x,
      threshold
    );
    expect(dialogRectAfterDragFromHeader.y).toBeCloseTo(
      dialogRectBeforeDragFromHeader.y,
      threshold
    );
  });

  // Do not drag

  it("should not allow drag from the header", async () => {
    chDialogRef.setProperty("allowDrag", "no");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    const dialogRectBeforeDragFromHeader: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const headerRect: CustomDOMRect = await getDialogPartRect(
      page,
      headerSelector
    );

    expect(dialogRectBeforeDragFromHeader.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromHeader.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    await page.mouse.move(headerRect.x, headerRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromHeader: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from header
    expect(dialogRectAfterDragFromHeader.x).toBeCloseTo(
      dialogRectBeforeDragFromHeader.x,
      threshold
    );
    expect(dialogRectAfterDragFromHeader.y).toBeCloseTo(
      dialogRectBeforeDragFromHeader.y,
      threshold
    );
  });

  it("should not allow drag from the content", async () => {
    chDialogRef.setProperty("allowDrag", "no");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    const dialogRectBeforeDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const contentRect: CustomDOMRect = await getDialogPartRect(
      page,
      contentSelector
    );

    expect(dialogRectBeforeDragFromContent.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromContent.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    await page.mouse.move(contentRect.x, contentRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromContent: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from content
    expect(dialogRectAfterDragFromContent.x).toBeCloseTo(
      dialogRectBeforeDragFromContent.x,
      threshold
    );
    expect(dialogRectAfterDragFromContent.y).toBeCloseTo(
      dialogRectBeforeDragFromContent.y,
      threshold
    );
  });

  it("should not allow drag from the footer", async () => {
    chDialogRef.setProperty("allowDrag", "no");
    await page.waitForChanges();

    chDialogRef.setProperty("show", true);
    await page.waitForChanges();

    // - - - - - - - - - - - - -
    // Try to drag from footer
    // - - - - - - - - - - - - -

    const dialogRectBeforeDragFromFooter: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);
    const footerRect: CustomDOMRect = await getDialogPartRect(
      page,
      footerSelector
    );

    expect(dialogRectBeforeDragFromFooter.x).toBeCloseTo(
      chDialogInlineStart,
      threshold
    );
    expect(dialogRectBeforeDragFromFooter.y).toBeCloseTo(
      chDialogBlockStart,
      threshold
    );

    await page.mouse.move(footerRect.x, footerRect.y);
    await page.mouse.down();
    await page.mouse.move(dragInlineValue, dragBlockValue);
    await page.mouse.up();

    const dialogRectAfterDragFromFooter: CustomDOMRect =
      await getDialogPartRect(page, dialogSelector);

    // Dialog should not have been moved after drag from footer
    expect(dialogRectAfterDragFromFooter.x).toBeCloseTo(
      dialogRectBeforeDragFromFooter.x,
      threshold
    );
    expect(dialogRectAfterDragFromFooter.y).toBeCloseTo(
      dialogRectBeforeDragFromFooter.y,
      threshold
    );
  });
});
