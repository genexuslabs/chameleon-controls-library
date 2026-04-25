import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators/property.js";

// Side-effect import to define the segmented control component
import "../../../src/components/segmented-control/segmented-control-render.lit";

import {
  getComponentDisplayName,
  getComponentSlug
} from "../../core/component-registry";
import { navigate, getCurrentPathname } from "../../core/router-integration";

import styles from "./component-page.scss?inline";

const SECTIONS = [
  { id: "overview", caption: "Overview" },
  { id: "examples", caption: "Examples" },
  { id: "api", caption: "API" },
  { id: "style", caption: "Style" },
  { id: "accessibility", caption: "Accessibility" },
  { id: "playground", caption: "Playground" }
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

@Component({
  styles,
  tag: "showcase-component-page"
})
export class ShowcaseComponentPage extends KasstorElement {
  /**
   * The component tag name (e.g., "ch-checkbox").
   */
  @property({ attribute: "component-name" }) componentName: string | undefined;

  /**
   * The child content (section) rendered by the router.
   */
  @property({ attribute: false }) sectionContent:
    | TemplateResult
    | typeof nothing = nothing;

  #getActiveSection(): SectionId {
    const pathname = getCurrentPathname();
    const lastSegment = pathname.split("/").pop();

    for (const section of SECTIONS) {
      if (section.id === lastSegment) {
        return section.id;
      }
    }
    return "overview";
  }

  #handleSectionChange = (event: CustomEvent) => {
    if (!this.componentName) {
      return;
    }
    const slug = getComponentSlug(this.componentName);
    const selectedId =
      event.detail?.id ?? event.detail?.itemId ?? this.#getActiveSection();

    navigate(`/components/${slug}/${selectedId}`);
  };

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    const displayName = getComponentDisplayName(this.componentName);
    const activeSection = this.#getActiveSection();

    return html`
      <div class="component-page" part="component-page">
        <header class="page-header" part="page-header">
          <h1 class="page-title" part="page-title">${displayName}</h1>
          <code class="tag-name" part="tag-name"
            >&lt;${this.componentName}&gt;</code
          >
        </header>

        <nav class="sub-nav" part="sub-nav">
          ${SECTIONS.map(
            section => html`
              <button
                class="sub-nav-item ${section.id === activeSection ? "sub-nav-item--active" : ""}"
                part="sub-nav-item"
                @click=${() => {
                  if (!this.componentName) return;
                  const slug = getComponentSlug(this.componentName);
                  navigate(`/components/${slug}/${section.id}`);
                }}
              >
                ${section.caption}
              </button>
            `
          )}
        </nav>

        <div class="section-content" part="section-content">
          ${this.sectionContent}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-component-page": ShowcaseComponentPage;
  }
}
