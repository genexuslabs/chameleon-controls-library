import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";

import { getComponentDefinition } from "../../core/component-registry";

import styles from "./section-api.scss?inline";

@Component({
  styles,
  tag: "showcase-section-api"
})
export class ShowcaseSectionApi extends KasstorElement {
  @property({ attribute: "component-name" }) componentName: string | undefined;

  override render() {
    if (!this.componentName) {
      return nothing;
    }

    const definition = getComponentDefinition(this.componentName);

    if (!definition) {
      return html`<p>Component not found in library summary.</p>`;
    }

    return html`
      <section class="api" part="api">
        ${this.#renderProperties(definition)}
        ${this.#renderEvents(definition)}
        ${this.#renderCssVariables(definition)}
      </section>
    `;
  }

  #renderProperties(definition: NonNullable<ReturnType<typeof getComponentDefinition>>) {
    const properties = definition.properties;

    if (!properties || properties.length === 0) {
      return nothing;
    }

    return html`
      <h2 id="properties">Properties</h2>
      <div class="table-wrapper">
        <table class="api-table" part="api-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Attribute</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${properties.map(
              prop => html`
                <tr>
                  <td><code>${prop.name}</code></td>
                  <td>
                    <code>${prop.attribute === false ? "—" : prop.attribute || prop.name}</code>
                  </td>
                  <td><code>${prop.type?.trim() || "unknown"}</code></td>
                  <td><code>${prop.default ?? "—"}</code></td>
                  <td>${prop.description || "—"}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  #renderEvents(definition: NonNullable<ReturnType<typeof getComponentDefinition>>) {
    const events = definition.events;

    if (!events || events.length === 0) {
      return nothing;
    }

    return html`
      <h2 id="events">Events</h2>
      <div class="table-wrapper">
        <table class="api-table" part="api-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Detail Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(
              event => html`
                <tr>
                  <td><code>${event.name}</code></td>
                  <td><code>${event.detailType || "void"}</code></td>
                  <td>${event.description || "—"}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  #renderCssVariables(definition: NonNullable<ReturnType<typeof getComponentDefinition>>) {
    const cssVars = definition.cssVariables;

    if (!cssVars || cssVars.length === 0) {
      return nothing;
    }

    return html`
      <h2 id="css-variables">CSS Variables</h2>
      <div class="table-wrapper">
        <table class="api-table" part="api-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${cssVars.map(
              cssVar => html`
                <tr>
                  <td><code>${cssVar.name}</code></td>
                  <td>${cssVar.description || "—"}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "showcase-section-api": ShowcaseSectionApi;
  }
}
