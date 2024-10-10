import {
  ComboBoxSuggestInfo,
  ComboBoxSuggestOptions,
  ComboBoxItemGroup,
  ComboBoxItemModel,
  ComboBoxModel
} from "../../../../components/combo-box/types";

const ASSETS_PREFIX = "showcase/pages/assets/icons/";

export const simpleModelComboBox1: ComboBoxModel = [
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
    expanded: true,
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
  },
  { value: "Value 10", caption: "Label for the value 10" },
  {
    value: "Value 11",
    caption: "Label for the value 11",
    expandable: true,
    expanded: true,
    disabled: true,
    items: [
      { value: "Value 11.1", caption: "Label for the value 11.1" },
      { value: "Value 11.2", caption: "Label for the value 11.2" },
      {
        value: "Value 11.3",
        caption: "Label for the value 11.3",
        disabled: false
      },
      { value: "Value 11.4", caption: "Label for the value 11.4" }
    ]
  },
  { value: "Value 12", caption: "Label for the value 12" }
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
    value: "_Basics",
    caption: "Basics",
    expandable: true,
    expanded: true,
    items: [
      { value: "_Audio", caption: "Audio" },
      { value: "_Blob", caption: "Blob" },
      { value: "_BlobFile", caption: "BlobFile" },
      { value: "_Boolean", caption: "Boolean" },
      { value: "_Character", caption: "Character" },
      { value: "_Date", caption: "Date" },
      { value: "_DateTime", caption: "DateTime" },
      { value: "_Geography", caption: "Geography" },
      { value: "_GeoLine", caption: "GeoLine" },
      { value: "_GeoPoint", caption: "GeoPoint" },
      { value: "_GeoPolygon", caption: "GeoPolygon" },
      { value: "_GUID", caption: "GUID" },
      { value: "_Image", caption: "Image" },
      { value: "_LongVarChar", caption: "LongVarChar" },
      { value: "_Numeric", caption: "Numeric" },
      { value: "_VarChar", caption: "VarChar" },
      { value: "_Video", caption: "Video" }
    ]
  },
  {
    value: "_Extended Types",
    caption: "Extended Types",
    expandable: true,
    items: [
      { value: "_Cache", caption: "Cache" },
      { value: "_ContentInfo", caption: "ContentInfo" },
      { value: "_Cookie", caption: "Cookie" },
      {
        value: "_CryptoAsymmetricEncrypt",
        caption: "CryptoAsymmetricEncrypt"
      },
      { value: "_CryptoCertificate", caption: "CryptoCertificate" },
      { value: "_CryptoHash", caption: "CryptoHash" },
      { value: "_CryptoSign", caption: "CryptoSign" },
      { value: "_CryptoSignXml", caption: "CryptoSignXml" },
      {
        value: "_CryptoSymmetricEncrypt",
        caption: "CryptoSymmetricEncrypt"
      },
      { value: "_DBConnection", caption: "DBConnection" },
      { value: "_Directory", caption: "Directory" },
      { value: "_ExcelDocument", caption: "ExcelDocument" },
      { value: "_Expression", caption: "Expression" },
      { value: "_File", caption: "File" },
      { value: "_HttpClient", caption: "HttpClient" },
      { value: "_HttpRequest", caption: "HttpRequest" },
      { value: "_HttpResponse", caption: "HttpResponse" }
    ]
  },
  {
    value: "_Structured Data Types",
    caption: "Structured Data Types",
    expandable: true,
    items: [
      {
        value: "_GeneXus.Common.AnalyticsKeyValue",
        caption: "AnalyticsKeyValue, GeneXus.Common"
      },
      {
        value: "_GeneXus.Common.AnalyticsKeyPurchase",
        caption: "AnalyticsKeyPurchase, GeneXus.Common"
      },
      {
        value: "_GeneXus.Common.AnalyticsKeyPurchase.Item",
        caption: "AnalyticsKeyPurchase.Item, GeneXus.Common"
      },
      {
        value: "_GeneXus.SD.Media.AudioPlayerCustomAction",
        caption: "AudioPlayerCustomAction, GeneXus.SD.Media"
      },
      {
        value: "_GeneXus.SD.Media.AudioPlayerSettings",
        caption: "AudioPlayerSettings, GeneXus.SD.Media"
      },
      {
        value: "_GeneXus.SD.BeaconInfo",
        caption: "BeaconInfo, GeneXus.SD"
      },
      {
        value: "_GeneXus.SD.BeaconProximityAlert",
        caption: "BeaconProximityAlert, GeneXus.SD"
      },
      {
        value: "_GeneXus.SD.BeaconRegion",
        caption: "BeaconRegion, GeneXus.SD"
      },
      {
        value: "_GeneXus.SD.BeaconState",
        caption: "BeaconState, GeneXus.SD"
      },
      {
        value: "_GeneXus.SD.CardInformation",
        caption: "CardInformation, GeneXus.SD"
      },
      {
        value: "_GeneXus.Common.Notifications.Configuration",
        caption: "Configuration, GeneXus.Common.Notifications"
      },
      {
        value: "_GeneXus.Common.Notifications.ConfigurationProperty",
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
  !filterInfo.filter ||
  filterWithString(
    item.caption ?? item.value,
    filterInfo.filter,
    filterInfo.options
  );

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
