// dev：identityUrl 直连本地 Identity（vite dev 下 CORS 由后端 localhost:* 放行；5174 已加进 BuiltInClients 白名单）。
// 注意 merge() 跳过空串，这里不能置 ""。
// 生产/IIS：identityUrl 指向 Identity 服务根，并按需调整 allowedRedirectHosts。
window.appSetting = {
  identityUrl: "https://localhost:7777",
  httpTimeout: 100000,
  // redirect_url 回跳白名单（host:port）：admin dev / mobile dev；同源始终放行
  allowedRedirectHosts: ["localhost:5173", "localhost:3000"],
  // redirect_url 缺失时的默认回跳（如直接打开 /login、登出后重新登录）
  defaultRedirectUrl: "http://localhost:5173/",
};
