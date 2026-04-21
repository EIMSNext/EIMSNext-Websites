import etDialog from "./etDialog.vue";
import etConfirmDialog from "./etConfirmDialog.vue";
import { withInstall } from "../utils/install";
export { EtConfirm, ConfirmResult } from "./EtConfirm";
export { MessageIcon } from "./type";
const EtDialog = withInstall(etDialog);
const EtConfirmDialog = withInstall(etConfirmDialog);
export { EtDialog, EtConfirmDialog };
