<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
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
import { accessToken, appSetting } from "@eimsnext/utils";
import fetch from "@eimsnext/form-render-core/src/frame/fetch";

export default {
  name: 'FormSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择表单'
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
  methods: {
    fetchFormList() {
      this.loading = true;
      try {
        // 从URL中获取应用ID和当前表单ID
        const url = window.location.href;
        console.log('当前URL:', url);
        const match = url.match(/\/app\/(.*?)\/form\/(.*?)(?:\/|$)/);
        const appId = match ? match[1] : '';
        const currentFormId = match ? match[2] : '';
        
        if (!appId) {
          console.error('无法获取应用ID');
          this.loading = false;
          return;
        }
        
        // 直接使用完整的API地址
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
            console.error('获取表单列表失败:', error);
            this.loading = false;
          }
        });
      } catch (error) {
        console.error('获取表单列表失败:', error);
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
