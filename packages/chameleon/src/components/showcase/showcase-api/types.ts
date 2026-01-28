export type ShowcaseApiProperties = Record<string, ShowcaseApiProperty>;

export type ShowcaseApiProperty = {
  description: string;
  default: string;
  htmlAttribute?: string;
  required?: boolean;
  type: string;
};

