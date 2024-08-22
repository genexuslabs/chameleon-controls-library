import {
  ComboBoxSuggestInfo,
  ComboBoxSuggestOptions,
  ComboBoxItemGroup,
  ComboBoxItemModel,
  ComboBoxModel
} from "../../../../components/combo-box/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const simpleModel1: ComboBoxModel = [
  { value: "Value 1", caption: "Label for the value 1" },
  {
    value: "Value 2",
    caption: "Label for the value 222 (not expandable)",
    items: [
      { value: "Value 2.1", caption: "Label for the value 2.1" },
      { value: "Value 2.2", caption: "Label for the value 2.2" }
    ]
  },
  {
    value: "Value 3",
    caption: "Label for the value 3",
    disabled: true
  },
  { value: "Value 4", caption: "Label for the value 4" },
  {
    value: "Value 5",
    caption: "Label for the value 5",
    disabled: true,
    expandable: true,
    items: [
      { value: "Value 5.1", caption: "Label for the value 5.1" },
      { value: "Value 5.2", caption: "Label for the value 5.2" },
      {
        value: "Value 5.3",
        caption: "Label for the value 5.3",
        disabled: false
      },
      { value: "Value 5.4", caption: "Label for the value 5.4" }
    ]
  },
  {
    value: "Value 6",
    caption: "Label for the value 6",
    expandable: true,
    expanded: true,
    items: [
      {
        value: "Value 6.1",
        caption: "Label for the value 6.1",
        disabled: true
      },
      {
        value: "Value 6.2",
        caption: "Label for the value 6.2",
        disabled: true
      },
      {
        value: "Value 6.3",
        caption: "Label for the value 6.3",
        disabled: false
      },
      { value: "Value 6.4", caption: "Label for the value 6.4" }
    ]
  },
  {
    value: "Value 7",
    caption: "Label for the value 7",
    disabled: true
  },
  { value: "Value 8", caption: "Label for the value 8" },
  {
    value: "Value 9",
    caption: "Label for the value 9",
    expandable: true,
    items: [
      { value: "Value 9.1", caption: "Label for the value 9.1" },
      { value: "Value 9.2", caption: "Label for the value 9.2" },
      {
        value: "Value 9.3",
        caption: "Label for the value 9.3",
        disabled: false
      },
      { value: "Value 9.4", caption: "Label for the value 9.4" }
    ]
  }
];

export const smallModel: ComboBoxModel = [
  { value: "chocolate", caption: "Chocolate" },
  { value: "coconut", caption: "Coconut" },
  { value: "mint", caption: "Mint" },
  { value: "strawberry", caption: "Strawberry" },
  { value: "vanilla", caption: "Vanilla" }
];

export const dataTypeInGeneXus: ComboBoxModel = [
  {
    value: "Basics",
    caption: "Basics",
    expandable: true,
    expanded: true,
    items: [
      { value: "Audio", caption: "Audio" },
      { value: "Blob", caption: "Blob" },
      { value: "BlobFile", caption: "BlobFile" },
      { value: "Boolean", caption: "Boolean" },
      { value: "Character", caption: "Character" },
      { value: "Date", caption: "Date" },
      { value: "DateTime", caption: "DateTime" },
      { value: "Geography", caption: "Geography" },
      { value: "GeoLine", caption: "GeoLine" },
      { value: "GeoPoint", caption: "GeoPoint" },
      { value: "GeoPolygon", caption: "GeoPolygon" },
      { value: "GUID", caption: "GUID" },
      { value: "Image", caption: "Image" },
      { value: "LongVarChar", caption: "LongVarChar" },
      { value: "Numeric", caption: "Numeric" },
      { value: "VarChar", caption: "VarChar" },
      { value: "Video", caption: "Video" }
    ]
  },
  {
    value: "Extended Types",
    caption: "Extended Types",
    expandable: true,
    items: [
      { value: "Cache", caption: "Cache" },
      { value: "ContentInfo", caption: "ContentInfo" },
      { value: "Cookie", caption: "Cookie" },
      {
        value: "CryptoAsymmetricEncrypt",
        caption: "CryptoAsymmetricEncrypt"
      },
      { value: "CryptoCertificate", caption: "CryptoCertificate" },
      { value: "CryptoHash", caption: "CryptoHash" },
      { value: "CryptoSign", caption: "CryptoSign" },
      { value: "CryptoSignXml", caption: "CryptoSignXml" },
      {
        value: "CryptoSymmetricEncrypt",
        caption: "CryptoSymmetricEncrypt"
      },
      { value: "DBConnection", caption: "DBConnection" },
      { value: "Directory", caption: "Directory" },
      { value: "ExcelDocument", caption: "ExcelDocument" },
      { value: "Expression", caption: "Expression" },
      { value: "File", caption: "File" },
      { value: "HttpClient", caption: "HttpClient" },
      { value: "HttpRequest", caption: "HttpRequest" },
      { value: "HttpResponse", caption: "HttpResponse" }
    ]
  },
  {
    value: "Structured Data Types",
    caption: "Structured Data Types",
    expandable: true,
    items: [
      {
        value: "GeneXus.Common.AnalyticsKeyValue",
        caption: "AnalyticsKeyValue, GeneXus.Common"
      },
      {
        value: "GeneXus.Common.AnalyticsKeyPurchase",
        caption: "AnalyticsKeyPurchase, GeneXus.Common"
      },
      {
        value: "GeneXus.Common.AnalyticsKeyPurchase.Item",
        caption: "AnalyticsKeyPurchase.Item, GeneXus.Common"
      },
      {
        value: "GeneXus.SD.Media.AudioPlayerCustomAction",
        caption: "AudioPlayerCustomAction, GeneXus.SD.Media"
      },
      {
        value: "GeneXus.SD.Media.AudioPlayerSettings",
        caption: "AudioPlayerSettings, GeneXus.SD.Media"
      },
      {
        value: "GeneXus.SD.BeaconInfo",
        caption: "BeaconInfo, GeneXus.SD"
      },
      {
        value: "GeneXus.SD.BeaconProximityAlert",
        caption: "BeaconProximityAlert, GeneXus.SD"
      },
      {
        value: "GeneXus.SD.BeaconRegion",
        caption: "BeaconRegion, GeneXus.SD"
      },
      {
        value: "GeneXus.SD.BeaconState",
        caption: "BeaconState, GeneXus.SD"
      },
      {
        value: "GeneXus.SD.CardInformation",
        caption: "CardInformation, GeneXus.SD"
      },
      {
        value: "GeneXus.Common.Notifications.Configuration",
        caption: "Configuration, GeneXus.Common.Notifications"
      },
      {
        value: "GeneXus.Common.Notifications.ConfigurationProperty",
        caption: "ConfigurationProperty, GeneXus.Common.Notifications"
      }
    ]
  },
  {
    value: "External Objects",
    caption: "External Objects",
    expandable: true,
    startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
    items: [
      {
        value: "GeneXus.SD.Actions",
        caption: "Actions, GeneXus.SD",
        startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
        endImgSrc: `${ASSETS_PREFIX}external-object.svg`
      },
      {
        value: "GeneXus.SD.Ads",
        caption: "Ads, GeneXus.SD",
        startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
        endImgSrc: `${ASSETS_PREFIX}external-object.svg`
      },
      {
        value: "GeneXus.Common.Analytics",
        caption: "Analytics, GeneXus.Common",
        startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
        endImgSrc: `${ASSETS_PREFIX}external-object.svg`
      },
      {
        value: "GeneXus.Common.AnyObject",
        caption: "AnyObject, GeneXus.Common",
        startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
        endImgSrc: `${ASSETS_PREFIX}external-object.svg`
      },
      {
        value: "GeneXus.Common.UI.Appearance",
        caption: "Appearance, GeneXus.Common.UI",
        startImgSrc: `${ASSETS_PREFIX}external-object.svg`,
        endImgSrc: `${ASSETS_PREFIX}external-object.svg`
      }
    ]
  }
];

const filterWithCase = (
  stringToFilter: string,
  filter: string,
  matchCase?: boolean
) =>
  matchCase
    ? stringToFilter.includes(filter)
    : stringToFilter.toLowerCase().includes(filter.toLowerCase());

const filterWithString = (
  stringToFilter: string,
  filter: string,
  filterOptions: ComboBoxSuggestOptions
) =>
  filterOptions?.regularExpression
    ? stringToFilter.match(filter) !== null
    : filterWithCase(stringToFilter, filter, filterOptions?.matchCase);

const filterCaption = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo
) =>
  filterInfo.filter
    ? filterWithString(
        item.caption ?? "",
        filterInfo.filter,
        filterInfo.options
      )
    : true;

const computeFilter = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo
): boolean =>
  filterInfo.options?.hideMatchesAndShowNonMatches === true
    ? !filterCaption(item, filterInfo)
    : filterCaption(item, filterInfo);

const filterSubModel = (
  item: ComboBoxItemModel,
  filterInfo: ComboBoxSuggestInfo,
  newModel: ComboBoxModel
): boolean => {
  // Check if a subitem is rendered
  let aSubItemIsRendered = false;
  const itemSubGroup = (item as ComboBoxItemGroup).items;
  const newSubItems: ComboBoxModel = [];

  if (itemSubGroup != null) {
    for (let index = 0; index < itemSubGroup.length; index++) {
      const itemLeaf = itemSubGroup[index];
      const itemSatisfiesFilter = filterSubModel(
        itemLeaf,
        filterInfo,
        newSubItems
      );

      aSubItemIsRendered ||= itemSatisfiesFilter;
    }
  }

  // The current item is rendered if it satisfies the filter condition or a
  // subitem exists that needs to be rendered
  const satisfiesFilter = aSubItemIsRendered || computeFilter(item, filterInfo);

  // Update selected and checkbox items
  if (satisfiesFilter) {
    newModel.push({
      ...item,
      items: aSubItemIsRendered ? newSubItems : undefined
    });
  }

  return satisfiesFilter;
};

export const comboBoxFilterChange = (
  filterInfo: ComboBoxSuggestInfo
): ComboBoxModel => {
  const filteredModel = [];

  for (let index = 0; index < dataTypeInGeneXus.length; index++) {
    const item = dataTypeInGeneXus[index];

    filterSubModel(item, filterInfo, filteredModel);
  }

  return filteredModel;
};
