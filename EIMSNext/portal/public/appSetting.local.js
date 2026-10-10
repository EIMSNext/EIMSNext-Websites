// dev：identityUrl 置空 → 相对路径走 vite proxy（见 vite.config.ts），后端无需为 portal 端口配 CORS。
// 生产/IIS：改为绝对地址（identityUrl 指向 Identity 服务根），并按需调整 allowedRedirectHosts。
window.appSetting = {
  identityUrl: "",
  apiUrl: "",
  uploadUrl: "",
  httpTimeout: 100000,
  // redirect_url 回跳白名单（host:port）：admin dev / mobile dev；同源始终放行
  allowedRedirectHosts: ["localhost:5173", "localhost:3000"],
  // redirect_url 缺失时的默认回跳（如直接打开 /portal/login）
  defaultRedirectUrl: "https://localhost:5173/",
};
