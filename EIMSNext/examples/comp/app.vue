<template>
  <et-dialog v-model="showDialog" :title="title" :show-footer="false">
    <et-card title="test card">
      <template #action>
        <el-button icon="plus">创建新应用</el-button>
      </template>
      <div>test content</div>
    </et-card>
    <div style="padding: 12px">
      <selected-tags
        v-model="selected"
        :editable="false"
        :closable="true"
        :empty-text="'选择成员或部门'"
        @editTag="editTag"
        @tagRemoved="tagRemoved"
      />
      <!-- <et-list v-model="selectedList" :data="listData" :selectable="true">
      </et-list> -->
      <button @click="changeTags">change Tags</button>
    </div>
  </et-dialog>
  <member-select-dialog
    v-model="showMemberDialog"
    @cancel="cancelSelect"
    @ok="finishSelect"
  />
  <et-confirm-dialog
    v-model="showConfirmDialog"
    :icon="MessageIcon.Error"
    @ok="onConfirmed"
  >
    <div>效果如何</div>
  </et-confirm-dialog>

  <!-- 部门选择组件测试 -->
  <div class="department-select" style="margin: 20px;">
    <h3>部门选择组件测试</h3>    
    <!-- 单选模式 -->
    <div style="margin-bottom: 20px;">
      <h4>1. 单选模式：</h4>
      <div class="current-selected" >
        <selected-tags v-if="dialogSelectedDepartment.length" v-model="dialogSelectedDepartment" :closable="true" @tagRemoved="removeDialogDepartment" @tagClick="editDepartment" />
        <el-button v-else type="primary" link @click="showDepartmentDialog = true">+ 选择部门</el-button>
      </div>
      <department-select-dialog v-model="showDepartmentDialog" :department="dialogSelectedDepartment" @ok="finishDepartmentSelect" />
    </div>
    
    <!-- 多选模式 -->
    <div>
      <h4>2. 多选模式：</h4>
      <div class="current-selected" >
        <selected-tags v-if="multiSelectedDepartments.length" v-model="multiSelectedDepartments" :closable="true" @tagRemoved="removeMultiDepartment" @tagClick="editMultiDepartment" />
        <el-button v-else type="primary" link @click="showMultiDepartmentDialog = true">+ 选择多个部门</el-button>
      </div>
      <department-select-dialog v-model="showMultiDepartmentDialog" :department="multiSelectedDepartments" :multiple="true" @ok="finishMultiDepartmentSelect" />
    </div>
  </div>
  <!-- <div class="shake">    
    <el-button @click="onClick">show dialog</el-button>
    <el-button @click="onMemberClick">show member dialog</el-button>
    <el-button @click="onConfirmClick">show confirm dialog</el-button>
    <el-button @click="changeName">change name</el-button>
    <el-button @click="save">save</el-button>
  </div> -->
</template>

<script lang="ts" setup>
import { computed, inject, ref, reactive } from "vue";
import { appSetting, http, HttpClient } from "@eimsnext/utils";
import {
  Department,
  CurrentUser,
  FormContent,
  FormDefRequest,
  FormDef,
  FormType,
} from "@eimsnext/models";
import { useUserStore } from "@eimsnext/store";
import {
  ISelectedTag,
  TagType,
  MessageIcon,
  IListItem,
  EtConfirm,
} from "@eimsnext/components";
import { formDefService } from "@eimsnext/services";
import { DepartmentSelectDialog } from "@eimsnext/components";

const userStore = useUserStore();

const showDialog = ref(false);
const showMemberDialog = ref(false);
const showConfirmDialog = ref(false);
// const http = inject<HttpClient>("http")!;

const listData: IListItem[] = [
  { id: "111", label: "111", icon: "el-icon-UserFilled", color: "red" },
  { id: "222", label: "222", icon: "el-icon-UserFilled", color: "red" },
];
const listTile = ref("list test");
const selectedList = ref(["111"]);

const title = ref("标题");
const selected = ref([
  { id: "111", label: "aaa", type: TagType.Employee },
  { id: "222", label: "bbb", type: TagType.Department },
  { id: "333", label: "ccc", type: TagType.Role, error: true },
]);

// 部门选择组件相关变量
const showDepartmentDialog = ref(false);
const dialogSelectedDepartment = ref<ISelectedTag[]>([]);

// 多选模式变量
const showMultiDepartmentDialog = ref(false);
const multiSelectedDepartments = ref<ISelectedTag[]>([]);
const changeTags = () => {
  selected.value = [
    { id: "222", label: "bbb", type: TagType.Department },
    { id: "333", label: "ccc", type: TagType.Role, error: true },
  ];
};

const tagRemoved = async () => {
  let ok = await EtConfirm.showDialog("要删除吗？", {
    title: "删除确认",
    icon: MessageIcon.Error,
    iconColor: "red",
  });
  alert("删除确认杠:" + ok);
  console.log("sel", selected);
};
const editTag = () => {
  alert("edit tag");
};
let admin = ref(new CurrentUser());

console.log("final app setting", appSetting);

userStore.get().then((res) => (admin.value = res));

const cancelSelect = () => {
  // showDialog.value = false;
};
const finishSelect = (tags: ISelectedTag[]) => {
  showMemberDialog.value = false;
  console.log(tags);
};
const onConfirmed = () => {
  showConfirmDialog.value = false;
};

const onClick = () => {
  showDialog.value = true;
};
const onMemberClick = () => {
  showMemberDialog.value = true;
};
const onConfirmClick = () => {
  showConfirmDialog.value = true;
};

const changeName = () => {
  admin.value.userName == "test"
    ? userStore.updateUserName("edee")
    : userStore.updateUserName("test");
};
const save = () => {
  let content = new FormContent();
  content.layout =
    '[{"type":"input","field":"Fz8sm3ceri6racc","title":"输入框","info":"","$required":false,"_fc_id":"id_Fdktm3ceri6radc","name":"ref_Fh2tm3ceri6raec","display":true,"hidden":false,"_fc_drag_tag":"input"}]';
  content.options =
    '{"info":{"align":"left"},"form":{"inline":false,"hideRequiredAsterisk":false,"labelPosition":"right","size":"default","labelWidth":"125px"},"globalEvent":{},"globalData":{},"resetBtn":{"show":false,"innerText":"重置"},"submitBtn":{"show":true,"innerText":"提交"}}';

  let req: FormDefRequest = {
    id: "",
    appId: "",
    name: "test1",
    type: FormType.Form,
    content: content,
  };

  formDefService.post<FormDef>(req).then((res) => {
    console.log("form res", res);
  });
};

// 部门选择组件相关方法
const finishDepartmentSelect = (departments: ISelectedTag[]) => {
  // 单选模式下，dialog返回的是包含单个部门的数组
  if (departments && Array.isArray(departments) && departments.length > 0) {
    const department = departments[0];
    if (department && department.id && department.label) {
      dialogSelectedDepartment.value = [department];
      console.log("选择的部门：", department);
    } else {
      dialogSelectedDepartment.value = [];
      console.log("取消部门选择");
    }
  } else {
    dialogSelectedDepartment.value = [];
    console.log("取消部门选择");
  }
};

const removeDialogDepartment = () => {
  dialogSelectedDepartment.value = [];
};

// 编辑部门，点击tag时调用
const editDepartment = (tag: ISelectedTag) => {
  // 打开部门选择对话框，当前部门会通过props.department传递给对话框
  showDepartmentDialog.value = true;
};

// 多选部门相关方法
const finishMultiDepartmentSelect = (departments: ISelectedTag[]) => {
  // 检查部门是否有效，如果无效则清空选择
  if (departments && Array.isArray(departments) && departments.length > 0) {
    multiSelectedDepartments.value = departments;
    console.log("选择的多个部门：", departments);
  } else {
    multiSelectedDepartments.value = [];
    console.log("取消部门选择");
  }
};

const removeMultiDepartment = (tag: ISelectedTag) => {
  const index = multiSelectedDepartments.value.findIndex(dept => dept.id === tag.id);
  if (index > -1) {
    multiSelectedDepartments.value.splice(index, 1);
  }
};

// 编辑多个部门，点击tag时调用
const editMultiDepartment = (tag: ISelectedTag) => {
  // 打开部门选择对话框，当前部门会通过props.department传递给对话框
  showMultiDepartmentDialog.value = true;
};
</script>
<style scoped lang="less">
.selected-tags{
 height: auto;
}

.current-selected :deep(.selected-tags) {
  cursor: pointer;
}
</style>