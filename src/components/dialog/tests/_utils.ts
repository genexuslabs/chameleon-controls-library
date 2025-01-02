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
  partSelector: string
): Promise<CustomDOMRect> {
  if (!partSelector) {
    throw new Error("No partSelector provided.");
  }

  return await page.evaluate(partSelector => {
    const chDialog = document.querySelector("ch-dialog");
    if (!chDialog) {
      throw new Error("ch-dialog element not found.");
    }

    const element = chDialog.shadowRoot.querySelector(partSelector);
    if (!element) {
      throw new Error(
        `Element with selector "${partSelector}" not found in ch-dialog's shadow DOM.`
      );
    }

    const rect = element.getBoundingClientRect();

    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  }, partSelector);
}
