# ch-radio-group-render



<!-- Auto Generated Below -->


## Overview

The radio group control is used to render a short list of mutually exclusive options.

It contains radio items to allow users to select one option from the list of options.

## Properties

| Property   | Attribute  | Description                                                                                                                                                  | Type          | Default     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ----------- |
| `disabled` | `disabled` | This attribute lets you specify if the radio-group is disabled. If disabled, it will not fire any user interaction related event (for example, click event). | `boolean`     | `false`     |
| `items`    | --         | This property lets you define the items of the ch-radio-group-render control.                                                                                | `RadioItem[]` | `undefined` |
| `value`    | `value`    | The value of the control.                                                                                                                                    | `string`      | `undefined` |


## Events

| Event    | Description                                                                                    | Type                  |
| -------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| `change` | Fired when the selected item change. It contains the information about the new selected value. | `CustomEvent<string>` |


## Shadow Parts

| Part                 | Description                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"checked"`          | Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is checked (`checked` === `true`).     |
| `"disabled"`         | Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is disabled (`disabled` === `true`).   |
| `"radio__container"` | The container that serves as a wrapper for the `input` and the `option` parts.                                                                     |
| `"radio__input"`     | The invisible input element that implements the interactions for the component. This part must be kept "invisible".                                |
| `"radio__item"`      | The radio item element.                                                                                                                            |
| `"radio__label"`     | The label that is rendered when the `caption` property is not empty.                                                                               |
| `"radio__option"`    | The actual "input" that is rendered above the `input` part. This part has `position: absolute` and `pointer-events: none`.                         |
| `"unchecked"`        | Present in the `radio__item`, `radio__option`, `radio__label` and `radio__container` parts when the control is not checked (`checked` !== `true`). |


## CSS Custom Properties

| Name                                     | Description                                                                                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--ch-radio-group__radio-container-size` | Specifies the size for the container of the `radio__input` and `radio__option` elements. @default min(1em, 20px) |
| `--ch-radio-group__radio-option-size`    | Specifies the size for the `radio__option` element. @default 50%                                                 |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
