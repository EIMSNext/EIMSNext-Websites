import {localeProps} from '../../utils';

const label = '视频播放器';
const name = 'videoBox';

export default {
    menu: 'aide',
    icon: 'icon-video',
    label: label,
    name: name,
    mask: false,
    event: ['pause', 'play', 'ended', 'error'],
    rule() {
        return {
            type: name,
            props: {
                src: 'https://static.form-create.com/res/demo.mp4',
                type: 'mp4',
            },
        };
    },
    props(_, {t}) {
        return localeProps(t, name + '.props', [
            {
                type: 'input',
                field: 'src',
            },
            {
                type: 'select',
                field: 'type',
                options: [
                    {
                        label: 'mp4',
                        value: 'mp4',
                    },
                    {
                        label: 'mpegts',
                        value: 'mpegts',
                    },
                    {
                        label: 'm2ts',
                        value: 'm2ts',
                    },
                    {
                        label: 'flv',
                        value: 'flv',
                    },
                    {
                        label: 'mse',
                        value: 'mse',
                    }
                ],
            },
            {
                type: 'switch',
                field: 'autoplay',
            },
            {
                type: 'switch',
                field: 'controls',
                value: true,
            },
            {
                type: 'switch',
                field: 'isLive',
            },
            {
                type: 'switch',
                field: 'loop',
            },
            {
                type: 'switch',
                field: 'withCredentials',
                value: true,
            },
        ]);
    },
};

