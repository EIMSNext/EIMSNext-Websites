import etToolbar from "./etToolbar.vue";
import etToolbarItem from "./etToolbarItem.vue";
import { withInstall } from "../utils/install";
const EtToolbar = withInstall(etToolbar);
const EtToolbarItem = withInstall(etToolbarItem);
export { EtToolbar, EtToolbarItem };
