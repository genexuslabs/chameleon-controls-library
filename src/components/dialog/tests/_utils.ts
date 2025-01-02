// utils/_utils.ts

import { E2EPage } from "@stencil/core/testing";

export interface CustomDOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getDialogPartRect(
  page: E2EPage,
  partSelector: string = null
): Promise<CustomDOMRect | null> {
  return await page.evaluate(partSelector => {
    const chDialog = document.querySelector("ch-dialog");
    if (!chDialog) {
      throw new Error("ch-dialog element not found.");
    }

    const rect = chDialog.shadowRoot
      .querySelector(partSelector)
      .getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }, partSelector);
}
