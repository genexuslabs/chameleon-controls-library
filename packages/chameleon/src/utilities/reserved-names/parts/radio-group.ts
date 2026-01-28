import { joinParts } from "../join-parts";

const RADIO_ITEM_PARTS_PREFIX = "radio__";

export const RADIO_ITEM_PARTS_DICTIONARY = {
  RADIO_ITEM: "radio-item",
  CONTAINER: `${RADIO_ITEM_PARTS_PREFIX}container`,
  INPUT: `${RADIO_ITEM_PARTS_PREFIX}input`,
  OPTION: `${RADIO_ITEM_PARTS_PREFIX}option`,
  LABEL: `${RADIO_ITEM_PARTS_PREFIX}label`,

  CHECKED: "checked",
  DISABLED: "disabled",
  UNCHECKED: "unchecked"
} as const;

export const RADIO_ITEM_EXPORT_PARTS = joinParts(RADIO_ITEM_PARTS_DICTIONARY);

