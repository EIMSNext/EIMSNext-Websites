import elmFormCreate from './core/index';
import { FcEditor } from './components';

const FormCreate = elmFormCreate();

if (typeof window !== 'undefined') {
    window.formCreate = FormCreate;
}

const maker = FormCreate.maker;

export { maker, FcEditor }

export default FormCreate;
