<template>
  <div class="publish-container">
    <header class="page-header">
      <h2>{{ t("publicpublish.title") }}</h2>
      <p>
        {{ t("publicpublish.subtitle") }}
        <a class="help-link">{{ t("publicpublish.helpDoc") }}</a>
      </p>
      <a class="extlink-guide">{{ t("publicpublish.extlinkGuide") }}</a>
    </header>

    <el-tabs v-model="activeName" :before-leave="tabChanging">
      <el-tab-pane :label="t('publicpublish.formlink')" name="formlink">
        <PublicFormLink ref="formlinkRef" :form-def="formDef" :public-setting="formSetting" />
      </el-tab-pane>
      <el-tab-pane :label="t('publicpublish.datalink')" name="datalink">
        <PublicDataLink ref="datalinkRef" :form-def="formDef" :public-setting="formSetting" />
      </el-tab-pane>
      <el-tab-pane :label="t('publicpublish.querylink')" name="querylink">
        <PublicQueryLink ref="querylinkRef" :form-def="formDef" :public-setting="formSetting" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { TabPaneName } from "element-plus";
import { ConfirmResult, EtConfirm, MessageIcon } from "@eimsnext/components";
import { FormDef, PublicSetting, PublicTargetType } from "@eimsnext/models";
import { publicSettingService } from "@eimsnext/services";
import { useI18n } from "vue-i18n";
import PublicFormLink from "./PublicFormLink.vue";
import PublicDataLink from "./PublicDataLink.vue";
import PublicQueryLink from "./PublicQueryLink.vue";

const { t } = useI18n();
defineOptions({ name: "Publish" });

const props = defineProps<{ formDef: FormDef }>();

const formSetting = ref<PublicSetting>(newPublicSetting());
const activeName = ref("formlink");

const formlinkRef = ref<InstanceType<typeof PublicFormLink>>();
const datalinkRef = ref<InstanceType<typeof PublicDataLink>>();
const querylinkRef = ref<InstanceType<typeof PublicQueryLink>>();

const tabRefs: Record<string, Ref<{ isDirty: () => boolean; save: () => Promise<void> } | undefined>> = {
  formlink: formlinkRef,
  datalink: datalinkRef,
  querylink: querylinkRef,
};

function newPublicSetting(): PublicSetting {
  return {
    id: "",
    appId: props.formDef.appId,
    targetType: PublicTargetType.Form,
    targetId: props.formDef.id,
    corpId: "",
    createBy: undefined as any,
    createTime: undefined as any,
    updateBy: undefined as any,
    updateTime: undefined as any,
    deleteFlag: false,
    form: { formLink: {} as any, dataLink: {} as any, queryLink: {} as any },
    dashboard: {},
  } as PublicSetting;
}

async function loadSetting() {
  try {
    const settings = await publicSettingService.query<PublicSetting>(
      `$filter=targetType eq ${PublicTargetType.Form} and targetId eq '${props.formDef.id.replace(/'/g, "''")}'&$top=1`,
    );
    if (settings.length > 0) {
      formSetting.value = settings[0];
    } else {
      formSetting.value = newPublicSetting();
    }
  } catch {
    formSetting.value = newPublicSetting();
  }
}

watch(
  () => props.formDef.id,
  () => loadSetting(),
  { immediate: true },
);

const askSave = async (tabName: string): Promise<boolean> => {
  const ref = tabRefs[tabName];
  if (!ref?.value?.isDirty()) return true;

  const confirm = await EtConfirm.showDialog(
    t("publicpublish.unsavedMessage"),
    {
      title: t("publicpublish.unsavedTitle"),
      icon: MessageIcon.Question,
      showCancel: true,
      showNoSave: true,
      okText: t("publicpublish.saveAndSwitch"),
    },
    t,
  );

  if (confirm === ConfirmResult.Yes) {
    await ref.value.save();
    return true;
  } else if (confirm === ConfirmResult.No) {
    return true;
  }
  return false;
};

const tabChanging = async (_newTab: TabPaneName, oldTab: TabPaneName): Promise<boolean> => {
  if (!oldTab) return true;
  return await askSave(oldTab.toString());
};

defineExpose({
  beforeClose: () => askSave(activeName.value),
});
</script>

<style scoped lang="scss">
.publish-container {
  height: 100%;
  overflow: auto;
  padding: var(--et-space-20);
}

.page-header {
  margin-bottom: var(--et-space-20);

  h2 {
    color: var(--et-text-primary);
    font-size: var(--et-font-size-18);
    font-weight: 600;
    margin: 0 0 var(--et-space-6);
  }

  p {
    color: var(--et-text-secondary);
    font-size: var(--et-font-size-13);
    margin: 0;
  }

  .help-link {
    color: var(--et-color-primary);
    cursor: pointer;
    margin-left: var(--et-space-4);
  }

  .extlink-guide {
    color: var(--et-color-primary);
    cursor: pointer;
    float: right;
    font-size: var(--et-font-size-13);
  }
}
</style>
