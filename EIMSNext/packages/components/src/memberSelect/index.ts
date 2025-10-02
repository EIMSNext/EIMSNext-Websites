import memberSelect from "./memberSelect.vue";
import memberSelectDialog from "./memberSelectDialog.vue";
import { withInstall } from "../utils/install";
const MemberSelect = withInstall(memberSelect);
const MemberSelectDialog = withInstall(memberSelectDialog);
export { MemberSelect, MemberSelectDialog };
