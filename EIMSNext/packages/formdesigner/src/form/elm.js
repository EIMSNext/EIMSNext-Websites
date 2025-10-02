// +-----------------------------------------------------------------------
// | FormCreate商业版 [ 让表单设计更简单 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2018~2025 https://form-create.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed FormCreate商业版并不是自由软件，未经授权不得使用、修改或移除版权信息
// +----------------------------------------------------------------------
// | Author: FormCreate Team <admin@form-create.com>
// +----------------------------------------------------------------------
import formCreate from '@eimsnext/form-render/element-plus';
import DataTable from '../components/dataTable/DataTable.vue';
import Table from '../components/table/Table.vue';
import Value from '../components/value/Value.vue';
import Slot from '../components/slotComponent/SlotComponent.vue';
import Json from '../components/jsonComponent/JsonComponent.vue';
import StepForm from '../components/stepForm/StepForm.vue';
import InlineForm from '../components/InlineForm.vue';
import NestedTableForm from '../components/nestedTableForm/NestedTableForm.vue';
import InfiniteTableForm from '../components/infiniteTableForm/InfiniteTableForm.vue';
import TableForm from '../components/tableForm/TableForm.vue';
import TableFormPro from '../components/tableForm/TableFormPro.vue';
import FcCity from '../components/City.vue';
import Dialog from '../components/dialog/Dialog.vue';
import Drawer from '../components/drawer/Drawer.vue';
import Echarts from '../components/echarts/Echarts.vue';
import SignaturePad from '../components/SignaturePad.vue';
import Id from '../components/Id.vue';
import FcTitle from '../components/aide/FcTitle.vue';
import AudioBox from '../components/aide/AudioBox.vue';
import IframeBox from '../components/aide/IframeBox.vue';
import BarCodeBox from '../components/aide/BarCodeBox.vue';
import VideoBox from '../components/aide/VideoBox.vue';
import QrCodeBox from '../components/aide/QrCodeBox.vue';
import Cell from '../components/cell/Cell.vue';
import './elm.css';
import '../style/icon.css';
import formulas from '../utils/formulas';
import renderPreview from '../utils/preview';
import behaviorAttr from '../utils/behavior';
import easySlotsAttr from '../utils/easySlots';
import useExtendApi from '../utils/extendApi';
import loadjs from 'loadjs';

formCreate.parser().preview = renderPreview;


export function useAdvanced(formCreate) {
    Object.keys(formulas).forEach(k => {
        formCreate.setFormula(k, formulas[k]);
    });

    useExtendApi(formCreate);
    formCreate.register('behavior', behaviorAttr);
    formCreate.register('easySlots', easySlotsAttr);

}

useAdvanced(formCreate);

formCreate.component('FcSlot', Slot);
formCreate.component('FcJson', Json);
formCreate.component('DataTable', DataTable);
formCreate.component('FcCell', Cell);
formCreate.component('TableForm', TableForm);
formCreate.component('TableFormPro', TableFormPro);
formCreate.component('StepForm', StepForm);
formCreate.component('FcValue', Value);
formCreate.component('FcCity', FcCity);
formCreate.component('FcTable', Table);
formCreate.component('NestedTableForm', NestedTableForm);
formCreate.component('InfiniteTableForm', InfiniteTableForm);
formCreate.component('FcDialog', Dialog);
formCreate.component('FcDrawer', Drawer);
formCreate.component('FcInlineForm', InlineForm);
formCreate.component('AudioBox', AudioBox);
formCreate.component('VideoBox', VideoBox);
formCreate.component('BarCodeBox', BarCodeBox);
formCreate.component('IframeBox', IframeBox);
formCreate.component('QrCodeBox', QrCodeBox);
formCreate.component('SignaturePad', SignaturePad);
formCreate.component('FcEcharts', Echarts);
formCreate.component('FcTitle', FcTitle);
formCreate.component('FcId', Id);
formCreate.loadjs = loadjs;


export default formCreate;