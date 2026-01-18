import formFieldList from "./FormFieldList.vue";
import formFieldItem from "./FormFieldItem.vue";
import formFieldValue from "./FormFieldValue.vue";
import { withInstall } from "../utils/install";
const FormFieldList = withInstall(formFieldList);
const FormFieldItem = withInstall(formFieldItem);
const FormFieldValue = withInstall(formFieldValue);
export { FormFieldList, FormFieldItem, FormFieldValue };
