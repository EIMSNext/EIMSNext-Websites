<template>
    <basic-field :field="field" :is-deleted="isDeleted">
        <template #dropdown-item="{ field, isDeleted }">
            <el-dropdown-item>
                {{ field.title }}
            </el-dropdown-item>
        </template>
    </basic-field>
</template>
<script setup lang="ts">
import { IDimensionField } from '../../ECharts/type';
import BasicField from './BasicField.vue';

defineOptions({
    name: "DimensionField",
});

const props = defineProps<{
    field: IDimensionField,
    isDeleted: boolean
}>();

console.log("dim field", props.field)

</script>
<style lang="scss" scoped></style>