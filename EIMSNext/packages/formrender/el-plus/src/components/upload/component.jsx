import { toArray } from "@eimsnext/form-render-core";
import { compressImage, getFileFullUrl, getFileKind, isCompressibleImage } from "@eimsnext/utils";
import "./style.css";
import { defineComponent } from "vue";
import IconUpload from "./IconUpload.vue";

function parseFile(file, i) {
  if (typeof file === "object") {
    return file;
  }
  return {
    url: file,
    is_string: true,
    name: getFileName(file),
    uid: i,
  };
}

function parseUpload(file) {
  const value = normalizeStoredValue(file);
  return { ...file, ...value, url: getFileFullUrl(value.url), file, value };
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

/** 默认体积上限（仅用于文案展示，本组件不做大小校验）。 */
const DEFAULT_MAX_SIZE_MB = { file: 500, image: 20 };

const NAME = "fcUpload";

export default defineComponent({
  name: NAME,
  inheritAttrs: false,
  formCreateParser: {
    toFormValue(value) {
      return toArray(value);
    },
    toValue(formValue, ctx) {
      return ctx.prop.props.limit === 1 ? formValue[0] || "" : formValue;
    },
  },
  props: {
    previewMask: undefined,
    onPreview: Function,
    httpRequest: Function,
    modalTitle: String,
    listType: String,
    formCreateInject: Object,
    modelValue: [Array, String, Object],
  },
  emits: ["update:modelValue", "change", "remove", "fc.el"],
  data() {
    return {
      previewVisible: false,
      previewImage: "",
      fileList: [],
      /** 正在本地压缩的 rawFile.uid 集合，用于展示「压缩中」。 */
      compressing: {},
    };
  },
  computed: {
    /** 皮肤：图片走卡片网格，附件走文本行。 */
    skin() {
      const uploadType = this.$attrs.uploadType;
      if (uploadType === "image" || uploadType === "file") return uploadType;
      return String(this.$attrs.accept || "").includes("image") ? "image" : "file";
    },
    isImage() {
      return this.skin === "image";
    },
    isDisabled() {
      return !!this.$attrs.disabled;
    },
    limit() {
      const value = Number(this.$attrs.limit);
      return Number.isFinite(value) && value > 0 ? value : 0;
    },
    exceeded() {
      return this.limit > 0 && this.limit <= toArray(this.modelValue).length;
    },
    /** 图片压缩开关：图片默认开启，附件不涉及。 */
    compressEnabled() {
      if (!this.isImage) return false;
      return this.$attrs.compress !== false;
    },
    compressOptions() {
      return {
        maxEdge: Number(this.$attrs.imageMaxEdge) || undefined,
        quality: Number(this.$attrs.imageQuality) || undefined,
      };
    },
    sizeText() {
      const configured = Number(this.$attrs.maxSizeMb);
      const mb = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_MAX_SIZE_MB[this.skin];
      return `${mb}MB`;
    },
  },
  created() {
    this.fileList = toArray(this.modelValue).map(parseFile).map(parseUpload);
  },
  watch: {
    modelValue(n) {
      this.fileList = toArray(n).map(parseFile).map(parseUpload);
    },
  },
  methods: {
    t(key, params) {
      // 文案走应用级 i18n（key 与 @eimsnext/components 一致，内容来自 @eimsnext/locale 的 comp.*）。
      // 不能用 formCreateInject.t：form-create 的 t 只在「form 的 locale / options.language /
      // 内置 baseLanguage」里找文案，而内置只有 required/validate，这些文案会被解析成空串。
      const translate = this.$t;
      if (typeof translate !== "function") return key;
      return params === undefined ? translate(key) : translate(key, params);
    },
    handlePreview(file) {
      if (this.onPreview) {
        this.onPreview(...arguments);
        return;
      }
      if (this.isImage) {
        this.previewImage = file.url;
        this.previewVisible = true;
      } else {
        window.open(file.url);
      }
    },
    /**
     * 只回写「已成功上传且拿到服务端返回值」的文件。
     * 排队中/上传中/失败的文件没有 value，不能进入表单值（否则会把临时 blob 地址写进数据）。
     *
     * 但「等全部文件落地再回写」这一步同样重要：回写会让 modelValue 变化，
     * 回流的 watch 会用这份「只有已完成项」的列表重建 this.fileList，EP 把它当作
     * fileList 的新值（useVModel passive 模式会直接覆盖内部列表），在途文件随即被挤出；
     * 之后 EP 靠 uid 找不到它们，handleSuccess 里 getFile() 返回 undefined 直接 return，
     * 它们的 value 就永远进不了表单值了（文件却已经传到服务器）。多选上传时必踩。
     */
    update(fileList) {
      const list = toArray(fileList);
      if (list.some((item) => item && (item.status === "ready" || item.status === "uploading"))) {
        return;
      }
      const files = list
        .filter((item) => item && item.status === "success" && item.value)
        .map((item) => normalizeStoredValue(item.value))
        .filter((item) => !!item.url);
      this.$emit("update:modelValue", files);
    },
    handleCancel() {
      this.previewVisible = false;
    },
    handleChange(file, fileList) {
      this.$emit("change", ...arguments);
      if (file.status !== "success") return;
      const uploaded = file.response?.value?.[0] || file.response?.data?.[0];
      if (uploaded) {
        const value = normalizeStoredValue(uploaded);
        file.value = value;
        file.url = getFileFullUrl(value.url);
        if (value.thumbUrl) file.thumbUrl = getFileFullUrl(value.thumbUrl);
      }
      this.update(fileList);
    },
    handleRemove(file, fileList) {
      this.$emit("remove", ...arguments);
      this.update(fileList);
    },
    /**
     * EP 约定：httpRequest 返回 Promise 时它会接管 onSuccess/onError。
     * 而底层 fetch 是自带回调的 XHR，所以这里必须返回 undefined ——
     * 压缩完成后再发起真正的请求，绝不能让 EP 把「压缩的 Promise」当成上传结果。
     */
    doHttpRequest(option) {
      const file = option?.file;
      if (file && this.compressEnabled && isCompressibleImage(file)) {
        const uid = file.uid;
        this.setCompressing(uid, true);
        compressImage(file, this.compressOptions)
          .then((compressed) => {
            if (compressed && compressed !== file) option.file = compressed;
          })
          .catch(() => {})
          .then(() => {
            this.setCompressing(uid, false);
            this.sendRequest(option);
          });
        return;
      }
      this.sendRequest(option);
    },
    sendRequest(option) {
      if (this.httpRequest) {
        this.httpRequest(option);
      } else {
        option.source = "upload";
        this.formCreateInject.api.fetch(option);
      }
    },
    setCompressing(uid, value) {
      if (uid === undefined || uid === null) return;
      const next = { ...this.compressing };
      if (value) next[uid] = true;
      else delete next[uid];
      this.compressing = next;
    },
    isCompressing(file) {
      return !!this.compressing[file?.uid];
    },
    /** 粘贴上传：仅在剪贴板里真的有文件时接管，避免与设计器的「粘贴规则」冲突。 */
    async onPaste(event) {
      if (this.isDisabled) return;
      const files = Array.from(event.clipboardData?.files || []);
      if (files.length === 0) return;
      const upload = this.$refs.upload;
      if (!upload) return;
      const remaining = this.limit > 0 ? this.limit - toArray(this.modelValue).length : Infinity;
      if (files.length > remaining) {
        const onExceed = this.$attrs.onExceed;
        if (typeof onExceed === "function") onExceed(files, this.fileList);
        return;
      }
      files.forEach((file) => upload.handleStart(file));
      upload.submit();
    },
    renderTrigger() {
      const selectText = this.t("comp.upload.select");
      const normalHint = this.isImage
        ? this.t("comp.upload.imageHint", [this.sizeText])
        : this.t("comp.upload.fileHint", [this.sizeText]);
      const entry = this.$slots.trigger?.() || this.$slots.default?.();
      if (entry) return entry;

      return (
        <div class="_fc-upload__trigger">
          {this.isDisabled ? null : <span class="_fc-upload__select">{selectText}</span>}
          <span class="_fc-upload__hint">
            <span class="_fc-upload__hint-normal">{normalHint}</span>
            <span class="_fc-upload__hint-drag">{this.t("comp.upload.dragging")}</span>
          </span>
        </div>
      );
    },
    renderFileItem(file) {
      const kind = getFileKind(file.name);
      const uploading = file.status === "uploading";
      return (
        <div class="_fc-upload__row">
          <span class={["_fc-upload__badge", `is-${kind.tone}`]}>{kind.label}</span>
          <div class="_fc-upload__meta">
            <span class="_fc-upload__name" title={file.name}>
              {file.name}
            </span>
            {this.isCompressing(file) ? <span class="_fc-upload__state">{this.t("comp.upload.compressing")}</span> : null}
            {uploading ? (
              <span class="_fc-upload__bar">
                <i style={{ width: `${Math.max(0, Math.min(100, Number(file.percentage) || 0))}%` }} />
              </span>
            ) : null}
            {file.status === "fail" ? <span class="_fc-upload__state is-error">{this.t("comp.upload.uploadFailed")}</span> : null}
          </div>
        </div>
      );
    },
    renderImageItem(file) {
      const uploading = file.status === "uploading";
      const percent = Math.max(0, Math.min(100, Math.round(Number(file.percentage) || 0)));
      return (
        <div class="_fc-upload__card">
          <div class="_fc-upload__thumb">
            {file.url ? <img src={file.url} alt="" /> : <IconUpload />}
            {this.isCompressing(file) ? <div class="_fc-upload__mask">{this.t("comp.upload.compressing")}</div> : null}
            {uploading ? (
              <div class="_fc-upload__mask">
                <span class="_fc-upload__percent">{percent}%</span>
                <span class="_fc-upload__bar">
                  <i style={{ width: `${percent}%` }} />
                </span>
              </div>
            ) : null}
            {file.status === "fail" ? <div class="_fc-upload__mask is-error">{this.t("comp.upload.uploadFailed")}</div> : null}
          </div>
          <div class="_fc-upload__caption" title={file.name}>
            {file.name}
          </div>
        </div>
      );
    },
  },
  render() {
    const upload = this.$refs.upload;
    void upload;
    return (
      <div class={["_fc-upload", this.isImage ? "_fc-upload--image" : "_fc-upload--file"]} onPaste={this.onPaste}>
        <ElUpload
          ref="upload"
          {...this.$attrs}
          class={[this.$attrs.class, { "_fc-exceed": this.exceeded }]}
          // 始终走 drag：EP 只在 drag 模式下渲染 `.el-upload-dragger` 外壳，
          // 而虚线框样式挂在这个外壳上；禁用时 EP 自己会拦掉拖放与点击。
          drag
          showFileList
          listType={this.isImage ? "picture-card" : "text"}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          onRemove={this.handleRemove}
          httpRequest={this.doHttpRequest}
          fileList={this.fileList}
          v-slots={{
            trigger: () => this.renderTrigger(),
            file: ({ file }) => (this.isImage ? this.renderImageItem(file) : this.renderFileItem(file)),
            tip: this.$slots.tip ? () => this.$slots.tip() : undefined,
          }}
        />
        <ElDialog
          appendToBody={true}
          modal={this.previewMask}
          title={this.modalTitle}
          modelValue={this.previewVisible}
          onClose={this.handleCancel}
        >
          <img style="width: 100%" src={this.previewImage} />
        </ElDialog>
      </div>
    );
  },
  mounted() {
    this.$emit("fc.el", this.$refs.upload);
  },
});
