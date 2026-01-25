<template>
  <div class="flow-container">
    <div><el-button @click="addNew(PrintTemplateType.Pdf)">Add</el-button></div>
    <el-space direction="vertical" class="flow-space">
      <template v-for="print in prints">
        <et-card class="flow-card">
          <template #header>
            <div class="flex-y-center">
              <div class="flow-header">
                <div class="flow-name" :title="print.name">
                  <span>{{ print.name }}</span>
                </div>
                <div style="margin-left: 50px">
                  <el-button @click="edit(print)">编辑</el-button>
                </div>
              </div>
            </div>
          </template>
          <div class="flow-content">触发: {{ print.printType }}</div>
        </et-card>
      </template>
    </el-space>
  </div>
  <EtDrawer v-model="showDrawer" @close="close">
    <template #title>
      <el-input v-model="selectedPrint!.name" class="title-editor" />
    </template>

    <PdfPrintDesigner :form-def="formDef" :print-def="selectedPrint!" />
  </EtDrawer>
</template>
<script setup lang="ts">
import PdfPrintDesigner from "@/components/PrintDesigner/PdfPrintDesigner.vue";
import { FormDef, PrintTemplate, PrintTemplateType } from "@eimsnext/models";
import { printTemplateService } from "@eimsnext/services";
import buildQuery from "odata-query";

defineOptions({
  name: "PrintTemplateList",
});

const props = defineProps<{
  formDef: FormDef;
}>();

const showDrawer = ref(false);

const prints = ref<PrintTemplate[]>([]);
const selectedPrint = ref<PrintTemplate>();

// console.log("formid", props.formId);

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
  // console.log("edit df", flow);
  selectedPrint.value = print;

  showDrawer.value = true;
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
  padding: 20px;
  display: flex;

  .flow-space {
    width: 100%;
    align-items: normal !important;
  }

  .flow-card {
    width: 100%;

    .flow-header {
      display: flex;

      .flow-name {
        font-size: 15px;
        font-weight: 600;
        max-width: 50%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .flow-content {
      display: flex;
      font-size: 13px;
      padding: 10px 20px;
    }
  }
}
</style>
