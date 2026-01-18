import { FcSubForm as subForm } from '@eimsnext/form-render-core';
import IconWarning from './icon/IconWarning.vue';

import { FcCheckbox as checkbox } from "./checkbox";
import { FcDepartmentSelect as departmentselect } from "./departmentselect";
import { FcEmployeeSelect as employeeselect } from "./employeeselect";
import { FcFrame as frame } from "./frame";
import { FcGroup as group } from "./group";
import { FcRadio as radio } from "./radio";
import { FcSelect as select } from "./select";
import { FcTree as tree } from "./tree";
import { FcUpload as upload } from "./upload";
import { FcEditor } from './wangeditor';

// export { FcCheckbox, FcFrame, FcGroup, FcRadio, FcSelect, FcTree, FcUpload, FcEditor }
export { FcEditor }

export default [
    checkbox,
    departmentselect,
    employeeselect,
    frame,
    radio,
    select,
    tree,
    upload,
    group,
    subForm,
    IconWarning
]
