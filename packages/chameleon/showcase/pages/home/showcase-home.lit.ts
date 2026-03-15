import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html } from "lit";

import { navigate } from "../../core/router-integration";

import styles from "./showcase-home.scss?inline";

@Component({
  styles,
  tag: "showcase-home"
})
export class ShowcaseHome extends KasstorElement {
  override render() {
    return html`
      <div class="hero" part="hero">
        <h1 class="hero-title" part="hero-title">Chameleon</h1>
        <p class="hero-subtitle" part="hero-subtitle">
          A Web Components design system built with
          <a href="https://lit.dev" target="_blank" rel="noopener">Lit</a>
          for building adaptive, accessible, and performant user interfaces.
        </p>

        <div class="hero-actions" part="hero-actions">
          <button
            class="cta-primary"
            part="cta-primary"
            @click=${() => navigate("/getting-started")}
          >
            Get Started
          </button>
          <button
            class="cta-secondary"
            part="cta-secondary"
            @click=${() => navigate("/components/checkbox/overview")}
          >
            View Components
          </button>
        </div>

        <div class="features" part="features">
          <div class="feature" part="feature">
            <h3>Framework Agnostic</h3>
            <p>
              Built on Web Components standards. Works with Angular, React, Vue,
              or vanilla JS.
            </p>
          </div>
          <div class="feature" part="feature">
            <h3>Accessible</h3>
            <p>
              ARIA attributes, keyboard navigation, and screen reader support
              built into every component.
            </p>
          </div>
          <div class="feature" part="feature">
            <h3>Themeable</h3>
            <p>
              CSS custom properties and shadow parts for complete visual
              customization.
            </p>
          </div>
          <div class="feature" part="feature">
            <h3>SSR Ready</h3>
            <p>
              Server-side rendering support for faster initial page loads and
              better SEO.
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-home": ShowcaseHome;
  }
}
