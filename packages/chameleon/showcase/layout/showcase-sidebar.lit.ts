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

// Side-effect imports to define the components
import "../../src/components/navigation-list/navigation-list-render.lit";
import "../../src/components/sidebar/sidebar.lit";

import { navigate } from "../core/router-integration";
import { buildNavigationModel } from "../core/navigation-model";

import styles from "./showcase-sidebar.scss?inline";

@Component({
  styles,
  tag: "showcase-sidebar"
})
export class ShowcaseSidebar extends KasstorElement {
  #navigationModel: NavigationListModel = buildNavigationModel();

  /**
   * Current pathname, used to highlight the active navigation item.
   */
  @property() pathname: string | undefined;

  #handleNavClick = (
    event: CustomEvent<NavigationListHyperlinkClickEvent>
  ) => {
    event.preventDefault();
    const url = event.detail.item.link?.url;
    if (url) {
      navigate(url);
    }
  };

  override render() {
    return html`
      <ch-sidebar expanded part="sidebar">
        <ch-navigation-list-render
          .model=${this.#navigationModel}
          .selectedLink=${{ link: { url: this.pathname } }}
          selected-link-indicator
          @hyperlinkClick=${this.#handleNavClick}
        ></ch-navigation-list-render>
      </ch-sidebar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-sidebar": ShowcaseSidebar;
  }
}
