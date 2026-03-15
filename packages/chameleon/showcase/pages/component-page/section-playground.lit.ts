import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import "../../widgets/playground.lit";

@Component({
  tag: "showcase-section-playground"
})
export class ShowcaseSectionPlayground extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    return html`
      <showcase-playground
        component-name=${this.componentName}
      ></showcase-playground>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-playground": ShowcaseSectionPlayground;
  }
}
