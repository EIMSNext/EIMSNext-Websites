<template>
    <el-popover :visible="showFilter" :virtual-ref="filterBtnRef" :show-arrow="false" :offset="5" placement="bottom-end"
        width="500" :teleported="false" trigger="click" :destroy-on-close="true">
        <DashFilter :model-value="condList" :formId="formId" @ok="setFilter" @cancel="showFilter = false"></DashFilter>
    </el-popover>
    <div class="item dimension-item">
        <div @click="onFieldClick" class="item-text">
            <et-icon icon="el-filter" color="#fff" style="margin: 0 5px;"></et-icon>
            <span ref="filterBtnRef">设置过滤条件</span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { IConditionList } from '@eimsnext/components';
import DashFilter from '../DashFilter.vue';
import { uniqueId } from '@eimsnext/utils';
import { cloneDeep } from 'lodash-es';

defineOptions({
    name: "FilterField",
});

const props = defineProps<{
    formId: string,
    filter?: IConditionList
}>();

const showFilter = ref(false);
const filterBtnRef = ref(null)
const condList = ref<IConditionList>({ id: uniqueId(), rel: "and", items: [] });
if (props.filter)
    condList.value = cloneDeep(props.filter)

const emit = defineEmits(["ok", "cancel"]);

const onFieldClick = () => {
    showFilter.value = true
}
const setFilter = (filter: IConditionList) => {
    condList.value = filter;
    showFilter.value = false;
    emit("ok", cloneDeep(condList.value));
};

</script>
<style lang="scss" scoped>
.item {
    cursor: pointer !important;
    border-radius: 20px;
    padding: 4px 10px 4px 2px;
    position: relative;
    height: 25px;

    &:hover {
        .close-icon {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .close-icon {
        position: absolute;
        right: 6px;
        top: 4px;
        display: none;
        cursor: pointer;
        background-color: #fff;
        border-radius: 50%;
        width: 15px;
        height: 15px;
        line-height: 16px;
        text-align: center;
    }

    .item-text {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 16px;
    }
}

.dimension-item {
    background-color: #8095fe;
    color: #fff;
}
</style>