# ch-live-kit-room

<!-- Auto Generated Below -->


## Properties

| Property            | Attribute            | Description                                      | Type                                                                                                                                                                 | Default     |
| ------------------- | -------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `callbacks`         | --                   | Specifies the callbacks required in the control. | `{ muteMic?: () => void; unmuteMic?: () => void; connectionEvents?: LiveKitConnectionListener; updateTranscriptions?: (segments: TranscriptionSegment[]) => void; }` | `undefined` |
| `connected`         | `connected`          | Specifies the room state.                        | `boolean`                                                                                                                                                            | `false`     |
| `microphoneEnabled` | `microphone-enabled` | Specifies the microphone state.                  | `boolean`                                                                                                                                                            | `false`     |
| `token`             | `token`              | Specifies the token to connect to the room       | `string`                                                                                                                                                             | `""`        |
| `url`               | `url`                | Specifies the url to connect to the room         | `string`                                                                                                                                                             | `""`        |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
