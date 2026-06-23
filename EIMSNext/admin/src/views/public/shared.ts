import { defineComponent, h, ref, type Ref, type VNode } from "vue";
import { AxiosHeaders } from "axios";
import { ElEmpty, ElButton, ElIcon } from "element-plus";
import { FullScreen, Printer } from "@element-plus/icons-vue";
import qs from "qs";
import {
  http,
  ContentType,
  ODataMetadata,
  type HttpRequestConfig,
} from "@eimsnext/utils";
import { PublicScope } from "@eimsnext/models";
import { useI18n } from "vue-i18n";

// =============================================================
// 1. 业务异常
// =============================================================

export class AccessCodeInvalidError extends Error {
  constructor(message = "访问密码错误") {
    super(message);
    this.name = "AccessCodeInvalidError";
  }
}

// =============================================================
// 2. 404 / 找不到组件
// =============================================================

export const PublicNotFound = defineComponent({
  name: "PublicNotFound",
  props: {
    description: String,
  },
  setup(props) {
    const { t } = useI18n();
    return () =>
      h("div", { class: "public-not-found" }, [
        h(ElEmpty, { description: props.description || t("admin.public.notFound") }),
      ]);
  },
});

// =============================================================
// 3. 页面级 token 隔离的 HTTP 客户端
//    publicHttp.token 是组件实例的 ref，组件卸载后被 GC。
//    全局 accessToken 完全不感知，绝不污染系统正常使用。
//    跨 tab 场景：每个 tab 独立 JS 上下文，usePublicHttp() 是新实例，互不影响。
// =============================================================

const API_BASE = "/api/v1";
const ODATA_BASE = "/odata/v1";

function buildApiUrl(path: string, params?: any): string {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  if (!params) return url;
  const q = typeof params === "string" ? params : qs.stringify(params, { encode: false });
  if (!q) return url;
  return url + (url.includes("?") ? "&" : "?") + (q.startsWith("?") ? q.slice(1) : q);
}

function buildODataUrl(model: string, suffix: string, query?: any): string {
  const url = `${ODATA_BASE}/${model}/${suffix}`;
  if (!query) return url;
  const q = typeof query === "string" ? query : qs.stringify(query, { encode: false });
  if (!q) return url;
  return url + (url.includes("?") ? "&" : "?") + (q.startsWith("?") ? q.slice(1) : q);
}

export interface PublicHttp {
  token: Ref<string | null>;
  api: {
    get: <T = any>(path: string, params?: any) => Promise<T>;
    post: <T = any>(path: string, data?: any, contentType?: ContentType) => Promise<T>;
    put: <T = any>(path: string, data?: any) => Promise<T>;
    delete: <T = any>(path: string, data?: any) => Promise<T>;
  };
  odata: {
    get: <T = any>(model: string, id: string, query?: any) => Promise<T>;
    query: <T = any>(model: string, query?: any) => Promise<T[]>;
    count: (model: string, query?: any) => Promise<number>;
  };
}

export function usePublicHttp(): PublicHttp {
  const token = ref<string | null>(null);
  const hr = http.httpRequest;

  function withAuth<T>(build: (cfg: HttpRequestConfig) => Promise<T>): Promise<T> {
    if (!token.value) {
      return Promise.reject(new Error("Public token not initialized"));
    }
    return build({
      headers: new AxiosHeaders(),
      withToken: false,
      token: token.value,
    });
  }

  return {
    token,
    api: {
      get: <T = any>(path: string, params?: any) =>
        withAuth<T>((cfg) => hr.get<T>({ ...cfg, url: buildApiUrl(path, params) })),
      post: <T = any>(path: string, data?: any, contentType: ContentType = ContentType.JSON) => {
        const headers = new AxiosHeaders();
        headers.setContentType(contentType);
        return withAuth<T>((cfg) => hr.post<T>({ ...cfg, url: buildApiUrl(path), data, headers }));
      },
      put: <T = any>(path: string, data?: any) =>
        withAuth<T>((cfg) =>
          hr.put<T>({ ...cfg, url: buildApiUrl(path), data, headers: new AxiosHeaders() }),
        ),
      delete: <T = any>(path: string, data?: any) =>
        withAuth<T>((cfg) =>
          hr.delete<T>({ ...cfg, url: buildApiUrl(path), data, headers: new AxiosHeaders() }),
        ),
    },
    odata: {
      get: <T = any>(model: string, id: string, query?: any) => {
        const headers = new AxiosHeaders();
        headers.setAccept(ODataMetadata.None);
        return withAuth<T>((cfg) =>
          hr.get<T>({ ...cfg, url: buildODataUrl(model, id, query), headers }),
        );
      },
      query: <T = any>(model: string, query?: any) => {
        const headers = new AxiosHeaders();
        headers.setAccept(ODataMetadata.None);
        headers.setContentType(ContentType.TEXT_PLAIN, true);
        const data = query
          ? typeof query === "string"
            ? query
            : qs.stringify(query, { encode: false })
          : "";
        return withAuth<{ value: T[] }>((cfg) =>
          hr.post<{ value: T[] }>({
            ...cfg,
            url: buildODataUrl(model, "$query"),
            data,
            headers,
          }),
        ).then((r) => r.value);
      },
      count: (model: string, query?: any) => {
        const headers = new AxiosHeaders();
        headers.setAccept(ODataMetadata.None);
        headers.setContentType(ContentType.TEXT_PLAIN, true);
        const data = query
          ? typeof query === "string"
            ? query
            : qs.stringify(query, { encode: false })
          : "";
        return withAuth<number>((cfg) =>
          hr.post<number>({
            ...cfg,
            url: buildODataUrl(model, "$count"),
            data,
            headers,
          }),
        );
      },
    },
  };
}

// =============================================================
// 4. bootstrapWithToken
//    申请 public token 并写入 publicHttp 的本地 ref。
//    401 → 抛 AccessCodeInvalidError
// =============================================================

export async function bootstrapWithToken(
  publicHttp: PublicHttp,
  targetId: string,
  scope: PublicScope,
  accessCode?: string,
): Promise<void> {
  try {
    const tokenResult = (await http.auth.requestPublicToken(
      targetId,
      accessCode,
      scope,
    )) as { access_token: string; expires_in: number };
    publicHttp.token.value = tokenResult.access_token;
  } catch (err: any) {
    if (err instanceof AccessCodeInvalidError) throw err;
    if (err?.name === "PublicTokenError" || err?.response?.status === 401) {
      throw new AccessCodeInvalidError();
    }
    throw err;
  }
}

// =============================================================
// 5. accessCode 错误友好提示
//    AuthClient 已经把 401 转成 PublicTokenError，这里再转成 AccessCodeInvalidError。
// =============================================================

export function toAccessCodeError(err: any): AccessCodeInvalidError | null {
  if (err instanceof AccessCodeInvalidError) return err;
  if (err?.name === "PublicTokenError" || err?.response?.status === 401) {
    return new AccessCodeInvalidError();
  }
  return null;
}

// =============================================================
// 6. 打印 / 全屏 toolbar 渲染器
//    4 个页面各自调用，按需修改/扩展。
// =============================================================

export function renderPrintFullscreenToolbar(): VNode {
  return h("div", { class: "public-toolbar" }, [
    h(
      ElButton,
      { circle: true, size: "large", onClick: () => window.print() },
      { default: () => h(ElIcon, null, { default: () => h(Printer) }) },
    ),
    h(
      ElButton,
      { circle: true, size: "large", onClick: () => toggleFullscreen() },
      { default: () => h(ElIcon, null, { default: () => h(FullScreen) }) },
    ),
  ]);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}
