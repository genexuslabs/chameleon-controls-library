export type DataModel = {
  Entities: Entity[];
};

export type Entity = {
  Name: string;
  Level: EntityItem[];
};

export type EntityItem = {
  Name: string;
  Description?: string;
  Type: EntityItemType;
  DataType: string;
  Level?: EntityItem[];
};

export type EntityItemType = "ATT" | "ENTITY" | "LEVEL";

export type EntityNameToATTs = { [key: string]: string[] };
