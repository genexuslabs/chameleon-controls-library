import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import {
  getComponentDefinition,
  getComponentDisplayName,
  getComponentSlug
} from "../../core/component-registry";
import {
  componentExamples,
  chameleonExamplesRegistry
} from "../../core/examples-registry";
import "../../../src/components/json-render/json-render.lit";

import styles from "./section-overview.scss?inline";

@Component({
  styles,
  tag: "showcase-section-overview"
})
export class ShowcaseSectionOverview extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  #renderExamples(componentName: string) {
    const examples = componentExamples[componentName] ?? [];
    if (examples.length === 0) {
      return html`<p>Code examples will be added in a future update.</p>`;
    }
    const playgroundUrl = `/components/${getComponentSlug(componentName)}/playground`;
    return html`
      ${examples.map(
        ex => html`
          <div class="example-card">
            <h3 class="example-title">${ex.title}</h3>
            ${ex.description
              ? html`<p class="example-desc">${ex.description}</p>`
              : nothing}
            <div class="example-preview">
              <ch-json-render
                .spec=${ex.spec}
                .registry=${chameleonExamplesRegistry}
              ></ch-json-render>
            </div>
            <ch-code
              language=${ex.language ?? "html"}
              .value=${ex.code}
            ></ch-code>
          </div>
        `
      )}
      <p class="example-playground-link">
        <a href=${playgroundUrl} class="example-link">Try in Playground →</a>
      </p>
    `;
  }

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
        ${this.#renderExamples(this.componentName)}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-overview": ShowcaseSectionOverview;
  }
}
