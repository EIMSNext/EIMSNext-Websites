import formCreateMobile, {useAdvanced} from '../form/mobile';
import StepFormView from '../components/mobile/stepForm/StepFormView.vue';
import StepFormItemView from '../components/mobile/stepForm/StepFormItemView.vue';
import PopupView from '../components/mobile/popup/PopupView.vue';

const viewFormMobile = formCreateMobile;

const designerFormMobile = formCreateMobile.factory();


useAdvanced(designerFormMobile);

designerFormMobile.setDriver('elm', {
    parsers: {
        stepForm: {
            mergeProp(ctx) {
                ctx.prop.component = StepFormView;
            }
        },
        stepFormItem: {
            mergeProp(ctx) {
                ctx.prop.component = StepFormItemView;
            }
        },
        fcDialog: {
            mergeProp(ctx) {
                ctx.prop.component = PopupView;
            }
        },
        fcDrawer: {
            mergeProp(ctx) {
                ctx.prop.component = PopupView;
            }
        }
    }
})

designerFormMobile.component('MStepForm', StepFormView);
designerFormMobile.component('MStepFormItemView', StepFormItemView);
designerFormMobile.component('PopupView', PopupView);

export default viewFormMobile;

export {designerFormMobile};
