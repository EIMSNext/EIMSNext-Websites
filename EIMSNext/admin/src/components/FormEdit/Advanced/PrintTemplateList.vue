<template>
  <EtConfirmDialog
    v-model="showDeleteConfirmDialog"
    title="你确定要删除所选数据吗？"
    :icon="MessageIcon.Warning"
    :showNoSave="false"
    okText="确定"
    @ok="execDelete"
  >
    <div>数据删除后将不可恢复</div>
  </EtConfirmDialog>
  <EtDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="selectedPrint!.name" class="title-editor" />
    </template>

    <component :is="PdfPrintDesigner" :form-def="formDef" :print-def="selectedPrint!" />
  </EtDrawer>
  <AdvanceLayout title="打印模板" desc="打印表单时将按照使用中的模板格式打印">
    <div class="flow-container">
      <div class="panel-header">
        <div class="header-left">
          <el-button type="primary" icon="plus" @click="addNew(PrintTemplateType.Pdf)">
            新建打印模板
          </el-button>
        </div>
        <div class="header-right"></div>
      </div>
      <div>
        <el-space direction="vertical" class="flow-space">
          <template v-for="print in prints">
            <et-card class="flow-card" :title="print.name">
              <template #action>
                <div class="flow-header">
                  <el-button @click="edit(print)">编辑</el-button>
                  <el-button @click="remove(print)">删除</el-button>
                </div>
              </template>
              <div class="flow-content">
                <div class="item-line">使用范围: aaaa</div>
                <div class="item-line">文件名称: bbbb</div>
              </div>
            </et-card>
          </template>
        </el-space>
      </div>
    </div>
  </AdvanceLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { FormDef, PrintTemplate, PrintTemplateType } from "@eimsnext/models";
import { MessageIcon } from "@eimsnext/components";
import { printTemplateService } from "@eimsnext/services";
import buildQuery from "odata-query";

const PdfPrintDesigner = defineAsyncComponent(() => import("@/components/PrintDesigner/PdfPrintDesigner.vue"));

defineOptions({
  name: "PrintTemplateList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);
const showDeleteConfirmDialog = ref(false);
const prints = ref<PrintTemplate[]>([]);
const selectedPrint = ref<PrintTemplate>();

const loadPrints = (formId: string) => {
  let query = buildQuery({ filter: { formId: formId } });
  printTemplateService.query<PrintTemplate>(query).then((res) => {
    prints.value = res;
  });
};

const addNew = (printType: PrintTemplateType) => {
  selectedPrint.value = {
    id: "",
    name: "未命名打印模板",
    appId: props.formDef.appId,
    formId: props.formDef.id,
    content: "",
    printType: printType,
  };

  showDrawer.value = true;
};

const edit = (print: PrintTemplate) => {
  selectedPrint.value = print;

  showDrawer.value = true;
};

const remove = (print: PrintTemplate) => {
  selectedPrint.value = print;
  showDeleteConfirmDialog.value = true;
};
const execDelete = () => {
  printTemplateService.delete<PrintTemplate>(selectedPrint.value!.id).then((res) => {
    loadPrints(props.formDef.id);
    showDeleteConfirmDialog.value = false;
  });
};

// const emit = defineEmits(["close"]);

function close() {
  showDrawer.value = false;

  loadPrints(props.formDef.id);
  // emit("close");
}

onBeforeMount(() => {
  //初始化
  if (props.formDef) {
    loadPrints(props.formDef.id);
  }
});
</script>
<style lang="scss" scoped>
.flow-container {
  display: flex;
  flex-direction: column;

  .panel-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--et-space-16);
  }

  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;
      justify-content: space-between;

      .flow-name {
        font-size: var(--et-font-size-15);
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .el-button {
        margin: var(--et-space-0);
        border: none;
      }
    }

    .flow-content {
      display: flex;
      font-size: var(--et-font-size-13);
      padding: var(--et-space-10) var(--et-space-20);
      flex-direction: column;

      .item-line {
        word-wrap: break-word;
        align-items: center;
        color: var(--et-text-secondary);
        display: flex;
        font-size: var(--et-font-size-14);
        line-height: var(--et-line-height-22);
        word-break: break-word;
      }
    }
  }
}

.main-title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: var(--et-font-size-16);
}

.main-content {
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: var(--et-size-60);
}
</style>
