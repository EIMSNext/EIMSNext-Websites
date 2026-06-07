import mitt from "mitt";

export type AppEvents = {
  "auth:logout": undefined;
  "corp:changed": string;
  "app:changed": undefined;
  "data:saved": { formId: string };
  "data:deleted": { formId: string };
};

export const bus = mitt<AppEvents>();
