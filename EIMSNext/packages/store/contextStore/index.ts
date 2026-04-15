import { defineStore } from "pinia";
import { store } from "../setup";
import { ref } from "vue";
import { useAppStoreHook } from "../genericStore/appStore";
import { useFormStoreHook } from "../genericStore/formStore";
import { corporateService } from "@eimsnext/services";
import { Corporate } from "@eimsnext/models";

export const useContextStore = defineStore("context", () => {
  //state
  const corpId = ref<string>("");
  const corpName = ref<string>("");
  const appId = ref<string>("");
  const appChanged = ref<number>(new Date().getTime());
  const appStore = useAppStoreHook();
  const formStore = useFormStoreHook();

  //actions
  const setCorpId = (
    id: string,
    foreceReload: boolean = false,
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let needReload = false;
      if (corpId.value !== id) {
        corpId.value = id;
        needReload = true;
      }
      if (needReload || foreceReload) {
        Promise.all([
          corporateService
            .get<Corporate>(corpId.value)
            .then((corp) => {
              corpName.value = corp.name;
            })
            .catch((error) => {
              reject(error);
            }),
          ,
          appStore
            .load("", false)
            .then(() => {
              updateAppChanged();
            })
            .catch((error) => {
              reject(error);
            }),
        ])
          .then(() => resolve())
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
    updateAppChanged();
  };

  const setAppId = (
    id: string,
    foreceReload: boolean = false,
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      let needReload = false;
      if (appId.value !== id) {
        appId.value = id;
        updateAppChanged();
        // needReload = true;
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
    updateAppChanged();
  };

  const setAppChanged = () => {
    if (appId.value) {
      appStore.get(appId.value, false).then(() => {
        updateAppChanged();
      });
    }
  };
  const updateAppChanged = () => {
    appChanged.value = new Date().getTime();
  };

  const clearAll = () => {
    corpId.value = "";
    corpName.value = "";
    appId.value = "";
    updateAppChanged();
  };

  return {
    corpId,
    corpName,
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
