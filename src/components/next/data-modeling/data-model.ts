/**
 * Maps entities of the current dataModel with their corresponding ATTs.
 */
export const mapDataModelToEntityATTs = (entities: Entity[]) => {
  const result: EntityNameToATTs = {};

  entities.forEach(entity => {
    result[entity.Name] = entity.Level.map(entityItem => entityItem.Name);
  });

  return result;
};

export type DataModel = {
  Entities: Entity[];
};

export type Entity = {
  Name: string;
  Level: EntityItem[];
};

export type EntityItem = {
  Name: string;
  Type: EntityItemType;
  DataType: string;
  Level?: EntityItem[];
};

export type EntityItemType = "ATT" | "ENTITY" | "LEVEL";

export type EntityNameToATTs = { [key: string]: string[] };
