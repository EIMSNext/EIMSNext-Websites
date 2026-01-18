<template>
  <button @click="onClick">show dialog</button>
  <button @click="changeName">change name</button>
  <button @click="testApprove">approve</button>
</template>

<script lang="ts" setup>
import { Department, FormDef, ApproveRequest, ApproveAction} from "@jlsoft/models";
import {
  authService,
  departmentService,
  formDataService,
  workflowService
} from "@jlsoft/services";
import { useUserStore, useFormStore, useDeptStore, useAppStore , useContextStore} from "@jlsoft/store";
import buildQuery from "odata-query";
import { storeToRefs } from "pinia";

const contextStore=useContextStore()
const userStore = useUserStore();
const formStore = useFormStore();
const deptStore = useDeptStore();
const appStore= useAppStore()
const { items: appsRef } = storeToRefs(appStore);

let admin = userStore.currentUser;
let forms = formStore.items;
let form1: FormDef;
let form2: FormDef;

let depts: any;

authService
  .login({
    username: "12345678901",
    password: "123456",
    grant_type: "password",
  })
  .then(async () => {
    await userStore.get(false);

    let query = buildQuery({ filter: { name: "1" } }); //01 - 简捷软件
    console.log("query", query);

    deptStore.load("", false).then((res: Department[]) => {
      depts = res;

      console.log("depts", depts);
    });

    // formStore.get("67317736321f7eacddda80a0").then((res) => {
    //   console.log("form1", res);
    //   if (res) form1 = res;
    // });
    // formStore.get("6731744d321f7eacddda809f").then((res) => {
    //   if (res) form2 = res;
    // });
  });

const onClick = () => {
  console.log("res",appsRef.value)
  // alert(admin.userName);
  // alert(form1?.id);
  // alert(form2?.id);

  // formDataService.query<FormData>("{}").then((res) => console.log("ress", res));
  // appStore.load("",false).then(res=>{
  //   console.log("res",res, appsRef.value)
  // });
  contextStore.setCorpId("67d687c8f7094f3ff1734545",true).then(()=>{ console.log("apps",appsRef.value)});

};
const changeName = () => {
  admin.userName == "test"
    ? userStore.updateUserName("edee")
    : userStore.updateUserName("test");
};
const testApprove=()=>{
  workflowService.approve({dataId:"67f7c8c1bb6515c3e8404b1a", action:ApproveAction.Approve, comment:"同意"});
}
</script>
