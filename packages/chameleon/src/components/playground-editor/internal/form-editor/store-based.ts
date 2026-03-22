import { html, nothing } from "lit";
import type { StateStore } from "@json-render/core";

import "../../../switch/switch.lit";
import type ChSwitch from "../../../switch/switch.lit";

import type { PlaygroundStateTypeMeta } from "../../typings/playground-json-render-model";

/**
 * Infers the form editor type from an initial state value when no explicit
 * stateTypes override is provided.
 */
export const inferStateType = (value: unknown): string => {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value) || (typeof value === "object" && value !== null))
    return "object";
  return "string";
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                   Per-type editor renderers
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const booleanEditorFromStore = (
  key: string,
  value: boolean,
  store: StateStore
) =>
  html`<label class="label" for=${key}>${key}</label>
    <ch-switch
      id=${key}
      name=${key}
      class="switch-small"
      .checked=${value}
      @input=${(e: CustomEvent) => {
        store.set("/" + key, (e.target as ChSwitch).checked);
      }}
    ></ch-switch>`;

const numberEditorFromStore = (
  key: string,
  value: number,
  store: StateStore
) =>
  html`<label class="label" for=${key}>${key}</label>
    <input
      id=${key}
      name=${key}
      class="input"
      type="number"
      value=${value}
      @input=${(e: Event) => {
        store.set("/" + key, Number((e.target as HTMLInputElement).value));
      }}
    ></input>`;

const stringEditorFromStore = (
  key: string,
  value: string,
  store: StateStore
) =>
  html`<label class="label" for=${key}>${key}</label>
    <input
      id=${key}
      name=${key}
      class="input"
      type="text"
      value=${value}
      @input=${(e: Event) => {
        store.set("/" + key, (e.target as HTMLInputElement).value);
      }}
    ></input>`;

const stringMultilineEditorFromStore = (
  key: string,
  value: string,
  store: StateStore
) =>
  html`<label class="label" for=${key}>${key}</label>
    <textarea
      id=${key}
      name=${key}
      class="input"
      .value=${value ?? ""}
      @input=${(e: Event) => {
        store.set("/" + key, (e.target as HTMLTextAreaElement).value);
      }}
    ></textarea>`;

const enumEditorFromStore = (
  key: string,
  value: string,
  options: string[],
  store: StateStore
) =>
  html`<label class="label" for=${key}>${key}</label>
    <select
      id=${key}
      name=${key}
      class="input"
      .value=${value ?? ""}
      @change=${(e: Event) => {
        store.set("/" + key, (e.target as HTMLSelectElement).value);
      }}
    >
      ${options.map(
        opt => html`<option value=${opt} ?selected=${opt === value}>${opt}</option>`
      )}
    </select>`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//                     Main export
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Renders a property editor panel driven by a StateStore.
 *
 * - Reads current values from `store.getSnapshot()`.
 * - Each editor calls `store.set("/" + key, newValue)` on change; the store
 *   subscription in playground-editor automatically triggers requestUpdate().
 * - Types are inferred from initial values; override with `stateTypes` for
 *   enum, string-multiline, or other non-inferrable types.
 * - Keys of type object/ref/function are skipped (not editable in the form).
 */
export const renderPropertiesFromStore = (
  store: StateStore,
  stateTypes?: Record<string, PlaygroundStateTypeMeta>
) => {
  const snapshot = store.getSnapshot();
  const keys = Object.keys(snapshot);

  if (keys.length === 0) return nothing;

  return html`<div class="property-editor" part="property-editor">
    ${keys.map(key => {
      const override = stateTypes?.[key];
      const type = override?.type ?? inferStateType(snapshot[key]);
      const currentValue = snapshot[key];

      switch (type) {
        case "boolean":
          return booleanEditorFromStore(key, currentValue as boolean, store);

        case "number":
          return numberEditorFromStore(key, currentValue as number, store);

        case "string":
          return stringEditorFromStore(key, String(currentValue ?? ""), store);

        case "string-multiline":
          return stringMultilineEditorFromStore(
            key,
            String(currentValue ?? ""),
            store
          );

        case "enum":
          return enumEditorFromStore(
            key,
            String(currentValue ?? ""),
            (override as { type: "enum"; options: string[] }).options,
            store
          );

        // object / ref / function — not editable in the form panel
        default:
          return nothing;
      }
    })}
  </div>`;
};
