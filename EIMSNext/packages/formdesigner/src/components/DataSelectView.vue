<template>
  <div class="data-select-view">
    <SelectedTags :modelValue="tags" :style="{ height: '35px' }" :editable="true"
      :emptyText="placeholder"></SelectedTags>
  </div>
</template>

<script>
import { SelectedTags } from '@eimsnext/components';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DataSelectView',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '选择数据'
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
  computed: {
    t() {
      return this.designer.setupState.t;
    }
  }
})

</script>

<style scoped lang="scss">
.data-select-view {
  width: 100%;
}
</style>
