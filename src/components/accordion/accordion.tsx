import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  Watch,
  forceUpdate,
  h
} from "@stencil/core";
import {
  AccordionItem,
  AccordionItemExpandedChangeEvent,
  AccordionModel
} from "./types";
import { tokenMap, updateDirectionInImageCustomVar } from "../../common/utils";
import {
  ACCORDION_PARTS_DICTIONARY,
  DISABLED_CLASS
} from "../../common/reserved-names";
import { GxImageMultiState, GxImageMultiStateStart } from "../../common/types";
import { getControlRegisterProperty } from "../../common/registry-properties";

let GET_IMAGE_PATH_CALLBACK_REGISTRY: (
  imageSrc: string
) => GxImageMultiState | undefined;

const DEFAULT_GET_IMAGE_PATH_CALLBACK: (
  imageSrc: string
) => GxImageMultiState | undefined = imageSrc => ({ base: imageSrc });

@Component({
  shadow: true,
  styleUrl: "accordion.scss",
  tag: "ch-accordion-render"
})
export class ChAccordionRender implements ComponentInterface {
  #images: Map<string, GxImageMultiStateStart | undefined> = new Map();

  @Element() el: HTMLChAccordionRenderElement;

  /**
   * This property specifies a callback that is executed when the path for an
   * startImgSrc needs to be resolved.
   */
  @Prop() readonly getImagePathCallback?: (
    imageSrc: string
  ) => GxImageMultiState | undefined;
  @Watch("getImagePathCallback")
  getImagePathCallbackChanged() {
    this.#computeImages();
  }

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly model!: AccordionModel;
  @Watch("getImagePathCallback")
  modelChanged() {
    this.#computeImages();
  }

  /**
   * Fired when an item is expanded or collapsed
   */
  @Event() expandedChange: EventEmitter<AccordionItemExpandedChangeEvent>;

  #computeImage = (
    imageSrc: string | undefined
  ): GxImageMultiStateStart | undefined => {
    if (!imageSrc) {
      return undefined;
    }
    const getImagePathCallback =
      this.getImagePathCallback ?? GET_IMAGE_PATH_CALLBACK_REGISTRY;

    if (!getImagePathCallback) {
      return undefined;
    }
    const img = getImagePathCallback(imageSrc);

    return img
      ? (updateDirectionInImageCustomVar(
          img,
          "start"
        ) as GxImageMultiStateStart)
      : undefined;
  };

  #computeImages = () => {
    this.#images.clear();

    this.model.forEach(itemUIModel => {
      const itemImage = this.#computeImage(itemUIModel.startImgSrc);

      if (itemImage) {
        this.#images.set(itemUIModel.id, itemImage);
      }
    });
  };

  #handleHeaderToggle = (event: PointerEvent) => {
    const headerRef = event
      .composedPath()
      .find(
        el => (el as HTMLElement).tagName?.toLowerCase() === "button"
      ) as HTMLButtonElement;

    if (!headerRef || headerRef.getRootNode() !== this.el.shadowRoot) {
      return;
    }

    const itemId = headerRef.id;
    const itemUIModel = this.model.find(item => item.id === itemId);

    if (itemUIModel.disabled) {
      return;
    }

    const newExpandedValue = !itemUIModel.expanded;
    itemUIModel.expanded = newExpandedValue;

    this.expandedChange.emit({ id: itemId, expanded: newExpandedValue });

    forceUpdate(this);
  };

  #renderItem = (item: AccordionItem, index: number) => {
    const startImage = this.#images.get(item.id);
    const startImageClasses = startImage?.classes;

    return (
      <div
        class={{ panel: true, "panel--expanded": item.expanded }}
        key={item.id}
        part={tokenMap({
          [item.id]: true,
          [ACCORDION_PARTS_DICTIONARY.PANEL]: true,
          [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
          [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
        })}
      >
        <button
          id={item.id}
          aria-controls={`section-${index}`}
          aria-label={item.accessibleName || undefined}
          aria-expanded={item.expanded ? "true" : "false"}
          class={{
            header: true,
            [DISABLED_CLASS]: item.disabled,
            "header--expanded": item.expanded,
            [`start-img-type--${
              item.startImgType ?? "background"
            } pseudo-img--start`]: !!startImage,
            [startImageClasses]: !!startImageClasses
          }}
          part={tokenMap({
            [item.id]: true,
            [item.headerSlotId]: !!item.headerSlotId,
            [ACCORDION_PARTS_DICTIONARY.HEADER]: true,
            [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
            [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
          })}
          style={startImage?.styles ?? undefined}
          disabled={item.disabled}
          type="button"
        >
          {item.headerSlotId ? <slot name={item.headerSlotId} /> : item.caption}
        </button>

        <section
          id={`section-${index}`}
          aria-label={item.accessibleName || undefined}
          aria-labelledby={!item.accessibleName ? item.id : undefined}
          class={!item.expanded ? "section--hidden" : undefined}
        >
          <div
            class="sub-section"
            part={tokenMap({
              [item.id]: true,
              [ACCORDION_PARTS_DICTIONARY.SECTION]: true,
              [ACCORDION_PARTS_DICTIONARY.EXPANDED]: item.expanded,
              [ACCORDION_PARTS_DICTIONARY.COLLAPSED]: !item.expanded
            })}
          >
            <slot name={item.id} />
          </div>
        </section>
      </div>
    );
  };

  connectedCallback(): void {
    // Initialize default getImagePathCallback
    GET_IMAGE_PATH_CALLBACK_REGISTRY ??=
      getControlRegisterProperty(
        "getImagePathCallback",
        "ch-accordion-render"
      ) ?? DEFAULT_GET_IMAGE_PATH_CALLBACK;

    this.#computeImages();
  }

  render() {
    return (
      <Host onClick={this.#handleHeaderToggle}>
        {this.model.map(this.#renderItem)}
      </Host>
    );
  }
}
