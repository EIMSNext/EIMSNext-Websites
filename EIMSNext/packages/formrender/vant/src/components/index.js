import { FcSubForm as subForm } from '@eimsnext/form-render-core';
import Calendar from './calendar';
import Cascader from './cascader';
import Checkbox from './checkbox';
import Select from './select';
import Uploader from './uploader';
import Radio from './radio';
import DatePicker from './datePicker';
import TimePicker from './timePicker';
import Group from './group';
import SerialNo from './serialno';
import Number from './number';
import DataSelect from './dataSelect';
import Query from './query';
import { DepartmentSelect, EmployeeSelect } from './organizationSelect';
import { Collapse, Tabs } from './layout';
import IconWarning from './icon/IconWarning.vue';

export default [
    subForm,
    IconWarning,
    Calendar,
    Cascader,
    Checkbox,
    Radio,
    Select,
    DatePicker,
    TimePicker,
    Group,
    SerialNo,
    Uploader,
    Number,
    DepartmentSelect,
    EmployeeSelect,
    DataSelect,
    Query,
    Tabs,
    Collapse,
]
