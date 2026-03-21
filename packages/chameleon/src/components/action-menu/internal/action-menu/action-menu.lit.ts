import {
  Component,
  KasstorElement
} from "@genexus/kasstor-core/decorators/component.js";
import { Observe } from "@genexus/kasstor-core/decorators/observe.js";
import { html, nothing } from "lit";
import { property } from "lit/decorators/property.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { watch } from "@genexus/kasstor-signals/directives/watch.js";
import type { ReadonlySignal } from "@genexus/kasstor-signals/core.js";

import { IS_SERVER } from "../../../../development-flags";
import {
  ACTION_MENU_ITEM_EXPORT_PARTS,
  ACTION_MENU_ITEM_PARTS_DICTIONARY
} from "../../../../utilities/reserved-names/reserved-names";
import { DISABLED_CLASS } from "../../../../utilities/reserved-names/common";
import type {
  GetImagePathCallback,
  ImageRender
} from "../../../../typings/multi-state-images";
import type { ItemLink } from "../../../../typings/hyperlinks";
import { tokenMap } from "../../../../utilities/mapping/token-map";
import type { ChPopoverAlign } from "../../../popover/types";
import type { ActionMenuItemActionableModel } from "../../types";
import { getActionMenuItemMetadata } from "../parse-model";
import { focusFirstActionMenuItem } from "../utils";

import styles from "./action-menu.scss?inline";

// In the server we need to preload the ch-popover and ch-image just in case
// to properly render them, because Lit doesn't support async rendering in
// the server. In the client we can lazy load them
if (IS_SERVER) {
  await import("../../../popover/popover.lit");
  await import("../../../image/image.lit");
}

const SEPARATE_BY_SPACE_REGEX = /\s+/;

// Parts
const ACTION_LINK =
  `${ACTION_MENU_ITEM_PARTS_DICTIONARY.ACTION} ${ACTION_MENU_ITEM_PARTS_DICTIONARY.LINK}` as const;

const ACTION_LINK_EXPANDABLE =
  `${ACTION_LINK} ${ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDABLE}` as const;

const ACTION_BUTTON =
  `${ACTION_MENU_ITEM_PARTS_DICTIONARY.ACTION} ${ACTION_MENU_ITEM_PARTS_DICTIONARY.BUTTON}` as const;

const ACTION_BUTTON_EXPANDABLE =
  `${ACTION_BUTTON} ${ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDABLE}` as const;

const WINDOW_ID = "window";

/**
 * @status experimental
 */
@Component({
  shadow: { delegatesFocus: true },
  styles,
  tag: "ch-action-menu"
})
export class ChActionMenu extends KasstorElement {
  // Refs
  #mainActionRef: Ref<HTMLButtonElement | HTMLAnchorElement> = createRef();

  /**
   * Specifies if the current parent of the item is the action-group control.
   */
  @property({ type: Boolean, attribute: "action-group-parent" })
  actionGroupParent: boolean = false;

  /**
   * Specifies the block alignment of the dropdown menu that is placed
   * relative to the expandable button.
   */
  @property({ attribute: false }) blockAlign: ChPopoverAlign = "center";

  /**
   * Specifies the caption that the control will display.
   */
  @property({ attribute: false }) caption: string | undefined;

  /**
   * This attribute lets you specify if the element is disabled.
   * If disabled, it will not fire any user interaction related event
   * (for example, click event).
   */
  @property({ type: Boolean }) disabled: boolean = false;

  /**
   * Specifies the src of the end image.
   */
  @property({ attribute: false }) endImgSrc: string | undefined;

  /**
   * Specifies how the end image will be rendered.
   */
  @property({ attribute: false }) endImgType: Exclude<ImageRender, "img"> =
    "background";

  /**
   * Specifies whether the item contains a subtree. `true` if the item has a
   * subtree.
   */
  @property({ type: Boolean }) expandable: boolean = false;

  /**
   * `true` to display the dropdown menu.
   */
  @property({ attribute: false }) expanded: boolean | undefined = false;

  /**
   * Specifies the inline alignment of the dropdown menu that is placed
   * relative to the expandable button.
   */
  @property({ attribute: false }) inlineAlign: ChPopoverAlign = "center";

  /**
   * Specifies the hyperlink properties of the item. If this property is
   * defined, the `ch-action-menu` will render an anchor tag with this
   * properties. Otherwise, it will render a button tag.
   */
  @property({ attribute: false }) link: ItemLink | undefined;

  /**
   * Specifies the extended model of the control. This property is only needed
   * to know the UI Model on each event
   */
  @property({ attribute: false }) model!: ActionMenuItemActionableModel;

  /**
   * Determine if the dropdown menu should be opened when the expandable
   * button of the control is focused.
   * TODO: Add implementation
   */
  @property({ type: Boolean, attribute: "open-on-focus" })
  openOnFocus: boolean = false;

  /**
   * Specifies a set of parts to use in every DOM element of the control.
   */
  @property({ attribute: false }) parts: string | undefined;
  @Observe("parts")
  protected partsChanged() {
    this.#setExportparts(this.parts);
  }

  /**
   * Specifies an alternative position to try when the popover overflows the
   * window.
   */
  @property({ attribute: false }) positionTry!:
    | "flip-block"
    | "flip-inline"
    | "none";

  /**
   * Computed signal from the render component that resolves the image path
   * callback. Received as a normal class member, NOT a reactive property.
   */
  resolvedImagePathCallback:
    | ReadonlySignal<GetImagePathCallback | undefined>
    | undefined;

  /**
   * Specifies the shortcut caption that the control will display.
   */
  @property({ attribute: false }) shortcut: string | undefined;

  /**
   * Specifies the src for the left img.
   */
  @property({ attribute: false }) startImgSrc: string | undefined;

  /**
   * Specifies how the start image will be rendered.
   */
  @property({ attribute: false }) startImgType: Exclude<ImageRender, "img"> =
    "background";

  #itemContent = () => html`
    <span
      class="content"
      part=${tokenMap({
        [ACTION_MENU_ITEM_PARTS_DICTIONARY.CONTENT]: true,
        [this.parts!]: !!this.parts
      })}
    >
      ${this.caption}
    </span>

    ${this.shortcut
      ? html`<span
          aria-hidden="true"
          part=${tokenMap({
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.SHORTCUT]: true,
            [this.parts!]: !!this.parts
          })}
        >
          ${this.shortcut}
        </span>`
      : nothing}
  `;

  #actionRender = () => {
    const expandable = this.expandable;
    const hasParts = !!this.parts;
    const hasStartImage = !!this.startImgSrc;
    const hasEndImage = !!this.endImgSrc;

    return this.link
      ? html`<a
          role=${this.disabled ? "link" : nothing}
          aria-controls=${expandable ? WINDOW_ID : nothing}
          aria-disabled=${this.disabled ? "true" : nothing}
          aria-expanded=${expandable ? (!!this.expanded).toString() : nothing}
          aria-haspopup=${expandable ? "true" : nothing}
          class=${classMap({
            action: true,
            [DISABLED_CLASS]: this.disabled
          })}
          part=${tokenMap({
            [ACTION_LINK_EXPANDABLE]: expandable,
            [ACTION_LINK]: !expandable,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDED]:
              expandable && !!this.expanded,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.COLLAPSED]:
              expandable && !this.expanded,
            [this.parts!]: hasParts
          })}
          href=${!this.disabled && this.link.url ? this.link.url : nothing}
          rel=${!this.disabled && this.link.rel ? this.link.rel : nothing}
          target=${!this.disabled && this.link.target
            ? this.link.target
            : nothing}
          ${ref(this.#mainActionRef)}
        >
          ${hasStartImage
            ? html`<ch-image
                .src=${this.startImgSrc}
                .type=${this.startImgType}
                .getImagePathCallback=${this.resolvedImagePathCallback
                  ? watch(this.resolvedImagePathCallback)
                  : nothing}
              ></ch-image>`
            : nothing}
          ${this.#itemContent()}
          ${hasEndImage
            ? html`<ch-image
                .src=${this.endImgSrc}
                .type=${this.endImgType}
                .getImagePathCallback=${this.resolvedImagePathCallback
                  ? watch(this.resolvedImagePathCallback)
                  : nothing}
              ></ch-image>`
            : nothing}
        </a>`
      : html`<button
          popoverTarget=${WINDOW_ID}
          aria-controls=${expandable ? WINDOW_ID : nothing}
          aria-expanded=${expandable ? (!!this.expanded).toString() : nothing}
          aria-haspopup=${expandable ? "true" : nothing}
          class=${classMap({
            action: true,
            [DISABLED_CLASS]: this.disabled
          })}
          part=${tokenMap({
            [ACTION_BUTTON_EXPANDABLE]: expandable,
            [ACTION_BUTTON]: !expandable,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.DISABLED]: this.disabled,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.EXPANDED]:
              expandable && !!this.expanded,
            [ACTION_MENU_ITEM_PARTS_DICTIONARY.COLLAPSED]:
              expandable && !this.expanded,
            [this.parts!]: hasParts
          })}
          ?disabled=${this.disabled}
          type="button"
          ${ref(this.#mainActionRef)}
        >
          ${hasStartImage
            ? html`<ch-image
                .src=${this.startImgSrc}
                .type=${this.startImgType}
                .getImagePathCallback=${this.resolvedImagePathCallback
                  ? watch(this.resolvedImagePathCallback)
                  : nothing}
              ></ch-image>`
            : nothing}
          ${this.#itemContent()}
          ${hasEndImage
            ? html`<ch-image
                .src=${this.endImgSrc}
                .type=${this.endImgType}
                .getImagePathCallback=${this.resolvedImagePathCallback
                  ? watch(this.resolvedImagePathCallback)
                  : nothing}
              ></ch-image>`
            : nothing}
        </button>`;
  };

  #popoverRender = () =>
    html`<ch-popover
      role="list"
      id=${WINDOW_ID}
      part=${tokenMap({
        [ACTION_MENU_ITEM_PARTS_DICTIONARY.WINDOW]: true,
        [this.parts!]: !!this.parts
      })}
      ?actionById=${true}
      .actionElement=${this.#mainActionRef.value as HTMLButtonElement}
      .blockAlign=${this.blockAlign}
      ?firstLayer=${this.actionGroupParent}
      .inlineAlign=${this.inlineAlign}
      popover="manual"
      .positionTry=${this.positionTry}
      ?show=${true}
    >
      <slot></slot>
    </ch-popover>`;

  #setExportparts = (parts?: string) => {
    // TODO: Add tests for this.
    // TODO: Should be global the Regex?
    // TODO: Test this with multiple parts

    const customParts = parts
      ? `${ACTION_MENU_ITEM_EXPORT_PARTS},${parts
          .split(SEPARATE_BY_SPACE_REGEX)
          .join(",")}`
      : ACTION_MENU_ITEM_EXPORT_PARTS;

    this.setAttribute("exportparts", customParts);
  };

  override connectedCallback(): void {
    super.connectedCallback();

    this.setAttribute("role", "listitem");
    this.#setExportparts(this.parts);
  }

  protected override updated(): void {
    const metadata = getActionMenuItemMetadata(this.model);

    if (this.expanded && metadata.focusFirstItemAfterExpand) {
      metadata.focusFirstItemAfterExpand = false;

      // Wait until the first item is rendered
      requestAnimationFrame(() => focusFirstActionMenuItem(this));
    }

    if (!this.expanded && metadata.focusAfterCollapse) {
      metadata.focusAfterCollapse = false;
      this.focus();
    }
  }

  override render() {
    return html`${this.#actionRender()}
    ${this.expandable && this.expanded ? this.#popoverRender() : nothing}`;
  }
}

declare global {
  // Backward-compatible type alias used by internal utilities
  // (keyboard-actions.ts, utils.ts) that reference the old Stencil name
  type HTMLChActionMenuElement = ChActionMenu;

  interface HTMLElementTagNameMap {
    "ch-action-menu": ChActionMenu;
  }
}
