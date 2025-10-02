import formCreate from '@eimsnext/form-render-elplus';
import {renderPreview} from './index';
import formulas from './formulas';
import behaviorAttr from './behavior';
import easySlotsAttr from './easySlots';
import useExtendApi from './extendApi';

formCreate.parser().preview = renderPreview;

Object.keys(formulas).forEach(k => {
    formCreate.setFormula(k, formulas[k]);
});

const viewForm = formCreate;

const designerForm = formCreate.factory();

useExtendApi(viewForm);
useExtendApi(designerForm);

viewForm.register('behavior', behaviorAttr);
viewForm.register('easySlots', easySlotsAttr);
designerForm.register('easySlots', easySlotsAttr);

export default viewForm;

export {designerForm};
