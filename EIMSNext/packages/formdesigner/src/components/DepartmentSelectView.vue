<template>
  <div class="fc-department-select-view">
    <div class="fc-department-select-content" @click="handleClick">      
      <template v-if="selectedDepartments && selectedDepartments.length > 0">
        <div 
          v-for="(dept, index) in selectedDepartments" 
          :key="index" 
          class="fc-department-tag"
          @click.stop="handleTagClick"
        >
          {{ dept.label }}
        </div>
      </template>
      <template v-else>
        <div class="fc-department-placeholder">+ 选择部门</div>
      </template>
    </div>
    
    <!-- 部门选择对话框 -->
    <MemberSelectDialog
      v-if="showDialog"
      :key="dialogKey"
      v-model:modelValue="showDialog"
      :tags="formattedTags"
      :showTabs="showTabs"
      multiple
      @ok="handleDepartmentChange"
      @cancel="handleCancel"
    />
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { MemberSelectDialog, MemberTabs, TagType } from '@eimsnext/components';

export default {
  name: 'DepartmentSelectView',
  components: {
    MemberSelectDialog
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formCreateInject: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const showDialog = ref(false);
    const dialogKey = ref(0);
    const selectedDepartments = ref([...props.modelValue]);
    // 只显示部门标签页
    const showTabs = MemberTabs.Department;
    
    // 监听modelValue变化
    watch(
      () => props.modelValue,
      (newVal) => {
        selectedDepartments.value = [...newVal];
      },
      { deep: true }
    );
    
    // 格式化部门数据，添加type字段，确保MemberSelectDialog能正确处理
    const formattedTags = computed(() => {
      return selectedDepartments.value.map(dept => ({
        id: dept.id || dept.value,
        label: dept.label,
        type: TagType.Department,
        code: dept.code
      }));
    });
    
    // 点击选择部门按钮
    const handleClick = () => {
      dialogKey.value++;
      // 延迟显示对话框，确保有足够时间初始化和加载数据
      setTimeout(() => {
        showDialog.value = true;
      }, 200);
    };
    
    // 点击标签
    const handleTagClick = () => {
      dialogKey.value++;
      // 延迟显示对话框，确保有足够时间初始化和加载数据
      setTimeout(() => {
        showDialog.value = true;
      }, 200);
    };
    
    // 部门选择确认
    const handleDepartmentChange = (departments) => {
      selectedDepartments.value = departments;
      emit('update:modelValue', departments);
      emit('change', departments);
      showDialog.value = false;
    };
    
    // 取消选择
    const handleCancel = () => {
      showDialog.value = false;
    };
    
    return {
      showDialog,
      dialogKey,
      selectedDepartments,
      showTabs,
      formattedTags,
      handleClick,
      handleTagClick,
      handleDepartmentChange,
      handleCancel
    };
  }
};
</script>

<style scoped>
.fc-department-select-view {
  padding: 0;
  width:100%;
  display: flex;
  align-items: center;
}

.fc-department-select-content {
  width: 100%;
  padding: 8px 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  min-height: 32px;
  max-height: 110px; /* 大约3行高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  cursor: pointer;
  overflow-y: auto;
  color: #909399;
  font-size: 14px;
  line-height: 24px;
}

.fc-department-tag {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 4px 10px;
  border-radius: 10px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 4px;
}

.fc-department-placeholder {
  color: #909399;
  font-size: 14px;
  line-height: 24px;
  cursor: pointer;
}
</style>
