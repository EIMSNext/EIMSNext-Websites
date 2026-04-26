<template>
    <div class="_fd-selection-process-config">
        <el-badge type="warning" is-dot :hidden="!configured">
            <el-button class="_fd-plain-button" plain @click="visible = true">
                <slot>
                    {{ btn || '设置' }}
                </slot>
            </el-button>
        </el-badge>
        <el-dialog class="_fd-selection-process-dialog _fd-config-dialog" :title="title || '数据选择过程设置'" v-model="visible" destroy-on-close :close-on-click-modal="false" append-to-body width="1000px">
            <el-main>
                <div class="_fd-selection-process-content">
                    <!-- 左侧数据列表 -->
                    <div class="_fd-selection-process-left">
                        <div class="_fd-selection-process-search">
                            <el-input v-model="searchQuery" placeholder="搜索数据" style="width: 300px;"></el-input>
                            <el-button type="primary" style="margin-left: 10px;">筛选</el-button>
                        </div>
                        <div class="_fd-selection-process-list">
                            <!-- 数据列表，将来会根据选择的显示字段动态显示 -->
                            <div class="_fd-selection-process-list-header">
                                <div v-for="field in selectedFields" :key="field.value" class="_fd-selection-process-list-header-item">
                                    {{ field.label }}
                                </div>
                            </div>
                            <div class="_fd-selection-process-list-body">
                                <!-- 加载状态 -->
                                <div v-if="loading" class="_fd-selection-process-list-empty">
                                    加载中...
                                </div>
                                <!-- 错误提示 -->
                                <div v-else-if="error" class="_fd-selection-process-list-empty" style="color: #f56c6c;">
                                    {{ error }}
                                </div>
                                <!-- 无数据提示 -->
                                <div v-else-if="formData.length === 0" class="_fd-selection-process-list-empty">
                                    暂无数据
                                </div>
                                <!-- 实际数据行 -->
                                <div v-else v-for="(row, index) in formData" :key="index" class="_fd-selection-process-list-row">
                                    <div v-for="field in selectedFields" :key="field.value" class="_fd-selection-process-list-row-item">
                                        {{ row[field.value] || '' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 右侧配置项 -->
                    <div class="_fd-selection-process-right">
                        <div class="_fd-selection-process-config-item">
                            <div class="_fd-selection-process-config-label">按钮的文字</div>
                            <el-input v-model="config.buttonText" placeholder="+选择数据"></el-input>
                        </div>
                        <div class="_fd-selection-process-config-item">
                            <div class="_fd-selection-process-config-label">选择数据时的显示字段</div>
                            <el-select v-model="selectedFields" multiple placeholder="请选择显示字段" style="width: 100%;">
                                <el-option v-for="field in formFields" :key="field.value" :label="field.label" :value="field"></el-option>
                            </el-select>
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
import { defineComponent, watch } from 'vue';
import { formDataService } from '@eimsnext/services';
import { accessToken } from '../../../utils';

export default defineComponent({
    name: 'SelectionProcessConfig',
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
        // 获取当前选中的表单数据
        activeForm() {
            // 根据用户选择的表单获取对应的字段和数据
            return formData[this.selectedForm] || {
                fields: [],
                data: []
            };
        }
    },
    data() {
        return {
            visible: false,
            value: this.modelValue,
            searchQuery: '',
            config: {
                buttonText: '+选择数据'
            },
            selectedFields: [],
            formFields: [],
            formData: [],
            loading: false,
            error: ''
        };
    },
    watch: {
        modelValue(n) {
            this.value = n;
            if (n) {
                this.config = { ...this.config, ...n };
                this.selectedFields = n.selectedFields || [];
            }
        },
        visible(v) {
            if (v) {
                this.loadFormFields();
                this.loadConfig();
            }
        },
        selectedForm() {
            // 当用户选择的表单变化时，重新加载表单字段和数据
            this.loadFormFields();
        }
    },
    methods: {
        async loadFormFields() {
            // 加载表单字段和数据
            if (!this.selectedForm) {
                this.formFields = [];
                this.formData = [];
                return;
            }
            
            this.loading = true;
            this.error = '';
            
            try {
                // 1. 调用 API 获取表单定义
                const apiUrl = window.appSetting?.apiUrl || '';
                if (!apiUrl) {
                    throw new Error('无法获取API地址');
                }
                
                // 获取token
                const token = accessToken.get();
                
                // 调用 /odata/v1/FormDef/{formId} 接口获取表单定义
                const formDefResponse = await fetch(`${apiUrl}/odata/v1/FormDef/${this.selectedForm}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                
                if (!formDefResponse.ok) {
                    throw new Error('获取表单定义失败');
                }
                
                const formDefData = await formDefResponse.json();
                
                // 提取表单字段信息
                let formFields = [];
                if (formDefData && formDefData.content && formDefData.content.items) {
                    formFields = formDefData.content.items.map(item => ({
                        label: item.title, // 使用字段的显示名称
                        value: item.field  // 使用字段的id
                    }));
                }
                
                this.formFields = formFields;
                
                // 如果 selectedFields 为空，则默认选择所有字段
                if (this.selectedFields.length === 0 && formFields.length > 0) {
                    this.selectedFields = [...formFields];
                }
                
                // 2. 调用 API 获取表单数据
                // 使用用户提供的正确参数格式
                const query = {
                    skip: 0,
                    take: 20,
                    scope: {},
                    sort: [{
                        field: "createTime",
                        type: "timestamp",
                        dir: -1
                    }],
                    filter: {
                        rel: "and",
                        items: [{
                            field: "formId",
                            type: "none",
                            op: "eq",
                            value: this.selectedForm // 选择的表单的 id
                        }, {}]
                    }
                };
                
                // 调用 formDataService.query 方法获取数据
                // 注意：这里的 API 调用可能需要根据实际情况调整
                const data = await formDataService.query(query);
                
                // 处理数据，提取data字段中的实际表单项值
                this.formData = data.map(item => {
                    // 提取data字段中的值，并与其他字段合并
                    return {
                        ...item,
                        ...(item.data || {})
                    };
                });
                
            } catch (err) {
                this.error = '获取表单数据失败，请重试';
                console.error('获取表单数据失败:', err);               
            } finally {
                this.loading = false;
            }
        },
        loadConfig() {
            if (this.value) {
                this.config = { ...this.config, ...this.value };
                this.selectedFields = this.value.selectedFields || [];
            }
        },
        onOk() {
            const config = {
                ...this.config,
                selectedFields: this.selectedFields
            };
            this.$emit('update:modelValue', config);
            this.$emit('change', config);
            this.visible = false;
        },
    }
});
</script>

<style>
._fd-selection-process-config {
    width: 100%;
}

._fd-selection-process-config .el-badge {
    width: 100%;
}

._fd-selection-process-config .el-button {
    font-weight: 400;
    width: 100%;
}

._fd-selection-process-content {
    display: flex;
    padding: 0;
    height: 500px;
}

._fd-selection-process-left {
    flex: 1;
    padding: 20px;
    border-right: 1px solid #e6e6e6;
}

._fd-selection-process-right {
    width: 300px;
    padding: 20px;
}

._fd-selection-process-search {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

._fd-selection-process-list {
    height: calc(100% - 60px);
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    overflow: hidden;
}

._fd-selection-process-list-header {
    display: flex;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e6e6e6;
    padding: 10px;
}

._fd-selection-process-list-header-item {
    flex: 1;
    font-weight: bold;
}

._fd-selection-process-list-body {
    height: calc(100% - 40px);
    overflow-y: auto;
}

._fd-selection-process-list-row {
    display: flex;
    padding: 10px;
    border-bottom: 1px solid #e6e6e6;
}

._fd-selection-process-list-row-item {
    flex: 1;
}

._fd-selection-process-config-item {
    margin-bottom: 20px;
}

._fd-selection-process-config-label {
    margin-bottom: 8px;
    font-weight: 500;
}

._fd-selection-process-list-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #999;
}
</style>