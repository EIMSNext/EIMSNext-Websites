<template>
  <DefaultFormList v-if="!componentPath" />
  <component
    :is="customComponent"
    v-else-if="customComponent"
    :app-id="appId"
    :form-id="formId"
    :menu="menu"
  />
  <el-result
    v-else
    icon="warning"
    :title="t('admin.dynamicList.unavailable')"
    :sub-title="t('admin.dynamicList.componentNotFound', { component: componentPath })"
  />
</template>

<script setup lang="ts">
import type { AppMenu } from "@eimsnext/models";
import { useAppStore } from "@eimsnext/store";
import { findAppMenu } from "@/utils/appEntry";
import DefaultFormList from "./index.vue";
import type { Component } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const appStore = useAppStore();
const appId = computed(() => String(route.params.appId || ""));
const formId = computed(() => String(route.params.formId || ""));
const menu = ref<AppMenu>();
const customComponent = shallowRef<Component>();
const viewModules = import.meta.glob([
  "../**/*.vue",
  "!../form/index.vue",
  "!../form/FormListPage.vue",
]);

const normalizeComponentPath = (value?: string | null) => {
  const normalized = (value || "")
    .trim()
    .replaceAll("\\", "/")
    .replace(/^@\/views\//, "")
    .replace(/^\/?src\/views\//, "")
    .replace(/^\/?views\//, "")
    .replace(/^\//, "")
    .replace(/\.vue$/, "");

  if (!normalized || normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    return "";
  }
  return normalized;
};

const componentPath = computed(() => normalizeComponentPath(menu.value?.listComponent));

const loadMenuComponent = async () => {
  customComponent.value = undefined;
  const app = await appStore.get(appId.value);
  menu.value = findAppMenu(app?.appMenus || [], formId.value);
  const path = normalizeComponentPath(menu.value?.listComponent);
  if (!path) return;

  const loader = viewModules[`../${path}.vue`];
  if (!loader) return;
  const module = await loader() as { default: Component };
  customComponent.value = module.default;
};

watch([appId, formId], loadMenuComponent, { immediate: true });
</script>
