import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-lit";
import type { ChConfirmation } from "../confirmation.lit";
import "../confirmation.lit.js";
import { CONFIRMATION_PARTS_DICTIONARY } from "../constants";
import type {
  ConfirmationApproveEvent,
  ConfirmationRejectEvent
} from "../types";

describe("[ch-confirmation][basic rendering]", () => {
  let confirmationRef: ChConfirmation;

  afterEach(cleanup);

  describe("state: approval-requested", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          title="Approval Required"
          request-message="Do you approve this action?"
          accepted-message="Action approved"
          rejected-message="Action rejected"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should render the request message", () => {
      const message = confirmationRef.shadowRoot!.querySelector(".message");
      expect(message).toBeTruthy();
      expect(message!.textContent!.trim()).toBe("Do you approve this action?");
    });

    it("should render the title", () => {
      const title = confirmationRef.shadowRoot!.querySelector(".title");
      expect(title).toBeTruthy();
      expect(title!.textContent!.trim()).toBe("Approval Required");
    });

    it("should render both approve and reject buttons", () => {
      const approveButton = confirmationRef.shadowRoot!.querySelector(
        ".button-approve"
      ) as HTMLButtonElement;
      const rejectButton = confirmationRef.shadowRoot!.querySelector(
        ".button-reject"
      ) as HTMLButtonElement;

      expect(approveButton).toBeTruthy();
      expect(rejectButton).toBeTruthy();
      expect(approveButton.textContent!.trim()).toBe("Approve");
      expect(rejectButton.textContent!.trim()).toBe("Reject");
    });

    it("should render the actions container", () => {
      const actions = confirmationRef.shadowRoot!.querySelector(".actions");
      expect(actions).toBeTruthy();
    });
  });

  describe("state: approval-responded", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-responded"
          request-message="Do you approve this action?"
          accepted-message="Action approved"
          rejected-message="Action rejected"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should render the accepted message", () => {
      const message = confirmationRef.shadowRoot!.querySelector(".message");
      expect(message).toBeTruthy();
      expect(message!.textContent!.trim()).toBe("Action approved");
    });

    it("should NOT render action buttons", () => {
      const actions = confirmationRef.shadowRoot!.querySelector(".actions");
      expect(actions).toBeNull();
    });
  });

  describe("state: output-available", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="output-available"
          request-message="Do you approve this action?"
          accepted-message="Output is ready"
          rejected-message="Action rejected"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should render the accepted message", () => {
      const message = confirmationRef.shadowRoot!.querySelector(".message");
      expect(message).toBeTruthy();
      expect(message!.textContent!.trim()).toBe("Output is ready");
    });

    it("should NOT render action buttons", () => {
      const actions = confirmationRef.shadowRoot!.querySelector(".actions");
      expect(actions).toBeNull();
    });
  });

  describe("state: output-denied", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="output-denied"
          request-message="Do you approve this action?"
          accepted-message="Action approved"
          rejected-message="Action was rejected"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should render the rejected message", () => {
      const message = confirmationRef.shadowRoot!.querySelector(".message");
      expect(message).toBeTruthy();
      expect(message!.textContent!.trim()).toBe("Action was rejected");
    });

    it("should NOT render action buttons", () => {
      const actions = confirmationRef.shadowRoot!.querySelector(".actions");
      expect(actions).toBeNull();
    });
  });
});

describe("[ch-confirmation][events]", () => {
  let confirmationRef: ChConfirmation;

  afterEach(cleanup);

  describe("approve event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Approve this?"
          .approval=${{ id: "test-approval-123", approved: false }}
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should emit approve event when Approve button is clicked", async () => {
      const handler = vi.fn();
      confirmationRef.addEventListener("approve", handler);

      const approveButton = confirmationRef.shadowRoot!.querySelector(
        ".button-approve"
      ) as HTMLButtonElement;
      approveButton.click();
      await confirmationRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);

      const event = handler.mock.calls[0][0] as CustomEvent<ConfirmationApproveEvent>;
      expect(event.detail).toEqual({ approvalId: "test-approval-123" });
    });

    it("should emit approve event with undefined approvalId when approval prop is not set", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Approve this?"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const handler = vi.fn();
      confirmationRef.addEventListener("approve", handler);

      const approveButton = confirmationRef.shadowRoot!.querySelector(
        ".button-approve"
      ) as HTMLButtonElement;
      approveButton.click();
      await confirmationRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<ConfirmationApproveEvent>;
      expect(event.detail).toEqual({ approvalId: undefined });
    });
  });

  describe("reject event", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Approve this?"
          .approval=${{ id: "test-approval-456", approved: false }}
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should emit reject event when Reject button is clicked", async () => {
      const handler = vi.fn();
      confirmationRef.addEventListener("reject", handler);

      const rejectButton = confirmationRef.shadowRoot!.querySelector(
        ".button-reject"
      ) as HTMLButtonElement;
      rejectButton.click();
      await confirmationRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);

      const event = handler.mock.calls[0][0] as CustomEvent<ConfirmationRejectEvent>;
      expect(event.detail).toEqual({ approvalId: "test-approval-456" });
    });

    it("should emit reject event with undefined approvalId when approval prop is not set", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Reject this?"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const handler = vi.fn();
      confirmationRef.addEventListener("reject", handler);

      const rejectButton = confirmationRef.shadowRoot!.querySelector(
        ".button-reject"
      ) as HTMLButtonElement;
      rejectButton.click();
      await confirmationRef.updateComplete;

      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent<ConfirmationRejectEvent>;
      expect(event.detail).toEqual({ approvalId: undefined });
    });
  });
});

describe("[ch-confirmation][css parts]", () => {
  let confirmationRef: ChConfirmation;

  afterEach(cleanup);

  describe("container parts", () => {
    it("should have 'container' and 'approval-requested' parts in approval-requested state", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");
      const partAttr = container!.getAttribute("part");
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.CONTAINER);
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.APPROVAL_REQUESTED);
    });

    it("should have 'container' and 'approval-responded' parts in approval-responded state", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-responded"
          accepted-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");
      const partAttr = container!.getAttribute("part");
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.CONTAINER);
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.APPROVAL_RESPONDED);
    });

    it("should have 'container' and 'output-denied' parts in output-denied state", async () => {
      const result = await render(
        html`<ch-confirmation
          state="output-denied"
          rejected-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");
      const partAttr = container!.getAttribute("part");
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.CONTAINER);
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.OUTPUT_DENIED);
    });

    it("should have 'container' and 'output-available' parts in output-available state", async () => {
      const result = await render(
        html`<ch-confirmation
          state="output-available"
          accepted-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");
      const partAttr = container!.getAttribute("part");
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.CONTAINER);
      expect(partAttr).toContain(CONFIRMATION_PARTS_DICTIONARY.OUTPUT_AVAILABLE);
    });
  });

  describe("element parts", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          title="Test Title"
          request-message="Test Message"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it("should have 'title' part on title element", () => {
      const title = confirmationRef.shadowRoot!.querySelector(".title");
      expect(title!.getAttribute("part")).toBe(CONFIRMATION_PARTS_DICTIONARY.TITLE);
    });

    it("should have 'message' part on message element", () => {
      const message = confirmationRef.shadowRoot!.querySelector(".message");
      expect(message!.getAttribute("part")).toBe(CONFIRMATION_PARTS_DICTIONARY.MESSAGE);
    });

    it("should have 'actions' part on actions container", () => {
      const actions = confirmationRef.shadowRoot!.querySelector(".actions");
      expect(actions!.getAttribute("part")).toBe(CONFIRMATION_PARTS_DICTIONARY.ACTIONS);
    });

    it("should have 'button-approve' part on approve button", () => {
      const button = confirmationRef.shadowRoot!.querySelector(".button-approve");
      expect(button!.getAttribute("part")).toBe(CONFIRMATION_PARTS_DICTIONARY.BUTTON_APPROVE);
    });

    it("should have 'button-reject' part on reject button", () => {
      const button = confirmationRef.shadowRoot!.querySelector(".button-reject");
      expect(button!.getAttribute("part")).toBe(CONFIRMATION_PARTS_DICTIONARY.BUTTON_REJECT);
    });
  });
});

describe("[ch-confirmation][accessibility]", () => {
  let confirmationRef: ChConfirmation;

  afterEach(cleanup);

  describe("ARIA attributes on host", () => {
    beforeEach(async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;
    });

    it('should have role="alert" on the component', () => {
      expect(confirmationRef.getAttribute("role")).toBe("alert");
    });

    it('should have aria-live="polite" on the component', () => {
      expect(confirmationRef.getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("aria-label and aria-labelledby", () => {
    it("should use aria-labelledby when title is provided", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          title="Important Alert"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");
      const title = confirmationRef.shadowRoot!.querySelector(".title");

      // Container should have aria-labelledby pointing to the title's ID
      const labelledBy = container!.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();

      // Title should have that ID
      const titleId = title!.getAttribute("id");
      expect(titleId).toBe(labelledBy);

      // Container should NOT have aria-label when title is present
      expect(container!.hasAttribute("aria-label")).toBe(false);
    });

    it("should use aria-label when no title but accessibleName is provided", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          accessible-name="Confirmation Alert"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");

      // Container should have aria-label
      expect(container!.getAttribute("aria-label")).toBe("Confirmation Alert");

      // Container should NOT have aria-labelledby when no title
      expect(container!.hasAttribute("aria-labelledby")).toBe(false);
    });

    it("should not have aria-label or aria-labelledby when neither title nor accessibleName is provided", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const container = confirmationRef.shadowRoot!.querySelector(".container");

      expect(container!.hasAttribute("aria-label")).toBe(false);
      expect(container!.hasAttribute("aria-labelledby")).toBe(false);
    });
  });

  describe("button aria-labels", () => {
    it("should have default aria-label on approve button", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const approveButton = confirmationRef.shadowRoot!.querySelector(
        ".button-approve"
      ) as HTMLButtonElement;
      expect(approveButton.getAttribute("aria-label")).toBe("Approve");
    });

    it("should have default aria-label on reject button", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const rejectButton = confirmationRef.shadowRoot!.querySelector(
        ".button-reject"
      ) as HTMLButtonElement;
      expect(rejectButton.getAttribute("aria-label")).toBe("Reject");
    });

    it("should use custom aria-label on approve button when approveButtonLabel is provided", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
          approve-button-label="Aceptar"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const approveButton = confirmationRef.shadowRoot!.querySelector(
        ".button-approve"
      ) as HTMLButtonElement;
      expect(approveButton.getAttribute("aria-label")).toBe("Aceptar");
      expect(approveButton.textContent!.trim()).toBe("Aceptar");
    });

    it("should use custom aria-label on reject button when rejectButtonLabel is provided", async () => {
      const result = await render(
        html`<ch-confirmation
          state="approval-requested"
          request-message="Test"
          reject-button-label="Rechazar"
        ></ch-confirmation>`
      );
      confirmationRef = result.container.querySelector("ch-confirmation")!;
      await confirmationRef.updateComplete;

      const rejectButton = confirmationRef.shadowRoot!.querySelector(
        ".button-reject"
      ) as HTMLButtonElement;
      expect(rejectButton.getAttribute("aria-label")).toBe("Rechazar");
      expect(rejectButton.textContent!.trim()).toBe("Rechazar");
    });
  });
});

describe("[ch-confirmation][internationalization]", () => {
  let confirmationRef: ChConfirmation;

  afterEach(cleanup);

  it("should support custom button labels for internationalization", async () => {
    const result = await render(
      html`<ch-confirmation
        state="approval-requested"
        request-message="¿Aprobar esta acción?"
        approve-button-label="Aprobar"
        reject-button-label="Rechazar"
      ></ch-confirmation>`
    );
    confirmationRef = result.container.querySelector("ch-confirmation")!;
    await confirmationRef.updateComplete;

    const approveButton = confirmationRef.shadowRoot!.querySelector(
      ".button-approve"
    ) as HTMLButtonElement;
    const rejectButton = confirmationRef.shadowRoot!.querySelector(
      ".button-reject"
    ) as HTMLButtonElement;

    expect(approveButton.textContent!.trim()).toBe("Aprobar");
    expect(rejectButton.textContent!.trim()).toBe("Rechazar");
  });
});
