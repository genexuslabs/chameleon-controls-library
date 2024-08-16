import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Host,
  Prop,
  forceUpdate,
  h
} from "@stencil/core";
import { AccordionItemExpandedChangeEvent, AccordionModel } from "./types";
import { tokenMap } from "../../common/utils";

@Component({
  shadow: true,
  styleUrl: "accordion.scss",
  tag: "ch-accordion-render"
})
export class ChAccordionRender implements ComponentInterface {
  @Element() el: HTMLChAccordionRenderElement;

  /**
   * Specifies the items of the control.
   */
  @Prop() readonly model!: AccordionModel;

  /**
   * Fired when an item is expanded or collapsed
   */
  @Event() expandedChange: EventEmitter<AccordionItemExpandedChangeEvent>;

  #handleHeaderToggle = (event: PointerEvent) => {
    const headerRef = event.composedPath()[0] as HTMLButtonElement;

    if (
      headerRef.tagName.toLowerCase() !== "button" ||
      headerRef.getRootNode() !== this.el.shadowRoot
    ) {
      return;
    }

    const itemId = headerRef.id;
    const itemUIModel = this.model.find(item => item.id === itemId);
    const newExpandedValue = !itemUIModel.expanded;
    itemUIModel.expanded = newExpandedValue;

    this.expandedChange.emit({ id: itemId, expanded: newExpandedValue });

    forceUpdate(this);
  };

  render() {
    return (
      <Host onClick={this.#handleHeaderToggle}>
        {(this.model ?? []).map((item, index) => (
          <div
            class={{ panel: true, "panel--expanded": item.expanded }}
            key={item.id}
          >
            <button
              id={item.id}
              aria-controls={`section-${index}`}
              aria-label={item.accessibleName || undefined}
              aria-expanded={item.expanded ? "true" : "false"}
              part={tokenMap({
                [item.id]: true,
                header: true,
                expanded: item.expanded,
                collapsed: !item.expanded
              })}
              disabled={item.disabled}
              type="button"
            >
              {item.headerSlot ? <slot name={item.headerSlot} /> : item.caption}
            </button>

            <section
              id={`section-${index}`}
              aria-label={item.accessibleName || undefined}
              aria-labelledby={!item.accessibleName ? item.id : undefined}
              class={!item.expanded ? "section--hidden" : undefined}
              part={tokenMap({
                [item.id]: true,
                section: true,
                expanded: item.expanded,
                collapsed: !item.expanded
              })}
            >
              <slot name={item.id} />
            </section>
          </div>
        ))}
      </Host>
    );
  }
}
