import { defineStore } from "pinia";
import { store } from "../setup";
import { ref } from "vue";
import { useAppStoreHook } from "../genericStore/appStore";
import { useFormStoreHook } from "../genericStore/formStore";

export const useContextStore = defineStore("context", () => {
  //state
  const corpId = ref<string>("");
  const appId = ref<string>("");
  const appChanged = ref<number>(new Date().getTime());
  const appStore = useAppStoreHook();
  const formStore = useFormStoreHook();

  //actions
  const setCorpId = (
    id: string,
    foreceReload: boolean = false
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let needReload = false;
      if (corpId.value !== id) {
        corpId.value = id;
        needReload = true;
      }
      if (needReload || foreceReload) {
        appStore
          .load("", false)
          .then(() => {
            setAppChanged();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  };
  const clearCorpId = () => {
    corpId.value = "";
  };

  const setAppId = (
    id: string,
    foreceReload: boolean = false
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let needReload = false;
      if (appId.value !== id) {
        appId.value = id;
        setAppChanged();
        needReload = true;
      }
      if (needReload || foreceReload) {
        formStore
          .load(`$filter=appId eq '${id}'`, false)
          .then(() => resolve())
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  };

  const clearAppId = () => {
    appId.value = "";
  };

  const setAppChanged = () => {
    appChanged.value = new Date().getTime();
  };

  const clearAll = () => {
    corpId.value = "";
    appId.value = "";
  };

  return {
    corpId,
    setCorpId,
    clearCorpId,
    appId,
    setAppId,
    clearAppId,
    clearAll,
    appChanged,
    setAppChanged,
  };
});

export function useContextStoreHook() {
  return useContextStore(store);
}
