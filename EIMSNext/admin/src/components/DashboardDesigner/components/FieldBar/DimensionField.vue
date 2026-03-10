<template>
    <basic-field :field="field" :is-deleted="isDeleted" @remove="onRemoveClick">
        <template #dropdown-item="{ field, isDeleted }">
           
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

const emit = defineEmits(["remove"]);
const onRemoveClick = () => {
    emit("remove", props.field)
}

</script>
<style lang="scss" scoped></style>