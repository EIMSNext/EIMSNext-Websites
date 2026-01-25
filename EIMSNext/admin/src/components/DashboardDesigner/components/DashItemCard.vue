<template>
    <div class="react-grid-item layout-grid-item react-draggable cssTransforms react-resizable"
        style="background: rgb(255, 255, 255); width: 615px; height: 290px; position: absolute; transform: translate(10px, 10px);">
        <div class="container-group-drag-handle"></div>
        <div class="container-header">
            <div class="header-operate-container">
                <div class="header-operate">
                    <div class="selected-operate-btn">
                        <div class="operate-btn" title="在桌面端隐藏该组件"><i class="x-icon iconfont-fx-pc icon-eye-close"></i>
                        </div>
                    </div>
                    <div class="operate-btn" title="编辑"><i class="x-icon iconfont-fx-pc icon-pencil-edit"></i></div>
                    <div class="operate-btn" title="复制"><i class="x-icon iconfont-fx-pc icon-copy"></i></div>
                    <div class="operate-btn" title="删除"><i class="x-icon iconfont-fx-pc icon-trash"></i></div>
                    <span></span>
                    <div class="operate-btn custom-line-operate"></div>
                </div>
            </div>
            <div class="header-title" style="color: rgb(31, 45, 61);"><span class="title-text item-text">未命名统计表</span>
            </div>
        </div>
        <div class="container-content-wrapper">
            <el-empty class="fx-dash-empty">
                <div class="empty-wrapper"><i class="x-icon iconfont-fx-pc icon-info-o"></i>
                    <div class="empty-text">组件配置异常</div>
                </div>
            </el-empty>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useLocale } from "element-plus";
const { t } = useLocale();

defineOptions({
    name: "DashItemCard",
});

const props = withDefaults(
    defineProps<{
        isView?: boolean;
        height?: number;
        width?: number;
    }>(),
    {
        isView: false
    }
);

</script>
<style lang="scss" scoped>
.react-grid-item {
    -webkit-transition: all .2s ease;
    transition: all .2s ease;
    -webkit-transition-property: left, top;
    transition-property: left, top;
    background: var(--et-color-bg-container);
    -webkit-box-shadow: 0 2px 6px 0 rgba(84, 48, 132, .1);
    box-shadow: 0 2px 6px 0 rgba(84, 48, 132, .1);

    .container-group-drag-handle,
    .group-container-item-handle {
        bottom: 0;
        cursor: move;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 1;
    }

    .container-header {
        height: 40px;
        left: 0;
        line-height: 30px;
        padding: 4px;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 2;

        .header-operate-container {
            background: transparent;
            color: var(--et-color-text-secondary);
            cursor: pointer;
            opacity: 0;
            pointer-events: auto;
            position: absolute;
            right: 0;
            -webkit-transition: .2s;
            transition: .2s;

            .header-operate {
                background: var(--et-color-bg-container);
                border-radius: 3px;
                -webkit-box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .15);
                box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .15);
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;

                .selected-operate-btn {
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    margin-right: 15px;
                    position: relative;
                }

                .operate-btn {
                    -webkit-box-flex: 1;
                    -ms-flex: 1 1 auto;
                    flex: 1 1 auto;
                    height: 30px;
                    line-height: 30px;
                    min-width: 30px;
                    text-align: center;
                }

                .operate-btn.custom-line-operate {
                    height: 0;
                    position: absolute;
                    right: 0;
                    top: 30px;
                    width: 0;
                }
            }
        }

        .header-title {
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            font-weight: 700;
            overflow: hidden;
            padding: 0 5px;
            text-overflow: ellipsis;
            white-space: nowrap;

            .title-text {
                -webkit-box-flex: 0;
                -ms-flex: 0 1 auto;
                flex: 0 1 auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .container-content-wrapper {
        bottom: 10px;
        left: 10px;
        overflow: hidden;
        pointer-events: none;
        position: absolute;
        right: 10px;
        top: 40px;

        .fx-dash-empty {
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            background: transparent;
            bottom: 0;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            z-index: 2;

            .empty-wrapper {
                color: var(--et-color-text-tertiary);
                margin: auto;
                text-align: center;

                .empty-text {
                    margin-top: 10px;
                }
            }
        }
    }

    .layout-grid-item {
        z-index: 10;
    }

    .cssTransforms {
        -webkit-transition-property: -webkit-transform;
        transition-property: -webkit-transform;
        transition-property: transform;
        transition-property: transform, -webkit-transform;
    }
}
</style>