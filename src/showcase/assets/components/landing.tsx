import { h } from "@stencil/core";
import { ShowcaseCustomStory } from "./types";

const renderShowcaseLanding = () => (
  <div class="main-page text-body-2">
    <p class="heading-1">Chameleon</p>
    <h1 class="heading-4">
      A library of white-label, highly-customizable and reusable web components.
    </h1>

    <ul class="chameleon-features text-body-1">
      <li class="card icon-mask card__framework">Works with all frameworks</li>
      <li class="card icon-mask card__fully-customizable">
        Fully customizable with CSS
      </li>
      <li class="card icon-mask card__white-label">White-label components</li>
      <li class="card icon-mask card__accessibility">
        Built with accessibility in mind
      </li>
      <li class="card icon-mask card__performance">Blazing fast performance</li>
      <li class="card icon-mask card__rtl">
        Full RTL and internationalization support
      </li>
      <li class="card icon-mask card__open-source">Open source</li>
    </ul>

    <div class="sections">
      <section>
        <h2 id="quick-start" class="heading-2">
          Quick start
          <a href="#quick-start" aria-label='Direct link to "Quick Start"'>
            #
          </a>
        </h2>
      </section>

      <section>
        <h2 id="goals-and-objectives" class="heading-2">
          Goals And Objectives
          <a
            href="#goals-and-objectives"
            aria-label='Direct link to "Goals And Objectives"'
          >
            #
          </a>
        </h2>
      </section>

      <section>
        <h2 id="browser-support" class="heading-2">
          Browser support
          <a
            href="#browser-support"
            aria-label='Direct link to "Browser support"'
          >
            #
          </a>
        </h2>
        <ul>
          <li>Chrome &gt;= 114</li>
          <li>Edge &gt;= 114</li>
          <li>Safari &gt;= 17</li>
          <li>Firefox &gt;= 125</li>
          <li>Opera &gt;= 100</li>
        </ul>

        <p>
          See{" "}
          <a
            class="text-link"
            href="https://caniuse.com/?search=popover"
            target="_blank"
          >
            Caniuse
          </a>{" "}
          for more information.
        </p>
      </section>

      <section>
        <h2 id="development-status" class="heading-2">
          Meaning of development status in each control
          <a
            href="#development-status"
            aria-label='Direct link to "Meaning of development status in each control"'
          >
            #
          </a>
        </h2>

        <ul>
          <li>
            <p>
              <strong>Experimental</strong>: The control is in its early stages
              of the development. This phase is often useful for testing the
              control early, but it is very likely that the interface will
              change from the final version.
            </p>

            <p>
              Breaking changes for the control can be applied in "patch" tags.
            </p>
            <br />
          </li>

          <li>
            <p>
              <strong>Developer Preview</strong>: The control is in its final
              stages of the development. The interface and behaviors to
              implement the control are almost complete. The interface of the
              control should not change so much from the final version.
            </p>
            <p>
              Breaking changes for the control can be applied in "major" tags.
            </p>
            <br />
          </li>

          <li>
            <p>
              <strong>Stable</strong>: The control's development is stable and
              can be safety used in production environments.
            </p>
            <p>
              Breaking changes for the control can be applied in "major" tags.
              In some cases, two "major" tags would be used to deprecate a
              behavior in the control.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <h2 id="license" class="heading-2">
          License
          <a href="#license" aria-label='Direct link to "License"'>
            #
          </a>
        </h2>
      </section>
    </div>
  </div>
);

export const landingStory: ShowcaseCustomStory = {
  render: renderShowcaseLanding
};
