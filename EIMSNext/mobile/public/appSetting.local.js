window.appSetting = {
  clientId: "EIMSD160507G0401S171201B1014Next",
  // 6666 是 Chrome unsafe port，浏览器直连报 ERR_UNSAFE_PORT；与 portal 对齐走 https 7777
  identityUrl: "https://localhost:7777",
  // 与 admin 对齐：Service/File.Host 双监听（https 8899/8855 + http 8888/8844），统一走 https
  apiUrl: "https://localhost:8899",
  uploadUrl: "https://localhost:8855",
  tokenKey: "jat",
  httpTimeout: 30000,
  // 独立登录应用（portal）：配置后登录/401/登出统一跳 portal
  portalUrl: "http://localhost:5174",
  allowedRedirectHosts: ["localhost:5174"]
};
