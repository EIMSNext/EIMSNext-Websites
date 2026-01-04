<template>
    <div class="et-field-perms">
        <!-- 表头 -->
        <div class="list-header">
            <div class="item-header">字段</div>
            <div class="item-header">可见</div>
            <div class="item-header">可编辑 <span class="tips">!</span></div>
        </div>

        <!-- 列表项 -->
        <ul class="list-content-wrapper">
            <li v-for="item in data" :key="item.id" class="list-item">
                <div class="content-wrapper">
                    <!-- 字段名称 -->
                    <div class="item-label" :style="{ paddingLeft: `${item.level || 0} * 16 + 'px'` }">
                        {{ item.label }}
                        <span v-if="item.type === FieldType.TableForm" class="subform-tag">::</span>
                    </div>

                    <el-checkbox v-model="item.visible"
                        @change="(val: boolean) => handlePermChange(item, 'visible', val)" />

                    <el-checkbox v-if="!item.system" v-model="item.editable"
                        @change="(val: boolean) => handlePermChange(item, 'editable', val)" />
                </div>
            </li>
        </ul>
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
const emit = defineEmits(["update:modelValue"]);


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
};
</script>

<style lang="less" scoped></style>