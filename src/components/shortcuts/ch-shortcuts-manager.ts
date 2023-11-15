import { focusComposedPath } from "../common/helpers";

const SHORTCUTS = new Map<string, ShortcutMap>();
let LATEST_SHORTCUT: ShortcutMap;

export function loadShortcuts(
  name: string,
  root: Document | ShadowRoot,
  shortcuts: Shortcut[]
) {
  shortcuts.forEach(shortcut => {
    const keyShortcuts = parseKeyShortcuts(shortcut.keyShortcuts);
    keyShortcuts.forEach(keyShortcut => {
      const normalizedKeyShortcut = normalize(
        keyShortcut.ctrl,
        keyShortcut.alt,
        keyShortcut.shift,
        keyShortcut.meta,
        keyShortcut.key
      );

      SHORTCUTS.set(normalizedKeyShortcut, {
        name,
        root,
        shortcut
      });
    });
  });

  addListener();
}

export function unloadShortcuts(name: string) {
  const removeKeyShortcuts: string[] = [];

  SHORTCUTS.forEach((shortcutMap, key) => {
    if (shortcutMap.name === name) {
      removeKeyShortcuts.push(key);
    }
  });

  removeKeyShortcuts.forEach(key => SHORTCUTS.delete(key));
  removeListener();
}

export function getShortcuts(name: string): {
  element: HTMLElement;
  keyShortcuts: string;
  legendPosition: string;
}[] {
  return Array.from(SHORTCUTS.values())
    .filter(shortcutMap => {
      return (
        shortcutMap.name === name &&
        !shortcutMap.shortcut.conditions?.focusInclude
      );
    })
    .map(shortcutMap => ({
      element: querySelectorPlus(
        shortcutMap.shortcut.selector,
        shortcutMap.root
      ) as HTMLElement,
      keyShortcuts: shortcutMap.shortcut.keyShortcuts,
      legendPosition: shortcutMap.shortcut.legendPosition
    }));
}

function addListener() {
  if (SHORTCUTS.size > 0) {
    window.addEventListener("keydown", keydownHandler, { capture: true });
  }
}

function removeListener() {
  if (SHORTCUTS.size === 0) {
    window.removeEventListener("keydown", keydownHandler, { capture: true });
  }
}

function keydownHandler(eventInfo: KeyboardEvent) {
  if (
    !eventInfo.repeat ||
    (eventInfo.repeat && LATEST_SHORTCUT?.shortcut.conditions?.allowRepeat)
  ) {
    LATEST_SHORTCUT = triggerShortcut(eventInfo);
  }
}

function triggerShortcut(eventInfo: KeyboardEvent): ShortcutMap {
  const shortcut = normalize(
    eventInfo.ctrlKey,
    eventInfo.altKey,
    eventInfo.shiftKey,
    eventInfo.metaKey,
    eventInfo.key
  );
  const shortcutMap = SHORTCUTS.get(shortcut);
  const focus = focusComposedPath();

  if (shortcutMap && conditions(shortcutMap, focus)) {
    const element = querySelectorPlus(
      shortcutMap.shortcut.selector,
      shortcutMap.root
    ) as HTMLElement;
    const keyShortcutPressedEvent = createEvent(shortcut, element, focus);

    if (shortcutMap.root.dispatchEvent(keyShortcutPressedEvent)) {
      switch (shortcutMap.shortcut.action) {
        case "click":
          element?.dispatchEvent(new Event("click"));
          break;
        default:
          element?.focus();
      }

      if (shortcutMap.shortcut.preventDefault !== false) {
        eventInfo.preventDefault();
      }
    } else {
      eventInfo.preventDefault();
    }
  }

  return shortcutMap;
}

function parseKeyShortcuts(value = ""): KeyShortcut[] {
  return value.split(" ").map(item => {
    return item.split(/(?<!(?:[+]|^))[+]/).reduce(
      (keyShortcut: KeyShortcut, key: string) => {
        switch (key.toLowerCase()) {
          case "ctrl":
            keyShortcut.ctrl = true;
            break;
          case "alt":
            keyShortcut.alt = true;
            break;
          case "shift":
            keyShortcut.shift = true;
            break;
          case "meta":
            keyShortcut.meta = true;
            break;
          default:
            keyShortcut.key = key;
        }
        return keyShortcut;
      },
      {
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
        key: ""
      } as KeyShortcut
    );
  });
}

function normalize(
  ctrl: boolean,
  alt: boolean,
  shift: boolean,
  meta: boolean,
  key: string
): string {
  return [
    ctrl ? "Ctrl" : null,
    alt ? "Alt" : null,
    shift ? "Shift" : null,
    meta ? "Meta" : null,
    key ? key.charAt(0).toUpperCase() + key.slice(1) : null
  ]
    .filter(element => {
      return element !== null;
    })
    .join("+");
}

function conditions(shortcutMap: ShortcutMap, focus: HTMLElement[]): boolean {
  if (shortcutMap.shortcut.conditions?.focusInclude) {
    return querySelectorAllPlus(
      shortcutMap.shortcut.conditions.focusInclude,
      shortcutMap.root
    ).some((el: HTMLElement) => focus.includes(el));
  }
  if (shortcutMap.shortcut.conditions?.focusExclude) {
    return !querySelectorAllPlus(
      shortcutMap.shortcut.conditions.focusExclude,
      shortcutMap.root
    ).some((el: HTMLElement) => focus.includes(el));
  }

  return true;
}

function createEvent(
  keyShortcut: string,
  target: HTMLElement,
  focusComposedPath: HTMLElement[]
): CustomEvent {
  return new CustomEvent<KeyShortcutPressedEvent>("keyShortcutPressed", {
    bubbles: true,
    cancelable: true,
    composed: false,
    detail: {
      keyShortcut,
      target,
      focusComposedPath
    }
  });
}

function querySelectorAllPlus(
  selector: string,
  root: Document | ShadowRoot
): HTMLElement[] {
  return (
    selector
      ?.split(",")
      .map(selectorItem => {
        if (selector.includes("::part")) {
          return querySelectorPlus(selectorItem, root);
        } else {
          return Array.from(root.querySelectorAll(selector)) as HTMLElement[];
        }
      })
      .flat() ?? []
  );
}

function querySelectorPlus(
  selector: string,
  root: Document | ShadowRoot
): HTMLElement {
  const querySelectorDeep = (
    element: HTMLElement,
    parts: string
  ): HTMLElement => {
    const shadow = element.shadowRoot;
    const partList = parts.split(" ");

    const partElement: HTMLElement = shadow.querySelector(
      partList.map(partName => `[part~="${partName}"]`).join("")
    );
    if (partElement) {
      return partElement;
    }

    const exportPartElement: HTMLElement = shadow.querySelector(
      partList.map(partName => `[exportparts*="${partName}"]`).join("")
    );
    if (exportPartElement) {
      const exportPartList: string[] = [];
      const exportparts = exportPartElement.getAttribute("exportparts");

      partList.forEach(partItem => {
        const exportPartName = exportparts.match(
          `(?:([\\w-]+):)?(${partItem})`
        )[1];
        if (exportPartName) {
          exportPartList.push(exportPartName);
        }
      });

      if (partList.length === exportPartList.length) {
        return querySelectorDeep(exportPartElement, exportPartList.join(" "));
      }
    }

    return null;
  };

  if (selector?.includes("::part")) {
    const selectorItems = selector.match("(.*)::part\\(([^)]+)\\)");
    const entity = selectorItems[1];
    const partName = selectorItems[2];

    return querySelectorDeep(root.querySelector(entity), partName);
  } else {
    return root.querySelector(selector);
  }
}

interface ShortcutMap {
  name: string;
  root: Document | ShadowRoot;
  shortcut: Shortcut;
}

export interface Shortcut {
  selector: string;
  keyShortcuts: string;
  preventDefault?: boolean;
  conditions?: {
    focusInclude?: string;
    focusExclude?: string;
    allowRepeat?: boolean;
  };
  legendPosition?: string;
  action?: "focus" | "click";
}

export type KeyShortcut = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
};

export interface KeyShortcutPressedEvent {
  keyShortcut: string;
  target: HTMLElement;
  focusComposedPath: HTMLElement[];
}
