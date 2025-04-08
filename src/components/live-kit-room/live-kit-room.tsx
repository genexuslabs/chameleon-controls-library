import { Component, Host, h, Prop, Element } from "@stencil/core";
import { ImageRender } from "../../common/types";
import { LiveKitCallbacks } from "./types";

/**
 * TODO.
 */
@Component({
  tag: "ch-live-kit-room",
  styleUrl: "live-kit-room.scss",
  shadow: true
})
export class ChLiveKitRoom {
  #userRef: undefined | HTMLDivElement;

  #agentRef: undefined | HTMLDivElement;

  @Element() el!: HTMLChLiveKitRoomElement;

  /**
   * Specifies the callbacks required in the control.
   */
  @Prop() readonly callbacks?: LiveKitCallbacks | undefined;

  /**
   * Specifies how the image will be rendered.
   */
  @Prop() readonly type: Exclude<ImageRender, "img"> = "background";

  /**
   * Specifies the room state.
   */
  @Prop() readonly connected: boolean = false;

  #connect = () => {
    this.callbacks?.connectToRoom!({
      user: this.#userRef,
      agent: this.#agentRef
    });
  };

  #disconnectRoom = () => {
    this.callbacks?.disconnectRoom!();
  };

  #muteMic = () => {
    this.callbacks?.muteMic!();
  };

  #unmuteMic = () => {
    this.callbacks?.unmuteMic!();
  };

  render() {
    return (
      <Host>
        <div class="button-container" part="button-container">
          {true && (
            <button
              aria-label="Mute"
              title="Mute"
              class="mute-button"
              part="mute-button"
              disabled={false}
              type="button"
              onClick={this.#muteMic}
            ></button>
          )}

          {true && (
            <button
              aria-label="Unmute"
              title="Unmute"
              class="unmute-button"
              part="unmute-button"
              disabled={false}
              type="button"
              onClick={this.#unmuteMic}
            ></button>
          )}

          <div ref={el => (this.#userRef = el)}></div>

          <div ref={el => (this.#agentRef = el)}></div>

          {!this.connected && (
            <button
              aria-label="Connect"
              title="Connect"
              class="connect-button"
              part="connect-button"
              disabled={false}
              type="button"
              onClick={this.#connect}
            ></button>
          )}

          {true && (
            <button
              aria-label="Disconnect"
              title="Disconnect"
              class="disconnect-button"
              part="disconnect-button"
              disabled={false}
              type="button"
              onClick={this.#disconnectRoom}
            ></button>
          )}
        </div>
      </Host>
    );
  }
}
