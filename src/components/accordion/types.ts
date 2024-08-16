export type AccordionModel = AccordionItem[];

export type AccordionItem = {
  id: string;
  accessibleName?: string;
  caption: string;
  disabled?: boolean;
  expanded?: boolean;
  headerSlot?: string;
};

export type AccordionItemExpandedChangeEvent = {
  id: string;
  expanded: boolean;
};
