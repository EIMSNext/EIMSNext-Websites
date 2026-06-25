import { ref } from "vue";
import { systemService } from "@eimsnext/services";
import { useUserStoreHook } from "../userStore";

export function useSwitchCorp() {
  const loading = ref(false);

  const switchTo = async (corpId: string): Promise<void> => {
    if (!corpId) return;
    loading.value = true;
    try {
      await systemService.switchCorp(corpId);
      // userStore.initialize(true) 会清空 3 个 genericStore + setCorpId(true) + 加载部门
      await useUserStoreHook().initialize(true);
    } finally {
      loading.value = false;
    }
  };

  return { switchTo, loading };
}
