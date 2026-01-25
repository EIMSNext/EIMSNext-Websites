export default function advanced({ t }) {
  return [
    // {
    //   type: "ComputedConfig",
    //   field: "value",
    //   value: "",
    //   props: {
    //     type: "linkage",
    //     btn: t("computed.value.btn"),
    //     title: t("computed.value.title"),
    //     name: t("computed.value.name"),
    //   },
    //   title: t("computed.value.title"),
    // },
    {
      type: "ComputedConfig",
      field: "$required",
      value: "",
      props: {
        btn: t("computed.required.btn"),
        title: t("computed.required.title"),
        name: t("computed.required.name"),
        invertLabel: t("validate.modes.notRequired"),
        validLabel: t("validate.modes.required"),
      },
      title: t("computed.required.title"),
    },
    {
      type: "ComputedConfig",
      field: "props.disabled",
      value: "",
      props: {
        btn: t("computed.disabled.btn"),
        title: t("computed.disabled.title"),
        name: t("computed.disabled.name"),
        invertLabel: t("props.enable"),
        validLabel: t("props.disabled"),
      },
      title: t("computed.disabled.title"),
    },
    {
      type: "ComputedConfig",
      field: "hidden",
      value: "",
      props: {
        btn: t("computed.hidden.btn"),
        title: t("computed.hidden.title"),
        name: t("computed.hidden.name"),
        invertLabel: t("props.show"),
        validLabel: t("props.hide"),
      },
      title: t("computed.hidden.title"),
    },
  ];
}
