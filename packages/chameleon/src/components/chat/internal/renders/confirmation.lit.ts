import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { tokenMap } from "../../../../utilities/mapping/token-map.js";
import type {
  ChatConfirmationRender,
  ChatMessageConfirmation
} from "../../types";

/**
 * Default render function for ch-confirmation component within chat messages.
 * Renders a confirmation workflow with approval requests and responses.
 */
export const defaultConfirmationRender: ChatConfirmationRender = (
  confirmation: ChatMessageConfirmation
): any =>
  html`<ch-confirmation
    class="confirmation-container"
    part=${tokenMap({
      "confirmation-container": true,
      [confirmation.parts]: !!confirmation.parts
    })}
    exportparts="container, title, message, actions, button-approve, button-reject, approval-requested, approval-responded, output-denied, output-available"
    .approval=${ifDefined(confirmation.approval)}
    .state=${confirmation.state}
    .title=${ifDefined(confirmation.title)}
    .requestMessage=${ifDefined(confirmation.requestMessage)}
    .acceptedMessage=${ifDefined(confirmation.acceptedMessage)}
    .rejectedMessage=${ifDefined(confirmation.rejectedMessage)}
  ></ch-confirmation>`;
