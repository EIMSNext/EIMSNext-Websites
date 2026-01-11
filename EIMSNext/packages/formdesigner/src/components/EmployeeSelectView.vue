<template>
  <div class="fc-employee-select-view">
    <div class="fc-employee-select-content">
      <div class="fc-employee-placeholder">+ 选择成员</div>
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
  padding: 8px 12px;
  width:100%;
  display: flex;
  align-items: center;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  min-height: 32px;
  max-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  cursor: pointer;
  overflow-y: auto;
}

.fc-employee-select-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  line-height: 24px;
}

.fc-employee-placeholder {
  color: #909399;
  font-size: 14px;
  line-height: 24px;
  cursor: pointer;
}
</style>
