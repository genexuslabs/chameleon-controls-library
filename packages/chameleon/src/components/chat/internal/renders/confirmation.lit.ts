import { html } from "lit";
import type {
  ConfirmationApproval,
  ConfirmationState
} from "../../../confirmation/types.js";
import type { AGUIActivityMessage } from "../../typesAGUI.js";

/**
 * Application-level schema for the `content` field of an AG-UI activity
 * message whose `activityType === "confirmation"`. The protocol only
 * requires `Record<string, any>`; this is the shape `ch-confirmation`
 * expects.
 *
 * All four text fields are data, not rendering hints — they describe what
 * the assistant communicates at each stage of the approval workflow:
 *  - `requestMessage`: shown while waiting for the user (`approval-requested`)
 *  - `acceptedMessage`: shown after the user approves (`approval-responded`)
 *  - `rejectedMessage`: shown after the user denies (`output-denied`)
 *  - `title`: optional heading rendered alongside the message
 */
export type ConfirmationActivityContent = {
  state: ConfirmationState;
  approval?: ConfirmationApproval;
  title?: string;
  requestMessage?: string;
  acceptedMessage?: string;
  rejectedMessage?: string;
};

/**
 * Default render for `ch-confirmation` driven by an AG-UI activity message.
 */
export const defaultConfirmationRender = (activity: AGUIActivityMessage) => {
  const content = activity.content as ConfirmationActivityContent;
  return html`<ch-confirmation
    class="confirmation-container"
    part="confirmation-container"
    exportparts="container, title, message, actions, button-approve, button-reject, approval-requested, approval-responded, output-denied, output-available"
    .state=${content.state}
    .approval=${content.approval}
    .title=${content.title}
    .requestMessage=${content.requestMessage}
    .acceptedMessage=${content.acceptedMessage}
    .rejectedMessage=${content.rejectedMessage}
  ></ch-confirmation>`;
};
