<template>
  <div class="api-config-pane">
    <div class="config-content">
      <div class="config-pane">
        <div class="config-editor">
          <el-space direction="vertical" alignment="left" :size="20" style="width: 100%">
            <div class="notify-mode">
              <div class="label mode-label">提醒类型</div>
              <el-select v-model="formNotify.triggerMode" class="notify-select" @change="triggerModeChanged">
                <el-option :value="FormNotifyTriggerMode.DataAdded" label="新数据提交时提醒"></el-option>
                <el-option :value="FormNotifyTriggerMode.DataChanged" label="数据修改时提醒"></el-option>
                <!-- <el-option :value="FormNotifyTriggerMode.CustomScheduled" label="自定义定时提醒"></el-option>
                <el-option :value="FormNotifyTriggerMode.TimeFieldScheduled" label="字段定时提醒"></el-option> -->
              </el-select>
              <div v-if="formNotify.triggerMode === FormNotifyTriggerMode.DataChanged" class="tip">
                提示：被提醒人若不在相关权限组中，收到提醒时无法查看数据。
              </div>

              <div v-if="formNotify.triggerMode === FormNotifyTriggerMode.DataChanged" class="modify-fields">
                <div class="modify-fields-select">
                  <el-select v-model="changeMode" class="notify-select">
                    <el-option value="all" label="任意字段修改后提醒"></el-option>
                    <el-option value="specific" label="指定字段修改后提醒"></el-option>
                  </el-select>
                  <el-button v-if="changeMode === 'specific'" type="primary" style="margin-left: var(--et-space-12)"
                    @click="showFieldDialog = true">
                    选择字段 ({{ formNotify.changeFields?.length || 0 }})
                  </el-button>
                </div>
                <div v-if="
                  formNotify.triggerMode === FormNotifyTriggerMode.DataChanged &&
                  changeMode == 'specific'
                " class="tip">
                  提示：如果设置了多个提醒字段，任意一个字段被修改就会触发提醒
                </div>
              </div>
            </div>

            <div class="notify-filter">
              <div class="label">提醒条件</div>
              <el-select v-model="filterMode" class="notify-select">
                <el-option value="any" label="任意数据"></el-option>
                <el-option value="condition" label="满足条件的数据"></el-option>
              </el-select>
              <condition-list v-if="filterMode === 'condition'" v-model="filter" :form-id="formDef.id"
                :max-level="1"></condition-list>
            </div>

            <div class="notify-notifier">
              <div class="label">被提醒人</div>
              <selected-tags v-model="notifier" :editable="true" class="notify-margin" @editTag="editNotifier" />
            </div>

            <div class="notify-msg">
              <div class="label">提醒文字</div>
              <div class="content notify-margin">
                <el-input v-model="formNotify.notifyText" type="textarea" :rows="3" placeholder="请输入提醒内容" />
              </div>
            </div>

            <div class="notify-chanel">
              <div class="label">提醒方式</div>
              <div class="channel-item">
                <el-checkbox :model-value="hasChannel(NotifyChannel.System)"
                  @change="toggleChannel(NotifyChannel.System, $event)">
                  站内消息
                </el-checkbox>
                <el-checkbox :model-value="hasChannel(NotifyChannel.Email)"
                  @change="toggleChannel(NotifyChannel.Email, $event)">
                  邮箱消息
                </el-checkbox>
              </div>
            </div>
          </el-space>
        </div>
      </div>
      <div class="btn-pane"><el-button type="primary" @click="save">保存</el-button></div>
    </div>
  </div>

  <et-dialog v-model="showFieldDialog" title="提醒字段设置" width="500px" @ok="confirmFieldSelection">
    <div class="dialog-body">
      <field-select-list v-model="tempChangeFields" :form-id="formDef.id" :showSubFields="false" style="border: none" />
    </div>
  </et-dialog>

  <member-select-dialog v-model="showMemberDialog" :tags="notifier" :member-options="{
    showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee,
    cascadedDept: true,
    showCascade: true,
  }" @ok="finishSelectNotifier" />
</template>

<script setup lang="ts">
import {
  FormDef,
  FormNotify,
  FormNotifyRequest,
  FormNotifyTriggerMode,
  NotifyChannel,
} from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";
import { cloneDeep } from "lodash-es";
import {
  ConditionList,
  IConditionList,
  ISelectedTag,
  SelectedTags,
  MemberTabs,
  MemberSelectDialog,
  convertCandidateToTag,
  convertTagToCandidate,
  IApprovalCandidate,
  FieldSelectList,
} from "@eimsnext/components";
import { formNotifyService } from "@eimsnext/services";

defineOptions({
  name: "NotifyEditor",
});

const props = defineProps<{
  modelValue: FormNotify;
  formDef: FormDef;
}>();

const emit = defineEmits(["update:modelValue", "saved"]);

const formNotify = ref<FormNotify>(cloneDeep(props.modelValue));
const filter = ref<IConditionList>({ id: "", rel: "and", items: [] });
const notifier = ref<ISelectedTag[]>([]);
const changeMode = ref<"all" | "specific">("all");
const filterMode = ref<"any" | "condition">("any");
const showFieldDialog = ref(false);
const showMemberDialog = ref(false);
const tempChangeFields = ref<string[]>([]);

function initFromModelValue() {
  formNotify.value = cloneDeep(props.modelValue);

  if (formNotify.value.dataFilter) {
    try {
      filter.value = JSON.parse(formNotify.value.dataFilter);
      filterMode.value = "condition";
    } catch {
      filter.value = { id: "", rel: "and", items: [] };
      filterMode.value = "any";
    }
  } else {
    filter.value = { id: "", rel: "and", items: [] };
    filterMode.value = "any";
  }

  if (formNotify.value.notifiers) {
    try {
      const candidates: IApprovalCandidate[] = JSON.parse(formNotify.value.notifiers);
      notifier.value = candidates.map((c) => convertCandidateToTag(c));
    } catch {
      notifier.value = [];
    }
  } else {
    notifier.value = [];
  }

  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataChanged) {
    if (formNotify.value.changeFields && formNotify.value.changeFields.length > 0) {
      changeMode.value = "specific";
    } else {
      changeMode.value = "all";
    }
  } else {
    changeMode.value = "all";
  }

  tempChangeFields.value = [...(formNotify.value.changeFields || [])];
}

const triggerModeChanged = () => {
  formNotify.value.changeFields = [];
  formNotify.value.dataFilter = "";
  formNotify.value.notifiers = "";
  formNotify.value.notifyText = getDefaultNotifyText();
  formNotify.value.channels = NotifyChannel.System;

  filter.value = { id: "", rel: "and", items: [] };
  filterMode.value = "any";
  notifier.value = [];
  changeMode.value = "all";
  tempChangeFields.value = [];
};

const getDefaultNotifyText = () => {
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataAdded)
    return "有新数据提交，请及时处理"
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.DataChanged)
    return "有数据被修改，请及时处理"
  if (formNotify.value.triggerMode === FormNotifyTriggerMode.TimeFieldScheduled)
    return "有数据到期，请及时处理"

  return "已到提醒时间，请及时处理"
}

function confirmFieldSelection() {
  formNotify.value.changeFields = [...tempChangeFields.value];
  showFieldDialog.value = false;
  emit("update:modelValue", formNotify.value);
}

watch(showFieldDialog, (val) => {
  if (val) {
    tempChangeFields.value = [...(formNotify.value.changeFields || [])];
  }
});

onMounted(() => {
  initFromModelValue();
});

function hasChannel(channel: NotifyChannel): boolean {
  return FlagEnum.has(formNotify.value.channels, channel);
}

function toggleChannel(channel: NotifyChannel, checked: any) {
  if (checked) {
    formNotify.value.channels = FlagEnum.add(formNotify.value.channels, channel);
  } else {
    formNotify.value.channels = FlagEnum.remove(formNotify.value.channels, channel);
  }
}

function editNotifier() {
  showMemberDialog.value = true;
}

function finishSelectNotifier(tags: ISelectedTag[]) {
  const candidates: IApprovalCandidate[] = [];
  tags.forEach((x) => candidates.push(convertTagToCandidate(x)));
  formNotify.value.notifiers = JSON.stringify(candidates);
  notifier.value = tags;
  showMemberDialog.value = false;
  emit("update:modelValue", formNotify.value);
}

watch(
  filter,
  (val) => {
    if (filterMode.value === "condition") {
      formNotify.value.dataFilter = JSON.stringify(val);
    } else {
      formNotify.value.dataFilter = "";
    }
    emit("update:modelValue", formNotify.value);
  },
  { deep: true }
);

watch(changeMode, (val) => {
  if (val === "all") {
    formNotify.value.changeFields = [];
  }
});

const save = async () => {
  try {
    const request: FormNotifyRequest = {
      id: formNotify.value.id,
      appId: formNotify.value.appId,
      formId: formNotify.value.formId,
      triggerMode: formNotify.value.triggerMode,
      changeFields: formNotify.value.changeFields,
      dataFilter: formNotify.value.dataFilter,
      notifyText: formNotify.value.notifyText,
      notifiers: formNotify.value.notifiers,
      channels: formNotify.value.channels,
      disabled: formNotify.value.disabled,
    };

    if (formNotify.value.id) {
      formNotify.value = await formNotifyService.put<FormNotify>(formNotify.value.id, request);
    } else {
      formNotify.value = await formNotifyService.post<FormNotify>(request);
    }
    emit("saved", formNotify.value);
  } catch (error) {
    console.error("保存提醒配置失败:", error);
  }
};
</script>

<style lang="scss" scoped>
.api-config-pane {
  background: var(--et-bg-page);
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;

  .config-content {
    background: var(--et-bg-container);
    border-radius: var(--et-radius-6);
    bottom: 0;
    left: 0;
    margin: var(--et-space-20) auto;
    position: absolute;
    right: 0;
    top: 0;
    width: var(--et-size-700);

    .config-pane {
      bottom: 56px;
      left: 0;
      overflow: auto;
      padding: 0 var(--et-space-30) var(--et-space-10);
      position: absolute;
      right: 0;
      top: 0;

      .config-editor {
        bottom: 0px;
        left: 0;
        overflow: auto;
        padding: 20px;
        position: absolute;
        right: 0;
        top: 0;

        .label {
          color: rgba(19, 29, 46, 0.78);
          font-size: 600;
        }

        .mode-label {
          margin-top: 0;
        }

        .notify-select {
          margin: 6px 0;
          width: 280px;
        }

        .notify-margin {
          margin: 6px 0;
        }

        .tip {
          color: rgba(19, 29, 46, 0.66);
          font-size: 12px;
        }

        .modify-fields-select {
          display: flex;
          align-items: center;
        }

        .notify-chanel {
          .channel-item {
            margin-bottom: 12px;
          }
        }
      }
    }

    .btn-pane {
      align-items: center;
      border-top: 1px solid var(--et-border-color);
      bottom: 0;
      display: flex;
      height: var(--et-size-56);
      justify-content: center;
      left: 0;
      position: absolute;
      right: 0;
    }
  }
}

.dialog-body {
  padding: 0 var(--et-space-20) var(--et-space-10);
  height: 400px;
}
</style>
