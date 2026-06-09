<template>
  <div class="_fd-serialno-segments">
    <div class="_fd-serialno-head">
      <span>{{ t('com.serialno.segmentsTitle') }}</span>
      <el-popover
        v-model:visible="addOpen"
        placement="bottom"
        :width="180"
        trigger="manual"
        popper-class="_fd-serialno-add-pop"
      >
        <template #reference>
          <i class="fc-icon icon-add-circle" @click="addOpen = !addOpen"></i>
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
        <ConfigItem>
          <template #label>
            <i class="fc-icon icon-drag"></i>
            <span>{{ formatLabel(element) }}</span>
          </template>
          <i class="fc-icon icon-edit" @click="openEdit(element)"></i>
          <i
            v-if="element.type !== 'counter'"
            class="fc-icon icon-delete"
            @click="removeAt(index)"
          ></i>
        </ConfigItem>
      </template>
    </draggable>

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
import { defineComponent, ref, computed, inject } from "vue";
import draggable from "vuedraggable/src/vuedraggable";
import { uniqueId8 } from "@eimsnext/form-render-core";
import ConfigItem from "./style/ConfigItem.vue";
import SerialNoCounterDialog from "./SerialNoCounterDialog.vue";
import SerialNoDateDialog from "./SerialNoDateDialog.vue";
import SerialNoFixedDialog from "./SerialNoFixedDialog.vue";
import SerialNoFieldDialog from "./SerialNoFieldDialog.vue";

export default defineComponent({
  name: "SerialNoSegments",
  components: {
    draggable,
    ConfigItem,
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
      add,
      openEdit,
      removeAt,
      onDragEnd,
      onUpdate,
      formatLabel,
    };
  },
});
</script>

<style>
._fd-serialno-segments ._fd-serialno-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--fc-text-color-1);
  margin-bottom: 8px;
}
._fd-serialno-segments ._fd-serialno-head .fc-icon {
  cursor: pointer;
}
._fd-serialno-segments ._fd-serialno-add-list {
  display: flex;
  flex-direction: column;
}
._fd-serialno-segments ._fd-serialno-add-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  border-radius: 4px;
}
._fd-serialno-segments ._fd-serialno-add-item:hover {
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
