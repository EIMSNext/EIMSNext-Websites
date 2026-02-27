<template>
  <div class="form-select-container">
    <!-- 数据源下拉选择 -->
    <el-select v-model="value" size="default" placeholder="请选择表单" @change="onInput">
      <el-option v-for="item in formList" :key="item.id" :label="item.label" :value="item.id" />
    </el-select>
    
    <!-- 选择后显示的设置区域 -->
    <div v-if="selectedForm" class="form-select-settings">
      <!-- 数据选择过程 -->
      <div class="setting-section">
        <div class="section-title">数据选择过程</div>
        <el-button type="primary" plain class="setting-button" @click="openDataSelectDialog">设置</el-button>
      </div>
      
      <!-- 数据选择后 -->
      <div class="setting-section">
        <div class="section-title">数据选择后</div>
        
        <!-- 显示在表单中 -->
        <div class="sub-section">
          <div class="sub-section-title">显示在表单中</div>
          <el-button type="primary" plain class="setting-button">设置显示字段</el-button>
        </div>
        
        <!-- 填充到表单字段 -->
        <div class="sub-section">
          <div class="sub-section-title">填充到表单字段</div>
          <el-button type="primary" plain class="setting-button">填充规则设置</el-button>
        </div>
      </div>
    </div>
    
    <!-- 数据选择设置对话框 -->
    <el-dialog
      v-model="dataSelectDialogVisible"
      title="数据选择过程"
      width="80%"
      top="10vh"
    >
      <div class="data-select-dialog">
        <!-- 左侧数据列表区域 -->
        <div class="data-list-section">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索数据"
              prefix-icon="el-icon-search"
              @keyup.enter="handleFilter"
            />
            <el-button type="primary" @click="handleFilter">筛选</el-button>
          </div>
          
          <!-- 数据列表 -->
        <div class="data-list">
          <div v-if="!dataList.length" class="empty-state">
            <el-empty description="暂无可用的数据" />
          </div>
          <el-table v-else :data="dataList" style="width: 100%">
            <!-- 动态列 -->
            <el-table-column
              v-for="field in selectedDisplayFields"
              :key="field"
              :prop="field"
              :label="getFieldLabel(field)"
              width="150"
            />
          </el-table>
        </div>
        </div>
        
        <!-- 右侧配置区域 -->
        <div class="config-section">
          <div class="config-title">配置项</div>
          
          <!-- 按钮文字配置 -->
          <div class="config-item">
            <div class="config-label">按钮的文字</div>
            <el-input
              v-model="buttonText"
              placeholder="请输入按钮文字"
            />
          </div>
          
          <!-- 显示字段配置 -->
          <div class="config-item">
            <div class="config-label">选择数据时的显示字段</div>
            <el-select
              v-model="displayFields"
              multiple
              placeholder="请选择显示字段"
              style="width: 100%"
            >
              <el-option
                v-for="field in selectedFormFields"
                :key="field.id"
                :label="field.label"
                :value="field.id"
              />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useFormStore, useAppStore } from "@eimsnext/store";
import { ref, watch, computed } from "vue";
import { IFormItem, IFormSelectOptions, buildFormListItems } from "./type";
import { isObject, isString, http } from "@eimsnext/utils";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineOptions({
  name: "FormSelect",
});
const props = defineProps<{
  modelValue: IFormItem | string;
  appId: string;
  buttonText?: string;
  options?: IFormSelectOptions
}>();

const appStore = useAppStore()
const formList = ref<IFormItem[]>([]);


const value = ref("");
if (isObject(props.modelValue))
  value.value = (props.modelValue as IFormItem).id || ""
else
  value.value = props.modelValue || ""
const selectedForm = computed(() => {
  return formList.value.find(item => item.id === value.value);
});


// 对话框相关状态
const dataSelectDialogVisible = ref(false);
const searchKeyword = ref("");
const buttonText = ref(props.buttonText || "+选择数据");
const displayFields = ref<string[]>([]);

// 数据列表
const dataList = ref<Array<{
  id: number;
  name: string;
  creator: string;
  createTime: string;
  status: string;
  [key: string]: any;
}>>([]);

// 原始数据列表，用于筛选
const originalDataList = ref<any[]>([]);

// 选择表单的字段列表
const selectedFormFields = ref([
  { id: "name", label: "姓名" },
  { id: "age", label: "年龄" },
  { id: "gender", label: "性别" },
  { id: "email", label: "邮箱" },
  { id: "phone", label: "电话" },
]);

// 从displayFields中获取选中的显示字段
const selectedDisplayFields = computed(() => {
  return displayFields.value;
});

// 根据字段ID获取字段标签
const getFieldLabel = (fieldId: string) => {
  const field = selectedFormFields.value.find(item => item.id === fieldId);
  return field ? field.label : fieldId;
};

// 生成数据列表，只包含选中的字段
const generateDataList = () => {
  if (!selectedForm.value || selectedDisplayFields.value.length === 0) {
    dataList.value = [];
    return;
  }
  
  const mockData = [];
  for (let i = 1; i <= 3; i++) {
    const dataItem: any = {
      id: i,
    };
    
    // 只添加选中的显示字段
    selectedDisplayFields.value.forEach(fieldId => {
      const field = selectedFormFields.value.find(item => item.id === fieldId);
      if (field) {
        dataItem[fieldId] = `${field.label}${i}`;
      }
    });
    
    mockData.push(dataItem);
  }
  
  dataList.value = mockData;
  console.log('FormSelect: Generated data list with selected fields:', dataList.value);
};

// 监听显示字段变化，重新加载数据
watch(displayFields, async () => {
  if (!selectedForm.value || selectedDisplayFields.value.length === 0) {
    dataList.value = [];
    return;
  }
  
  console.log('FormSelect: Display fields changed, reloading data...');
  
  try {
    // 构建API请求参数
    const requestParams = {
      skip: 0,
      take: 20,
      scope: {},
      sort: [
        {
          field: "createTime",
          type: "timestamp",
          dir: -1
        }
      ],
      filter: {
        rel: "and",
        items: [
          {
            field: "formId",
            type: "none",
            op: "eq",
            value: selectedForm.value.id
          },
          {}
        ]
      }
    };
    
    console.log('FormSelect: Reloading form data with params:', requestParams);
    
    // 调用实际的API接口获取表单数据
    const response = await http.api.post('/FormData/$query', requestParams);
    console.log('FormSelect: API response received:', response);
    
    // 处理API响应数据
    if (response && response.value && Array.isArray(response.value)) {
      console.log('FormSelect: Selected display fields:', selectedDisplayFields.value);
      console.log('FormSelect: First item data:', response.value[0]?.data);
      
      // 过滤数据，只保留选中的显示字段
      const filteredData = response.value.map((item: any) => {
        const filteredItem: any = {
          id: item.id
        };
        
        // 只添加选中的显示字段，从item.data中获取实际值
        selectedDisplayFields.value.forEach(fieldId => {
          console.log('FormSelect: Checking field:', fieldId, 'in item.data:', item.data);
          // 从item.data中获取字段值
          if (item.data && item.data.hasOwnProperty(fieldId)) {
            filteredItem[fieldId] = item.data[fieldId];
            console.log('FormSelect: Found value:', item.data[fieldId], 'for field:', fieldId);
          } else {
            console.log('FormSelect: Field not found:', fieldId, 'in item.data');
          }
        });
        
        return filteredItem;
      });
      
      dataList.value = filteredData;
      originalDataList.value = [...filteredData]; // 同时更新原始数据列表，用于筛选
      console.log('FormSelect: Processed form data from API:', dataList.value);
      console.log('FormSelect: Updated original data list for filtering:', originalDataList.value.length, 'items');
    } else {
      console.error('FormSelect: Invalid API response format:', response);
      dataList.value = [];
      originalDataList.value = [];
    }
  } catch (error) {
    console.error('FormSelect: Error reloading form data:', error);
    dataList.value = [];
    originalDataList.value = [];
  }
}, { deep: true });

const emit = defineEmits(["update:modelValue", "change", "update:buttonText", "update:buttonTextField"]);
const onInput = (val: string) => {
  let formtem = formList.value.find((x) => x.id == val);
  if (formtem) {
    emit("update:modelValue", formtem);
    emit("change", formtem);
  }
};

// 监听按钮文字变化，通知父组件
watch(buttonText, (newText) => {
  console.log('FormSelect: Button text changed:', newText);
  
  // 触发update:buttonTextField事件，直接更新buttonText字段
  emit("update:buttonTextField", newText);
  console.log('FormSelect: Emitted update:buttonTextField event');
});

// 监听props.buttonText变化，更新本地buttonText
watch(() => props.buttonText, (newText) => {
  if (newText) {
    buttonText.value = newText;
  }
});

// 处理筛选功能
const handleFilter = () => {
  console.log('FormSelect: Filter started with keyword:', searchKeyword.value);
  console.log('FormSelect: Original data count:', originalDataList.value.length);
  console.log('FormSelect: Selected display fields:', selectedDisplayFields.value);
  
  if (!searchKeyword.value.trim()) {
    // 如果搜索关键词为空，显示所有数据
    dataList.value = [...originalDataList.value];
    console.log('FormSelect: Empty keyword, showing all data:', originalDataList.value.length, 'items');
    return;
  }
  
  // 过滤数据，对所有选中字段进行模糊查询
  const filteredData = originalDataList.value.filter(item => {
    console.log('FormSelect: Checking item:', item);
    // 检查所有选中的字段
    return selectedDisplayFields.value.some(fieldId => {
      // 获取字段值
      const fieldValue = item[fieldId];
      console.log('FormSelect: Checking field:', fieldId, 'value:', fieldValue);
      // 检查值是否存在且包含搜索关键词
      const match = fieldValue && String(fieldValue).includes(searchKeyword.value);
      console.log('FormSelect: Match result:', match);
      return match;
    });
  });
  
  dataList.value = filteredData;
  console.log('FormSelect: Filtered data with keyword:', searchKeyword.value, 'result:', filteredData.length, 'items');
  console.log('FormSelect: Filtered data details:', filteredData);
};

// 打开数据选择对话框
const openDataSelectDialog = async () => {
  if (!selectedForm.value) return;
  
  // 显示加载状态
  dataList.value = [];
  
  // 打开对话框
  dataSelectDialogVisible.value = true;
  
  try {
    // 构建API请求参数
    const requestParams = {
      skip: 0,
      take: 20,
      scope: {},
      sort: [
        {
          field: "createTime",
          type: "timestamp",
          dir: -1
        }
      ],
      filter: {
        rel: "and",
        items: [
          {
            field: "formId",
            type: "none",
            op: "eq",
            value: selectedForm.value.id
          },
          {}
        ]
      }
    };
    
    console.log('FormSelect: Fetching actual form data with params:', requestParams);
    
    // 调用实际的API接口获取表单数据
    const response = await http.api.post('/FormData/$query', requestParams);
    console.log('FormSelect: API response received:', response);
    
    // 处理API响应数据
    if (response && response.value && Array.isArray(response.value)) {
      console.log('FormSelect: Selected display fields:', selectedDisplayFields.value);
      console.log('FormSelect: First item data:', response.value[0]?.data);
      
      // 过滤数据，只保留选中的显示字段
      const filteredData = response.value.map((item: any) => {
        const filteredItem: any = {
          id: item.id
        };
        
        // 只添加选中的显示字段，从item.data中获取实际值
        selectedDisplayFields.value.forEach(fieldId => {
          console.log('FormSelect: Checking field:', fieldId, 'in item.data:', item.data);
          // 从item.data中获取字段值
          if (item.data && item.data.hasOwnProperty(fieldId)) {
            filteredItem[fieldId] = item.data[fieldId];
            console.log('FormSelect: Found value:', item.data[fieldId], 'for field:', fieldId);
          } else {
            console.log('FormSelect: Field not found:', fieldId, 'in item.data');
          }
        });
        
        return filteredItem;
      });
      
      // 保存原始数据用于筛选
      originalDataList.value = [...filteredData];
      // 更新当前显示的数据
      dataList.value = filteredData;
      console.log('FormSelect: Processed form data from API:', dataList.value);
    } else {
      console.error('FormSelect: Invalid API response format:', response);
      dataList.value = [];
      originalDataList.value = [];
    }
  } catch (error) {
    console.error('FormSelect: Error fetching form data:', error);
    dataList.value = [];
    originalDataList.value = [];
  }
};

// 监听选择的表单变化，更新字段列表和数据列表
watch(selectedForm, (newForm) => {
  if (newForm) {
    console.log('FormSelect: Selected form changed:', newForm);
    
    // 根据实际选择的表单ID获取字段列表
    const formStore = useFormStore();
    formStore.get(newForm.id).then(form => {
      if (form?.content?.items) {
        console.log('FormSelect: Fetched form fields:', form.content.items);
        
        // 构建字段列表
        selectedFormFields.value = form.content.items
          .map(item => ({
            id: item.field,
            label: item.title
          }));
        
        // 过滤掉空字段
        selectedFormFields.value = selectedFormFields.value.filter(item => item.id && item.label);
        
        console.log('FormSelect: Built form fields:', selectedFormFields.value);
      }
    }).catch(err => {
      console.error('FormSelect: Error fetching form fields:', err);
      // 错误时使用模拟数据
      selectedFormFields.value = [
        { id: "name", label: "姓名" },
        { id: "age", label: "年龄" },
        { id: "gender", label: "性别" },
        { id: "email", label: "邮箱" },
        { id: "phone", label: "电话" },
      ];
    });
    
    // 模拟获取表单数据
    console.log('FormSelect: Fetching form data for:', newForm.id);
    
    // 这里应该调用实际的API来获取表单数据
    // 暂时使用模拟数据
    setTimeout(() => {
      // 生成数据列表，只包含选中的字段
      generateDataList();
    }, 500);
  }
});

// 从URL中提取appId的辅助函数
function extractAppIdFromUrl() {
  try {
    const windowWithLocation = window as any;
    if (windowWithLocation.location) {
      // 检查哈希路由部分（优先）
      if (windowWithLocation.location.hash) {
        const hashParts = windowWithLocation.location.hash.substring(1).split('/');
        const appIndex = hashParts.findIndex((part: string) => part === 'app') + 1;
        if (appIndex > 0 && appIndex < hashParts.length) {
          return hashParts[appIndex];
        }
      }
      
      // 检查路径部分（备用）
      if (windowWithLocation.location.pathname) {
        const pathParts = windowWithLocation.location.pathname.split('/');
        const appIndex = pathParts.findIndex((part: string) => part === 'app') + 1;
        if (appIndex > 0 && appIndex < pathParts.length) {
          return pathParts[appIndex];
        }
      }
    }
  } catch (e) {
    console.error('FormSelect: Error extracting appId from URL:', e);
  }
  return null;
}

// 从URL中提取当前表单id的辅助函数
function extractCurrentFormIdFromUrl() {
  try {
    const windowWithLocation = window as any;
    if (windowWithLocation.location) {
      // 检查哈希路由部分
      if (windowWithLocation.location.hash) {
        const hashParts = windowWithLocation.location.hash.substring(1).split('/');
        
        // 查找'form'路径部分，后面跟着表单id
        const formIndex = hashParts.findIndex((part: string) => part === 'form') + 1;
        if (formIndex > 0 && formIndex < hashParts.length) {
          return hashParts[formIndex];
        }
      }
    }
  } catch (e) {
    console.error('FormSelect: Error extracting current formId from URL:', e);
  }
  return null;
}

watch(
  [() => props.appId, () => props.modelValue],
  ([newAppId, newModel], [oldAppId, oldModel]) => {
    if (newAppId && newAppId != oldAppId) {

      // 处理模板字符串格式的appId
      let actualAppId = newAppId;
      
      // 如果appId是模板字符串，尝试从URL中提取
      if (actualAppId.includes('{{') && actualAppId.includes('}}')) {
        const urlAppId = extractAppIdFromUrl();
        if (urlAppId) {
          actualAppId = urlAppId;
        }
      }
      
      if (actualAppId && !actualAppId.includes('{{')) {
        // 使用appStore.get获取应用信息
        appStore.get(actualAppId).then(app => {
          if (app) {
            // 提取当前表单id
            const currentFormId = extractCurrentFormIdFromUrl();
            
            // 构建原始表单列表
            const originalFormList = buildFormListItems(app);
            
            // 构建表单列表并排除当前表单
            formList.value = originalFormList.filter(item => item.id !== currentFormId);
          } 
        }).catch(err => {
          console.error('FormSelect: Error fetching app:', err);
        });
      } 
    }
    if (newModel && newModel != oldModel) {
      // console.log("newmode", newModel)
      if (isString(newModel))
        value.value = newModel || ""
      else
        value.value = (newModel as IFormItem).id || ""
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.form-select-container {
  width: 100%;
}

.form-select-settings {
  margin-top: 20px;
}

.setting-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.sub-section {
  margin-left: 20px;
  margin-bottom: 15px;
}

.sub-section-title {
  font-size: 13px;
  margin-bottom: 8px;
  color: #666;
}

.setting-button {
  width: 100%;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #2e73ff;
  color: #2e73ff;
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

.setting-button:hover {
  background-color: #ecf5ff;
  border-color: #40a9ff;
  color: #40a9ff;
}

/* 数据选择对话框样式 */
.data-select-dialog {
  display: flex;
  width: 100%;
  height: 60vh;
  gap: 20px;
}

/* 左侧数据列表区域 */
.data-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fafafa;
}

.search-bar .el-input {
  flex: 1;
}

/* 数据列表 */
.data-list {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

/* 右侧配置区域 */
.config-section {
  width: 300px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  overflow-y: auto;
}

.config-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.config-item {
  margin-bottom: 20px;
}

.config-label {
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
}

/* 表格样式 */
.data-list .el-table {
  border: none;
}

.data-list .el-table__header-wrapper {
  background-color: #fafafa;
}

.data-list .el-table__header-wrapper th {
  border-bottom: 1px solid #e8e8e8;
}

.data-list .el-table__body-wrapper {
  overflow-x: hidden;
}

.data-list .el-table__row {
  border-bottom: 1px solid #f0f0f0;
}

.data-list .el-table__row:hover {
  background-color: #f5f7fa;
}
</style>
