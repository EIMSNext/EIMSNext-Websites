import { Department } from "@eimsnext/models";
import { store } from "../setup";
import createStore from "./creator";

const useDeptStoreCore = createStore<Department>("depts", "Department", []);

type DeptStoreCore = ReturnType<typeof useDeptStoreCore>;

/**
 * 部门只保留「按 id 取单条」的字典缓存，不提供列表缓存。
 * createStore.load 在缓存非空时直接返回缓存并忽略传入的 query，调用方拿到的
 * 可能是另一次请求（如登录时的默认页）留下的分页结果，列表一律按需直查。
 */
export type DeptStore = Pick<
  DeptStoreCore,
  "get" | "update" | "remove" | "clear" | "loading"
>;

export const useDeptStore = (
  ...args: Parameters<typeof useDeptStoreCore>
): DeptStore => {
  const core = useDeptStoreCore(...args);
  return {
    get: core.get,
    update: core.update,
    remove: core.remove,
    clear: core.clear,
    loading: core.loading,
  };
};

export function useDeptStoreHook(): DeptStore {
  return useDeptStore(store);
}
