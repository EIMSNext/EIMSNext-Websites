import sortList from "./SortList.vue";
import sortItem from "./SortItem.vue";
import { withInstall } from "../utils/install";
const SortList = withInstall(sortList);
const SortItem = withInstall(sortItem);
export { SortList, SortItem };
