<template>
    <div class="_fd-display-fields-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible = true">
                <slot>
                    {{ btn || '设置' }}
                </slot>
            </el-button>
        </el-badge>
        <el-dialog class="_fd-display-fields-dialog _fd-config-dialog" :title="title || '设置显示字段'" v-model="visible" destroy-on-close :close-on-click-modal="false" append-to-body width="600px">
            <el-main>
                <div class="_fd-display-fields-content">
                    <!-- 选择显示字段 -->
                    <div class="_fd-display-fields-config-item">
                        <div class="_fd-display-fields-config-label">显示在表单中的项目</div>
                        <el-select v-model="selectedDisplayFields" multiple placeholder="请选择显示字段" style="width: 100%;">
                            <el-option v-for="field in availableFields" :key="field.value" :label="field.label" :value="field"></el-option>
                        </el-select>
                    </div>
                    
                    <!-- 显示选中的字段 -->
                    <div class="_fd-display-fields-config-item">
                        <div class="_fd-display-fields-config-label">已选择的显示字段</div>
                        <div class="_fd-display-fields-list">
                            <div v-if="selectedDisplayFields.length === 0" class="_fd-display-fields-empty">
                                暂无选择字段
                            </div>
                            <div v-else v-for="field in selectedDisplayFields" :key="field.value" class="_fd-display-fields-item">
                                <div class="_fd-display-fields-item-name">{{ field.label }}</div>
                                <div class="_fd-display-fields-item-content">暂无内容</div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-main>
            <template #footer>
                <div>
                    <el-button @click="visible = false" size="default">{{ t('props.cancel') }}</el-button>
                    <el-button type="primary" @click="onOk" size="default">{{ t('props.ok') }}</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { defineComponent, watch, computed } from 'vue';

export default defineComponent({
    name: 'DisplayFieldsConfig',
    emits: ['update:modelValue', 'change'],
    props: {
        modelValue: [String, Object, Array],
        title: String,
        btn: String,
    },
    inject: ['designer'],
    computed: {
        t() {
            return this.designer.setupState.t;
        },
        configured() {
            return !!this.modelValue;
        },
        // 获取当前活跃的规则
        activeRule() {
            return this.designer.setupState.activeRule;
        },
        // 获取用户选择的表单
        selectedForm() {
            return this.activeRule?.props?.dataSource || '';
        },
        // 获取选择数据时的显示字段
        availableFields() {
            const selectionProcess = this.activeRule?.props?.selectionProcess || {};
            return selectionProcess.selectedFields || [];
        }
    },
    data() {
        return {
            visible: false,
            value: this.modelValue,
            selectedDisplayFields: []
        };
    },
    watch: {
        modelValue(n) {
            this.value = n;
            if (n) {
                this.selectedDisplayFields = n.selectedDisplayFields || [];
            }
        },
        visible(v) {
            if (v) {
                this.loadConfig();
            }
        }
    },
    methods: {
        loadConfig() {
            if (this.value) {
                this.selectedDisplayFields = this.value.selectedDisplayFields || [];
            }
        },
        onOk() {
            const config = {
                selectedDisplayFields: this.selectedDisplayFields
            };
            this.$emit('update:modelValue', config);
            this.$emit('change', config);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-display-fields-config {
    width: 100%;
}

._fd-display-fields-config .el-badge {
    width: 100%;
}

._fd-display-fields-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-display-fields-content {
    padding: 0;
}

._fd-display-fields-config-item {
    margin-bottom: 20px;
}

._fd-display-fields-config-label {
    margin-bottom: 8px;
    font-weight: 500;
}

._fd-display-fields-list {
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    padding: 10px;
    min-height: 100px;
}

._fd-display-fields-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e6e6e6;
}

._fd-display-fields-item:last-child {
    border-bottom: none;
}

._fd-display-fields-item-name {
    font-weight: 500;
}

._fd-display-fields-item-content {
    color: #999;
}

._fd-display-fields-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: #999;
}
</style>