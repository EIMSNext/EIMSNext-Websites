<template>
  <div style=" padding: 0 10px;">
    <div class="el-form-item__label"><span class="_fc-field-title">{{ title }}</span></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "GroupLabel",
  props: {
    title: String,
  }
});
</script>

<style></style>
