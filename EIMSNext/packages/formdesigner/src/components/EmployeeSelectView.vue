<template>
  <div class="fc-employee-select-view">
    <div class="fc-employee-select-content">
      <el-button type="primary" link size="small">+ 选择成员</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeSelectView',
};
</script>

<style scoped>
.fc-employee-select-view {
  padding: 10px;
}

.fc-employee-select-content {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 32px;
  display: flex;
  align-items: center;
}
</style>
