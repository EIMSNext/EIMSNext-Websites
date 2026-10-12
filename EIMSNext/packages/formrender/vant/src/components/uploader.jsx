import { defineComponent, getCurrentInstance, ref, toRef, watch } from "vue";
import { toArray } from "@eimsnext/form-render-core";
import { appSetting, compressImage, getFileFullUrl, isCompressibleImage } from "@eimsnext/utils";

const NAME = "fcUploader";

function parseFile(file, i) {
  if (typeof file === "object") {
    return file;
  }

  return {
    url: file,
    value: file,
    is_string: true,
    name: getFileName(file),
    uid: i,
  };
}
function parseUpload(file) {
  const value = file.value ?? file;
  const url = typeof value === "string" ? value : value?.url || file.url;
  return { ...file, url: getFileFullUrl(url), file, value };
}

function normalizeStoredValue(file) {
  if (typeof file === "string") return { name: getFileName(file), url: file };
  const url = file?.url || file?.savePath;
  return {
    ...(file?.id ? { id: file.id } : {}),
    name: file?.name || file?.fileName || getFileName(url || ""),
    url,
    ...(file?.thumbUrl || file?.thumbPath ? { thumbUrl: file.thumbUrl || file.thumbPath } : {}),
    ...(file?.fileSize !== undefined ? { fileSize: file.fileSize } : {}),
  };
}

function getFileName(file) {
  return ("" + file).split("/").pop();
}

function toStoredFileValue(value) {
  if (typeof value === "string") {
    const baseUrl = appSetting.uploadUrl.replace(/\/+$/, "");
    return baseUrl && value.startsWith(`${baseUrl}/`) ? value.slice(baseUrl.length + 1) : value;
  }

  if (value && typeof value === "object" && value.url) {
    return { ...normalizeStoredValue(value), url: toStoredFileValue(value.url) };
  }

  return value;
}

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  props: {
    formCreateInject: Object,
    modelValue: [Array, String, Object],
    afterRead: Function,
    action: String,
    headers: Object,
    method: String,
    data: Object,
    uploadName: String,
    onSuccess: Function,
    onError: Function,
    maxCount: Number,
  },
  emits: ["update:modelValue", "delete"],
  setup(props, _) {
    const instance = getCurrentInstance();
    const afterRead = toRef(props, "afterRead");
    const modelValue = toRef(props, "modelValue", []);

    /**
     * 文案取自应用级 i18n（key 与 @eimsnext/components 一致，内容来自 @eimsnext/locale 的 comp.*）。
     * 这里直接读 app 注入的 $t：不能用 useI18n()，宿主未安装 i18n 时它会直接抛异常；
     * 也不能用 formCreateInject.t，那是 form-create 自己的语言包（内置只有 required/validate）。
     * 宿主没装 i18n 时返回空串，由调用处的中文兜底接上。
     */
    const t = (key, params) => {
      const translate = instance?.appContext?.config?.globalProperties?.$t;
      if (typeof translate !== "function") return "";
      return params === undefined ? translate(key) : translate(key, params);
    };

    const fileList = ref(
      toArray(modelValue.value).map(parseFile).map(parseUpload)
    );

    watch(
      () => modelValue.value,
      (n) => {
        fileList.value = toArray(n).map(parseFile).map(parseUpload);
      }
    );

    /**
     * 规则上的 uploadType / accept / compress 等都没在组件里声明，落在 attrs 上。
     * 判定口径与 PC 端 upload 组件保持一致，避免两端行为不一致。
     */
    const fieldAttrs = () => _.attrs;

    /** 是否图片字段：优先看 uploadType，其次按 accept 推断。 */
    const isImageField = () => {
      const attrs = fieldAttrs();
      if (attrs.uploadType === "image" || attrs.uploadType === "file") {
        return attrs.uploadType === "image";
      }
      return String(attrs.accept || "").includes("image");
    };

    const compressOptions = () => {
      const attrs = fieldAttrs();
      return {
        enabled: attrs.compress !== false,
        maxEdge: Number(attrs.imageMaxEdge) || undefined,
        quality: Number(attrs.imageQuality) || undefined,
      };
    };

    /**
     * 上传前准备文件：图片字段先做本地压缩，其余情况原样返回。
     * 压缩失败一律回退原文件，绝不能因为压缩把上传卡住。
     */
    const prepareUploadFile = (file) => {
      const raw = file?.file;
      const options = compressOptions();
      if (!raw || !options.enabled || !isImageField() || !isCompressibleImage(raw)) {
        return Promise.resolve(raw);
      }
      return compressImage(raw, options).catch(() => raw);
    };

    /**
     * 规则配的是 limit（Element Plus 口径），而 Vant 的数量上限叫 max-count，
     * 这里做一次映射；0 / 未配置视为不限制。
     */
    const resolvedMaxCount = () => {
      const explicit = Number(props.maxCount);
      if (Number.isFinite(explicit) && explicit > 0) return explicit;
      const limit = Number(_.attrs.limit);
      if (Number.isFinite(limit) && limit > 0) return limit;
      return Infinity;
    };

    const uploadValue = () => {
      // 还有文件在传输中就暂不回写：回写会让 modelValue 变化，回流的 watch 会用
      // 「只有已完成项」的列表重建 fileList，把在途 item 挤出去，它们的值就丢了。
      // 守卫放在这里而不是 uploadItems，是为了同时覆盖「上传中删除 item」这条路径
      //（onDelete 也会回写，那时同样不能让在途 item 被置换掉）。
      if (fileList.value.some((v) => v && v.status === "uploading")) return;
      let files = fileList.value
        .map((v) => toStoredFileValue(v.value ?? v.url))
        .filter((url) => url !== undefined);
      _.emit(
        "update:modelValue",
        props.maxCount === 1 ? files[0] || "" : files
      );
    };

    /** 单个文件：压缩 → 上传 → 回写自身状态（表单值统一由 uploadItems 回写）。 */
    const uploadItem = (item) => {
      item.status = "uploading";
      return prepareUploadFile(item)
        .then((upload) => {
          // 用副本，避免并发上传时多个请求共享并互相覆盖同一个 data 对象
          const data = { ...(props.data || {}) };
          data[props.uploadName || "file"] = upload || item.file;
          return props.formCreateInject.api.fetch({
            action: props.action,
            dataType: "formData",
            source: "upload",
            headers: props.headers || {},
            method: props.method || "post",
            data,
          });
        })
        .then((res) => {
          item.status = "success";
          const uploaded = res?.value?.[0] || res?.data?.[0];
          if (uploaded) {
            const value = {
              ...normalizeStoredValue(uploaded),
            };
            item.value = value;
            item.url = getFileFullUrl(value.url);
          }
          props.onSuccess && props.onSuccess(res, item);
        })
        .catch((e) => {
          item.status = "failed";
          item.message = t("comp.upload.uploadFailed") || "上传失败";
          props.onError && props.onError(e, item);
        });
    };

    /**
     * 整批上传：全部 settle 之后只回写一次表单值。
     *
     * 不能每个 item 各自回写 —— 那样 modelValue 会先变成「只有最先完成的那个」，
     * 回流的 watch 会用这批新对象重建 fileList，把仍在传输中的 item 挤出去，
     * 它们随后写回的 value 就永远进不了表单值了。
     */
    const uploadItems = (items) =>
      Promise.all(items.map((item) => uploadItem(item))).then(() => uploadValue());

    return {
      fileList,
      modelValue,
      resolvedMaxCount,
      onDelete(file) {
        uploadValue();
        _.emit("delete", file);
      },
      uploadFile(file) {
        // 规则用 afterRead 自己接管上传时，保持 Vant 的原始契约（原样透传，可能是数组）
        if (afterRead.value) {
          return afterRead.value(file);
        }

        // Vant 只在本轮选了 1 个文件时给单个 item，多选时给的是整个数组
        //（判据是「本轮选中几个」，与 multiple 开关无关），所以这里统一按数组处理，
        // 否则 items.file 为 undefined，会把字面量 "undefined" 当文件传给后端。
        return uploadItems(Array.isArray(file) ? file : [file]);
      },
    };
  },
  render() {
    return (
      <van-uploader
        {...this.$attrs}
        model-value={this.fileList}
        maxCount={this.resolvedMaxCount()}
        onUpdate:model-value={(v) => (this.fileList = v)}
        afterRead={this.uploadFile}
        onDelete={this.onDelete}
      />
    );
  },
});
