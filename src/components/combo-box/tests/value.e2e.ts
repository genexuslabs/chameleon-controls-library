import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { simpleModelComboBox1 } from "../../../showcase/assets/components/combo-box/models";

describe("[ch-combo-box-render][value]", () => {
  let page: E2EPage;

  beforeEach(async () => {
    page = await newE2EPage({
      failOnConsoleError: true,
      html: ""
    });
  });

  // TODO: We should should include form test too
  // TODO: We should try to generalize this test
  it("should set the value at the initial load", async () => {
    const value = "Value 1";

    // This is a WA to create the element and assign the properties before it's
    // connected to the DOM. Otherwise, we would trigger an extra render
    await page.evaluate(
      (model, value) => {
        const comboBox = document.createElement("ch-combo-box-render");
        comboBox.model = model;
        comboBox.value = value;

        document.body.appendChild(comboBox);
      },
      simpleModelComboBox1,
      value
    );

    await page.waitForChanges();
    const inputRef = await page.find("ch-combo-box-render >>> input");

    expect(await inputRef.getProperty("value")).toBe(
      simpleModelComboBox1[0].caption
    );
  });

  it("should set the value at the initial load with suggest = true", async () => {
    const value = "Value 1";

    // This is a WA to create the element and assign the properties before it's
    // connected to the DOM. Otherwise, we would trigger an extra render
    await page.evaluate(
      (model, value) => {
        const comboBox = document.createElement("ch-combo-box-render");
        comboBox.model = model;
        comboBox.value = value;
        comboBox.suggest = true;

        document.body.appendChild(comboBox);
      },
      simpleModelComboBox1,
      value
    );

    await page.waitForChanges();
    const inputRef = await page.find("ch-combo-box-render >>> input");

    expect(await inputRef.getProperty("value")).toBe(value);
  });
});
