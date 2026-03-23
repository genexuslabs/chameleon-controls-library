import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";

import { navigate } from "../core/router-integration";

import styles from "./showcase-header.scss?inline";

@Component({
  styles,
  tag: "showcase-header"
})
export class ShowcaseHeader extends KasstorElement {
  #handleLogoClick = (event: MouseEvent) => {
    event.preventDefault();
    navigate("/");
  };

  #handleNavClick = (event: MouseEvent) => {
    const anchor = event.currentTarget as HTMLAnchorElement;
    const href = anchor.getAttribute("href");
    if (href) {
      event.preventDefault();
      navigate(href);
    }
  };

  override render() {
    return html`
      <header class="header" part="header">
        <a
          href="/"
          class="logo-link"
          part="logo-link"
          @click=${this.#handleLogoClick}
        >
          <span class="logo-text" part="logo-text">Chameleon</span>
        </a>

        <nav class="nav" part="nav">
          <a
            href="/chat"
            class="nav-link"
            part="nav-link"
            @click=${this.#handleNavClick}
            >Chat</a
          >
          <a
            href="/getting-started"
            class="nav-link"
            part="nav-link"
            @click=${this.#handleNavClick}
            >Getting Started</a
          >
          <a
            href="/components/checkbox/overview"
            class="nav-link"
            part="nav-link"
            @click=${this.#handleNavClick}
            >Components</a
          >
          <a
            href="/playground"
            class="nav-link"
            part="nav-link"
            @click=${this.#handleNavClick}
            >Playground</a
          >
        </nav>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-header": ShowcaseHeader;
  }
}
