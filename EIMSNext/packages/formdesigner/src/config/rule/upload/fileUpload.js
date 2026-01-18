import { uniqueId } from "@eimsnext/form-render-core";
import { getInjectArg, localeOptions, localeProps } from "../../../utils";

const label = "文件";
const name = "fileupload";

export default {
  menu: "subform",
  icon: "icon-upload",
  label,
  name,
  input: true,
  // easySlots: [{value: 'tip', type: 'text'}],
  event: ["change", "remove", "preview", "error", "progress", "exceed"],
  languageKey: ["clickToUpload"],
  validate: ["array"],
  sfc(rule) {
    rule.type = "elUpload";
    if (!rule.props.listType) {
      rule.props.listType = "picture-card";
    }
    rule._sfc.modelField = "fileList";
  },
  rule({ t }) {
    return {
      type: name,
      field: uniqueId(),
      title: t("com.fileupload.name"),
      info: "",
      $required: false,
      props: {
        action: "/upload",
        uploadType: "image",
        listType: "picture-card",
        multiple: true,
        autoUpload: true,
        accept:
          ".pdf,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        onSuccess:
          "$FNX:const res = $inject.args[0];\nconst file = $inject.args[1];\n\nfile.url = res.value[0].url;\nfile.value = {id:res.value[0].id, name:res.value[0].fileName,url:res.value[0].url};",
      },
    };
  },
  props(_, { t }) {
    return localeProps(t, name + ".props", [
      {
        type: "inputNumber",
        field: "limit",
        props: { min: 0 },
      },
      // {
      //   type: "CheckBoxInput",
      //   field: "readonly",
      //   wrap: { show: false },
      // },
      {
        type: "CheckBoxInput",
        field: "disabled",
        wrap: { show: false },
      },
      // {
      //   type: "select",
      //   field: "listType",
      //   options: localeOptions(t, [
      //     { label: "text", value: "text" },
      //     {
      //       label: "picture",
      //       value: "picture",
      //     },
      //     {
      //       label: "picture-card",
      //       value: "picture-card",
      //     },
      //   ]),
      // },
      // { type: "switch", field: "multiple" },
      // {type: 'input', field: 'name'},
      // {
      //     type: 'PromptInput',
      //     field: 'accept',
      //     props: {
      //         options: [
      //             {
      //                 label: t('props.image'),
      //                 value: 'image/*'
      //             },
      //             {
      //                 label: t('props.document'),
      //                 value: '.pdf,.doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      //             },
      //             {
      //                 label: t('props.video'),
      //                 value: 'video/*'
      //             },
      //             {
      //                 label: t('props.audio'),
      //                 value: 'audio/*'
      //             },
      //         ]
      //     }
      // },
      // {
      //     type: 'input',
      //     field: 'action'
      // },
      // {
      //     type: 'FnInput',
      //     field: 'beforeUpload',
      //     props: {
      //         body: true,
      //         button: true,
      //         fnx: true,
      //         args: [getInjectArg(t)],
      //         name: 'beforeUpload',
      //     }
      // }, {
      //     type: 'FnInput',
      //     field: 'beforeRemove',
      //     props: {
      //         body: true,
      //         button: true,
      //         fnx: true,
      //         args: [getInjectArg(t)],
      //         name: 'beforeRemove',
      //     }
      // }, {
      //     type: 'FnInput',
      //     field: 'onSuccess',
      //     warning: t('com.upload.info'),
      //     props: {
      //         body: true,
      //         button: true,
      //         fnx: true,
      //         args: [getInjectArg(t)],
      //         name: 'onSuccess',
      //     }
      // },
      // {
      //     type: 'TableOptions',
      //     field: 'headers',
      //     props: {
      //         column: [{label: t('props.key'), key: 'label'}, {label: t('props.value'), key: 'value'}],
      //         valueType: 'object'
      //     }
      // }, {
      //     type: 'TableOptions',
      //     field: 'data',
      //     props: {
      //         column: [{label: t('props.key'), key: 'label'}, {label: t('props.value'), key: 'value'}],
      //         valueType: 'object'
      //     }
      // }, {
      //     type: 'switch',
      //     field: 'withCredentials'
      // },
      // {
      //   type: "switch",
      //   field: "autoUpload",
      //   value: true,
      // },
     
    ]);
  },
};
