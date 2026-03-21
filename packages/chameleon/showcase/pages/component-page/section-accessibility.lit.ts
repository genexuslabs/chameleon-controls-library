import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import styles from "./section-accessibility.scss?inline";

@Component({
  styles,
  tag: "showcase-section-accessibility"
})
export class ShowcaseSectionAccessibility extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    return html`
      <section>
        <h2>Accessibility</h2>
        <p>
          Accessibility documentation for
          <code>&lt;${this.componentName}&gt;</code> will be added in a future
          update.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-accessibility": ShowcaseSectionAccessibility;
  }
}
