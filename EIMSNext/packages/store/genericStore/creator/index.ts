import { IIdentity } from "@eimsnext/models";
import { http } from "@eimsnext/utils";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export default function createStore<T extends IIdentity>(
  id: string,
  url: string,
  initData: T[] = []
) {
  return defineStore(id, () => {
    const loading = ref(false);
    const items = useStorage<T[]>(id, initData, sessionStorage);

    const load = (
      query: string = "",
      fromCache: boolean = true
    ): Promise<T[]> => {
      return new Promise<T[]>((resolve, reject) => {
        if (fromCache && items.value.length > 0) {
          resolve(items.value);
        } else {
          loading.value = true;
          http.odata
            .query<T>(url, query)
            .then((res) => {
              items.value = res;
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
    const get = (
      id: string,
      fromCache: boolean = true,
      saveToCache: boolean = true
    ): Promise<T | undefined> => {
      return new Promise<T | undefined>((resolve, reject) => {
        if (id) {
          let d = items.value.find((x) => x.id == id);
          if (fromCache && d) {
            resolve(d);
          } else {
            loading.value = true;
            http.odata
              .get<T>(url, id)
              .then((res) => {
                if (saveToCache) {
                  update(res);
                }
                resolve(res);
              })
              .catch((error) => {
                reject(error);
              })
              .finally(() => {
                loading.value = false;
              });
          }
        } else {
          resolve(undefined);
        }
      });
    };

    const update = (item: T) => {
      console.log(`${url} Store update: ${item}`);
      if (item && item.id) {
        const i = items.value.findIndex((x) => x.id == item.id);
        if (i > -1) items.value.splice(i, 1, item);
        else items.value.push(item);
      }
    };

    const remove = (id: string, removeFromDb: boolean = true) => {
      console.log(`${url} Store remove: ${id}`);
      if (id) {
        const i = items.value.findIndex((x) => x.id == id);
        if (i > -1) {
          if (removeFromDb) {
            http.odata.delete(url, id, null).then(() => {
              items.value.splice(i, 1);
            });
          } else {
            items.value.splice(i, 1);
          }
        }
      }
    };

    const clear = () => {
      items.value = initData;
    };

    return { loading, items, load, get, update, remove, clear };
  });
}
