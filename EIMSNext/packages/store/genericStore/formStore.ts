import { FieldType, FormDef } from "@eimsnext/models";
import { formDefService } from "@eimsnext/services";
import { bus, http } from "@eimsnext/utils";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";
import { store } from "../setup";

const initForms: FormDef[] = [
  {
    appId: "system",
    id: "employee",
    name: "Employee",
    isLedger: true,
    usingWorkflow: false,
    external: false,
    content: {
      items: [
        { field: "empName", title: "姓名", type: FieldType.Input },
        { field: "code", title: "工号", type: FieldType.Input },
        { field: "workPhone", title: "工作电话", type: FieldType.Input },
        { field: "workEmail", title: "工作邮箱", type: FieldType.Input },
      ],
    },
  },
];

export const useFormStore = defineStore("forms", () => {
  const loading = ref(false);
  const items = useStorage<FormDef[]>("forms", initForms, sessionStorage);
  const includeCrossFormsByAppId = ref<Record<string, FormDef[]>>({});

  const load = (query = "", fromCache = true): Promise<FormDef[]> => {
    return new Promise<FormDef[]>((resolve, reject) => {
      if (fromCache && items.value.length > 0) {
        resolve(items.value);
      } else {
        loading.value = true;
        http.odata
          .query<FormDef>("FormDef", query)
          .then((res) => {
            items.value = [...initForms, ...res.map((item) => ({ ...item, external: item.external ?? false }))];
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          })
          .finally(() => {
            loading.value = false;
          });
      }
    });
  };

  const get = (id: string, fromCache = true, saveToCache = true): Promise<FormDef | undefined> => {
    return new Promise<FormDef | undefined>((resolve, reject) => {
      if (!id) {
        resolve(undefined);
        return;
      }

      const cached = items.value.find((x) => x.id == id);
      if (fromCache && cached) {
        resolve(cached);
        return;
      }

      loading.value = true;
      http.odata
        .get<FormDef>("FormDef", id)
        .then((res) => {
          const form = { ...res, external: res.external ?? false };
          if (saveToCache) {
            update(form);
          }
          resolve(form);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          loading.value = false;
        });
    });
  };

  const update = (item: FormDef) => {
    if (item && item.id) {
      const form = { ...item, external: item.external ?? false };
      const i = items.value.findIndex((x) => x.id == form.id);
      if (i > -1) items.value.splice(i, 1, form);
      else items.value.push(form);
    }
  };

  const remove = (id: string, removeFromDb = true) => {
    if (id) {
      const i = items.value.findIndex((x) => x.id == id);
      if (i > -1) {
        if (removeFromDb) {
          http.odata.delete("FormDef", id, null).then(() => {
            items.value.splice(i, 1);
          });
        } else {
          items.value.splice(i, 1);
        }
      }
    }
  };

  const clear = () => {
    items.value = initForms;
    includeCrossFormsByAppId.value = {};
  };

  const loadFormsIncludeCross = async (appId: string, force = false): Promise<FormDef[]> => {
    if (!appId) {
      return [];
    }

    const cached = includeCrossFormsByAppId.value[appId];
    if (!force && cached) {
      return cached;
    }

    const forms = (await formDefService.getFormsIncludeCross(appId)).map((form) => ({
      ...form,
      external: form.external ?? false,
    }));

    includeCrossFormsByAppId.value[appId] = forms;
    forms.forEach(update);
    return forms;
  };

  bus.on("auth:logout", clear);

  return { loading, items, load, get, update, remove, clear, includeCrossFormsByAppId, loadFormsIncludeCross };
});

export function useFormStoreHook() {
  return useFormStore(store);
}
