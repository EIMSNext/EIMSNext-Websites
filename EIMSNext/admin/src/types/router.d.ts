import { UserType } from "@eimsnext/models";
import "vue-router";

declare module "vue-router" {
  // https://router.vuejs.org/zh/guide/advanced/meta.html#typescript
  // 可以通过扩展 RouteMeta 接口来输入 meta 字段
  interface RouteMeta {
    /**
     * 菜单名称
     * @example 'Dashboard'
     */
    title?: string;

    /**
     * 菜单图标
     * @example 'el-icon-edit'
     */
    icon?: string;

    /**
     * 菜单图标颜色
     * @example 'el-icon-edit'
     */
    iconColor?: string;
    /**
     * 是否隐藏菜单
     * true 隐藏, false 显示
     * @default false
     */
    hidden?: boolean;

    /**
     * 始终显示父级菜单，即使只有一个子菜单
     * true 显示父级菜单, false 隐藏父级菜单，显示唯一子节点
     * @default false
     */
    alwaysShow?: boolean;

    /**
     * 是否固定在页签上
     * true 固定, false 不固定
     * @default false
     */
    affix?: boolean;

    /**
     * 当固定在页签上时，是否显示关闭图标
     * true 显示, false 不显示
     * @default false
     */
    closable?: boolean;

    /**
     * 是否缓存页面
     * true 缓存, false 不缓存
     * @default false
     */
    keepAlive?: boolean;

    /**
     * 是否在面包屑导航中隐藏
     * true 隐藏, false 显示
     * @default false
     */
    breadcrumb?: boolean;

    //菜单ID
    id?: string;

    //是否分组
    isGroup?: boolean;

    //允许的用户类型
    allowedUserTypes?: UserType[];
  }
}
