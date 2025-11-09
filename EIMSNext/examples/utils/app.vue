<template>
  <button @click="onClick">show dialog</button>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import { http, Dictionary, uniqueId } from "@eimsnext/utils";
import buildQuery from "odata-query";

let query = buildQuery({ select: "code,name" });
console.log("query", query);

const title = ref("标题");
const onClick = () => {
  // alert(title.value + uniqueId());
};

http.odata.get("department", "675155244e626b19cf99623c").then((res) => {
  console.log("res", res);
  title.value = JSON.stringify(res);
});

http.odata.count("department", query).then((res) => {
  console.log("res", res);
  title.value = JSON.stringify(res);
});

http.odata.query("department", query).then((res) => {
  console.log("res", res);
  title.value = JSON.stringify(res);
});
</script>
