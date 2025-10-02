import { defineStore } from "pinia";
import { accessToken, http } from "@eimsnext/utils";
import { CurrentUser } from "@eimsnext/models";
import { useStorage } from "@vueuse/core";
import { store } from "../setup";
import { authService, LoginModel } from "@eimsnext/services";
import { useAppStoreHook } from "../genericStore/appStore";
import { useFormStoreHook } from "../genericStore/formStore";
import { useDeptStoreHook } from "../genericStore/deptStore";
import { useContextStoreHook } from "../contextStore";
import { ref } from "vue";

export const useUserStore = defineStore("currentuser", () => {
  //state
  const currentUser = useStorage<CurrentUser>(
    "currentuser",
    new CurrentUser(),
    sessionStorage
  );

  const initialized = ref(false);

  //actions
  const get = (fromCache: boolean = true): Promise<CurrentUser> => {
    return new Promise<CurrentUser>((resolve, reject) => {
      if (fromCache && currentUser.value.userId) resolve(currentUser.value);
      else {
        http.api
          .get<CurrentUser>("/system/currentuser")
          .then((res) => {
            Object.assign(currentUser.value, { ...res });
            initialized.value = true;
            resolve(currentUser.value);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  };

  const updateUserName = (userName: string) => {
    currentUser.value.userName = userName;
  };

  const updateEmpName = (empName: string) => {
    currentUser.value.empName = empName;
  };

  const login = (loginModel: LoginModel) => {
    return authService.login(loginModel);
  };

  // const switchCorp = () => { }

  const logout = () => {
    return new Promise<void>((resolve, reject) => {
      accessToken.clear();
      useFormStoreHook().clear();
      useAppStoreHook().clear();
      useDeptStoreHook().clear();
      useContextStoreHook().clearAll();

      resolve();
    });
  };
  //getters
  // function get() { return currentUser as Readonly<CurrentUser>; }

  //初始化
  const isInitialized = () => initialized.value;

  const initialize = async (): Promise<any> => {
    if (!initialized.value) {
      await get(false);

      let promises = [];
      if (currentUser.value.corpId) {
        useAppStoreHook().clear();
        useFormStoreHook().clear();
        useDeptStoreHook().clear();
        promises.push(
          useContextStoreHook().setCorpId(currentUser.value.corpId, true)
        );
        promises.push(useDeptStoreHook().load("", false));
      }

      return Promise.all(promises);
    }
    return Promise.resolve();
  };

  return {
    currentUser,
    get,
    updateUserName,
    updateEmpName,
    login,
    logout,
    isInitialized,
    initialize,
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
