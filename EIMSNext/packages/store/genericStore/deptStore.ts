import { Department } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

export const useDeptStore = createStore<Department>(
  "depts",
  "Department",
  []
);
export function useDeptStoreHook() {
  return useDeptStore(store);
}
