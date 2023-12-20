# ch-notifications



<!-- Auto Generated Below -->


## Properties

| Property                         | Attribute                            | Description | Type                                                                                            | Default           |
| -------------------------------- | ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| `delayToAnimateNewNotifications` | `delay-to-animate-new-notifications` |             | `number`                                                                                        | `50`              |
| `notifications`                  | --                                   |             | `NotificationMessageWithDelay[]`                                                                | `[]`              |
| `position`                       | `position`                           |             | `"bottom-center" \| "bottom-end" \| "bottom-start" \| "top-center" \| "top-end" \| "top-start"` | `"bottom-center"` |
| `timeToDismissNotifications`     | `time-to-dismiss-notifications`      |             | `number`                                                                                        | `5000`            |
| `timeType`                       | `time-type`                          |             | `"Milliseconds" \| "Seconds"`                                                                   | `"Milliseconds"`  |


## Dependencies

### Depends on

- [ch-notifications-item](../notifications-item)

### Graph
```mermaid
graph TD;
  ch-notifications --> ch-notifications-item
  ch-notifications-item --> ch-timer
  style ch-notifications fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
