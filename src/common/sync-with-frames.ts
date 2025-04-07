export class SyncWithRAF {
  #needForRAF = true; // To prevent redundant RAF (request animation frame) calls
  #computationId: number;

  /**
   * Perform a computation in the next frame. If this method is called multiple
   * times before the next frame, only the first call will be executed in the
   * frame.
   * @param computationInFrame Computation to perform in the frame
   * @param computationBeforeFrame Computation to perform in each call of this method. This computation is not synced with the frames.
   */
  perform(computationInFrame: () => void, computationBeforeFrame?: () => void) {
    if (computationBeforeFrame) {
      computationBeforeFrame();
    }

    if (!this.#needForRAF) {
      return;
    }
    this.#needForRAF = false; // No need to call RAF up until next frame

    this.#computationId = requestAnimationFrame(() => {
      this.#needForRAF = true; // RAF now consumes the movement instruction so a new one can come

      computationInFrame();
    });
  }

  /**
   * Cancel the computation queued in the next frame.
   */
  cancel() {
    cancelAnimationFrame(this.#computationId);
    this.#needForRAF = true;
  }
}
