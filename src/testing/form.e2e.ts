import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { ChameleonControlsTagName } from "../common/types";
import { isActiveElement } from "./utils.e2e";

const EXTERNAL_LABEL_TEXT = "EXTERNAL label";
const ACCESSIBLE_NAME = "INNER label";
const FORM_NAME = "form-element";

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
  value?: string | number
) =>
  options.externalLabel
    ? `<button>Dummy button</button>
      <label for="element">${EXTERNAL_LABEL_TEXT}</label>
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
    : `<button>Dummy button</button>
      <label>
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
    hasAutoFocusSupport?: boolean;
    valueIsNumeric?: boolean;
    hasTextSelectionSupport?: boolean | undefined;
    pressEnterToConfirmValue?: boolean;
    focusIsOnHostElement?: boolean;
    valueCanBeUpdatedByTheUser?: boolean;
  },
  inputSelector: string = "input",
  ariaLabelSelector?: string
) => {
  const {
    formElementTagName,
    hasReadonlySupport,
    hasAutoFocusSupport,
    hasTextSelectionSupport,
    valueIsNumeric,
    additionalAttributes,
    focusIsOnHostElement,
    pressEnterToConfirmValue,
    valueCanBeUpdatedByTheUser
  } = testOptions;

  const INITIAL_VALUE = valueIsNumeric ? 2 : "Initial value";
  const UPDATED_VALUE = valueIsNumeric ? 4 : "Updated value";

  const ariaLabelElementSelector = focusIsOnHostElement
    ? formElementTagName
    : `${formElementTagName} >>> ${ariaLabelSelector ?? inputSelector}`;

  const focusableElementSelector = focusIsOnHostElement
    ? formElementTagName
    : `${formElementTagName} >>> ${inputSelector}`;

  const getInputRef = async (page: E2EPage) =>
    await page.find(`${formElementTagName} >>> ${inputSelector}`);

  const getAriaLabelElementRef = async (page: E2EPage) =>
    await page.find(ariaLabelElementSelector);

  it("should render the input element (inputSelector)", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    });
    const inputRef = await getInputRef(page);
    expect(inputRef).toBeDefined();
  });

  it(`should label the ${inputSelector} with the external label (for and id)`, async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    });
    const ariaLabelElementRef = await getAriaLabelElementRef(page);

    expect(ariaLabelElementRef).toHaveAttribute("aria-label");
    expect(ariaLabelElementRef).toEqualAttribute(
      "aria-label",
      EXTERNAL_LABEL_TEXT
    );
  });

  it(`should label the ${inputSelector} with the parent label`, async () => {
    const page = await newE2EPage({ failOnConsoleError: true });
    await page.setContent(
      formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: false,
        accessibleName: false
      })
    );
    const ariaLabelElementRef = await getAriaLabelElementRef(page);

    expect(ariaLabelElementRef).toHaveAttribute("aria-label");
    expect(ariaLabelElementRef).toEqualAttribute(
      "aria-label",
      EXTERNAL_LABEL_TEXT
    );
  });

  it("should use the external label instead of the accessibleName property", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: true
      })
    });
    const ariaLabelElementRef = await getAriaLabelElementRef(page);

    expect(ariaLabelElementRef).toHaveAttribute("aria-label");
    expect(ariaLabelElementRef).toEqualAttribute(
      "aria-label",
      EXTERNAL_LABEL_TEXT
    );
    expect(ariaLabelElementRef).not.toEqualAttribute(
      "aria-label",
      ACCESSIBLE_NAME
    );
  });

  it("should use the parent label instead of the accessibleName property", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: false,
        accessibleName: true
      })
    });
    const ariaLabelElementRef = await getAriaLabelElementRef(page);

    expect(ariaLabelElementRef).toHaveAttribute("aria-label");
    expect(ariaLabelElementRef).toEqualAttribute(
      "aria-label",
      EXTERNAL_LABEL_TEXT
    );
    expect(ariaLabelElementRef).not.toEqualAttribute(
      "aria-label",
      ACCESSIBLE_NAME
    );
  });

  it("should use the accessibleName if there is no label defined", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: `<${formElementTagName} ${additionalAttributes} accessible-name="${ACCESSIBLE_NAME}"></${formElementTagName}>`
    });
    const ariaLabelElementRef = await getAriaLabelElementRef(page);

    expect(ariaLabelElementRef).toHaveAttribute("aria-label");
    expect(ariaLabelElementRef).toEqualAttribute("aria-label", ACCESSIBLE_NAME);
  });

  it("the form value for the element should be undefined if no value is set", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: `<form>
        ${formElementTemplate(formElementTagName, additionalAttributes, {
          externalLabel: true,
          accessibleName: true
        })}
      </form>`
    });

    const formValues = await page.evaluate(() => {
      const formElement = document.querySelector("form") as HTMLFormElement;
      const formData = new FormData(formElement);
      return Object.fromEntries(formData.entries());
    });

    // TODO: Add a property to set the default value
    if (valueIsNumeric) {
      expect(formValues[FORM_NAME]).toBe("0");
    } else {
      expect(formValues[FORM_NAME]).toBeUndefined();
    }
  });

  it("the form value for the element should be defined if a value is set as an attribute of the tag", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: `<form>
        ${formElementTemplate(
          formElementTagName,
          additionalAttributes,
          { externalLabel: true, accessibleName: true },
          INITIAL_VALUE
        )}
      </form>`
    });

    const formValues = await getFormValues(page);

    expect(formValues[FORM_NAME]).toBe(INITIAL_VALUE.toString());
  });

  it("the form value for the element should be updated if the value binding is updated at runtime", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: `<form>
      ${formElementTemplate(
        formElementTagName,
        additionalAttributes,
        { externalLabel: true, accessibleName: true },
        INITIAL_VALUE
      )}
    </form>`
    });
    let formValues = await getFormValues(page);

    expect(formValues[FORM_NAME]).toBe(INITIAL_VALUE.toString());

    // Update the binding
    const formElement = await page.find(formElementTagName);
    formElement.setProperty("value", UPDATED_VALUE);
    await page.waitForChanges();

    formValues = await getFormValues(page);
    expect(formValues[FORM_NAME]).toBe(UPDATED_VALUE.toString());
  });

  if (valueCanBeUpdatedByTheUser) {
    it("the form value for the element should be updated if the value is updated by the user", async () => {
      const page = await newE2EPage({
        failOnConsoleError: true,
        html: `<form>
        ${formElementTemplate(formElementTagName, additionalAttributes, {
          externalLabel: true,
          accessibleName: true
        })}
      </form>`
      });
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
      await page.waitForChanges();

      formValues = await getFormValues(page);
      expect(formValues[FORM_NAME]).toBe("Hello");
    });
  }

  it("should focus the element when clicking on the external label", async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    });
    await page.click("label");

    const inputIsFocused = await isActiveElement(
      page,
      focusableElementSelector
    );

    expect(inputIsFocused).toBe(true);
  });

  const getTextSuffixDescription = (options: {
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

    return `${clickedElement} ${optionsString}`;
  };

  const performFocusTest = (options: {
    externalLabel: boolean;
    accessibleName: boolean;
    disabled?: boolean;
    readonly?: boolean;
    clickOnLabel: boolean;
  }) => {
    const suffixDescription = getTextSuffixDescription(options);

    const descriptionLabel = options.disabled
      ? `should not focus the element when clicking on the ${suffixDescription}`
      : `should focus the element when clicking on the ${suffixDescription}`;

    it(descriptionLabel, async () => {
      const page = await newE2EPage({
        failOnConsoleError: true,
        html: formElementTemplate(
          formElementTagName,
          additionalAttributes,
          options
        )
      });

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

  const performTextSelectionTest = (options: {
    externalLabel: boolean;
    accessibleName: boolean;
    disabled?: boolean;
    readonly?: boolean;
    clickOnLabel: boolean;
  }) => {
    const suffixDescription = getTextSuffixDescription(options);

    const canSelectText = !options.disabled && hasTextSelectionSupport;

    const descriptionTextSelection = canSelectText
      ? `should select the element text when clicking on the ${suffixDescription}`
      : `should not select the element text when clicking on the ${suffixDescription}`;

    // TODO: Fix this test
    it.skip(descriptionTextSelection, async () => {
      const page = await newE2EPage({ failOnConsoleError: true });
      await page.setContent(
        formElementTemplate(formElementTagName, additionalAttributes, options)
      );
      await page.waitForChanges();

      // Select event does not bubbles, so we have to spy the input ref
      const inputRef = await getInputRef(page);
      const selectEventSpy = await inputRef.spyOnEvent("select");

      if (options.clickOnLabel) {
        await page.click("label");
      } else {
        await page.click(formElementTagName);
      }

      if (canSelectText) {
        expect(selectEventSpy).toHaveReceivedEventTimes(1);
      } else {
        expect(selectEventSpy).toHaveReceivedEventTimes(0);
      }
    });
  };

  if (hasTextSelectionSupport !== undefined) {
    [false, true].forEach(disabled => {
      [true, false].forEach(clickOnLabel => {
        [true, false].forEach(externalLabel => {
          [true, false].forEach(accessibleName => {
            readonlyValues.forEach(readonly =>
              performTextSelectionTest({
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
  }

  it(`should focus the ${inputSelector} when programmatically calling focus() on the Host`, async () => {
    const page = await newE2EPage({
      failOnConsoleError: true,
      html: formElementTemplate(formElementTagName, additionalAttributes, {
        externalLabel: true,
        accessibleName: false
      })
    });
    await page.focus(formElementTagName);

    const inputIsFocused = await isActiveElement(
      page,
      focusableElementSelector
    );

    expect(inputIsFocused).toBe(true);
  });

  if (hasAutoFocusSupport) {
    it(`should focus the ${inputSelector} when setting autoFocus on the initial page render`, async () => {
      const page = await newE2EPage({
        failOnConsoleError: true,
        html: `<${formElementTagName} auto-focus></${formElementTagName}>`
      });

      const inputIsFocused = await isActiveElement(
        page,
        ariaLabelElementSelector
      );
      expect(inputIsFocused).toBe(true);
    });

    it(`should focus the ${inputSelector} when setting autoFocus and creating the element after the initial page render`, async () => {
      const page = await newE2EPage({
        failOnConsoleError: true,
        html: `<${formElementTagName}></${formElementTagName}>`
      });

      let inputIsFocused = await isActiveElement(
        page,
        ariaLabelElementSelector
      );
      expect(inputIsFocused).toBe(false);
      await page.setContent(
        `<${formElementTagName} auto-focus></${formElementTagName}>`
      );
      await page.waitForChanges();

      inputIsFocused = await isActiveElement(page, ariaLabelElementSelector);
      expect(inputIsFocused).toBe(true);
    });
  }
};
