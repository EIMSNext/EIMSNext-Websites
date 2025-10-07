import formCreateMobile from '@eimsnext/form-render-vant';
import fcSelect from '@eimsnext/form-render-elplus';
import fcTree from '@eimsnext/form-render-elplus';
import fcUpload from '@eimsnext/form-render-elplus';
import formulas from '../utils/formulas';
import StepForm from '../components/mobile/stepForm/StepForm.vue';
import Popup from '../components/mobile/popup/Popup.vue';
import DataTable from '../components/dataTable/DataTable.vue';
import Table from '../components/table/Table.vue';
import TableForm from '../components/tableForm/TableForm.vue';
import TableFormPro from '../components/tableForm/TableFormPro.vue';
import InfiniteTableForm from '../components/infiniteTableForm/InfiniteTableForm.vue';
import NestedTableForm from '../components/nestedTableForm/NestedTableForm.vue';
import Cell from '../components/cell/Cell.vue';
import Value from '../components/value/Value.vue';
import FcCity from '../components/mobile/City.vue';
import Slot from '../components/slotComponent/SlotComponent.vue';
import {is} from '@eimsnext/form-render-core';
import Json from '../components/jsonComponent/JsonComponent.vue';
import InlineForm from '../components/InlineForm.vue';
import Echarts from '../components/echarts/Echarts.vue';
import SignaturePad from '../components/mobile/SignaturePad.vue';
import Id from '../components/Id.vue';
import FcTitle from '../components/aide/FcTitle.vue';
import AudioBox from '../components/aide/AudioBox.vue';
import IframeBox from '../components/aide/IframeBox.vue';
import BarCodeBox from '../components/aide/BarCodeBox.vue';
import VideoBox from '../components/aide/VideoBox.vue';
import QrCodeBox from '../components/aide/QrCodeBox.vue';
import './mobile.css';
import '../style/icon.css';
import useExtendApi from '../utils/extendApi';
import behaviorAttr from '../utils/behavior';
import easySlotsAttr from '../utils/easySlots';
import loadjs from 'loadjs';

const DEFAULT_FORMATS = {
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    datetime: 'YYYY-MM-DD HH:mm:ss',
    timerange: 'HH:mm:ss',
    daterange: 'YYYY-MM-DD',
    monthrange: 'YYYY-MM',
    datetimerange: 'YYYY-MM-DD HH:mm:ss',
    year: 'YYYY'
};


function pxToEm(px) {
    return px / 20 + 'em';
}

function tidyWrapAlign(prop) {
    if (!prop.wrap?.class) {
        return;
    }
    if (prop.wrap.class === 'fc-wrap-top') {
        prop.wrap.labelAlign = 'top';
        delete prop.wrap.class;
    } else if (prop.wrap.class === 'fc-wrap-left') {
        prop.wrap.labelAlign = 'left';
        delete prop.wrap.class;
    } else if (prop.wrap.class === 'fc-wrap-right') {
        prop.wrap.labelAlign = 'right';
        delete prop.wrap.class;
    }
}

const findTreeLabel = function (find, data, key, props) {
    const fieldKey = props || {};
    data.forEach(v => {
        if (find.indexOf(v[key || 'id']) > -1) {
            find.splice(find.indexOf(v[key || 'id']), 1, v[fieldKey.label || 'label'] || v.text);
        }
        if (is.trueArray(v[fieldKey.children || 'children'])) {
            findTreeLabel(find, v[fieldKey.children || 'children'], key, props);
        }
    });
    return find;
};

const findCheckboxLabel = function (find, data) {
    data.forEach(v => {
        if (find.indexOf(v.value) > -1) {
            find[find.indexOf(v.value)] = v.label || v.text;
        }
    });
    return find;
};

function toArray(val) {
    if (!val) {
        return [];
    } else if (!Array.isArray(val)) {
        return [val];
    }
    return val;
}

export function useAdvanced(formCreate) {
    Object.keys(formulas).forEach(k => {
        formCreate.setFormula(k, formulas[k]);
    });

    useExtendApi(formCreate);
    formCreate.register('behavior', behaviorAttr);
    formCreate.register('easySlots', easySlotsAttr);

    formCreate.setDriver('elm', {
        defaultPreview(ctx, _) {
            let val = ctx.rule.value;
            const h = ctx.$render.vNode.h;
            const type = ctx.type;
            const subForm = ctx.$handle.subForm[ctx.id];
            const readMode = ctx.prop.readMode;
            if (readMode === false || readMode === 'custom' || !ctx.input || ctx.rule.subForm || (Array.isArray(subForm) ? subForm.length : subForm) || ['fcGroup', 'fcSubForm', 'tableForm', 'stepForm', 'nestedTableForm', 'infiniteTableForm', 'upload'].indexOf(ctx.trueType) > -1) {
                return ctx.parser.render(_, ctx);
            }
            if (['radio', 'select', 'checkbox'].indexOf(type) > -1) {
                val = findCheckboxLabel([...toArray(val)], ctx.prop.props.options || ctx.prop.props.formCreateInject.options || []).join(', ');
            } else if (['timePicker', 'datePicker', 'slider'].indexOf(type) > -1) {
                val = Array.isArray(val) ? val.join(' - ') : val;
            } else if (type === 'cascader') {
                val = [...toArray(val)];
                if (!Array.isArray(val[0])) {
                    val = [val];
                }
                val = val.map(item => {
                    return findTreeLabel(item, ctx.prop.props.options || ctx.prop.props.formCreateInject.options || [], 'value').join('/');
                }).join(', ');
            } else if (type === 'fcEditor' || readMode === 'html') {
                return h('div', {innerHTML: val});
            } else if (type === 'uploader' || readMode === 'image') {
                val = toArray(val);
                return h('div', {class: '_fc-upload'}, val.map(function (src) {
                    return h('div', {class: '_fc-upload-preview'}, [
                        h('van-image', {src: src, fit: 'cover'})
                    ]);
                }));
            }  else if (type === 'signaturePad' && val) {
                return h('van-image', {src: val, fit: 'cover',style: {height: '90px'}});
            } else if (typeof val === 'boolean' || type === 'switch') {
                val = val ? '是' : '否';
            }

            return h('span', {class: '_fc-read-view'}, ['' + (val == null ? '' : val)]);
        },
        updateWrap(ctx) {
            let style = ctx.prop?.wrap?.style;
            if (ctx.prop.col && ctx.prop.col.span) {
                ctx.prop.col.span = 24;
            }
            if(style){
                style = Array.isArray(style) ? style : [style];
                style.forEach(item=>{
                    delete item.marginBottom;
                })
            }
            tidyWrapAlign(ctx.prop);
        },
        updateOptions(options) {
            if (options.form?.labelWidth && options.form.labelWidth.indexOf('px') > -1) {
                options.form.labelWidth = pxToEm(parseInt(options.form.labelWidth));
            }
            if (options.form?.labelPosition) {
                options.form.labelAlign = options.form.labelPosition;
                delete options.form.labelPosition;
            }
            if (options.form?.hideRequiredAsterisk) {
                options.form.colon = options.form.hideRequiredAsterisk;
                delete options.form.hideRequiredAsterisk;
            }
        },
        parsers: {
            inputNumber: {
                mergeProp(ctx) {
                    ctx.prop.component = 'vanStepper';
                    const props = ctx.prop.props;
                    props.decimalLength = props.precision;
                    props.integer = props.precision === 0;
                    delete props.precision;
                }
            },
            radio: {
                mergeProp(ctx) {
                    if (ctx.prop.options) {
                        ctx.prop.props.options = ctx.prop.options;
                    }
                }
            },
            checkbox: {
                mergeProp(ctx) {
                    if (ctx.prop.options) {
                        ctx.prop.props.options = ctx.prop.options;
                    }
                }
            },
            select: {
                mergeProp(ctx) {
                    if (ctx.prop.props.multiple === true) {
                        ctx.prop.component = fcSelect;
                    } else {
                        if (ctx.prop.options) {
                            ctx.prop.props.options = ctx.prop.options;
                        }
                        ctx.prop.props.options = (ctx.prop.props.options || []).map(item => {
                            return {
                                text: item.label,
                                value: item.value
                            }
                        })
                    }
                }
            },
            rate: {
                mergeProp(ctx) {
                    ctx.prop.props.count = ctx.prop.props.max;
                    delete ctx.prop.props.max;
                }
            },
            timePicker: {
                mergeProp(ctx) {
                    ctx.prop.component = 'elTimePicker';
                    const props = ctx.prop.props;
                    if (!props.valueFormat) {
                        props.valueFormat = 'HH:mm:ss';
                    }
                }
            },
            datePicker: {
                mergeProp(ctx) {
                    ctx.prop.component = 'elDatePicker';
                    const props = ctx.prop.props;
                    if (!props.valueFormat) {
                        props.valueFormat = DEFAULT_FORMATS[props.type] || DEFAULT_FORMATS['date'];
                    }
                }
            },
            colorPicker: {
                mergeProp(ctx) {
                    ctx.prop.component = 'elColorPicker';
                }
            },
            cascader: {
                mergeProp(ctx) {
                    ctx.prop.component = 'elCascader';
                }
            },
            elDivider: {
                mergeProp(ctx) {
                    ctx.prop.component = 'vanDivider';
                }
            },
            upload: {
                mergeProp(ctx) {
                    ctx.prop.component = fcUpload;
                }
            },
            tree: {
                mergeProp(ctx) {
                    ctx.prop.component = fcTree;
                }
            },
            row: {
                mergeProp(ctx) {
                    ctx.prop.component = 'vanRow';
                }
            },
            col: {
                mergeProp(ctx) {
                    ctx.prop.component = 'vanCol';
                    if (ctx.prop.props.xs) {
                        ctx.prop.props = {...ctx.prop.props, ...ctx.prop.props.xs};
                    }
                }
            },
            fcDialog: {
                mergeProp(ctx) {
                    ctx.prop.component = 'FcPopup';
                }
            },
            fcDrawer: {
                mergeProp(ctx) {
                    ctx.prop.component = 'FcPopup';
                }
            }
        }
    })
}

useAdvanced(formCreateMobile);

formCreateMobile.component('FcSlot', Slot);
formCreateMobile.component('FcJson', Json);
formCreateMobile.component('StepForm', StepForm);
formCreateMobile.component('FcPopup', Popup);
formCreateMobile.component('FcTable', Table);
formCreateMobile.component('FcCell', Cell);
formCreateMobile.component('FcInlineForm', InlineForm);
formCreateMobile.component('TableForm', TableForm);
formCreateMobile.component('TableFormPro', TableFormPro);
formCreateMobile.component('NestedTableForm', NestedTableForm);
formCreateMobile.component('InfiniteTableForm', InfiniteTableForm);
formCreateMobile.component('DataTable', DataTable);
formCreateMobile.component('FcValue', Value);
formCreateMobile.component('FcCity', FcCity);
formCreateMobile.component('AudioBox', AudioBox);
formCreateMobile.component('VideoBox', VideoBox);
formCreateMobile.component('BarCodeBox', BarCodeBox);
formCreateMobile.component('IframeBox', IframeBox);
formCreateMobile.component('QrCodeBox', QrCodeBox);
formCreateMobile.component('SignaturePad', SignaturePad);
formCreateMobile.component('FcEcharts', Echarts);
formCreateMobile.component('FcTitle', FcTitle);
formCreateMobile.component('FcId', Id);
formCreateMobile.loadjs = loadjs;

export default formCreateMobile;

