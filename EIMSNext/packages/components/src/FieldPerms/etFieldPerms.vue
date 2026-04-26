<template>
  <div class="et-field-perms">
    <!-- 表头 -->
    <div class="field-list-header">
      <span class="field-header">字段</span>
      <div class="field-view-col">可见</div>
      <div class="field-edit-col">可编辑 <span class="tips">!</span></div>
    </div>

    <!-- 列表项 -->
    <div class="field-list-content-wrapper">
      <div class="check-all">
        全选
        <div class="field-view-col">
          <el-checkbox
            :model-value="allVisibleChecked"
            :indeterminate="allVisibleIndeterminate"
            @change="handleCheckAllVisible"
          ></el-checkbox>
        </div>
        <div class="field-edit-col">
          <el-checkbox
            :model-value="allEditableChecked"
            :indeterminate="allEditableIndeterminate"
            @change="handleCheckAllEditable"
          ></el-checkbox>
        </div>
      </div>
      <div class="all-items">
        <template v-for="item in data" :key="item.id">
          <div class="check-item">
            <div
              class="check-item-text"
              :style="{ paddingLeft: `${(item.level || 0) * 8}px` }"
            >
              <span> {{ item.label }}</span>
            </div>
            <div class="field-view-col">
              <el-checkbox
                :model-value="item.visible"
                size="large"
                @change="(val: boolean) => handlePermChange(item, 'visible', val)"
              />
            </div>
            <div class="field-edit-col">
              <el-checkbox
                v-if="!item.system"
                :model-value="item.editable"
                size="large"
                @change="(val: boolean) => handlePermChange(item, 'editable', val)"
              />

              <el-popover
                v-if="item.type === FieldType.TableForm"
                placement="left"
                :width="150"
                :hide-after="0"
                trigger="click"
              >
                <template #reference>
                  <div class="subform-tag">
                    <el-button :plain="true" class="subform-button">
                      <et-icon icon="el-memo" class="subform-icon" />
                    </el-button>
                  </div>
                </template>
                <div>
                  <el-checkbox
                    :model-value="item.tableInsert"
                    @change="(val: boolean) => handleTablePermChange(item, 'tableInsert', val)"
                  >可新增记录</el-checkbox>
                  <el-checkbox
                    :model-value="item.tableEdit"
                    @change="(val: boolean) => handleTablePermChange(item, 'tableEdit', val)"
                  >可编辑已有记录</el-checkbox>
                  <el-checkbox
                    :model-value="item.tableDelete"
                    @change="(val: boolean) => handleTablePermChange(item, 'tableDelete', val)"
                  >可删除已有记录</el-checkbox>
                </div>
              </el-popover>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "./style/index.scss";
import { computed, ref, watch } from "vue";
import { IFieldPermItem } from "./type";
import { FieldDef, FieldType, isSystemField } from "@eimsnext/models";

defineOptions({
  name: "EtFieldPerms",
});

const props = withDefaults(
  defineProps<{
    modelValue: IFieldPermItem[];
    fields: FieldDef[];
    defaultVisbile?: boolean;
  }>(),
  {
    modelValue: () => [],
    defaultVisbile: false,
  },
);

interface IFieldPermListItem {
  id: string;
  label: string;
  type: string;
  level: number;
  parentId?: string;
  visible: boolean;
  editable: boolean;
  system: boolean;
  tableInsert?: boolean;
  tableEdit?: boolean;
  tableDelete?: boolean;
}

const data = ref<IFieldPermListItem[]>([]);
const emit = defineEmits(["update:modelValue", "change"]);

const isTableFormItem = (item: IFieldPermListItem) => item.type === FieldType.TableForm;

const getItem = (id: string) => data.value.find((item) => item.id === id);

const getChildren = (parentId: string) =>
  data.value.filter((item) => item.parentId === parentId);

const hasAnyTablePermission = (item: IFieldPermListItem) =>
  !!item.tableInsert || !!item.tableEdit || !!item.tableDelete;

const setAllTablePermissions = (item: IFieldPermListItem, val: boolean) => {
  item.tableInsert = val;
  item.tableEdit = val;
  item.tableDelete = val;
};

const applyItemRules = (item: IFieldPermListItem) => {
  if (item.system) {
    item.editable = false;
  }

  if (item.editable) {
    item.visible = true;
  }

  if (!item.visible) {
    item.editable = false;
  }

  if (isTableFormItem(item)) {
    item.tableInsert = !!item.tableInsert;
    item.tableEdit = !!item.tableEdit;
    item.tableDelete = !!item.tableDelete;

    if (hasAnyTablePermission(item)) {
      item.visible = true;
      item.editable = true;
    }

    if (!hasAnyTablePermission(item)) {
      item.editable = false;
    }

    if (!item.editable) {
      setAllTablePermissions(item, false);
    }

    if (!item.visible) {
      item.editable = false;
      setAllTablePermissions(item, false);
    }
  }
};

const normalizeData = () => {
  data.value.forEach(applyItemRules);

  data.value.filter(isTableFormItem).forEach((parent) => {
    const children = getChildren(parent.id);

    if (!parent.visible) {
      parent.editable = false;
      setAllTablePermissions(parent, false);
      children.forEach((child) => {
        child.visible = false;
        child.editable = false;
      });
    }

    children.forEach(applyItemRules);
    applyItemRules(parent);
  });
};

const emitChange = () => {
  normalizeData();

  const modelValue = data.value.map((item) => {
    const perm: IFieldPermItem = {
      id: item.id,
      visible: item.visible,
      editable: item.editable,
    };

    if (isTableFormItem(item)) {
      perm.tableInsert = !!item.tableInsert;
      perm.tableEdit = !!item.tableEdit;
      perm.tableDelete = !!item.tableDelete;
    }

    return perm;
  });

  emit("update:modelValue", modelValue);
  emit("change", modelValue);
};

const buildListItems = (items: IFieldPermItem[]) => {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const listItems: IFieldPermListItem[] = [];

  props.fields.forEach((x) => {
    if (x.type === FieldType.TableForm) {
      if (x.columns && x.columns.length > 0) {
        const source = itemMap.get(x.field);
        let li: IFieldPermListItem = {
          id: x.field,
          label: x.title,
          type: x.type,
          level: 0,
          visible: source?.visible ?? props.defaultVisbile,
          editable: source?.editable ?? false,
          system: false,
          tableInsert: source?.tableInsert ?? false,
          tableEdit: source?.tableEdit ?? false,
          tableDelete: source?.tableDelete ?? false,
        };

        listItems.push(li);

        x.columns.forEach((s) => {
          const childId = `${x.field}>${s.field}`;
          const childSource = itemMap.get(childId);
          let sub: IFieldPermListItem = {
            id: childId,
            label: s.title,
            type: s.type,
            level: li.level + 1,
            parentId: li.id,
            visible: childSource?.visible ?? props.defaultVisbile,
            editable: childSource?.editable ?? false,
            system: false,
          };

          listItems.push(sub);
        });
      }
    } else {
      const source = itemMap.get(x.field);
      let li = {
        id: x.field,
        label: x.title,
        type: x.type,
        level: 0,
        visible: source?.visible ?? props.defaultVisbile,
        editable: source?.editable ?? false,
        system: isSystemField(x.field),
      };

      listItems.push(li);
    }
  });

  data.value = listItems;
  normalizeData();

  return data.value;
};

watch(
  [() => props.modelValue, () => props.fields],
  () => {
    buildListItems(props.modelValue);
  },
  { immediate: true, deep: true }
);

const visibleItems = computed(() => data.value);
const editableItems = computed(() => data.value.filter((item) => !item.system));

const allVisibleChecked = computed(
  () => visibleItems.value.length > 0 && visibleItems.value.every((item) => item.visible)
);
const allVisibleIndeterminate = computed(() => {
  const checkedCount = visibleItems.value.filter((item) => item.visible).length;
  return checkedCount > 0 && checkedCount < visibleItems.value.length;
});

const allEditableChecked = computed(
  () => editableItems.value.length > 0 && editableItems.value.every((item) => item.editable)
);
const allEditableIndeterminate = computed(() => {
  const checkedCount = editableItems.value.filter((item) => item.editable).length;
  return checkedCount > 0 && checkedCount < editableItems.value.length;
});

const handlePermChange = (
  item: IFieldPermListItem,
  key: "visible" | "editable",
  val: boolean,
) => {
  item[key] = val;

  if (key === "visible") {
    if (!val) {
      item.editable = false;

      if (isTableFormItem(item)) {
        setAllTablePermissions(item, false);
        getChildren(item.id).forEach((child) => {
          child.visible = false;
          child.editable = false;
        });
      }
    } else if (isTableFormItem(item)) {
      getChildren(item.id).forEach((child) => {
        child.visible = true;
      });
    }

    if (val && item.parentId) {
      const parent = getItem(item.parentId);
      if (parent) {
        parent.visible = true;
      }
    }
  }

  if (key === "editable") {
    if (val) {
      item.visible = true;

      if (isTableFormItem(item)) {
        setAllTablePermissions(item, true);
        getChildren(item.id).forEach((child) => {
          child.visible = true;
          child.editable = true;
        });
      }

      if (item.parentId) {
        const parent = getItem(item.parentId);
        if (parent) {
          parent.visible = true;
        }
      }
    } else if (isTableFormItem(item)) {
      setAllTablePermissions(item, false);
    }
  }

  emitChange();
};

const handleTablePermChange = (
  item: IFieldPermListItem,
  key: "tableInsert" | "tableEdit" | "tableDelete",
  val: boolean,
) => {
  item[key] = val;

  if (val) {
    item.visible = true;
    if (!item.editable) {
      item.editable = true;
    }
  }

  emitChange();
};

const handleCheckAllVisible = (val: boolean) => {
  data.value.forEach((item) => {
    item.visible = val;
    if (!val) {
      item.editable = false;
      if (isTableFormItem(item)) {
        item.tableInsert = false;
        item.tableEdit = false;
        item.tableDelete = false;
      }
    }
  });

  emitChange();
};

const handleCheckAllEditable = (val: boolean) => {
  editableItems.value.forEach((item) => {
    item.editable = val;
    if (val) {
      item.visible = true;
      if (isTableFormItem(item)) {
        setAllTablePermissions(item, true);
      }
    } else if (isTableFormItem(item)) {
      setAllTablePermissions(item, false);
    }
  });

  emitChange();
};
</script>

<style lang="scss" scoped></style>
