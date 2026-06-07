import type { AppDef } from "../../models/dto/appDef";
import { store } from "../setup";
import createStore from "./creator";

export const useAppDefStore = createStore<AppDef>("appdefs", "AppDef", [
  {
    id: "system",
    name: "System",
    sortIndex: -1,
    appMenus: [],
  } as AppDef,
]);

export function useAppDefStoreHook() {
  return useAppDefStore(store);
}

export const useAppStore = useAppDefStore;
export const useAppStoreHook = useAppDefStoreHook;
