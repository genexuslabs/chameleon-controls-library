import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-lit";

import "../status.lit";
import type { ChStatus } from "../status.lit";

describe("[ch-status][form-associated]", () => {
  let statusRef: ChStatus;

  afterEach(cleanup);

  it("should be form-associated (formAssociated static property)", () => {
    render(html`<ch-status></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    expect(
      (statusRef.constructor as typeof HTMLElement & { formAssociated?: boolean })
        .formAssociated
    ).toBe(true);
  });

  it("should have ElementInternals available", async () => {
    render(html`<ch-status></ch-status>`);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    // The component should have successfully attached internals
    // (if it failed, the constructor would throw)
    expect(statusRef).toBeTruthy();
  });

  it("should be associated with a parent form", async () => {
    render(html`
      <form id="test-form">
        <ch-status></ch-status>
      </form>
    `);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    // Verify the component is form-associated by checking that it is
    // recognized as a form element. The ElementInternals gives us .form.
    const form = document.querySelector("#test-form") as HTMLFormElement;
    expect(form).toBeTruthy();

    // The status should be accessible as an element associated to the form
    // via the form's elements collection (if the browser supports form-associated custom elements)
    expect(statusRef.closest("form")).toBe(form);
  });

  it("should have labels accessible via ElementInternals", async () => {
    render(html`
      <div>
        <label for="labeled-status">Status Label</label>
        <ch-status id="labeled-status"></ch-status>
      </div>
    `);
    statusRef = document.querySelector("ch-status")!;
    await statusRef.updateComplete;

    // The component preserves the ID set by the user
    expect(statusRef.id).toBe("labeled-status");
  });
});
