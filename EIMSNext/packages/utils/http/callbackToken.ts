import accessToken from "./token";

const TOKEN_PARAM = "access_token";
const EXPIRES_PARAM = "expires_in";

/** 在回跳 URL 上追加 token（query 位于 hash 之前，不进服务器日志） */
export function buildCallbackUrl(target: URL, token: string, expiresIn: number): URL {
  const url = new URL(target.toString());
  url.searchParams.set(TOKEN_PARAM, token);
  url.searchParams.set(EXPIRES_PARAM, String(Math.max(1, Math.floor(expiresIn))));
  return url;
}

/**
 * 调用方（admin/mobile）启动时消费登录应用回传的 token：
 * 落盘到本 origin 的 localStorage，随后立即从地址栏清除凭据参数。
 *
 * @returns 是否消费到了 token
 */
export function consumeCallbackToken(): boolean {
  if (typeof window === "undefined") return false;

  const search = new URLSearchParams(window.location.search);
  const token = search.get(TOKEN_PARAM);
  if (!token) return false;

  const expiresIn = Number(search.get(EXPIRES_PARAM)) || 0;
  accessToken.set(token, expiresIn);

  search.delete(TOKEN_PARAM);
  search.delete(EXPIRES_PARAM);
  const query = search.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
  return true;
}
