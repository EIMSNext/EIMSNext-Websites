<template>
  <div class="settings-page">
    <template v-if="kind === 'version'">
      <h2>当前版本</h2>
      <section class="version-grid">
        <div class="version-card current"><strong>企业版</strong><span>有效期：2025-06-19-2027-06-26</span><div><el-button type="primary">咨询购买</el-button><el-button>上传凭证</el-button></div></div>
        <div class="version-card coins"><strong>-0.08 <small>（1 云币 = ￥1）</small></strong><div><el-button type="primary">充值</el-button><el-button>支付设置</el-button><el-button>消耗统计</el-button><el-button>使用日志</el-button></div></div>
      </section>
    </template>
    <template v-else-if="kind === 'enterprise'">
      <h2>基础信息</h2><div class="info-row"><b>企业名称</b><span>北京志臻互联网科技有限公司石家庄长安分公司</span><a>修改</a></div>
      <div class="info-row"><b>账号模式</b><el-tag>公共模式</el-tag><span class="hint">如需绑定第三方平台，<a>点击咨询</a></span></div>
      <div class="tenant"><span>租户 ID</span><code>5f029da37c98a00006dcf12e</code><el-button link>复制</el-button></div>
    </template>
    <template v-else-if="kind === 'enterprise-settings'">
      <h2>企业文化</h2><SettingRow label="自定义登录页"><el-switch v-model="login" /><el-button>设置</el-button><span>自定义登录页 Logo、展示图及登录方式等，对企业账号 URL 和发布给成员的内链生效。</span></SettingRow><SettingRow label="企业风格"><el-switch /><span>自定义企业风格。<a>了解更多</a></span></SettingRow><hr /><h2>企业协作</h2><SettingRow label="提醒屏蔽"><el-button>设置</el-button><span>可以设置成员是否接收应用内相关提醒。<a>了解更多</a></span></SettingRow><SettingRow label="系统语言"><el-select model-value="简体中文"><el-option label="简体中文" value="简体中文" /></el-select><span>设置系统的默认显示语言。<a>了解更多</a></span></SettingRow><SettingRow label="系统时区"><span>跟随成员设备实时区</span><a>修改</a><span>系统内所有的时间都基于系统时区显示并存储。</span></SettingRow>
    </template>
    <template v-else-if="kind === 'product-settings'"><h2>产品样式</h2><SettingRow label="自定义工作台"><el-button>设置</el-button><span>配置工作台默认布局，自定义内容优先级和入口。</span></SettingRow></template>
    <template v-else><h2>系统设置</h2><div class="empty">暂无内容</div></template>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import SettingRow from "./SettingRow.vue";
const route = useRoute(); const login = ref(true);
const kind = computed(() => String(route.path.split("/").pop()));
</script>
<style scoped lang="scss">
.settings-page{background:var(--et-bg-overlay,var(--et-bg-page));min-height:100%;padding:4px 16px;color:var(--et-text-color-primary)}h2{font-size:17px;margin:14px 0 22px;border-left:4px solid var(--et-color-primary);padding-left:10px}.version-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.version-card{padding:26px 22px;height:120px;border-radius:10px;display:flex;flex-direction:column;justify-content:space-between}.version-card.current{background:color-mix(in srgb,var(--et-color-primary) 8%,var(--et-bg-color));}.version-card.coins{background:color-mix(in srgb,#f59e0b 10%,var(--et-bg-color))}.version-card strong{font-size:25px}.version-card small{font-size:14px;font-weight:400}.version-card span{align-self:flex-end;color:var(--et-text-secondary)}.info-row{display:flex;align-items:center;gap:18px;margin:24px 16px}.info-row b{width:160px}.info-row a,a{color:var(--et-color-primary);cursor:pointer}.hint{margin-left:auto;color:var(--et-text-secondary)}.tenant{border:1px solid var(--el-border-color);padding:20px;border-radius:6px;display:flex;gap:20px;margin:16px 176px}.tenant span{color:var(--et-text-secondary)}.tenant code{margin-left:auto}.empty{color:var(--et-text-secondary);padding:40px;text-align:center}hr{border:0;border-top:1px solid var(--el-border-color);margin:30px 0}@media(max-width:800px){.version-grid{grid-template-columns:1fr}.tenant{margin:16px 0}.hint{display:none}}
</style>
