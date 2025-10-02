<template>
  <formCreate :modelValue="data" :rule="rules" :option="options" @submit="handleSubmit" />
</template>
<script setup lang="ts">
import formCreate from "@eimsnext/form-render-elplus";
import { FormContent } from "@eimsnext/models";

defineOptions({
  name: "FormRender",
});

const props = withDefaults(
  defineProps<{
    def: FormContent;
    data: FormData;
  }>(),
  {}
);

console.log("form def", props.def);

const rules = ref(formCreate.parseJson(props.def.layout!));
const options = ref(formCreate.parseJson(props.def.options!));
const ddd = ref({
  ilzf9w3k0s0q6: "222",
});

// options.value.onSubmit = (formData: any) => {
//   alert(JSON.stringify(formData));
// };
console.log("form con", rules, options);

const handleSubmit = (data: any) => {
  console.log("formdata", data);
};
</script>
