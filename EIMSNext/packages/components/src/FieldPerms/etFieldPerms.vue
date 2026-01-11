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
            <div class="check-all">全选<div class="field-view-col">
                    <el-checkbox></el-checkbox>
                </div>
                <div class="field-edit-col">
                    <el-checkbox></el-checkbox>
                </div>
            </div>
            <div class="all-items">
                <template v-for="item in data" :key="item.id">
                    <div class="check-item">
                        <div class="check-item-text" :style="{ paddingLeft: `${item.level || 0} * 8 + 'px'` }">
                            <span> {{ item.label }}</span>
                        </div>
                        <div class="field-view-col">
                            <el-checkbox v-model="item.visible" size="large"
                                @change="(val: boolean) => handlePermChange(item, 'visible', val)" />
                        </div>
                        <div class="field-edit-col">
                            <el-checkbox v-if="!item.system" v-model="item.editable" size="large"
                                @change="(val: boolean) => handlePermChange(item, 'editable', val)" />

                            <el-popover placement="left" :width="150" :hide-after="0" trigger="click">
                                <template #reference>
                                    <div v-if="item.type === FieldType.TableForm" class="subform-tag">
                                        <el-button :plain="true" style="width: 20px; height: 20px; padding: 0;">
                                            <et-icon icon="el-icon-memo" color="#B4B9C2" /></el-button>
                                    </div>
                                </template>
                                <div>
                                    <el-checkbox>可新增记录</el-checkbox>
                                    <el-checkbox>可编辑已有记录</el-checkbox>
                                    <el-checkbox>可删除已有记录</el-checkbox>
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
import "./style/index.less";
import { ref } from "vue";
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
        defaultVisbile: false
    }
);

const fixedModelValue = ref<IFieldPermItem[]>([])

interface IFieldPermListItem {
    id: string;
    label: string;
    type: string;
    level: number;
    visible: boolean;
    editable: boolean;
    system: boolean;
    tableInsert?: boolean;
    tableEdit?: boolean;
    tableDelete?: boolean;
}
const buildListItems = (items: IFieldPermItem[]) => {
    const listItems: IFieldPermListItem[] = [];

    props.fields.forEach(x => {
        if (x.type === FieldType.TableForm) {
            if (x.columns && x.columns.length > 0) {
                let li: IFieldPermListItem = { id: x.field, label: x.title, type: x.type, level: 0, visible: props.defaultVisbile, editable: false, system: false };

                //合并权限设置

                listItems.push(li)
                fixedModelValue.value.push({ id: li.id, visible: li.visible, editable: li.editable, tableInsert: li.tableInsert, tableEdit: li.tableEdit, tableDelete: li.tableDelete })

                x.columns.forEach(s => {
                    let sub: IFieldPermListItem = { id: `${x.field}>${s.field}`, label: s.title, type: s.type, level: li.level + 1, visible: props.defaultVisbile, editable: false, system: false };

                    //合并权限设置

                    listItems.push(sub)
                    fixedModelValue.value.push({ id: sub.id, visible: sub.visible, editable: sub.editable })
                })
            }
        }
        else {
            let li = { id: x.field, label: x.title, type: x.type, level: 0, visible: props.defaultVisbile, editable: false, system: isSystemField(x.field) }

            //合并权限设置

            listItems.push(li)
            fixedModelValue.value.push({ id: li.id, visible: li.visible, editable: li.editable })
        }
    });

    return listItems;
}


const data = ref<IFieldPermListItem[]>(buildListItems(props.modelValue));
const emit = defineEmits(["update:modelValue", "change"]);


const handlePermChange = (item: IFieldPermListItem, key: "visible" | "editable", val: boolean) => {
    let mItem = fixedModelValue.value.find(x => x.id == item.id)!
    mItem[key] = val;

    if (key === "visible" && !val) {
        mItem.editable = false;
    }

    if (key === 'editable' && val) {
        mItem.visible = true
    }

    emit("update:modelValue", fixedModelValue.value);
    emit("change", fixedModelValue.value);
};
</script>

<style lang="less" scoped></style>