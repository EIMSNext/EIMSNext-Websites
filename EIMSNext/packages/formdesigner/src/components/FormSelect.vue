<template>
  <el-select
    :value="value"
    :placeholder="computedPlaceholder"
    style="width: 100%"
    @change="handleChange"
    :loading="loading"
  >
    <el-option
      v-for="item in formList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
import fetch from "@eimsnext/form-render-core/src/frame/fetch";
import { useContextStore, useFormStore } from "@eimsnext/store";

export default {
  name: 'FormSelect',
  inject: ['designer'],
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    sourceScope: {
      type: String,
      default: 'currentApp'
    }
  },
  data() {
    return {
      formList: [],
      loading: false
    };
  },
  mounted() {
    this.fetchFormList();
  },
  computed: {
    computedPlaceholder() {
      return this.placeholder || this.designer?.setupState?.t?.('dataflow.selectForm') || '选择表单';
    }
  },
  methods: {
    async fetchFormList() {
      this.loading = true;
      try {
        const appId = useContextStore().appId || this.designer?.setupState?.appId || '';
        const currentFormId = this.designer?.setupState?.formId || '';
        
        if (!appId) {
          console.error('Unable to get app ID');
          this.loading = false;
          return;
        }
        
        if (this.sourceScope === 'crossApp') {
          const list = await useFormStore().loadFormsIncludeCross(appId);
          this.formList = list
            .filter(item => item.id !== currentFormId)
            .map(item => ({
              label: item.name,
              value: item.id
            }));
          this.loading = false;
          return;
        }

        const apiUrl = window.appSetting?.apiUrl || '';
        if (!apiUrl) {
          this.loading = false;
          return;
        }
        
        // 使用项目自定义的fetch函数
        fetch({
          action: `${apiUrl}/odata/v1/App/$query`,
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Accept': 'application/json;odata.metadata=none'
          },
          onSuccess: (data) => {
            // 根据应用ID过滤数据
            const appData = data.value.find(item => item.id === appId);
            
            if (appData && appData.appMenus) {
              // 转换为下拉选项格式，并排除当前表单
              this.formList = appData.appMenus
                .filter(menu => menu.menuId !== currentFormId)
                .map(menu => ({
                  label: menu.title,
                  value: menu.menuId
                }));
            }
            this.loading = false;
          },
          onError: (error) => {
            console.error('Failed to load form list:', error);
            this.loading = false;
          }
        });
      } catch (error) {
        console.error('Failed to load form list:', error);
        this.loading = false;
      }
    },
    handleChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
};
</script>
