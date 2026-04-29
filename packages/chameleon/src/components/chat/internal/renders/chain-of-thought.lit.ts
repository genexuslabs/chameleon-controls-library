import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type {
  ChatChainOfThoughtRender,
  ChatMessageChainOfThought
} from "../../types";

/**
 * Default render function for ch-chain-of-thought component within chat messages.
 * Renders a chain of thought reasoning process with steps, search results, and images.
 */
export const defaultChainOfThoughtRender: ChatChainOfThoughtRender = (
  chainOfThought: ChatMessageChainOfThought
): any =>
  html`<ch-chain-of-thought
    class="chain-of-thought-container"
    part=${tokenMap({
      "chain-of-thought-container": true,
      [chainOfThought.parts]: !!chainOfThought.parts
    })}
    exportparts="header, panel, section, disabled, expanded, collapsed, step, step-icon, step-content, step-label, step-description, step-status, search-results, search-result, image-container, image, image-caption"
    .headerIcon=${ifDefined(chainOfThought.headerIcon)}
    .steps=${ifDefined(chainOfThought.steps)}
    .searchResults=${ifDefined(chainOfThought.searchResults)}
    .images=${ifDefined(chainOfThought.images)}
    .defaultOpen=${ifDefined(chainOfThought.defaultOpen)}
    .open=${ifDefined(chainOfThought.open)}
  ></ch-chain-of-thought>`;
