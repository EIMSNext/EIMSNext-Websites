<template>
  <div class="fc-department-select-view">
    <div class="fc-department-select-content">
      <el-button type="primary" link size="small">+ 选择部门</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DepartmentSelectView',
};
</script>

<style scoped>
.fc-department-select-view {
  padding: 10px;
}

.fc-department-select-content {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 32px;
  display: flex;
  align-items: center;
}
</style>
