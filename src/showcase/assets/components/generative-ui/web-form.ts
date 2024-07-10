export const generativeUIWebFormModel = `<form>
  <div class="form-group form-group--label-block-start">
    <label for="data-type" class="form-input__label">Data Types</label>
    <ch-combo-box id="data-type" name="data-types" class="combo-box"></ch-combo-box>
  </div>
  <button class="button-primary" type="button">Submit</button>
</form>
<style>
  form {
    display: grid;
    grid-auto-rows: max-content;
    gap: 8px;
  }
</style>
`;
