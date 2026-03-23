import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { tokenMap } from "../../../../utilities/utils";
import type { ChatMessageSource, ChatSourceRender } from "../../types";

export const defaultSourceRender: ChatSourceRender = (
  source: ChatMessageSource
): any =>
  html`<li class="contents">
    <a
      aria-label=${source.accessibleName}
      part=${tokenMap({
        source: true,
        [source.parts]: !!source.parts
      })}
      href=${source.url}
      target="_blank"
    >
      ${when(
        source.caption,
        () => html`<span
          part=${tokenMap({
            "source-caption": true,
            [source.parts]: !!source.parts
          })}
        >
          ${source.caption}
        </span>`
      )}
    </a>
  </li>`;
