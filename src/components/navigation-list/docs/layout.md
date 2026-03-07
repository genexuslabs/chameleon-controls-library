# ch-navigation-list-render: Shadow DOM layout

## Case 1: Expanded navigation list

```
<ch-navigation-list-render>
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <ch-navigation-list-item exportparts="item__action,item__button,item__caption,item__group,item__link,indicator,disabled,expanded,collapsed,expand-button,start,end,selected,not-selected,navigation-list-collapsed,tooltip,even-level,odd-level">
  |   | #shadow-root
  |   |
  |   | <!-- Link item -->
  |   | <a part="item__action item__link [selected | not-selected] [disabled] [even-level | odd-level] [expand-button] [start | end] [navigation-list-collapsed]">
  |   |   <span part="item__caption [selected | not-selected] [disabled] [navigation-list-collapsed]">
  |   |     Caption text
  |   |   </span>
  |   | </a>
  |   |
  |   | <!-- else (button item) -->
  |   | <button part="item__action item__button [selected | not-selected] [disabled] [even-level | odd-level] [expanded | collapsed] [expand-button] [start | end] [navigation-list-collapsed]">
  |   |   <span part="item__caption [selected | not-selected] [disabled] [navigation-list-collapsed]">
  |   |     Caption text
  |   |   </span>
  |   | </button>
  |   |
  |   | <!-- when selected && selectedLinkIndicator -->
  |   | <div part="indicator [disabled]"></div>
  |   |
  |   | <!-- when expandable -->
  |   | <div role="list" part="item__group [even-level | odd-level] [expanded | collapsed] [disabled]">
  |   |   <slot />
  |   | </div>
  | </ch-navigation-list-item>
</ch-navigation-list-render>
```

## Case 2: Collapsed navigation list with tooltips

```
<ch-navigation-list-render>
  | #shadow-root
  |
  | <!-- for each item in model -->
  | <ch-navigation-list-item exportparts="item__action,item__button,item__caption,item__group,item__link,indicator,disabled,expanded,collapsed,expand-button,start,end,selected,not-selected,navigation-list-collapsed,tooltip,even-level,odd-level">
  |   | #shadow-root
  |   | <button part="item__action item__button [selected | not-selected] [disabled] [even-level | odd-level] navigation-list-collapsed">
  |   |   <!-- when showCaptionOnCollapse === "tooltip" -->
  |   |   <ch-tooltip exportparts="item__caption,tooltip">
  |   |     | #shadow-root
  |   |     | <button part="item__caption">
  |   |     |   <slot name="action" />
  |   |     | </button>
  |   |     | <!-- when visible -->
  |   |     | <ch-popover part="tooltip">
  |   |     |   | #shadow-root
  |   |     |   | <slot />
  |   |     | </ch-popover>
  |   |   </ch-tooltip>
  |   | </button>
  | </ch-navigation-list-item>
</ch-navigation-list-render>
```
