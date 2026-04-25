import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { getComponentSlug } from "../../core/component-registry";
import {
  componentExamples,
  chameleonExamplesRegistry
} from "../../core/examples-registry";
import "../../../src/components/json-render/json-render.lit";

import styles from "./section-examples.scss?inline";

@Component({
  styles,
  tag: "showcase-section-examples"
})
export class ShowcaseSectionExamples extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    const examples = componentExamples[this.componentName] ?? [];

    if (examples.length === 0) {
      return html`
        <section class="examples" part="examples">
          <h2 id="examples">Examples</h2>
          <p class="empty-state">
            Code examples will be added in a future update.
          </p>
        </section>
      `;
    }

    const playgroundUrl = `/components/${getComponentSlug(this.componentName)}/playground`;

    return html`
      <section class="examples" part="examples">
        <h2 id="examples">Examples</h2>
        ${examples.map(
          ex => html`
            <div class="example-card">
              <h3 class="example-title">${ex.title}</h3>
              ${ex.description
                ? html`<p class="example-desc">${ex.description}</p>`
                : nothing}
              <div class="example-body">
                <div class="example-code">
                  <ch-code
                    language=${ex.language ?? "html"}
                    .value=${ex.code}
                  ></ch-code>
                </div>
                <div class="example-preview">
                  <ch-json-render
                    .spec=${ex.spec}
                    .registry=${chameleonExamplesRegistry}
                  ></ch-json-render>
                </div>
              </div>
            </div>
          `
        )}
        <p class="example-playground-link">
          <a href=${playgroundUrl} class="example-link">Try in Playground →</a>
        </p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-examples": ShowcaseSectionExamples;
  }
}
