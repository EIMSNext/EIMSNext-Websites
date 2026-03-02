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
import { IFilterField } from '../../ECharts/type';
import BasicField from './BasicField.vue';

defineOptions({
    name: "FilterField",
});

const props = defineProps<{
    field: IFilterField,
    isDeleted: boolean
}>();

</script>
<style lang="scss" scoped></style>