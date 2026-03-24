import { html } from "lit";
import { MarkdownViewerExtensionRender } from "../parsers/types";
import { ExtendedContentMapping } from "./types";

const doSomething = (event: PointerEvent) => {
  const buttonRef = event.target as HTMLButtonElement;
  console.log("Clicked the button:", buttonRef.textContent);
};

export const render = {
  buttonReference: element =>
    html`<button type="button" @click=${doSomething}>${element.value}</button>`
} as const satisfies MarkdownViewerExtensionRender<ExtendedContentMapping>;
