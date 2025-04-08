import {
  ConnectionQuality,
  isAudioTrack,
  isLocalParticipant,
  isLocalTrack,
  isRemoteParticipant,
  LocalTrackPublication,
  Participant,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TranscriptionSegment
} from "livekit-client";
import { LiveKitCallbacks } from "../../../../components";

const URL_LIVE_KIT = "wss://lk-test-azenmy5t.livekit.cloud";

const roomState = {
  isConnected: false
};

const participantContainer: {
  user: HTMLDivElement | undefined;
  agent: HTMLDivElement | undefined;
} = {
  user: undefined,
  agent: undefined
};

const TOKEN_LIVE_KIT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwNzE3MjgsImlzcyI6IkFQSWh3OEFCdGtrWFpCQiIsIm5iZiI6MTc0NDA1MTgyOCwic3ViIjoidGVzdCIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJ0ZXN0Iiwicm9vbUpvaW4iOnRydWV9fQ.H4DXS1Jtm3Q6v5MVDv0RBnjGLjuAgDzvIsKsFu9XIXs";

let currentRoom: Room | undefined;

const handleTrackSubscribed = (
  _t: RemoteTrack,
  _p: RemoteTrackPublication,
  participant: Participant
) => {
  renderParticipant(participant);
};

function handleTrackUnsubscribed(
  _t: RemoteTrack,
  _p: RemoteTrackPublication,
  participant: Participant
) {
  renderParticipant(participant);
}

function handleLocalTrackUnpublished(publication: LocalTrackPublication) {
  // when local tracks are ended, update UI to remove them from rendering
  publication.track.detach();
}

function handleActiveSpeakerChange() {
  // show UI indicators when participant is speaking
}

function handleDisconnect() {
  console.log("disconnected from room");
  if (!currentRoom) {
    return;
  }
  renderParticipant(currentRoom.localParticipant, true);
  currentRoom.remoteParticipants.forEach(p => {
    renderParticipant(p, true);
  });

  participantContainer.user.innerHTML = "";
  participantContainer.agent.innerHTML = "";
}

// updates participant UI
function renderParticipant(participant: Participant, remove: boolean = false) {
  let container;

  if (participant.isLocal) {
    container = participantContainer.user;
  } else {
    container = participantContainer.agent;
  }

  if (!container) {
    return;
  }
  const { identity } = participant;
  let div = container.querySelector(`#participant-${identity}`);
  if (!div && !remove) {
    div = document.createElement("div");
    div.id = `participant-${identity}`;
    div.className = "participant";
    div.innerHTML = `
      <audio id="audio-${identity}"></audio>
      <div class="info-bar">
        <div id="name-${identity}" class="name">
        </div>
        <div style="text-align: center;">
          <span id="codec-${identity}" class="codec">
          </span>
          <span id="size-${identity}" class="size">
          </span>
          <span id="bitrate-${identity}" class="bitrate">
          </span>
        </div>
        <div class="right">
          <span id="signal-${identity}"></span>
          <span id="mic-${identity}" class="mic-on"></span>
        </div>
      </div>
      ${
        !isLocalParticipant(participant)
          ? `<div class="volume-control">
        <input id="volume-${identity}" type="range" min="0" max="1" step="0.1" value="1" orient="vertical" />
      </div>`
          : `<progress id="local-volume" max="1" value="0" />`
      }

    `;
    container.appendChild(div);
  }
  const audioELm = <HTMLAudioElement>(
    container.querySelector(`#audio-${identity}`)
  );
  if (remove) {
    div?.remove();
    if (audioELm) {
      audioELm.srcObject = null;
      audioELm.src = "";
    }
    return;
  }

  // update properties
  container.querySelector(`#name-${identity}`)!.innerHTML =
    participant.identity;
  if (isLocalParticipant(participant)) {
    container.querySelector(`#name-${identity}`)!.innerHTML += " (you)";
  }
  const micElm = container.querySelector(`#mic-${identity}`)!;
  const signalElm = container.querySelector(`#signal-${identity}`)!;
  const micPub = participant.getTrackPublication(Track.Source.Microphone);
  if (participant.isSpeaking) {
    div!.classList.add("speaking");
  } else {
    div!.classList.remove("speaking");
  }

  if (isRemoteParticipant(participant)) {
    const volumeSlider = <HTMLInputElement>(
      container.querySelector(`#volume-${identity}`)
    );
    volumeSlider.addEventListener("input", ev => {
      participant.setVolume(
        Number.parseFloat((ev.target as HTMLInputElement).value)
      );
    });
  }

  const micEnabled = micPub && micPub.isSubscribed && !micPub.isMuted;
  if (micEnabled) {
    if (!isLocalParticipant(participant)) {
      // don't attach local audio
      audioELm.onloadeddata = () => {};
      micPub?.audioTrack?.attach(audioELm);
    }
    micElm.className = "mic-on";
    micElm.innerHTML = '<i class="fas fa-microphone"></i>';
  } else {
    micElm.className = "mic-off";
    micElm.innerHTML = '<i class="fas fa-microphone-slash"></i>';
  }

  switch (participant.connectionQuality) {
    case ConnectionQuality.Excellent:
    case ConnectionQuality.Good:
    case ConnectionQuality.Poor:
      signalElm.className = `connection-${participant.connectionQuality}`;
      signalElm.innerHTML = '<i class="fas fa-circle"></i>';
      break;
    default:
      signalElm.innerHTML = "";
    // do nothing
  }

  console.log("entro");
}

function participantConnected(participant: Participant) {
  participant
    .on(ParticipantEvent.TrackMuted, () => {
      renderParticipant(participant);
    })
    .on(ParticipantEvent.TrackUnmuted, () => {
      renderParticipant(participant);
    })
    .on(ParticipantEvent.IsSpeakingChanged, () => {
      renderParticipant(participant);
    })
    .on(ParticipantEvent.ConnectionQualityChanged, () => {
      renderParticipant(participant);
    });
}

function participantDisconnected(participant: RemoteParticipant) {
  renderParticipant(participant, true);
}

function updateTranscriptions(segments: TranscriptionSegment[]) {
  console.log(segments);
}

export const liveKitCallbacks: LiveKitCallbacks = {
  connectToRoom: async (participants: {
    user: HTMLDivElement;
    agent: HTMLDivElement;
  }) => {
    participantContainer.user = participants.user;
    participantContainer.agent = participants.agent;

    console.log(participants);
    // creates a new room with options
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioOutput: {
        deviceId: "default"
      },
      publishDefaults: {
        simulcast: true,
        scalabilityMode: "L3T3_KEY"
      }
    });

    // pre-warm connection, this can be called as early as your page is loaded
    room.prepareConnection(URL_LIVE_KIT, TOKEN_LIVE_KIT);

    room
      .on(RoomEvent.ParticipantConnected, participantConnected)
      .on(RoomEvent.ParticipantDisconnected, participantDisconnected)
      .on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      .on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
      .on(RoomEvent.Disconnected, handleDisconnect)
      .on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished)
      // .on(RoomEvent.ActiveDeviceChanged, handleActiveDeviceChanged)
      .on(RoomEvent.LocalTrackPublished, pub => {
        const track = pub.track;

        if (isLocalTrack(track) && isAudioTrack(track)) {
          // const { calculateVolume } = createAudioAnalyser(track);
          // setInterval(() => {
          //   $("local-volume")?.setAttribute(
          //     "value",
          //     calculateVolume().toFixed(4)
          //   );
          // }, 200);
        }
        renderParticipant(room.localParticipant);
      })
      .on(RoomEvent.LocalTrackUnpublished, () => {
        renderParticipant(room.localParticipant);
      })
      .on(RoomEvent.TranscriptionReceived, updateTranscriptions);

    // connect to room
    await room.connect(URL_LIVE_KIT, TOKEN_LIVE_KIT);

    currentRoom = room;
    console.log("connected to room", room.name);

    room.remoteParticipants.forEach(participant => {
      participantConnected(participant);
    });
    participantConnected(room.localParticipant);
    roomState.isConnected = true;

    // room.localParticipant.setMicrophoneEnabled(true);
  },
  disconnectRoom: () => {
    if (currentRoom) {
      currentRoom.disconnect();
    }
  },
  muteMic: () => {
    currentRoom.localParticipant.setMicrophoneEnabled(true);
  },
  unmuteMic: () => {
    currentRoom.localParticipant.setMicrophoneEnabled(false);
  }
};
