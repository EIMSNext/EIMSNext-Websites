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
  width: 100%;
  padding: 3px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 4px;
}

.fc-employee-select-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  height: 24px;
  line-height: 24px;
}
</style>
