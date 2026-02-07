<template>
  <div class="org-select-view">
    <SelectedTags :modelValue="tags" :style="{ height: multiple ? '60px' : '35px' }" :editable="true"
      :emptyText="t('comp.emptyDept')"></SelectedTags>
  </div>
</template>

<script>
import { SelectedTags } from '@eimsnext/components';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DepartmentSelectView',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false,
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
.org-select-view {
  width: 100%;
}
</style>
