import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

// Router
import "../src/components/router/router.lit";
import type { RouterModel } from "../src/components/router/types";

// Layout components
import "./layout/showcase-header.lit";
import "./layout/showcase-sidebar.lit";
import "./layout/showcase-toc.lit";

// Page components
import "./pages/home/showcase-home.lit";
import "./pages/getting-started/showcase-getting-started.lit";
import "./pages/chat/showcase-chat.lit";
import "./pages/chat/showcase-chat2.lit";
import "./pages/component-page/component-page.lit";
import "./playground/global-playground.lit";

// Section components
import "./pages/component-page/section-overview.lit";
import "./pages/component-page/section-api.lit";
import "./pages/component-page/section-style.lit";
import "./pages/component-page/section-accessibility.lit";
import "./pages/component-page/section-playground.lit";

// Core
import {
  getPublicComponents,
  getComponentSlug
} from "./core/component-registry";
import {
  initRouterIntegration,
  handleLinkClick
} from "./core/router-integration";

import styles from "./showcase.scss?inline";

/**
 * Builds the route tree programmatically from the component registry.
 * Each public component gets a set of child routes for its 5 sections.
 */
function buildRouterModel(): RouterModel {
  const componentChildren: RouterModel = {};

  for (const component of getPublicComponents()) {
    const slug = getComponentSlug(component.tagName);
    const tagName = component.tagName;

    componentChildren[slug] = {
      render: (child?: TemplateResult | typeof nothing) => html`
        <showcase-component-page
          component-name=${tagName}
          .sectionContent=${child ?? nothing}
        ></showcase-component-page>
      `,
      children: {
        // Default to overview when navigating to /components/{slug}
        "": {
          render: () => html`
            <showcase-section-overview
              component-name=${tagName}
            ></showcase-section-overview>
          `
        },
        overview: {
          render: () => html`
            <showcase-section-overview
              component-name=${tagName}
            ></showcase-section-overview>
          `
        },
        api: {
          render: () => html`
            <showcase-section-api
              component-name=${tagName}
            ></showcase-section-api>
          `
        },
        style: {
          render: () => html`
            <showcase-section-style
              component-name=${tagName}
            ></showcase-section-style>
          `
        },
        accessibility: {
          render: () => html`
            <showcase-section-accessibility
              component-name=${tagName}
            ></showcase-section-accessibility>
          `
        },
        playground: {
          render: () => html`
            <showcase-section-playground
              component-name=${tagName}
            ></showcase-section-playground>
          `
        }
      }
    };
  }

  return {
    // Home page (default route)
    "": {
      render: () => html`<showcase-home></showcase-home>`
    },

    // Chat
    "chat": {
      render: () =>
        /* html`<showcase-chat></showcase-chat>` */
      html`<showcase-chat2></showcase-chat2>`
    },

    // Getting started
    "getting-started": {
      render: () =>
        html`<showcase-getting-started></showcase-getting-started>`
    },

    // Global playground
    playground: {
      render: () =>
        html`<showcase-global-playground></showcase-global-playground>`
    },

    // Component pages
    components: {
      render: (child?: TemplateResult | typeof nothing) => child ?? nothing,
      children: componentChildren
    },

    // 404
    "*": {
      render: () =>
        html`<div style="padding: 32px 40px;">
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>`
    }
  };
}

@Component({
  styles,
  tag: "ch-showcase"
})
export class ChShowcase extends KasstorElement {
  #routerModel: RouterModel = buildRouterModel();

  @property() pathname: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();

    // Set up History API integration
    initRouterIntegration(pathname => {
      this.pathname = pathname;
    });

    // Intercept link clicks for SPA navigation
    this.addEventListener("click", handleLinkClick);
  }

  #isHomePage(): boolean {
    return !this.pathname || this.pathname === "/";
  }

  override render() {
    const isHome = this.#isHomePage();

    return html`
      <showcase-header></showcase-header>

      ${isHome
        ? html`
            <main class="main-home">
              <ch-router
                .model=${this.#routerModel}
                .pathname=${this.pathname}
              ></ch-router>
            </main>
          `
        : html`
            <div class="docs-layout">
              <showcase-sidebar
                class="sidebar"
                .pathname=${this.pathname}
              ></showcase-sidebar>

              <main class="main-content">
                <ch-router
                  .model=${this.#routerModel}
                  .pathname=${this.pathname}
                ></ch-router>
              </main>

              <showcase-toc
                class="toc"
                .pathname=${this.pathname}
              ></showcase-toc>
            </div>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ch-showcase": ChShowcase;
  }
}
