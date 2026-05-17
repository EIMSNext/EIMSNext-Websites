import picker from "./FieldBlockPicker.vue";
import { withInstall } from "../utils/install";
import type { FieldBlockField } from "../FieldBlock/shared";
export { buildFieldBlockFields, getFieldBlockTokens } from "../FieldBlock/shared";

const FieldBlockPicker = withInstall(picker);

export { FieldBlockPicker };
export type { FieldBlockField };
