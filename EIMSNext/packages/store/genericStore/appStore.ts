import { App } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useAppStore = createStore<App>("apps","App",[]);
export function useAppStoreHook() {
  return useAppStore(store);
}
