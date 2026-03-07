# ch-color-picker: Shadow DOM layout

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
