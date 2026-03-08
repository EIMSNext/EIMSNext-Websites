<template>
    <el-dropdown ref="dropdownRef" trigger="contextmenu">
        <div :key="field.title" class="item dimension-item forbid">
            <div @click="onFieldClick" class="item-text" :class="isDeleted ? 'style-red' : ''">
                <et-icon icon="el-arrowDown" :color="isDeleted ? '#eb5050' : '#fff'" style="margin: 0 5px;"></et-icon>
                {{ field.title || field.label }}
            </div>
            <div :class="isDeleted ? 'close-icon-delete' : 'close-icon'">
                <et-icon icon="el-close" size="10px" :color="isDeleted ? '#fff' : '#8095fe'"
                    @click.stop="onRemoveClick" />
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

const onRemoveClick = () => { 

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
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .close-icon-delete {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .style-red {
        background-color: #fdeeee;
        color: #eb5050 !important;
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