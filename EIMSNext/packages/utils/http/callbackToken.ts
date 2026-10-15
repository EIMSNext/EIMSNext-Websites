import { appSetting } from "../appSetting";

const CODE_PARAM = "code";

/** 本站登录授权码前缀：authorizeCode 签发的裸 code 回传调用方前统一加 lg_ */
export const LOCAL_AUTH_CODE_PREFIX = "lg_";

export function withLocalAuthCodePrefix(code: string): string {
  return code.startsWith(LOCAL_AUTH_CODE_PREFIX) ? code : `${LOCAL_AUTH_CODE_PREFIX}${code}`;
}

/** 在回跳 URL 上追加一次性授权码（query 位于 hash 之前，由调用方自行换取并保存 token） */
export function buildCallbackUrl(target: URL, code: string): URL {
  const url = new URL(target.toString());
  url.searchParams.set(CODE_PARAM, code);
  return url;
}

/**
 * 调用方（admin/mobile）启动时取出登录应用回传的授权码，随后立即从地址栏清除；
 * 返回的 code（lg_/wx_/ww_/dd_/fs_ 前缀）交给 IdentityClient.requestWebToken
 * 换取 token 并落盘，后端按前缀完成换取。
 *
 * @returns 授权码；URL 上没有 code 时返回 null
 */
export function consumeCallbackCode(): string | null {
  if (typeof window === "undefined") return null;

  const search = new URLSearchParams(window.location.search);
  const code = search.get(CODE_PARAM);
  if (!code) return null;

  search.delete(CODE_PARAM);
  const query = search.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
  return code;
}

/**
 * 构建独立登录应用（portal）的 login/logout 地址；portalUrl 未配置时返回 undefined
 * （调用方应报告配置错误并终止导航）。
 *
 * redirectPath：字符串 = 以该路径回跳；null = 不带 redirect_url（登出后由 portal
 * 自行落到其登录页，避免 admin↔portal 往返跳转）；不传 = 回跳当前页。
 */
export function buildPortalAuthUrl(
  page: "login" | "logout",
  options?: { redirectPath?: string | null; reason?: string },
): string | undefined {
  if (!appSetting.portalUrl) return undefined;

  const redirectPath = options?.redirectPath;
  const current =
    redirectPath === null
      ? ""
      : typeof window === "undefined"
        ? ""
        : window.location.origin + (redirectPath ?? window.location.pathname + window.location.search);

  const params = new URLSearchParams();
  if (current) params.set("redirect_url", current);
  if (options?.reason) params.set("reason", options.reason);

  const query = params.toString();
  return `${appSetting.portalUrl.replace(/\/+$/, "")}/${page}${query ? `?${query}` : ""}`;
}

/**
 * 登出后整页跳 portal 失效 SSO 会话（portal 失效自身 token 后落到其登录页）。
 * portalUrl 未配置时返回 false，调用方应报告配置错误。
 */
export function redirectToPortalLogout(): boolean {
  const portalLogout = buildPortalAuthUrl("logout", { redirectPath: null });
  if (!portalLogout) return false;

  if (typeof window !== "undefined") window.location.replace(portalLogout);
  return true;
}
