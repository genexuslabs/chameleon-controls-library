import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import {
  getComponentDefinition,
  getComponentDisplayName
} from "../../core/component-registry";

import styles from "./section-overview.scss?inline";

@Component({
  styles,
  tag: "showcase-section-overview"
})
export class ShowcaseSectionOverview extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    const definition = getComponentDefinition(this.componentName);
    const displayName = getComponentDisplayName(this.componentName);
    const description = definition?.description || "No description available.";

    return html`
      <section class="overview" part="overview">
        <h2 id="description">Description</h2>
        <p>${description}</p>

        <h2 id="features">Features</h2>
        <p>Documentation coming soon.</p>

        <h2 id="examples">Examples</h2>
        <p>Code examples will be added in a future update.</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-overview": ShowcaseSectionOverview;
  }
}
