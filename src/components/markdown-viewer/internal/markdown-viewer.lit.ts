import { LitElement, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

export class ChMarkdownViewerLit extends LitElement {
  /**
   * Specifies the template result to render.
   */
  @property({ attribute: false }) accessor value: TemplateResult[] | undefined;

  // "Shadow DOM === false"
  protected createRenderRoot() {
    return this;
  }

  render() {
    return this.value;
  }
}

customElements.define("ch-markdown-viewer-lit", ChMarkdownViewerLit);

declare global {
  interface HTMLElementTagNameMap {
    "ch-markdown-viewer-lit": ChMarkdownViewerLit;
  }
}
