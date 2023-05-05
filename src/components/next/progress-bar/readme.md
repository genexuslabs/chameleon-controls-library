# ch-next-progress-bar

A determinate progress bar that measures progress using "steps".
The progress bar has a title (caption property) and a description. When the
description changes at runtime, the state transition is animated with a
fade-out and fade-in.

```html
<ch-next-progress-bar
  caption="Your App is almost ready!"
  description="Defining business entities"
  steps="5"
  current-step="2"
  presented
></ch-next-progress-bar>
```

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                           | Type      | Default     |
| ------------- | -------------- | --------------------------------------------------------------------- | --------- | ----------- |
| `caption`     | `caption`      | It specifies the main text that is shown on the progress.             | `string`  | `null`      |
| `cssClass`    | `css-class`    | A CSS class to set as the `ch-next-progress-bar` element class.       | `string`  | `undefined` |
| `currentStep` | `current-step` | This attribute lets you specify the value of the progress.            | `number`  | `MIN_VALUE` |
| `description` | `description`  | It specifies more information that is shown on the progress.          | `string`  | `null`      |
| `presented`   | `presented`    | This attribute lets you specify if the progress bar is rendered.      | `boolean` | `false`     |
| `steps`       | `steps`        | This attribute lets you specify the amount of steps for the progress. | `number`  | `1`         |


## Shadow Parts

| Part                                      | Description                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `"ch-next-progress-bar__caption"`         | The caption displayed in the top of the control.                       |
| `"ch-next-progress-bar__description"`     | The description displayed below the steps of the control.              |
| `"ch-next-progress-bar__main-container"`  | The main container of the control.                                     |
| `"ch-next-progress-bar__step"`            | Each step displayed in the control.                                    |
| `"ch-next-progress-bar__steps-container"` | The container of the steps displayed below the caption of the control. |


## CSS Custom Properties

| Name                      | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `--last-checked-gradient` | Define the gradient background that the last checked step will animate. |
| `--step-background-color` | Define the gradient background color of the steps.                      |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
