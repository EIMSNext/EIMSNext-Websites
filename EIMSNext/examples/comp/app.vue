<template>
  <div>
    <et-dialog v-model="showDialog" :title="title" :show-footer="false">
      <et-card title="test card">
        <template #action>
          <el-button icon="plus">创建新应用</el-button>
        </template>
        <div>test content</div>
      </et-card>
      <div style="padding: 12px">
        <selected-tags v-model="selected" :editable="false" :closable="true" :empty-text="'选择成员或部门'" @editTag="editTag"
          @tagRemoved="tagRemoved" />
        <!-- <et-list v-model="selectedList" :data="listData" :selectable="true">
      </et-list> -->
        <button @click="changeTags">change Tags</button>
      </div>
    </et-dialog>
    <member-select-dialog v-model="showMemberDialog"
      :member-options="{ multiple: true, showTabs: MemberTabs.Department | MemberTabs.Role | MemberTabs.Employee, cascadedDept: true, showCascade: true }"
      @ok="finishSelect" />
    <et-confirm-dialog v-model="showConfirmDialog" :icon="MessageIcon.Error" @ok="onConfirmed">
      <div>效果如何</div>
    </et-confirm-dialog>

    <div class="shake">
      <el-button @click="onClick">show dialog</el-button>
      <el-button @click="onMemberClick">show member dialog</el-button>
      <el-button @click="onConfirmClick">show confirm dialog</el-button>
      <el-button @click="changeName">change name</el-button>
      <el-button @click="save">save</el-button>
    </div>
  </div>
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
  MessageIcon,
  IListItem,
  EtConfirm,
  MemberTabs,
  DataItemType,
} from "@eimsnext/components";
import { formDefService } from "@eimsnext/services";

const userStore = useUserStore();

const showDialog = ref(false);
const showMemberDialog = ref(false);
const showConfirmDialog = ref(false);
// const http = inject<HttpClient>("http")!;

const listData: IListItem[] = [
  { id: "111", label: "111", icon: "el-UserFilled", iconColor: "red", type: DataItemType.Unknown },
  { id: "222", label: "222", icon: "el-UserFilled", iconColor: "red", type: DataItemType.Unknown },
];
const listTile = ref("list test");
const selectedList = ref(["111"]);

const title = ref("标题");
const selected = ref([
  { id: "111", label: "aaa", type: DataItemType.Employee },
  { id: "222", label: "bbb", type: DataItemType.Department },
  { id: "333", label: "ccc", type: DataItemType.Role, error: true },
]);

const changeTags = () => {
  selected.value = [
    { id: "222", label: "bbb", type: DataItemType.Department },
    { id: "333", label: "ccc", type: DataItemType.Role, error: true },
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

const finishSelect = (tags: ISelectedTag[]) => {
  showMemberDialog.value = false;
  console.log("memberSelect", tags);
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

</script>
<style scoped lang="less">
.selected-tags {
  height: auto;
}

.current-selected :deep(.selected-tags) {
  cursor: pointer;
}
</style>