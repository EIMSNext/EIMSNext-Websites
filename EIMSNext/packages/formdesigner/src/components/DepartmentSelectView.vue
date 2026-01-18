<template>
  <div class="org-select-view">
    <SelectedTags :modelValue="modelValue" :style="{ height: multiple ? '60px' : '42px' }" :editable="true"
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
