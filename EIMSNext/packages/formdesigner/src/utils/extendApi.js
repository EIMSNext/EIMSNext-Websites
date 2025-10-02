import { extend } from "@eimsnext/form-render-core";
import {behavior} from './behavior';

export default function useExtendApi(formCreate) {
    formCreate.__proto__.setBehavior = (behaviors) => {
        extend(behavior, behaviors);
    };
    formCreate.extendApi((api) => {
        return {
            open(name, ...args) {
                (api.el(name) || api.top.el(name)).open(...args);
            },
            close(name) {
                if (!name) {
                    api.top.bus.$emit('fc.closeDialog');
                    api !== api.top && api.bus.$emit('fc.closeDialog');
                } else {
                    (api.el(name) || api.top.el(name)).close();
                }
            },
        }
    });
}