import svgIcon from "./svgIcon.vue";
import etIcon from "./etIcon.vue";
import { withInstall } from "../utils/install";
const SvgIcon = withInstall(svgIcon);
const EtIcon = withInstall(etIcon);
export { SvgIcon, EtIcon };
