<template>
    <div class="_fd-fill-fields-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible = true">
                <slot>
                    {{ btn || '设置' }}
                </slot>
            </el-button>
        </el-badge>
        <el-dialog class="_fd-fill-fields-dialog _fd-config-dialog" :title="title || '填充规则设置'" v-model="visible" destroy-on-close :close-on-click-modal="false" append-to-body width="700px">
            <el-main>
                <div class="_fd-fill-fields-content">
                    <div class="_fd-fill-fields-description">
                        选择数据后，将按以下规则将所选字段的值填充到当前表单字段。
                    </div>
                    
                    <!-- 填充规则列表 -->
                    <div class="_fd-fill-fields-list">
                        <div v-for="rule in fillRules" :key="rule.field.value" class="_fd-fill-fields-item">
                            <div class="_fd-fill-fields-item-field">
                                <el-input v-model="rule.field.label" :disabled="true" style="width: 200px;"></el-input>
                            </div>
                            <div class="_fd-fill-fields-item-text">的值填充到</div>
                            <div class="_fd-fill-fields-item-select">
                                <el-select v-model="rule.targetField" placeholder="请选择字段" style="width: 200px;">
                                    <el-option v-for="field in currentFormFields" :key="field.value" :label="field.label" :value="field.value"></el-option>
                                </el-select>
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
import { defineComponent, watch, computed, ref } from 'vue';

export default defineComponent({
    name: 'FillFieldsConfig',
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
        // 获取选择数据时的显示字段
        selectedFields() {
            const selectionProcess = this.activeRule?.props?.selectionProcess || {};
            return selectionProcess.selectedFields || [];
        },
        // 获取当前表单的所有字段（排除本控件）
        currentFormFields() {
            
            const currentField = this.activeRule?.field;
            
            const fields = [];

            // 获取真正的 designer 实例（在 Vue 3 中，getCurrentInstance() 返回的实例需要通过 proxy 访问方法）
            const designerInstance = this.designer.proxy || this.designer;
            
            // 尝试从 designerInstance.getJson() 获取字段（这是保存时使用的方法）
            if (fields.length === 0 && designerInstance.getJson) {
                try {
                    const json = designerInstance.getJson();
                    
                    // 解析 JSON 字符串为对象
                    let ruleArray;
                    if (typeof json === 'string') {
                        try {
                            ruleArray = JSON.parse(json);
                        } catch (e) {
                            console.error('解析 JSON 失败:', e);
                            ruleArray = [];
                        }
                    } else if (Array.isArray(json)) {
                        ruleArray = json;
                    } else {
                        ruleArray = [];
                    }
                    
                    // 递归遍历规则数组，提取字段
                    const extractFieldsFromJson = (array) => {
                        array.forEach(item => {
                            if (item.field && item.title) {
                                if (item.field !== currentField && item.type !== 'formselecteddata') {
                                    fields.push({
                                        label: item.title,
                                        value: item.field
                                    });
                                }
                            }
                            if (item.children && Array.isArray(item.children)) {
                                extractFieldsFromJson(item.children);
                            }
                        });
                    };
                    
                    if (Array.isArray(ruleArray)) {
                        extractFieldsFromJson(ruleArray);
                    }
                } catch (e) {
                    console.error('调用 designer.getJson() 失败:', e);
                }
            }
            
            // 如果还是没有获取到字段，尝试从 designerInstance.getRule() 获取
            if (fields.length === 0 && designerInstance.getRule) {
                try {
                    const rule = designerInstance.getRule();
                    
                    if (Array.isArray(rule)) {
                        // 递归遍历规则数组，提取字段
                        const extractFieldsFromRule = (ruleArray) => {
                            ruleArray.forEach(item => {
                                if (item.field && item.title) {
                                      if (item.field !== currentField && item.type !== 'formselecteddata') {
                                        fields.push({
                                            label: item.title,
                                            value: item.field
                                        });
                                    }
                                }
                                if (item.children && Array.isArray(item.children)) {
                                    extractFieldsFromRule(item.children);
                                }
                            });
                        };
                        extractFieldsFromRule(rule);
                    }
                } catch (e) {
                    console.error('调用 designer.getRule() 失败:', e);
                }
            }
            
            // 尝试从 designerInstance.children 获取字段
            if (fields.length === 0 && designerInstance.children) {
                
                // 递归遍历 children，提取字段
                const extractFieldsFromChildren = (childrenArray) => {
                    childrenArray.forEach(item => {
                        // 检查是否是字段组件
                        if (item.field && item.title) {
                            if (item.field !== currentField && item.type !== 'formselecteddata') {
                                fields.push({
                                    label: item.title,
                                    value: item.field
                                });                                
                            }
                        }
                        // 递归处理子组件
                        if (item.children && Array.isArray(item.children)) {
                            extractFieldsFromChildren(item.children);
                        }
                    });
                };
                
                if (Array.isArray(designerInstance.children)) {
                    extractFieldsFromChildren(designerInstance.children);
                }
            }
            return fields;
        }
    },
    data() {
        return {
            visible: false,
            value: this.modelValue,
            fillRules: []
        };
    },
    watch: {
        modelValue(n) {
            this.value = n;
            // 不在这里直接设置 fillRules，而是在 loadConfig 中处理
        },
        visible(v) {
            if (v) {
                this.loadConfig();
            }
        },
        selectedFields: {
            handler(newFields) {
                // 当选择的字段变化时，更新填充规则
                // 只有当对话框可见时才更新，避免在加载配置时触发
                if (this.visible) {
                    this.updateFillRules(newFields);
                }
            },
            deep: true
        }
    },
    methods: {
        loadConfig() {
            if (this.value && this.value.fillRules) {
                // 先保存现有的填充规则
                const savedFillRules = this.value.fillRules;
                // 先将fillRules设置为保存的规则，以便updateFillRules可以使用这些值
                this.fillRules = savedFillRules;
                // 然后根据selectedFields的顺序重新构建fillRules
                this.updateFillRules(this.selectedFields);
            } else {
                // 初始化填充规则
                this.updateFillRules(this.selectedFields);
            }
        },
        updateFillRules(fields) {
            // 创建一个映射，用于快速查找已有的规则
            const existingRulesMap = new Map();
            this.fillRules.forEach(rule => {
                existingRulesMap.set(rule.field.value, rule);
            });
            
            const newRules = [];
            
            // 为每个选中的字段创建填充规则
            fields.forEach(field => {
                if (existingRulesMap.has(field.value)) {
                    // 保留已有的规则
                    newRules.push(existingRulesMap.get(field.value));
                } else {
                    // 创建新的规则
                    newRules.push({
                        field: field,
                        targetField: ''
                    });
                }
            });
            
            this.fillRules = newRules;
        },
        removeRule(index) {
            this.fillRules.splice(index, 1);
        },
        onOk() {
            // 保存填充规则时，确保顺序与selectedFields的顺序一致
            // 使用深拷贝避免响应式系统的影响
            // 按照selectedFields的顺序重新构建fillRules，确保顺序正确
            const fillRulesMap = new Map();
            this.fillRules.forEach(rule => {
                fillRulesMap.set(rule.field.value, rule);
            });
            
            // 按照selectedFields的顺序重新构建fillRules
            const orderedFillRules = this.selectedFields.map(field => {
                return fillRulesMap.get(field.value) || {
                    field: field,
                    targetField: ''
                };
            });
            
            const config = {
                fillRules: JSON.parse(JSON.stringify(orderedFillRules))
            };
            this.$emit('update:modelValue', config);
            this.$emit('change', config);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-fill-fields-config {
    width: 100%;
}

._fd-fill-fields-config .el-badge {
    width: 100%;
}

._fd-fill-fields-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-fill-fields-content {
    padding: 0;
}

._fd-fill-fields-description {
    margin-bottom: 20px;
    color: #666;
}

._fd-fill-fields-list {
    margin-bottom: 20px;
}

._fd-fill-fields-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

._fd-fill-fields-item-field {
    margin-right: 15px;
}

._fd-fill-fields-item-text {
    margin-right: 15px;
    color: #666;
    white-space: nowrap;
}

._fd-fill-fields-item-select {
    margin-right: 10px;
}
</style>