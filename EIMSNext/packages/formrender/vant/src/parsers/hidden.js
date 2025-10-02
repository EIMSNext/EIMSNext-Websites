import {creatorFactory} from '@eimsnext/form-render-core';

const name = 'hidden';
export default {
    name,
    maker: {
        [name]: (field, value) => creatorFactory(name)('', field, value)
    },
    render() {
        return [];
    }
}
