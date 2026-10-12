import assert from "node:assert/strict";
import { buildCallbackUrl } from "@eimsnext/utils";
import { resolveRedirectUrl } from "../src/auth/callback";
import { appSetting } from "@eimsnext/utils";

// ---- window/location 桩（resolveRedirectUrl 读取 origin）----
const fakeWindow: any = { location: new URL("https://auth.example.com/auth/login") };
(globalThis as any).window = fakeWindow;

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`PASS ${name}`);
}

// ---------- buildCallbackUrl：token 进 query、保留原 query 与 hash ----------
check("buildCallbackUrl appends token before hash, keeps existing query/hash", () => {
  const target = new URL("https://admin.example.com/?foo=1#/workbench?tab=2");
  const url = buildCallbackUrl(target, "tok_123", 3600);
  assert.equal(url.searchParams.get("access_token"), "tok_123");
  assert.equal(url.searchParams.get("expires_in"), "3600");
  assert.equal(url.searchParams.get("foo"), "1");
  assert.equal(url.hash, "#/workbench?tab=2");
  // query 必须在 hash 之前（URL 规范本身保证）
  assert.ok(url.toString().indexOf("?foo=1&access_token=") === 0 || url.toString().includes("access_token=tok_123&expires_in=3600#/workbench"));
});

check("buildCallbackUrl clamps non-positive expires_in", () => {
  const url = buildCallbackUrl(new URL("https://a.example.com/"), "t", 0);
  assert.equal(url.searchParams.get("expires_in"), "1");
});

// ---------- resolveRedirectUrl：同源放行 / 白名单放行 / 其余拒绝 ----------
check("same-origin redirect allowed without whitelist", () => {
  appSetting.allowedRedirectHosts = [];
  const url = resolveRedirectUrl("https://auth.example.com/auth/somepage");
  assert.ok(url);
});

check("cross-origin allowed when host in whitelist", () => {
  appSetting.allowedRedirectHosts = ["admin.example.com", "localhost:5173"];
  const url = resolveRedirectUrl("https://admin.example.com/#/workbench");
  assert.ok(url);
  assert.equal(url!.host, "admin.example.com");
});

check("whitelist host match is case-insensitive", () => {
  appSetting.allowedRedirectHosts = ["ADMIN.Example.com"];
  assert.ok(resolveRedirectUrl("https://admin.example.com/"));
});

check("cross-origin rejected when host not in whitelist", () => {
  appSetting.allowedRedirectHosts = ["admin.example.com"];
  assert.equal(resolveRedirectUrl("https://evil.example.com/steal"), undefined);
});

check("non-http(s) protocol rejected", () => {
  appSetting.allowedRedirectHosts = ["admin.example.com"];
  assert.equal(resolveRedirectUrl("javascript:alert(1)"), undefined);
  assert.equal(resolveRedirectUrl("file:///etc/passwd"), undefined);
});

check("invalid URL rejected", () => {
  assert.equal(resolveRedirectUrl(":::not-a-url"), undefined);
  assert.equal(resolveRedirectUrl("not a url"), undefined);
});

check("root-relative path resolves same-origin", () => {
  const url = resolveRedirectUrl("/auth/somepage?x=1");
  assert.ok(url);
  assert.equal(url!.origin, "https://auth.example.com");
});

check("missing candidate uses defaultRedirectUrl", () => {
  appSetting.allowedRedirectHosts = ["admin.example.com"];
  appSetting.defaultRedirectUrl = "https://admin.example.com/";
  const url = resolveRedirectUrl(undefined);
  assert.ok(url);
  assert.equal(url!.host, "admin.example.com");
  appSetting.defaultRedirectUrl = "";
});

check("missing candidate and no default rejected", () => {
  assert.equal(resolveRedirectUrl(undefined), undefined);
  assert.equal(resolveRedirectUrl(""), undefined);
});

console.log(`\n${passed} checks passed`);
