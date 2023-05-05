import { Component, Host, Prop, Watch, State, h } from "@stencil/core";
import { Component as ChComponent } from "../../../common/interfaces";

const MIN_VALUE = 0;
const TIME_TO_REMOVE_ANIMATION = 325; // 325ms
const INCREMENT_ADJUSTMENT_BETWEEN_STEPS = 1;

/**
 * @part ch-next-progress-bar__main-container - The main container of the control.
 * @part ch-next-progress-bar__caption - The caption displayed in the top of the control.
 * @part ch-next-progress-bar__steps-container - The container of the steps displayed below the caption of the control.
 * @part ch-next-progress-bar__step - Each step displayed in the control.
 * @part ch-next-progress-bar__description - The description displayed below the steps of the control.
 */
@Component({
  shadow: true,
  styleUrl: "next-progress-bar.scss",
  tag: "ch-next-progress-bar"
})
export class NextProgressBar implements ChComponent {
  /**
   * `true` if the componentDidLoad lifecycle method was executed
   */
  private didLoad = false;

  private incrementFromLastStep = 0;
  private lastDescription: string;

  @State() shouldAddFadeInOutAnimation = false;

  /**
   * It specifies the main text that is shown on the progress.
   */
  @Prop() readonly caption: string = null;

  /**
   * This attribute lets you specify the value of the progress.
   */
  @Prop() readonly currentStep: number = MIN_VALUE;

  /**
   * A CSS class to set as the `ch-next-progress-bar` element class.
   */
  @Prop() readonly cssClass: string;

  /**
   * It specifies more information that is shown on the progress.
   */
  @Prop() readonly description: string = null;

  /**
   * This attribute lets you specify if the progress bar is rendered.
   */
  @Prop() readonly presented: boolean = false;

  /**
   * This attribute lets you specify the amount of steps for the progress.
   */
  @Prop() readonly steps: number = 1;

  @Watch("currentStep")
  handleCurrentStepChange(newCurrentStep: number, oldCurrentStep: number) {
    this.incrementFromLastStep =
      newCurrentStep - oldCurrentStep - INCREMENT_ADJUSTMENT_BETWEEN_STEPS;
  }

  @Watch("description")
  handleCaptionChange(_newDescription: string, oldDescription: string) {
    if (this.didLoad && !this.shouldAddFadeInOutAnimation) {
      this.shouldAddFadeInOutAnimation = true;
      this.lastDescription = oldDescription; // Store the last description

      setTimeout(() => {
        this.shouldAddFadeInOutAnimation = false;
      }, TIME_TO_REMOVE_ANIMATION);
    }
  }

  @Watch("presented")
  handlePresentedChange(newPresentedValue: boolean) {
    if (newPresentedValue) {
      this.incrementFromLastStep = this.currentStep;
    }
  }

  private getStepPartName(stepValue: number, amountOfSteps: number): string {
    let partName = "ch-next-progress-bar__step";

    if (stepValue <= amountOfSteps) {
      partName += " checked";
    }

    if (stepValue == amountOfSteps) {
      partName += " last";
    }

    return partName;
  }

  componentWillLoad() {
    if (this.presented) {
      this.incrementFromLastStep = this.currentStep;
    }
  }

  componentDidLoad() {
    this.didLoad = true;
  }

  render() {
    const calculatedCurrentStep = Math.max(this.currentStep, MIN_VALUE);
    const amountOfSteps = Math.max(this.steps, MIN_VALUE);

    const accessibilityAttributes = {
      role: "progressbar",
      "aria-labelledby": this.caption ? "title" : undefined,
      "aria-describedby": this.description ? "description" : undefined,
      "aria-valuemin": "0",
      "aria-valuemax": amountOfSteps.toString(),
      "aria-valuenow": calculatedCurrentStep.toString()
    };

    return (
      <Host
        class={this.cssClass || null}
        aria-hidden={!this.presented ? "true" : undefined}
      >
        {this.presented && (
          <div
            {...accessibilityAttributes}
            class="progress-bar"
            part="ch-next-progress-bar__main-container"
          >
            {!!this.caption && (
              <h1 id="title" class="title" part="ch-next-progress-bar__caption">
                {this.caption}
              </h1>
            )}

            <div
              class="steps-container"
              style={{
                "--amount-of-steps": `${amountOfSteps}`
              }}
              part="ch-next-progress-bar__steps-container"
            >
              {[...Array(amountOfSteps).keys()].map((step: number) => (
                <div
                  class={{
                    step: true,
                    "step--checked": step <= calculatedCurrentStep,
                    "step--last-checked": step == calculatedCurrentStep
                  }}
                  part={this.getStepPartName(step, amountOfSteps)}
                  style={{
                    "--delay":
                      calculatedCurrentStep - step <= this.incrementFromLastStep
                        ? (
                            this.incrementFromLastStep -
                            calculatedCurrentStep +
                            step
                          ).toString()
                        : "0"
                  }}
                ></div>
              ))}
            </div>

            {!!this.description && (
              <p
                id="description"
                class={{
                  description: true,
                  "description-transition": this.shouldAddFadeInOutAnimation
                }}
                part="ch-next-progress-bar__description"
              >
                {this.shouldAddFadeInOutAnimation
                  ? this.lastDescription
                  : this.description}
              </p>
            )}
          </div>
        )}
      </Host>
    );
  }
}
