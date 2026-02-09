<template>
    <div class="form-list">
        <!-- 列表项 -->
        <ul class="form-list-wrapper">
            <li v-for="item in formList" :key="item.id" class="list-item">
                <slot :item="item">
                    <div class="item-wrapper clickable" @click.stop="itemClick(item)"
                        :class="{ active: item.id == modelValue?.id }">
                        <div class="item-content">
                            <et-icon v-if="item.icon" :icon="item.icon" :color="item.iconColor"
                                style="padding-right: 5px"></et-icon>
                            <div class="item-label">
                                {{ item.label }}
                            </div>
                        </div>
                    </div>
                </slot>
            </li>
        </ul>
    </div>
</template>
<script lang="ts" setup>
import "./style/index.less";
import { useAppStore } from "@eimsnext/store";
import { IFormItem, buildFormListItems } from "@/FormSelect/type";
import { ref } from "vue";

defineOptions({
    name: "FormList",
});
const props = withDefaults(
    defineProps<{
        modelValue: IFormItem;
        appId: string;
        itemClass?: string;
    }>(),
    {
        itemClass: "",
    }
);

const appStore = useAppStore()
const formList = ref<IFormItem[]>([]);

appStore.get(props.appId).then(app => {
    formList.value = buildFormListItems(app!);
})

const emit = defineEmits([
    "update:modelValue",
    "itemClick",
]);

const itemClick = (item: IFormItem) => {
    emit("update:modelValue", item)
    emit("itemClick", item);
};

</script>