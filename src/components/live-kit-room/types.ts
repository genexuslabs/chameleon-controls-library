export type LiveKitCallbacks = {
  connectToRoom: (participants: {
    user: HTMLDivElement;
    agent: HTMLDivElement;
  }) => void;
  disconnectRoom: () => void;
  muteMic: () => void;
  unmuteMic: () => void;
};
