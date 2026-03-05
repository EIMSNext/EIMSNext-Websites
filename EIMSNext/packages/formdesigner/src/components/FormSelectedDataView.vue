<template>
  <div class="form-selected-data-view">
    <SelectedTags :modelValue="tags" :style="{ height: '60px' }" :editable="true"
      :emptyText="'选择数据'" @editTag="handleEditTag"></SelectedTags>
  </div>
</template>

<script>
import { SelectedTags } from '@eimsnext/components';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FormSelectedDataView',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    formCreateInject: Object,
  },
  inject: ['designer'],
  components: {
    SelectedTags,
  },
  data() {
    return {
      tags: []
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        this.tags = val || [];
      },
      deep: true
    }
  },
  methods: {
    handleEditTag() {
      // 在设计界面中点击编辑按钮时的处理
      // 这里可以添加一些逻辑，比如显示一个提示或者打开配置对话框
    }
  },
  computed: {
    t() {
      return this.designer.setupState.t;
    }
  }
})

</script>

<style scoped lang="scss">
.form-selected-data-view {
  width: 100%;
}
</style>
