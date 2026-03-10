<template>
    <el-popover v-model:visible="showTitleInput" :virtual-ref="triggerRef" trigger="contextmenu" placement="bottom-start" :offset="5"
        :show-arrow="false" width="200" :teleported="false">
        <div class="total-input-popover">
            <el-input v-model="title" placeholder="请输入" size="small" @keyup.enter="confirmTitle" />
            <div class="popover-actions">
                <el-button size="small" @click="showTitleInput = false">取消</el-button>
                <el-button type="primary" size="small" @click="confirmTitle">确定</el-button>
            </div>
        </div>
    </el-popover>
    <el-dropdown :show-arrow="false" trigger="click" placement="bottom-start">
        <div ref="triggerRef" :key="field.title" class="item dimension-item forbid">
            <div class="item-text" :class="isDeleted ? 'style-red' : ''">
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
                <el-dropdown-item @click="setTitle">
                    设置显示名
                </el-dropdown-item>
                <slot name="dropdown-item" :field="field" :isDeleted="isDeleted"></slot>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>
<script setup lang="ts">

defineOptions({
    name: "BasicField",
});

const props = defineProps<{
    field: any,
    isDeleted: boolean
}>();

const triggerRef = ref(null)
const showTitleInput = ref(false)
const title = ref("")

const setTitle = () => {
    title.value = props.field.title || props.field.label
    showTitleInput.value = true
}

const confirmTitle = () => {
    var text = title.value.trim();
    props.field.title = text || props.field.label;

    showTitleInput.value = false
}

const emit = defineEmits(["remove"]);
const onRemoveClick = () => {
    emit("remove", props.field)
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