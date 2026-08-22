<template>
  <div class="_fd-serialno-segments">
    <div class="_fd-serialno-head">
      <span class="_fd-serialno-title">{{ t('com.serialno.segmentsTitle') }}</span>
    </div>

    <draggable
      :list="segments"
      handle=".icon-drag"
      direction="vertical"
      :animation="0"
      item-key="id"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="_fd-serialno-rule-row" @click="openEdit(element)">
          <i class="fc-icon icon-drag _fd-serialno-drag" @click.stop></i>
          <span class="_fd-serialno-rule-text">{{ formatLabel(element) }}</span>
          <button type="button" class="_fd-serialno-action" :title="t('common.edit')" @click.stop="openEdit(element)">
            <i class="fc-icon icon-edit"></i>
          </button>
          <button
            v-if="element.type !== 'counter'"
            type="button"
            class="_fd-serialno-action is-danger"
            :title="t('common.delete')"
            @click.stop="removeAt(index)"
          >
            <i class="fc-icon icon-delete"></i>
          </button>
        </div>
      </template>
    </draggable>

    <el-popover
      v-model:visible="addOpen"
      placement="bottom-start"
      :width="180"
      trigger="manual"
      popper-class="_fd-serialno-add-pop"
    >
      <template #reference>
        <el-button class="_fd-serialno-add-button" plain @click="addOpen = !addOpen">
          <i class="fc-icon icon-add"></i>
          <span>{{ t('com.serialno.addRule') }}</span>
        </el-button>
      </template>
      <div class="_fd-serialno-add-list">
        <div class="_fd-serialno-add-item" @click="add('fixed')">
          <i class="fc-icon icon-input"></i>
          <span>{{ t('com.serialno.addFixed') }}</span>
        </div>
        <div class="_fd-serialno-add-item" @click="add('date')">
          <i class="fc-icon icon-date"></i>
          <span>{{ t('com.serialno.addDate') }}</span>
        </div>
        <div class="_fd-serialno-add-item" @click="add('field')">
          <i class="fc-icon icon-group"></i>
          <span>{{ t('com.serialno.addField') }}</span>
        </div>
      </div>
    </el-popover>

    <section class="_fd-serialno-reset-panel">
      <div class="_fd-serialno-reset-title">{{ t('com.serialno.resetTitle') }}</div>
      <div v-if="sequenceLoading" class="_fd-serialno-reset-text">{{ t('com.serialno.resetLoading') }}</div>
      <template v-else-if="hasStarted">
        <div class="_fd-serialno-reset-text">
          {{ t('com.serialno.resetStarted', { current: currentCount, next: currentCount + 1 }) }}
        </div>
        <el-button link type="primary" class="_fd-serialno-reset-button" @click="resetSequence">
          {{ t('com.serialno.resetButton') }}
        </el-button>
      </template>
      <div v-else class="_fd-serialno-reset-text">{{ t('com.serialno.resetNotStarted') }}</div>
    </section>

    <SerialNoCounterDialog
      v-if="editing && editing.type === 'counter'"
      v-model="editing"
      @update="onUpdate"
    />
    <SerialNoDateDialog
      v-else-if="editing && editing.type === 'date'"
      v-model="editing"
      @update="onUpdate"
    />
    <SerialNoFixedDialog
      v-else-if="editing && editing.type === 'fixed'"
      v-model="editing"
      @update="onUpdate"
    />
    <SerialNoFieldDialog
      v-else-if="editing && editing.type === 'field'"
      v-model="editing"
      @update="onUpdate"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, inject, watch } from "vue";
import draggable from "vuedraggable/src/vuedraggable";
import { uniqueId8 } from "@eimsnext/form-render-core";
import { serialNoSequenceService } from "@eimsnext/services";
import SerialNoCounterDialog from "./SerialNoCounterDialog.vue";
import SerialNoDateDialog from "./SerialNoDateDialog.vue";
import SerialNoFixedDialog from "./SerialNoFixedDialog.vue";
import SerialNoFieldDialog from "./SerialNoFieldDialog.vue";

export default defineComponent({
  name: "SerialNoSegments",
  components: {
    draggable,
    SerialNoCounterDialog,
    SerialNoDateDialog,
    SerialNoFixedDialog,
    SerialNoFieldDialog,
  },
  props: {
    modelValue: { type: Array, default: () => [] },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const designer = inject("designer");
    const t = designer.setupState.t;

    const segments = computed({
      get: () => props.modelValue || [],
      set: (v) => emit("update:modelValue", v),
    });
    const addOpen = ref(false);
    const editing = ref(null);
    const sequenceId = ref("");
    const currentCount = ref(0);
    const sequenceLoading = ref(false);
    const activeRule = computed(() => designer.setupState.activeRule);
    const appId = computed(() => designer.setupState.appId || "");
    const formId = computed(() => designer.setupState.formId || "");
    const serialField = computed(() => activeRule.value?.field || "");
    const hasStarted = computed(() => currentCount.value > 0);
    let sequenceRequestVersion = 0;

    watch([appId, formId, serialField], loadSequence, { immediate: true });

    async function loadSequence() {
      const requestVersion = ++sequenceRequestVersion;
      if (!appId.value || !formId.value || !serialField.value) {
        sequenceId.value = "";
        currentCount.value = 0;
        sequenceLoading.value = false;
        return;
      }
      const scope = { appId: appId.value, formId: formId.value, field: serialField.value };
      sequenceLoading.value = true;
      try {
        const sequence = (await serialNoSequenceService.queryByScope(scope.appId, scope.formId, scope.field))[0];
        if (requestVersion !== sequenceRequestVersion) return;
        sequenceId.value = sequence?.id || "";
        currentCount.value = Math.max(0, Number(sequence?.currId || 0));
      } catch {
        if (requestVersion !== sequenceRequestVersion) return;
        sequenceId.value = "";
        currentCount.value = 0;
      } finally {
        if (requestVersion === sequenceRequestVersion) sequenceLoading.value = false;
      }
    }

    async function resetSequence() {
      if (!sequenceId.value) return;
      const requestVersion = ++sequenceRequestVersion;
      const id = sequenceId.value;
      sequenceLoading.value = true;
      try {
        await serialNoSequenceService.reset(id);
        if (requestVersion !== sequenceRequestVersion || sequenceId.value !== id) return;
        currentCount.value = 0;
      } finally {
        if (requestVersion === sequenceRequestVersion) sequenceLoading.value = false;
      }
    }

    function add(type) {
      addOpen.value = false;
      const id = "seg_" + uniqueId8();
      const base = { id, type };
      if (type === "fixed") base.value = "";
      if (type === "date") base.format = "yyyyMMdd";
      if (type === "field") base.field = "";
      segments.value = [...segments.value, base];
    }
    function openEdit(seg) {
      editing.value = JSON.parse(JSON.stringify(seg));
    }
    function removeAt(idx) {
      const next = [...segments.value];
      next.splice(idx, 1);
      segments.value = next;
    }
    function onDragEnd() {
      segments.value = [...segments.value];
    }
    function onUpdate(updated) {
      const next = segments.value.map((s) => (s.id === updated.id ? updated : s));
      segments.value = next;
      editing.value = null;
    }
    function formatLabel(seg) {
      if (seg.type === "counter") {
        const resetLabel = t(`com.serialno.reset.${seg.reset || "never"}`);
        return t("com.serialno.segments.counter", {
          digits: seg.digits || 5,
          reset: resetLabel,
        });
      }
      if (seg.type === "fixed") {
        return t("com.serialno.segments.fixed", { value: seg.value || "" });
      }
      if (seg.type === "date") {
        return t("com.serialno.segments.date", { format: seg.format || "yyyyMMdd" });
      }
      if (seg.type === "field") {
        return t("com.serialno.segments.field", { field: seg.field || "" });
      }
      return "";
    }

    return {
      t,
      segments,
      addOpen,
      editing,
      sequenceLoading,
      currentCount,
      hasStarted,
      add,
      openEdit,
      removeAt,
      onDragEnd,
      onUpdate,
      formatLabel,
      resetSequence,
    };
  },
});
</script>

<style>
._fd-serialno-segments ._fd-serialno-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: var(--fc-text-color-1);
  margin-bottom: 8px;
}
._fd-serialno-title {
  flex: 1;
}

._fd-serialno-add-button {
  width: 100%;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

._fd-serialno-reset-panel {
  margin-top: 14px;
  padding: 0;
  color: var(--fc-text-color-1);
}

._fd-serialno-reset-title {
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
}

._fd-serialno-reset-text {
  line-height: 1.7;
  color: var(--fc-text-color-1);
}

._fd-serialno-reset-button {
  margin-top: 4px;
  padding: 0;
}

._fd-serialno-rule-row {
  display: flex;
  align-items: center;
  min-height: 34px;
  margin-bottom: 8px;
  padding: 0 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  color: var(--fc-text-color-1);
  cursor: pointer;
  transition: border-color .2s, background-color .2s;
}

._fd-serialno-rule-row:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-fill-color-light);
}

._fd-serialno-drag {
  margin-right: 8px;
  color: var(--fc-text-color-3);
  cursor: grab;
}

._fd-serialno-rule-text {
  flex: 1;
  min-width: 0;
  line-height: 20px;
}

._fd-serialno-action {
  display: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
}

._fd-serialno-rule-row:hover ._fd-serialno-action {
  display: inline-flex;
}

._fd-serialno-action:hover {
  color: var(--el-color-primary);
}

._fd-serialno-action.is-danger:hover {
  color: var(--el-color-danger);
}
._fd-serialno-segments ._fd-serialno-add-list {
  display: flex;
  flex-direction: column;
}
._fd-serialno-add-list ._fd-serialno-add-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  border-radius: 4px;
}
._fd-serialno-add-list ._fd-serialno-add-item:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}
._fd-serialno-segments .fc-icon {
  cursor: pointer;
}
._fd-serialno-segments ._fd-config-item + ._fd-config-item {
  margin-top: 8px;
}
</style>
