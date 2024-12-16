import { Component, Host, Prop, State, Watch, h } from "@stencil/core";
import axe, { Result } from "axe-core";

import {
  AccordionModel,
  ChEditCustomEvent,
  ChSwitchCustomEvent
} from "../../components";
import { getDOMReferenceUsingPath } from "./get-dom-reference";

const CRITICAL = "critical" satisfies axe.ImpactValue;
const SERIOUS = "serious" satisfies axe.ImpactValue;
const MODERATE = "moderate" satisfies axe.ImpactValue;
const MINOR = "minor" satisfies axe.ImpactValue;

/**
 * @status experimental
 */
@Component({
  shadow: true,
  styleUrl: "accessibility.scss",
  tag: "ch-accessibility"
})
export class ChAccessibility {
  #timeoutId: NodeJS.Timeout;
  #accordionViolations: AccordionModel = [];
  #elapsedTime: number = 0;

  #popoverTargetElement: HTMLElement | undefined;

  @State() popoverTargetElementSelector: string | undefined;

  @State() results!: {
    [CRITICAL]: Result[];
    [SERIOUS]: Result[];
    [MODERATE]: Result[];
    [MINOR]: Result[];
  };

  /**
   * Specifies a debounce value between runs.
   */
  @Prop({ mutable: true }) debounce?: number = 1500;
  @Watch("debounce")
  debounceChanged() {
    this.#runOrCancelTest();
  }
  /**
   * `true` to run the accessibility tests.
   */
  @Prop({ mutable: true }) running: boolean = false;
  @Watch("running")
  runningChanged() {
    this.#runOrCancelTest();
  }

  #runOrCancelTest = () => {
    clearInterval(this.#timeoutId);

    if (!this.running) {
      return;
    }

    // We use setTimeout instead of setInterval, because test runs will always
    // take time and he should avoid queuing another test until the last run
    // has ended
    this.#timeoutId = setTimeout(() => {
      this.#performTest();
    }, this.debounce);
  };

  // Double debounce with RAF the axe-core to ensure that the UI is properly
  // updated with the analyzing State
  #performTest = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const startTime = performance.now();

        axe.run({ exclude: "ch-accessibility" }).then(results => {
          const violations = results.violations;
          this.#initializeEmptyResults();

          for (let index = 0; index < violations.length; index++) {
            const result = violations[index];

            if (result.impact) {
              this.results[result.impact].push(result);
            }
          }

          this.#setModels();
          this.#runOrCancelTest();

          this.#elapsedTime = performance.now() - startTime;
        });
      })
    );

  #enableDisableAutoRunning = (
    event: ChSwitchCustomEvent<any> | InputEvent
  ) => {
    this.running = (event as ChSwitchCustomEvent<any>).target.value === "true";
  };

  #handleDebounceChange = (event: ChEditCustomEvent<string> | InputEvent) => {
    this.debounce = Math.max(
      1000,
      Number((event as ChEditCustomEvent<string>).detail)
    );
  };

  #highlightElementInTheDOM = (event: PointerEvent) => {
    const buttonTarget = event
      .composedPath()
      .find(
        target => (target as HTMLElement).tagName?.toLowerCase() === "button"
      ) as HTMLButtonElement;

    if (!buttonTarget || !buttonTarget.value) {
      return;
    }

    this.popoverTargetElementSelector = buttonTarget.value;
    this.#popoverTargetElement = getDOMReferenceUsingPath(
      buttonTarget.value.split(",")
    );
  };

  #removeHighlight = () => {
    this.popoverTargetElementSelector = undefined;
    this.#popoverTargetElement = undefined;
  };

  #renderResult = (result: Result, index: number) => [
    index !== 0 && <hr />,

    <article>
      <hgroup>
        <h3 class="result-separator">{result.id}</h3>
        <p>{result.description}</p>
      </hgroup>

      <p>
        Help:{" "}
        <a href={result.helpUrl} target="blank">
          {result.help}
        </a>
      </p>

      <p>Tags: {result.tags.join(", ")}</p>

      <div
        class="nodes"
        onMouseOver={this.#highlightElementInTheDOM}
        onMouseLeave={this.#removeHighlight}
      >
        {result.nodes.map((node, nodeIndex) => [
          nodeIndex !== 0 && <hr class="node-separator" />,

          <article>
            <button class="node" type="button" value={node.target.join(",")}>
              <p>{node.failureSummary}</p>
              <ch-code class="code" language="html" value={node.html}></ch-code>
            </button>
          </article>
        ])}
      </div>
    </article>
  ];

  #initializeEmptyResults = () => {
    this.results = {
      [CRITICAL]: [],
      [SERIOUS]: [],
      [MODERATE]: [],
      [MINOR]: []
    };
  };

  #setModels = () => {
    this.#accordionViolations = [
      {
        id: CRITICAL,
        caption: `Critical (${this.results[CRITICAL].length})`,
        expanded: this.#accordionViolations[0]?.expanded
      },
      {
        id: SERIOUS,
        caption: `Serious (${this.results[SERIOUS].length})`,
        expanded: this.#accordionViolations[1]?.expanded
      },
      {
        id: MODERATE,
        caption: `Moderate (${this.results[MODERATE].length})`,
        expanded: this.#accordionViolations[2]?.expanded
      },
      {
        id: MINOR,
        caption: `Minor (${this.results[MINOR].length})`,
        expanded: this.#accordionViolations[3]?.expanded
      }
    ];
  };

  connectedCallback() {
    this.#initializeEmptyResults();
    this.#setModels();
    this.#runOrCancelTest();
  }

  render() {
    return (
      <Host>
        <ch-popover
          // TODO: Fix this. The popover must support all types of HTMLElement
          actionElement={this.#popoverTargetElement as HTMLButtonElement}
          mode="manual"
          hidden={!this.popoverTargetElementSelector}
          blockSizeMatch="action-element"
          inlineSizeMatch="action-element"
        ></ch-popover>

        <ch-dialog
          allowDrag="header"
          caption="Accessibility"
          modal={false}
          hidden={false}
          resizable
          showHeader
        >
          <div class="settings">
            <ch-switch
              checkedCaption="Running"
              checkedValue="true"
              unCheckedCaption="Running"
              value={this.running.toString()}
              onInput={this.#enableDisableAutoRunning}
            ></ch-switch>

            <ch-edit
              accessibleName="Debounce"
              debounce={100}
              type="number"
              value={this.debounce.toString()}
              onInput={this.#handleDebounceChange}
            />

            <p>Elapsed time: {this.#elapsedTime.toFixed(2)}ms</p>
          </div>

          <ch-accordion-render model={this.#accordionViolations}>
            {this.results[CRITICAL].length && (
              <section slot={CRITICAL}>
                {this.results[CRITICAL].map(this.#renderResult)}
              </section>
            )}

            {this.results[SERIOUS].length && (
              <section slot={SERIOUS}>
                {this.results[SERIOUS].map(this.#renderResult)}
              </section>
            )}

            {this.results[MODERATE].length && (
              <section slot={MODERATE}>
                {this.results[MODERATE].map(this.#renderResult)}
              </section>
            )}

            {this.results[MINOR].length && (
              <section slot={MINOR}>
                {this.results[MINOR].map(this.#renderResult)}
              </section>
            )}
          </ch-accordion-render>
        </ch-dialog>
      </Host>
    );
  }
}
