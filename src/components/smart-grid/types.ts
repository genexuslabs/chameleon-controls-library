export type SmartGridModel = SmartGridItem[];

export type SmartGridItem = {
  [key in string]: any;
} & { id: string };
