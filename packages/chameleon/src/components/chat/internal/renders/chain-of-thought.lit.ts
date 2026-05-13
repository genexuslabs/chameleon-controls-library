import { html } from "lit";
import type {
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtStep
} from "../../../chain-of-thought/types.js";
import type { AGUIActivityMessage } from "../../typesAGUI.js";

/**
 * Application-level schema for the `content` field of an AG-UI activity
 * message whose `activityType === "chain-of-thought"`.
 *
 * `steps` may carry their own nested `searchResults` and `images`. The
 * top-level `searchResults` / `images` are step-independent collections.
 *
 * `defaultOpen` lets the app decide whether a given chain of thought
 * should start expanded — useful when a chat shows multiple of them and
 * only the current focus should reveal its contents.
 */
export type ChainOfThoughtActivityContent = {
  headerIcon?: string;
  steps?: ChainOfThoughtStep[];
  searchResults?: ChainOfThoughtSearchResult[];
  images?: ChainOfThoughtImage[];
  defaultOpen?: boolean;
};

/**
 * Default render for `ch-chain-of-thought` driven by an AG-UI activity
 * message.
 */
export const defaultChainOfThoughtRender = (
  activity: AGUIActivityMessage
) => {
  const content = activity.content as ChainOfThoughtActivityContent;
  return html`<ch-chain-of-thought
    class="chain-of-thought-container"
    part="chain-of-thought-container"
    exportparts="header, panel, section, disabled, expanded, collapsed, step, step-icon, step-content, step-label, step-description, step-status, search-results, search-result, image-container, image, image-caption"
    .headerIcon=${content.headerIcon}
    .steps=${content.steps ?? []}
    .searchResults=${content.searchResults ?? []}
    .images=${content.images ?? []}
    .defaultOpen=${content.defaultOpen ?? false}
  ></ch-chain-of-thought>`;
};
