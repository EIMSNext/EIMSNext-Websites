<template>
  <div class="api-config-pane">
    <div class="config-content">
      <div class="config-pane">
        <div class="config-editor">
          <el-space direction="vertical" alignment="left" :size="20" style="width: 100%;">
            <div class="notify-mode">
              <div class="label mode-label">提醒类型</div>
              <el-select class="notify-select">
                <el-option value="create" label="新数据提交时提醒"></el-option>
                <el-option value="modity" label="新数据提交时提醒"></el-option>
              </el-select>
              <div class="tip">提示：被提醒人若不在相关权限组中，收到提醒时无法查看数据。</div>
              <div class="modify-fields">
                <div class="modify-fields-select">
                  <el-select class="notify-select">
                    <el-option value="create" label="任意字段修改后提醒"></el-option>
                    <el-option value="modity" label="指定字段修改后提醒"></el-option>
                  </el-select>
                  <el-button type="primary" style="margin-left: var(--et-space-12);">提醒字段设置</el-button>
                </div>
              </div>
              <div class="tip">提示：如果设置了多个提醒字段，任意一个字段被修改就会触发提醒</div>
            </div>
            <div class="notify-filter">
              <div class="label">提醒条件</div>
              <el-select class="notify-select">
                <el-option value="create" label="任意数据"></el-option>
                <el-option value="modity" label="满足条件的数据"></el-option>
              </el-select>
              <condition-list v-model="filter" :form-id="formDef.id" :max-level="1"></condition-list>
            </div>
            <div class="notify-notifier">
              <div class="label">被提醒人</div>
              <selected-tags v-model="notifier" class="notify-margin" />
            </div>
            <div class="notify-msg">
              <div class="label">提醒文字</div>
              <div class="content notify-margin">
                <el-input />
              </div>
            </div>
            <div class="notify-chanel">
              <div class="label">提醒方式</div>
              <div class="channel-item">
                <el-checkbox-group>
                  <el-checkbox value="1">站内消息</el-checkbox>
                  <el-checkbox value="2">邮箱消息</el-checkbox>
                  <!-- <el-checkbox value="3">微信提醒</el-checkbox> -->
                </el-checkbox-group>
              </div>
            </div>
          </el-space>
        </div>
      </div>
      <div class="btn-pane"><el-button type="primary" @click="save">保存</el-button></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { FormDef, Webhook, WebHookTrigger } from "@eimsnext/models";
import { FlagEnum } from "@eimsnext/utils";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash-es";
import { ConditionList, IConditionList, ISelectedTag, SelectedTags } from "@eimsnext/components";
const { t } = useI18n();

defineOptions({
  name: "ReminderEditor",
});

const props = defineProps<{
  modelValue: Webhook;
  formDef: FormDef;
}>();

const hook = ref<Webhook>(cloneDeep(props.modelValue) || {});
const filter = ref<IConditionList>({ id: "", rel: "and" })
const notifier = ref<ISelectedTag[]>([])


const emit = defineEmits(["update:modelValue", "saved"]);
const triggers = ref(hook.value.triggers || WebHookTrigger.NotSet);
const triggerChanged = (perm: WebHookTrigger, checked: any) => {
  if (checked) {
    triggers.value = FlagEnum.combine(triggers.value, perm);
  } else {
    triggers.value = FlagEnum.remove(triggers.value, perm);
  }

  hook.value.triggers = triggers.value;
  emit("update:modelValue", hook.value);
};

const save = async () => {
  // if (!hook.value) return;
  // // try {
  // //     await appRef.value.validate();
  // // } catch (error) {
  // //     return;
  // // }
  // const newHook: WebhookRequest = {
  //     id: hook.value.id,
  //     appId: props.formDef.appId,
  //     formId: props.formDef.id,
  //     url: hook.value.url,
  //     secret: hook.value.secret,
  //     triggers: hook.value.triggers,
  //     disabled: false
  // };
  // if (hook.value.id) {
  //     hook.value = await webhookService.patch<Webhook>(hook.value.id, newHook);
  // } else {
  //     hook.value = await webhookService.post<Webhook>(newHook);
  // }
  // emit("saved", hook.value);
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
        }

        .mode-label {
          margin-top: 0;
        }

        .notify-select,
        .notify-datetime {
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

        .fx-notify-config-pane .config-body .config-pane .config-editor .config-notify-mode .modify-fields .modify-fields-select {
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
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
</style>
