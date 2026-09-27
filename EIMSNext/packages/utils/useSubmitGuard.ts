import { ref, computed } from "vue";

/** Prevents duplicate activation of a save/submit/delete action. */
export function useSubmitGuard() {
  const loading = ref(false);
  let active: Promise<unknown> | undefined;

  const run = <T>(action: () => Promise<T> | T): Promise<T> => {
    if (active) return active as Promise<T>;
    loading.value = true;
    active = Promise.resolve().then(action);
    return active.finally(() => {
      loading.value = false;
      active = undefined;
    }) as Promise<T>;
  };

  return { loading, disabled: computed(() => loading.value), run };
}
