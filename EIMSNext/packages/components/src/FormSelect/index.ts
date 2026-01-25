import formSelect from "./FormSelect.vue";
import formSelectInDesigner from "./FormSelectInDesigner.vue";
import { withInstall } from "../utils/install";
const FormSelect = withInstall(formSelect);
const FormSelectInDesigner = withInstall(formSelectInDesigner);
export { FormSelect, FormSelectInDesigner };
