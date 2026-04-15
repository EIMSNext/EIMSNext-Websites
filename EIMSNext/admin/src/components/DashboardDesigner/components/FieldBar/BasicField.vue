<template>
  <div>
    <el-popover
      v-model:visible="showTitleInput"
      :virtual-ref="triggerRef"
      trigger="contextmenu"
      placement="bottom-start"
      :offset="5"
      :show-arrow="false"
      width="200"
      :teleported="false"
    >
      <div class="total-input-popover">
        <el-input v-model="title" placeholder="请输入" size="small" @keyup.enter="confirmTitle" />
        <div class="popover-actions">
          <el-button size="small" @click="showTitleInput = false">取消</el-button>
          <el-button type="primary" size="small" @click="confirmTitle">确定</el-button>
        </div>
      </div>
    </el-popover>
    <el-dropdown :show-arrow="false" trigger="click" placement="bottom-start">
      <div ref="triggerRef" :key="field.title" class="item dimension-item forbid">
        <div class="item-text" :class="isDeleted ? 'style-red' : ''">
          <et-icon
            icon="el-arrowDown"
            :color="isDeleted ? 'var(--et-color-danger)' : 'var(--et-text-on-primary)'"
            class="field-icon"
          ></et-icon>
          {{ field.title || field.label }}
        </div>
        <div :class="isDeleted ? 'close-icon-delete' : 'close-icon'">
          <et-icon
            icon="el-close"
            size="10px"
            :color="isDeleted ? 'var(--et-text-on-primary)' : 'var(--et-color-primary-hover)'"
            @click.stop="onRemoveClick"
          />
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="setTitle">设置显示名</el-dropdown-item>
          <slot name="dropdown-item" :field="field" :isDeleted="isDeleted"></slot>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: "BasicField",
});

const props = defineProps<{
  field: any;
  isDeleted: boolean;
}>();

const triggerRef = ref();
const showTitleInput = ref(false);
const title = ref("");

const setTitle = () => {
  title.value = props.field.title || props.field.label;
  showTitleInput.value = true;
};

const confirmTitle = () => {
  var text = title.value.trim();
  props.field.title = text || props.field.label;

  showTitleInput.value = false;
};

const emit = defineEmits(["remove"]);
const onRemoveClick = () => {
  emit("remove", props.field);
};
</script>
<style lang="scss" scoped>
.item {
  cursor: pointer !important;
  border-radius: var(--et-radius-20);
  padding: var(--et-space-4) var(--et-space-25) var(--et-space-4) var(--et-space-2);
  position: relative;
  height: var(--et-size-25);

  .field-icon {
    margin: 0 var(--et-space-5);
  }

  &:hover {
    .close-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .close-icon-delete {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .style-red {
    background-color: var(--et-bg-danger-soft);
    color: var(--et-color-danger) !important;
  }

  .el-submenu [class^="el-icon-"] {
    vertical-align: text-bottom;
    width: var(--et-size-18);
  }

  .close-icon {
    position: absolute;
    right: var(--et-space-6);
    top: var(--et-space-4);
    display: none;
    cursor: pointer;
    background-color: var(--et-bg-container);
    border-radius: var(--et-radius-round);
    width: var(--et-space-15);
    height: var(--et-space-15);
    line-height: var(--et-line-height-16);
    text-align: center;
  }

  .close-icon-delete {
    position: absolute;
    right: var(--et-space-6);
    top: var(--et-space-4);
    display: none;
    cursor: pointer;
    background-color: var(--et-color-danger);
    border-radius: var(--et-radius-round);
    width: var(--et-space-15);
    height: var(--et-space-15);
    line-height: var(--et-line-height-16);
    text-align: center;
  }

  .item-text {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: var(--et-line-height-16);
  }
}

.dimension-item {
  background-color: var(--et-color-primary-hover);
  color: var(--et-text-on-primary);
}
</style>
