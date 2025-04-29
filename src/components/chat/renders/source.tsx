import { h } from "@stencil/core";
import { ChatMessageSource, ChatSourceRender } from "../types";
import { tokenMap } from "../../../common/utils";

export const defaultSourceRender: ChatSourceRender = (
  source: ChatMessageSource
): any => (
  <li class="contents">
    <a
      aria-label={source.accessibleName}
      part={tokenMap({
        source: true,
        [source.parts]: !!source.parts
      })}
      href={source.url}
      target="_blank"
    >
      {source.caption && (
        <span
          part={tokenMap({
            "source-caption": true,
            [source.parts]: !!source.parts
          })}
        >
          {source.caption}
        </span>
      )}
    </a>
  </li>
);
