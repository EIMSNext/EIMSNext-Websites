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
import { IMetricsField } from '../../EChartDesigner/type';
import BasicField from './BasicField.vue';

defineOptions({
    name: "MetricsField",
});

const props = defineProps<{
    field: IMetricsField,
    isDeleted: boolean
}>();

</script>
<style lang="scss" scoped></style>