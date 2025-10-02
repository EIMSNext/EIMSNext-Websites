import {localeOptions, localeProps} from '../../utils';

const label = '音频播放器';
const name = 'audioBox';

export default {
    menu: 'aide',
    icon: 'icon-audio',
    label: label,
    name: name,
    mask: false,
    event: ['pause', 'play', 'ended'],
    rule() {
        return {
            type: name,
            props: {
                src: 'https://static.form-create.com/res/demo.mp3',
                type: 'audio/mpeg',
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
                        label: 'MP3',
                        value: 'audio/mpeg'
                    },
                    {
                        label: 'OGG',
                        value: 'audio/ogg'
                    },
                    {
                        label: 'AAC',
                        value: 'audio/aac'
                    },
                    {
                        label: 'WAV',
                        value: 'audio/wav'
                    },
                    {
                        label: 'WMA',
                        value: 'audio/x-ms-wma'
                    },
                    {
                        label: 'WEBA',
                        value: 'audio/webm'
                    },
                    {
                        label: 'FLAC',
                        value: 'audio/flac'
                    },
                    {
                        label: 'ALAC',
                        value: 'audio/x-alac'
                    },
                    {
                        label: 'AMR',
                        value: 'audio/amr'
                    },
                    {
                        label: 'MIDI',
                        value: 'audio/midi'
                    },
                ]
            },
            {
                type: 'switch',
                field: 'autoplay',
            },
            {
                type: 'switch',
                field: 'loop',
            },
            {
                type: 'switch',
                field: 'muted',
            },
            {
                type: 'switch',
                field: 'controls',
            },
            {
                type: 'select',
                field: 'preload',
                options: localeOptions(t, [
                    {
                        label: 'auto',
                        value: 'auto'
                    },
                    {
                        label: 'metadata',
                        value: 'metadata'
                    },
                    {
                        label: 'none',
                        value: 'none'
                    }
                ], 'com.audioBox.preloadOpt')
            }
        ]);
    },
};

