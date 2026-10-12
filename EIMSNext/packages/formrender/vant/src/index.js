import VantFormCreate from './core/index';
import { FcAddress } from './components';

const FormCreateMobile = VantFormCreate();

if (typeof window !== 'undefined') {
    window.formCreateMobile = FormCreateMobile;
}

const maker = FormCreateMobile.maker;

export {maker, FcAddress}

export default FormCreateMobile;
