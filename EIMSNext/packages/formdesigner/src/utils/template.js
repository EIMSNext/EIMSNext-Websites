
export function formTemplate(json, options) {
    return `<template>
  <form-create
    v-model="formData"
    v-model:api="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create>
</template>

<script>
import formCreate from "@eimsnext/form-render/element-plus";

export default {
  components: {
    formCreate: formCreate.$form()
  },
  data () {
    const option = formCreate.parseJson('${options.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}');
    //开启阅读模式
    //option.preview = true;
    return {
      formData: {},
      fapi: null,
      rule: formCreate.parseJson('${json.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'),
      option: option
    }
  },
  methods: {
    onSubmit (formData) {
      //todo 提交表单
    }
  }
}
<\/script>`
}

export function formTemplateV3(json, options) {
    return `<template>
  <form-create
    v-model="formData"
    v-model:api="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create>
</template>

<script setup>
import {ref} from "vue";
import formCreate from "@eimsnext/form-render/element-plus";

const option = ref(formCreate.parseJson('${options.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'));
const rule = ref(formCreate.parseJson('${json.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'));
const fapi = ref(null);
const formData = ref({});

const onSubmit =  (formData) => {
  //todo 提交表单
}
<\/script>`
}

export function mobileTemplate(json, options) {
    return `<template>
  <form-create-mobile
    driver="elm"
    v-model="formData"
    v-model:api="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create-mobile>
</template>

<script>
import formCreate from "@eimsnext/form-render/vant";

export default {
  components: {
    formCreateMobile: formCreate.$form()
  },
  data () {
    const option = formCreate.parseJson('${options.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}');
    //开启阅读模式
    //option.preview = true;
    return {
      formData: {},
      fapi: null,
      rule: formCreate.parseJson('${json.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'),
      option: option
    }
  },
  methods: {
    onSubmit (formData) {
      //todo 提交表单
    }
  }
}
<\/script>`
}

export function mobileTemplateV3(json, options) {
    return `<template>
  <form-create-mobile
    driver="elm"
    v-model="formData"
    v-model:api="fapi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create-mobile>
</template>

<script setup>
import {ref} from "vue";
import formCreateMobile from "@eimsnext/form-render/vant";

const option = ref(formCreateMobile.parseJson('${options.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'));
const rule = ref(formCreateMobile.parseJson('${json.replaceAll('\\', '\\\\').replaceAll('\'', '\\\'')}'));
const fapi = ref(null);
const formData = ref({});

const onSubmit =  (formData) => {
  //todo 提交表单
}
<\/script>`
}