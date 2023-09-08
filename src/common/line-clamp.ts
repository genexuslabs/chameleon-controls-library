import { debounce, overrideMethod } from "./utils";
import { Component } from "./interfaces";

export function makeLinesClampable(
  component: LineClampComponent,
  contentElementSelector: string,
  contentContainerElementSelector: string,
  lineMeasuringElementSelector: string,
  componentHasShadowDOM = false
): void | { applyLineClamp: () => void } {
  if (!component.lineClamp) {
    return;
  }

  // Used to know the sizes of the `content`
  let contentElement: HTMLElement;

  // Used to know the sizes of the `content-container`
  let contentContainerElement: HTMLElement;

  // Used to measure the line height
  let lineMeasuringElement: HTMLElement;

  // Used to keep the state of the component
  let contentHeight = -1;
  let contentContainerHeight = -1;
  let lineMeasuringHeight = -1;

  const applyLineClamp = debounce(() => {
    requestAnimationFrame(() => {
      const currentContentContainerHeight =
        contentContainerElement.clientHeight;

      if (currentContentContainerHeight === 0) {
        return;
      }

      const currentContentHeight = contentElement.scrollHeight;
      const currentLineMeasuringHeight = lineMeasuringElement.clientHeight;

      /*  If the container height and the line height have not been changed,
          there is not need to update `component.maxLines`
      */
      if (
        contentHeight === currentContentHeight &&
        contentContainerHeight === currentContentContainerHeight &&
        lineMeasuringHeight === currentLineMeasuringHeight
      ) {
        return;
      }

      // Stores the current height of the content container and line measurement
      contentHeight = currentContentHeight;
      contentContainerHeight = currentContentContainerHeight;
      lineMeasuringHeight = currentLineMeasuringHeight;

      // Set how much lines needs the control to not overflow its content
      component.contentLines = Math.max(
        Math.trunc(currentContentHeight / lineMeasuringHeight),
        1
      );

      // At least, one line will be displayed
      component.maxLines = Math.max(
        Math.trunc(currentContentContainerHeight / lineMeasuringHeight),
        1
      );
    });
  }, 10);

  let resizeObserverContainer: ResizeObserver = null;

  overrideMethod(component, "componentDidLoad", {
    before: () => {
      const componentElement = component.element;

      if (componentHasShadowDOM) {
        contentElement = componentElement.shadowRoot.querySelector(
          contentElementSelector
        ) as HTMLElement;

        contentContainerElement = componentElement.shadowRoot.querySelector(
          contentContainerElementSelector
        ) as HTMLElement;

        lineMeasuringElement = componentElement.shadowRoot.querySelector(
          lineMeasuringElementSelector
        ) as HTMLElement;
      } else {
        contentElement = componentElement.querySelector(
          contentElementSelector
        ) as HTMLElement;

        contentContainerElement = componentElement.querySelector(
          contentContainerElementSelector
        ) as HTMLElement;

        lineMeasuringElement = componentElement.querySelector(
          lineMeasuringElementSelector
        ) as HTMLElement;
      }

      if (contentContainerElement === null || lineMeasuringElement === null) {
        return;
      }

      /*  If the `content-container` resizes or the `font-size` changes, it
            checks if it is necessary to update `component.maxLines`
        */
      resizeObserverContainer = new ResizeObserver(() => {
        applyLineClamp();
      });

      // Observe the content, content-container and line height
      resizeObserverContainer.observe(contentElement);
      resizeObserverContainer.observe(contentContainerElement);
      resizeObserverContainer.observe(lineMeasuringElement);
    }
  });

  overrideMethod(component, "disconnectedCallback", {
    before: () => {
      if (resizeObserverContainer) {
        resizeObserverContainer.disconnect();
        resizeObserverContainer = undefined;
      }
    }
  });

  return {
    applyLineClamp
  };
}

export interface LineClampComponent extends Component {
  lineClamp: boolean;
  contentLines: number;
  maxLines: number;
}
