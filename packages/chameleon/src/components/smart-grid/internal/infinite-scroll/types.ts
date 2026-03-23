/**
 *  - `loading`: Specifies if the control is waiting for the data to be retrieved
 */
export type SmartGridDataState =
  | "initial"
  | "loading"
  | "more-data-to-fetch"
  | "all-records-loaded";
