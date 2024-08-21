import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChameleonControlsTagName } from "../common/types";
import { isActiveElement } from "./utils.e2e";

const EXTERNAL_LABEL_TEXT = "EXTERNAL label";
const ACCESSIBLE_NAME = "INNER label";
const FORM_NAME = "form-element";

const INITIAL_VALUE = "Initial value";
const UPDATED_VALUE = "Updated value";

const getFormValues = async (page: E2EPage) =>
  await page.evaluate(() => {
    const formElement = document.querySelector("form") as HTMLFormElement;
    const formData = new FormData(formElement);
    return Object.fromEntries(formData.entries());
  });

const formElementTemplate = (
  tagName: ChameleonControlsTagName,
  additionalAttributes: string,
  options: {
    externalLabel: boolean;
    accessibleName: boolean;
    disabled?: boolean;
    readonly?: boolean;
  },
  value?: string
) =>
  options.externalLabel
    ? `<label for="element">${EXTERNAL_LABEL_TEXT}</label>
        <${tagName}
          ${additionalAttributes}
          id="element"
          name="${FORM_NAME}"
          ${
            options.accessibleName ? `accessible-name="${ACCESSIBLE_NAME}"` : ""
          }
          ${options.disabled ? "disabled" : ""}
          ${options.readonly ? "readonly" : ""}
          ${value ? `value="${value}"` : ""}
        >
        </${tagName}>`
    : `<label>
        ${EXTERNAL_LABEL_TEXT}
        
        <${tagName}
          ${additionalAttributes}
          name="${FORM_NAME}"
          ${
            options.accessibleName ? `accessible-name="${ACCESSIBLE_NAME}"` : ""
          }
          ${options.disabled ? "disabled" : ""}
          ${options.readonly ? "readonly" : ""}
          ${value ? `value="${value}"` : ""}
        >
        </${tagName}>
      </label>`;

export const performFormTests = (
  testOptions: {
    additionalAttributes?: string;
    formElementTagName: ChameleonControlsTagName;
    hasReadonlySupport: boolean;
    pressEnterToConfirmValue?: boolean;
    focusIsOnHostElement?: boolean;
    valueCanBeUpdatedByTheUser?: boolean;
  },
  inputSelector: string = "input"
) => {
  const {
    formElementTagName,
    hasReadonlySupport,
    additionalAttributes,
    focusIsOnHostElement,
    pressEnterToConfirmValue,
    valueCanBeUpdatedByTheUser
  } = testOptions;

  const focusableElementSelector = focusIsOnHostElement
    ? formElementTagName
    : `${formElementTagName} >>> ${inputSelector}`;

  const getInputRef = async (page: E2EPage) =>
    await page.find(`${formElementTagName} >>> ${inputSelector}`);

  it("should render the input element (inputSelector)", async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    );

    const inputRef = await getInputRef(page);
    expect(inputRef).toBeDefined();
  });

  it(`should label the ${inputSelector} with the external label (for and id)`, async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    );

    const inputRef = await getInputRef(page);

    expect(inputRef).toHaveAttribute("aria-label");
    expect(inputRef).toEqualAttribute("aria-label", EXTERNAL_LABEL_TEXT);
  });

  it(`should label the ${inputSelector} with the parent label`, async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: false,
        accessibleName: false
      })
    );

    const inputRef = await getInputRef(page);

    expect(inputRef).toHaveAttribute("aria-label");
    expect(inputRef).toEqualAttribute("aria-label", EXTERNAL_LABEL_TEXT);
  });

  it("should use the external label instead of the accessibleName property", async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: true
      })
    );

    const inputRef = await getInputRef(page);

    expect(inputRef).toHaveAttribute("aria-label");
    expect(inputRef).toEqualAttribute("aria-label", EXTERNAL_LABEL_TEXT);
    expect(inputRef).not.toEqualAttribute("aria-label", ACCESSIBLE_NAME);
  });

  it("should use the parent label instead of the accessibleName property", async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: false,
        accessibleName: true
      })
    );

    const inputRef = await getInputRef(page);

    expect(inputRef).toHaveAttribute("aria-label");
    expect(inputRef).toEqualAttribute("aria-label", EXTERNAL_LABEL_TEXT);
    expect(inputRef).not.toEqualAttribute("aria-label", ACCESSIBLE_NAME);
  });

  it("should use the accessibleName if there is no label defined", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<${formElementTagName} ${additionalAttributes} accessible-name="${ACCESSIBLE_NAME}"></${formElementTagName}>`
    );

    const inputRef = await getInputRef(page);

    expect(inputRef).toHaveAttribute("aria-label");
    expect(inputRef).toEqualAttribute("aria-label", ACCESSIBLE_NAME);
  });

  it("the form value for the element should be undefined if no value is set", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<form>
        ${formElementTemplate(formElementTagName, additionalAttributes, {
          externalLabel: true,
          accessibleName: true
        })}
      </form>`
    );

    const formValues = await page.evaluate(() => {
      const formElement = document.querySelector("form") as HTMLFormElement;
      const formData = new FormData(formElement);
      return Object.fromEntries(formData.entries());
    });

    expect(formValues[FORM_NAME]).toBeUndefined();
  });

  it("the form value for the element should be defined if a value is set as an attribute of the tag", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<form>
        ${formElementTemplate(
          formElementTagName,
          additionalAttributes,
          { externalLabel: true, accessibleName: true },
          INITIAL_VALUE
        )}
      </form>`
    );
    const formValues = await getFormValues(page);

    expect(formValues[FORM_NAME]).toBe(INITIAL_VALUE);
  });

  it("the form value for the element should be updated if the value binding is updated at runtime", async () => {
    const page = await newE2EPage();
    await page.setContent(
      `<form>
        ${formElementTemplate(
          formElementTagName,
          additionalAttributes,
          { externalLabel: true, accessibleName: true },
          INITIAL_VALUE
        )}
      </form>`
    );
    let formValues = await getFormValues(page);

    expect(formValues[FORM_NAME]).toBe(INITIAL_VALUE);

    // Update the binding
    const formElement = await page.find(formElementTagName);
    formElement.setProperty("value", UPDATED_VALUE);
    await page.waitForChanges();

    formValues = await getFormValues(page);
    expect(formValues[FORM_NAME]).toBe(UPDATED_VALUE);
  });

  if (valueCanBeUpdatedByTheUser) {
    it("the form value for the element should be updated if the value is updated by the user", async () => {
      const page = await newE2EPage();
      await page.setContent(
        `<form>
        ${formElementTemplate(formElementTagName, additionalAttributes, {
          externalLabel: true,
          accessibleName: true
        })}
      </form>`
      );
      let formValues = await getFormValues(page);

      expect(formValues[FORM_NAME]).toBeUndefined();

      const inputRef = await getInputRef(page);
      await inputRef.press("H");
      await inputRef.press("e");
      await inputRef.press("l");
      await inputRef.press("l");
      await inputRef.press("o");

      if (pressEnterToConfirmValue) {
        await inputRef.press("Enter");
      }

      formValues = await getFormValues(page);
      expect(formValues[FORM_NAME]).toBe("Hello");
    });
  }

  it("should focus the element when clicking on the external label", async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    );

    await page.click("label");

    const inputIsFocused = await isActiveElement(
      page,
      focusableElementSelector
    );

    expect(inputIsFocused).toBe(true);
  });

  const performFocusTest = (options: {
    externalLabel: boolean;
    accessibleName: boolean;
    disabled?: boolean;
    readonly?: boolean;
    clickOnLabel: boolean;
  }) => {
    let clickedElement = "element's Host";

    let optionsString = options.disabled ? "[disabled]" : "[not disabled]";

    optionsString += options.accessibleName
      ? "[with accessibleName]"
      : "[without accessibleName]";

    if (hasReadonlySupport) {
      optionsString += options.readonly ? "[readonly]" : "[editable]";
    }

    if (options.clickOnLabel) {
      clickedElement = options.externalLabel
        ? "external label"
        : "parent label";
    } else {
      clickedElement += options.externalLabel
        ? " and having external label"
        : " and having parent label";
    }

    const description = options.disabled
      ? `should not focus the element when clicking on the ${clickedElement} ${optionsString}`
      : `should focus the element when clicking on the ${clickedElement} ${optionsString}`;

    it(description, async () => {
      const page = await newE2EPage();
      await page.setContent(
        formElementTemplate(formElementTagName, additionalAttributes, options)
      );

      if (options.clickOnLabel) {
        await page.click("label");
      } else {
        await page.click(formElementTagName);
      }

      const inputIsFocused = await isActiveElement(
        page,
        focusableElementSelector
      );

      if (options.disabled) {
        expect(inputIsFocused).not.toBe(true);
      } else {
        expect(inputIsFocused).toBe(true);
      }
    });
  };

  const readonlyValues = hasReadonlySupport ? [false, true] : [false];

  [false, true].forEach(disabled => {
    [true, false].forEach(clickOnLabel => {
      [true, false].forEach(externalLabel => {
        [true, false].forEach(accessibleName => {
          readonlyValues.forEach(readonly =>
            performFocusTest({
              externalLabel,
              accessibleName,
              clickOnLabel,
              disabled,
              readonly
            })
          );
        });
      });
    });
  });

  it(`should focus the ${inputSelector} when programmatically calling focus() on the Host`, async () => {
    const page = await newE2EPage();
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    );

    await page.focus(formElementTagName);

    const inputIsFocused = await isActiveElement(
      page,
      focusableElementSelector
    );

    expect(inputIsFocused).toBe(true);
  });
};
