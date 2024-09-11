import {
  ActionListItemAdditionalInformationSection,
  ActionListItemAdditionalInformationSectionAlign
} from "../../types";

export type ActionListFixedChangeEventDetail = {
  itemId: string;
  value: boolean;
};

export type ActionListCaptionChangeEventDetail = {
  itemId: string;
  newCaption: string;
};

export type ActionListItemActionTypeBlockInfo = {
  section: ActionListItemAdditionalInformationSection;
  align: ActionListItemAdditionalInformationSectionAlign[];
};
