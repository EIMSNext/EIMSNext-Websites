import { FormDef } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useFormStore = createStore<FormDef>("forms", "FormDef", []);
export function useFormStoreHook() {
  return useFormStore(store);
}
