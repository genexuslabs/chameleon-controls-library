import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";
import { property } from "lit/decorators/property.js";

import type {
  NavigationListHyperlinkClickEvent,
  NavigationListModel
} from "../../src/components/navigation-list/types";
import "../../src/components/navigation-list/navigation-list-render.lit";

import "../widgets/playground.lit";

import { navigate } from "../core/router-integration";
import { getPublicComponents, getComponentDisplayName } from "../core/component-registry";

import styles from "./global-playground.scss?inline";

@Component({
  styles,
  tag: "showcase-global-playground"
})
export class ShowcaseGlobalPlayground extends KasstorElement {
  /** Currently selected component tag name. */
  @property({ attribute: "component-name" }) componentName: string =
    "ch-checkbox";

  #componentListModel: NavigationListModel = this.#buildComponentListModel();

  #buildComponentListModel(): NavigationListModel {
    const components = getPublicComponents();
    return [
      {
        id: "components",
        caption: "Components",
        expanded: true,
        items: components.map(c => ({
          id: c.tagName,
          caption: getComponentDisplayName(c.tagName),
          leaf: true,
          link: { url: `/playground?component=${c.tagName}` }
        }))
      }
    ];
  }

  override connectedCallback() {
    super.connectedCallback();
    // Read ?component= query param if present
    const params = new URLSearchParams(window.location.search);
    const comp = params.get("component");
    if (comp) {
      this.componentName = comp;
    }
  }

  #handleNavClick = (
    event: CustomEvent<NavigationListHyperlinkClickEvent>
  ) => {
    event.preventDefault();
    const url = event.detail.item.link?.url;
    if (!url) return;
    // Update the selected component without a full navigation
    const params = new URLSearchParams(url.split("?")[1] ?? "");
    const comp = params.get("component");
    if (comp) {
      this.componentName = comp;
      // Update URL so the user can share/bookmark the selection
      history.replaceState(null, "", `/playground?component=${comp}`);
    }
  };

  override render() {
    return html`
      <div class="global-playground-layout" part="layout">
        <aside class="component-selector" part="component-selector">
          <div class="selector-header">Components</div>
          <ch-navigation-list-render
            class="selector-nav"
            .model=${this.#componentListModel}
            .selectedLink=${{ link: { url: `/playground?component=${this.componentName}` } }}
            selected-link-indicator
            @hyperlinkClick=${this.#handleNavClick}
          ></ch-navigation-list-render>
        </aside>

        <main class="playground-main" part="playground-main">
          <showcase-playground
            component-name=${this.componentName}
          ></showcase-playground>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-global-playground": ShowcaseGlobalPlayground;
  }
}
