import formSelect from "./FormSelect.vue";
import formSelectById from "./FormSelectById.vue";
import { withInstall } from "../utils/install";
const FormSelect = withInstall(formSelect);
const FormSelectById = withInstall(formSelectById);
export { FormSelect, FormSelectById };
