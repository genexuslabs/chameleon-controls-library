import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

@Component({
  tag: "showcase-section-style"
})
export class ShowcaseSectionStyle extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    return html`
      <section>
        <h2>Style Guide</h2>
        <p>
          Styling documentation for
          <code>&lt;${this.componentName}&gt;</code> will be added in a future
          update.
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-style": ShowcaseSectionStyle;
  }
}
