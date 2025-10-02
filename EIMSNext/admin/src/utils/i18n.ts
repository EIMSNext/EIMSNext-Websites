// translate router.meta.title, be used in breadcrumb sidebar tagsview
// import { useLocale } from "element-plus";
// const { t } = useLocale();

export function translateRouteTitle(title: any) {
  // 判断是否存在国际化配置，如果没有原生返回
  return title;
  // const key = "route." + title;
  // const translatedTitle = t(key);
  // return translatedTitle === key ? title : translatedTitle;
}
