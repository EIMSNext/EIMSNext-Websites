import { FormDef } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useFormStore = createStore<FormDef>("forms", "FormDef", [
  {
    appId: "system",
    id: "employee",
    name: "Employee",
    isLedger: true,
    usingWorkflow: false,
    content: {
      items: [],
    },
  },
]);
export function useFormStoreHook() {
  return useFormStore(store);
}
