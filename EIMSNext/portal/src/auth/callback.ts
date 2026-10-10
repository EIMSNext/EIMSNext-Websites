import { accessToken, appSetting, buildCallbackUrl } from "@eimsnext/utils";

/**
 * 解析并校验 redirect_url：
 * - 仅接受绝对 http(s) URL 或根相对路径（"/xxx"，天然同源）；其余一律拒绝，防开放重定向
 * - 绝对 URL 同源放行；跨源必须命中 appSetting.allowedRedirectHosts（host:port，大小写不敏感）
 */
export function resolveRedirectUrl(raw: string | null | undefined): URL | undefined {
  const candidate = raw || appSetting.defaultRedirectUrl;
  if (!candidate) return undefined;

  let url: URL;
  if (candidate.startsWith("/")) {
    try {
      return new URL(candidate, window.location.origin);
    } catch {
      return undefined;
    }
  }

  try {
    // 不带 base：非绝对 URL 直接抛错（避免 ":::xxx" 之类畸形串被 base 解析成同源路径）
    url = new URL(candidate);
  } catch {
    return undefined;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  if (url.origin === window.location.origin) return url;

  const allowed = (appSetting.allowedRedirectHosts ?? []).some(
    (host) => host.toLowerCase() === url.host.toLowerCase(),
  );
  return allowed ? url : undefined;
}

/** 登录成功后回跳调用方：token 以 query 参数追加在 hash 之前，保留原 hash */
export function redirectToCallback(target: URL, token: string, expiresIn: number): void {
  window.location.replace(buildCallbackUrl(target, token, expiresIn).toString());
}

/**
 * auth 自身 origin 的会话（有效期内再进 /login 免重复登录）。
 * accessToken.set 落盘时已预留 5 分钟缓冲，此处返回的是剩余有效秒数。
 */
export function currentSession(): { token: string; expiresIn: number } | undefined {
  const token = accessToken.get();
  if (!token) return undefined;

  const expiresAt = Number(localStorage.getItem(`${appSetting.tokenKey}_exp`)) || 0;
  const remaining = Math.floor((expiresAt - Date.now()) / 1000);
  if (remaining <= 0) return undefined;

  return { token, expiresIn: remaining };
}
