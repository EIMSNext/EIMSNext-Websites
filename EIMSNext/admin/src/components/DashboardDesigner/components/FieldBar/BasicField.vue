<template>
    <el-dropdown ref="dropdownRef" trigger="contextmenu">
        <div :key="field.title" class="item dimension-item forbid">
            <div @click="onFieldClick" class="item-text" :class="isDeleted ? 'style-red' : ''">
                <i :style="{ color: isDeleted ? '#eb5050' : '#fff' }" class="el-icon-arrow-down ml-5 mr-2"></i>
                {{ field.title || field.label }}
                <div :class="isDeleted ? 'close-icon-delete' : 'close-icon'">
                    <et-icon icon="el-delete" />
                </div>
            </div>
        </div>
        <template #dropdown>
            <el-dropdown-menu>
                <slot name="dropdown-item" :field="field" :isDeleted="isDeleted"></slot>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<script setup lang="ts">
import { DropdownInstance } from 'element-plus';

defineOptions({
    name: "BasicField",
});

const props = defineProps<{
    field: any,
    isDeleted: boolean
}>();

console.log("dim field", props.field)

const dropdownRef = ref<DropdownInstance>()

const onFieldClick = () => {
    if (dropdownRef.value) {
        dropdownRef.value.handleOpen()
    }
}
</script>
<style lang="scss" scoped>
.item {
    cursor: pointer !important;
    border-radius: 20px;
    padding: 4px 25px 4px 2px;
    position: relative;
    height: 25px;

    &:hover {
        .close-icon {
            display: block;
        }

        .close-icon-delete {
            display: block;
        }
    }

    .el-submenu [class^="el-icon-"] {
        vertical-align: text-bottom;
        width: 18px;
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

        .vs-icon {
            font-size: 10px;
        }
    }

    .close-icon-delete {
        position: absolute;
        right: 6px;
        top: 4px;
        display: none;
        cursor: pointer;
        background-color: #eb5050;
        border-radius: 50%;
        width: 15px;
        height: 15px;
        line-height: 16px;
        text-align: center;

        .vs-icon {
            font-size: 10px;
            color: #fff;
        }
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

    .vs-icon {
        color: #8095fe;
    }
}
</style>