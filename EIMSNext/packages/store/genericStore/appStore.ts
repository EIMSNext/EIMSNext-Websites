import { App } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useAppStore = createStore<App>("apps", "App", [
  {
    id: "system",
    name: "System",
    sortIndex: -1,
    appMenus: [],
  },
]);
export function useAppStoreHook() {
  return useAppStore(store);
}
