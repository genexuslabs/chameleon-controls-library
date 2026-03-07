# ch-color-picker: Styling

## Table of Contents

- [Shadow Parts](#shadow-parts)
- [CSS Custom Properties](#css-custom-properties)
- [Shadow DOM Layout](#shadow-dom-layout)
  - [Case 1: Full layout (all controls)](#case-1-full-layout-all-controls)

## Shadow Parts

| Part                        | Description                                                                       |
| --------------------------- | --------------------------------------------------------------------------------- |
| `"alpha-suffix"`            | The suffix text (e.g., "%") displayed after the alpha input.                      |
| `"alpha__input"`            | The numeric input for directly entering the alpha value.                          |
| `"alpha__input-group"`      | The container wrapping the alpha input and its label.                             |
| `"alpha__input-label"`      | The label for the alpha numeric input.                                            |
| `"alpha__slider"`           | The slider control for selecting the alpha (opacity) value.                       |
| `"alpha__slider-label"`     | The accessible label for the alpha slider.                                        |
| `"color-field"`             | The two-dimensional gradient area where users pick saturation and brightness.     |
| `"color-field__label"`      | The accessible label for the color field.                                         |
| `"color-format-selector"`   | The container for the color format selector controls.                             |
| `"color-format__combo-box"` | The combo box used to switch between color formats (HEX, RGB, HSL, HSV).          |
| `"color-inputs"`            | The container that holds all color channel inputs for the selected format.        |
| `"color-palette-grid"`      | The grid container for the preset color palette swatches.                         |
| `"color-palette__button"`   | A clickable button representing a single preset color in the palette.             |
| `"color-palette__label"`    | The label for the color palette section.                                          |
| `"color-preview"`           | The swatch element displaying the currently selected color.                       |
| `"color-preview-container"` | The container that wraps the color preview swatch and text.                       |
| `"color-preview__text"`     | The text representation of the current color shown alongside the preview.         |
| `"disabled"`                | Present on the host when the component is disabled.                               |
| `"format-selector__header"` | The header area of the format selector section.                                   |
| `"format-selector__label"`  | The label for the format selector dropdown.                                       |
| `"hex__input"`              | The text input for entering a HEX color value.                                    |
| `"hex__input-group"`        | The container wrapping the HEX input and its label.                               |
| `"hex__input-label"`        | The label for the HEX color input.                                                |
| `"hsl-h__group"`            | The container for the HSL hue input and label.                                    |
| `"hsl-h__input"`            | The numeric input for the HSL hue value (0-360).                                  |
| `"hsl-h__label"`            | The label for the HSL hue input.                                                  |
| `"hsl-inputs__group"`       | The container wrapping all HSL channel inputs.                                    |
| `"hsl-l-suffix"`            | The suffix text displayed after the HSL lightness input.                          |
| `"hsl-l__group"`            | The container for the HSL lightness input and label.                              |
| `"hsl-l__input"`            | The numeric input for the HSL lightness value (0-100).                            |
| `"hsl-l__label"`            | The label for the HSL lightness input.                                            |
| `"hsl-s-suffix"`            | The suffix text displayed after the HSL saturation input.                         |
| `"hsl-s__group"`            | The container for the HSL saturation input and label.                             |
| `"hsl-s__input"`            | The numeric input for the HSL saturation value (0-100).                           |
| `"hsl-s__label"`            | The label for the HSL saturation input.                                           |
| `"hsv-h__group"`            | The container for the HSV hue input and label.                                    |
| `"hsv-h__input"`            | The numeric input for the HSV hue value (0-360).                                  |
| `"hsv-h__label"`            | The label for the HSV hue input.                                                  |
| `"hsv-inputs__group"`       | The container wrapping all HSV channel inputs.                                    |
| `"hsv-s-suffix"`            | The suffix text displayed after the HSV saturation input.                         |
| `"hsv-s__group"`            | The container for the HSV saturation input and label.                             |
| `"hsv-s__input"`            | The numeric input for the HSV saturation value (0-100).                           |
| `"hsv-s__label"`            | The label for the HSV saturation input.                                           |
| `"hsv-v-suffix"`            | The suffix text displayed after the HSV value input.                              |
| `"hsv-v__group"`            | The container for the HSV value input and label.                                  |
| `"hsv-v__input"`            | The numeric input for the HSV value/brightness (0-100).                           |
| `"hsv-v__label"`            | The label for the HSV value input.                                                |
| `"hue-slider__label"`       | The accessible label for the hue slider.                                          |
| `"hue__slider"`             | The slider control for selecting the hue value (0-360).                           |
| `"marker"`                  | The draggable marker inside the color field that indicates the selected position. |
| `"readonly"`                | Present on the host when the component is readonly.                               |
| `"rgb-b__group"`            | The container for the blue channel input and label.                               |
| `"rgb-b__input"`            | The numeric input for the blue channel value (0-255).                             |
| `"rgb-b__label"`            | The label for the blue channel input.                                             |
| `"rgb-g__group"`            | The container for the green channel input and label.                              |
| `"rgb-g__input"`            | The numeric input for the green channel value (0-255).                            |
| `"rgb-g__label"`            | The label for the green channel input.                                            |
| `"rgb-inputs__group"`       | The container wrapping all RGB channel inputs.                                    |
| `"rgb-r__group"`            | The container for the red channel input and label.                                |
| `"rgb-r__input"`            | The numeric input for the red channel value (0-255).                              |
| `"rgb-r__label"`            | The label for the red channel input.                                              |

## CSS Custom Properties

| Name                                               | Description                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `--ch-color-picker-palette-button-min-block-size`  | Specifies the min height of the current color color-palette box. @default 1.5em |
| `--ch-color-picker-palette-button-min-inline-size` | Specifies the min width of the current color color-palette box. @default 2em    |
| `--ch-color-picker-palette-columns`                | Specifies the number of columns in the color palette grid. @default 10          |
| `--ch-color-picker-preview-block-size`             | Specifies the height of the current color preview box. @default 20px            |
| `--ch-color-picker-preview-inline-size`            | Specifies the width of the current color preview box. @default 20px             |

## Shadow DOM Layout

Controls rendered depend on the `controlsOrder` property. Each control is optional and composable.

## Case 1: Full layout (all controls)

```
<ch-color-picker>
  | #shadow-root
  |
  | <!-- Color field control -->
  | <div>
  |   <label part="color-field__label">Color field</label>
  |   <ch-color-field part="color-field">
  |     | #shadow-root
  |     | <canvas></canvas>
  |     | <div part="marker [disabled] [readonly]"></div>
  |   </ch-color-field>
  | </div>
  |
  | <!-- Hue slider control -->
  | <div>
  |   <label part="hue-slider__label">Hue</label>
  |   <ch-slider part="hue__slider">
  |     | #shadow-root
  |     | <div class="position-absolute-wrapper">
  |     |   <input type="range" />
  |     |   <div part="track [disabled]">
  |     |     <div part="track__selected [disabled]"></div>
  |     |     <div part="track__unselected [disabled]"></div>
  |     |   </div>
  |     |   <div part="thumb [disabled]"></div>
  |     | </div>
  |   </ch-slider>
  | </div>
  |
  | <!-- Alpha slider control -->
  | <div>
  |   <label part="alpha__slider-label">Alpha</label>
  |   <ch-slider part="alpha__slider">
  |     | #shadow-root
  |     | <div class="position-absolute-wrapper">
  |     |   <input type="range" />
  |     |   <div part="track [disabled]">
  |     |     <div part="track__selected [disabled]"></div>
  |     |     <div part="track__unselected [disabled]"></div>
  |     |   </div>
  |     |   <div part="thumb [disabled]"></div>
  |     | </div>
  |   </ch-slider>
  | </div>
  |
  | <!-- Color preview control -->
  | <div part="color-preview-container">
  |   <span part="color-preview__text">Current color</span>
  |   <div part="color-preview" role="img"></div>
  | </div>
  |
  | <!-- Color palette control -->
  | <div>
  |   <label part="color-palette__label">Palette</label>
  |   <div part="color-palette-grid" role="group">
  |     <ul>
  |       <!-- for each color in palette -->
  |       <li>
  |         <button part="color-palette__button [disabled] [readonly]"></button>
  |       </li>
  |     </ul>
  |   </div>
  | </div>
  |
  | <!-- Color format selector control -->
  | <div part="color-format-selector">
  |   <div part="format-selector__header">
  |     <label part="format-selector__label">Format</label>
  |     <ch-combo-box-render part="color-format__combo-box">
  |       | #shadow-root
  |       | <span class="invisible-text"></span>
  |       | <div role="combobox">
  |       |   <input />
  |       | </div>
  |       | <ch-popover role="listbox" part="window">
  |       |   | #shadow-root
  |       |   | <slot />
  |       |
  |       |   <!-- for each item in model -->
  |       |   <button role="option" part="{item.value} item [nested] [disabled] [selected]">
  |       |     Caption text
  |       |   </button>
  |       | </ch-popover>
  |     </ch-combo-box-render>
  |   </div>
  |   <div part="color-inputs">
  |     <!-- when selectedColorFormat === "hex" -->
  |     <div part="hex__input-group">
  |       <label part="hex__input-label">Hex</label>
  |       <input part="hex__input [disabled] [readonly]" type="text" />
  |     </div>
  |     <!-- when selectedColorFormat === "rgb" -->
  |     <div part="rgb-inputs__group">
  |       <div part="rgb-r__group">
  |         <label part="rgb-r__label">R</label>
  |         <input part="rgb-r__input [disabled] [readonly]" type="number" />
  |       </div>
  |       <div part="rgb-g__group">
  |         <label part="rgb-g__label">G</label>
  |         <input part="rgb-g__input [disabled] [readonly]" type="number" />
  |       </div>
  |       <div part="rgb-b__group">
  |         <label part="rgb-b__label">B</label>
  |         <input part="rgb-b__input [disabled] [readonly]" type="number" />
  |       </div>
  |     </div>
  |     <!-- when selectedColorFormat === "hsl" -->
  |     <div part="hsl-inputs__group">
  |       <div part="hsl-h__group">
  |         <label part="hsl-h__label">H</label>
  |         <input part="hsl-h__input [disabled] [readonly]" type="number" />
  |       </div>
  |       <div part="hsl-s__group">
  |         <label part="hsl-s__label">S</label>
  |         <input part="hsl-s__input [disabled] [readonly]" type="number" />
  |         <span part="hsl-s-suffix">%</span>
  |       </div>
  |       <div part="hsl-l__group">
  |         <label part="hsl-l__label">L</label>
  |         <input part="hsl-l__input [disabled] [readonly]" type="number" />
  |         <span part="hsl-l-suffix">%</span>
  |       </div>
  |     </div>
  |     <!-- when selectedColorFormat === "hsv" -->
  |     <div part="hsv-inputs__group">
  |       <div part="hsv-h__group">
  |         <label part="hsv-h__label">H</label>
  |         <input part="hsv-h__input [disabled] [readonly]" type="number" />
  |       </div>
  |       <div part="hsv-s__group">
  |         <label part="hsv-s__label">S</label>
  |         <input part="hsv-s__input [disabled] [readonly]" type="number" />
  |         <span part="hsv-s-suffix">%</span>
  |       </div>
  |       <div part="hsv-v__group">
  |         <label part="hsv-v__label">V</label>
  |         <input part="hsv-v__input [disabled] [readonly]" type="number" />
  |         <span part="hsv-v-suffix">%</span>
  |       </div>
  |     </div>
  |     <!-- Alpha input (always rendered within format selector) -->
  |     <div part="alpha__input-group">
  |       <label part="alpha__input-label">A</label>
  |       <input part="alpha__input [disabled] [readonly]" type="number" />
  |       <span part="alpha-suffix">%</span>
  |     </div>
  |   </div>
  | </div>
</ch-color-picker>
```
