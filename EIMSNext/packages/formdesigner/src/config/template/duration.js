const label = '时长';

export default {
    menu: 'template',
    name: 'duration',
    label,
    autoField: true,
    template: [
        {
            'type': 'fcInlineForm',
            '_fc_id': 'id_Founm50iu5kocac',
            'name': 'ref_Fqrpm50iu5kocbc',
            'display': true,
            'hidden': false,
            '_fc_drag_tag': 'fcInlineForm',
            'children': [
                {
                    'type': 'datePicker',
                    'field': 'Fz0um50itwf6bbc',
                    'title': '开始时间',
                    '$required': false,
                    '_fc_drag_tag': 'datePicker',
                    'validate': [
                        {
                            'type': 'validator',
                            'trigger': 'change',
                            'validator': '[[FORM-CREATE-PREFIX-function validator(rule, value, callback){this.api.validateField(\'Fv92m50itwf6bdc\');\ncallback();}-FORM-CREATE-SUFFIX]]',
                            'mode': 'validator',
                            'message': ''
                        }
                    ],
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fhqtm50itwf6bgc',
                    'name': 'ref_Fzsym50itwf6bhc',
                    'display': true,
                    'hidden': false
                },
                {
                    'type': 'select',
                    'field': 'F730m50itwf6bcc',
                    'title': '开始时间段',
                    'effect': {
                        'fetch': ''
                    },
                    '$required': false,
                    'options': [
                        {
                            'label': '上午',
                            'value': '1'
                        },
                        {
                            'label': '下午',
                            'value': '1.5'
                        }
                    ],
                    '_fc_drag_tag': 'select',
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fnj8m50itwf6bkc',
                    'name': 'ref_Fyjym50itwf6blc',
                    'display': true,
                    'hidden': false,
                    'wrap': {
                        'title': false
                    },
                    'style': {
                        'marginLeft': '10px',
                        'width': '150px'
                    }
                }
            ]
        },
        {
            'type': 'fcInlineForm',
            '_fc_id': 'id_Fxbnm50iw4ttccc',
            'name': 'ref_Fhwmm50iw4ttcdc',
            'display': true,
            'hidden': false,
            '_fc_drag_tag': 'fcInlineForm',
            'children': [
                {
                    'type': 'datePicker',
                    'field': 'Fv92m50itwf6bdc',
                    'title': '结束时间',
                    '$required': false,
                    '_fc_drag_tag': 'datePicker',
                    'validate': [
                        {
                            'type': 'validator',
                            'trigger': 'change',
                            'validator': '[[FORM-CREATE-PREFIX-function validator(rule, value, callback){let startTime = this.api.getValue(\'Fz0um50itwf6bbc\');\nif(startTime && value && Date.parse(startTime) > Date.parse(value)) {\n\tcallback(false);\n  return;\n}\ncallback()}-FORM-CREATE-SUFFIX]]',
                            'mode': 'min',
                            'message': '开始时间不能大于结束时间'
                        }
                    ],
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fu8im50itwf6bqc',
                    'name': 'ref_Fy17m50itwf6brc',
                    'display': true,
                    'hidden': false
                },
                {
                    'type': 'select',
                    'field': 'Fx9gm50itwf6bec',
                    'title': '结束时间段',
                    'effect': {
                        'fetch': ''
                    },
                    '$required': false,
                    'options': [
                        {
                            'label': '上午',
                            'value': '1'
                        },
                        {
                            'label': '下午',
                            'value': '1.5'
                        }
                    ],
                    '_fc_drag_tag': 'select',
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fxrxm50itwf6buc',
                    'name': 'ref_Fehcm50itwf6bvc',
                    'display': true,
                    'hidden': false,
                    'wrap': {
                        'title': false
                    },
                    'style': {
                        'marginLeft': '10px',
                        'width': '150px'
                    }
                }
            ]
        },
        {
            'type': 'fcInlineForm',
            '_fc_id': 'id_Ffb0m50j0g8vcec',
            'name': 'ref_Ftpym50j0g8vcfc',
            'display': true,
            'hidden': false,
            '_fc_drag_tag': 'fcInlineForm',
            'children': [
                {
                    'type': 'inputNumber',
                    'field': 'F5q8m50itwf6bfc',
                    'title': '时长',
                    '$required': false,
                    'props': {
                        'controls': false
                    },
                    '_fc_drag_tag': 'inputNumber',
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fo5cm50itwf7c0c',
                    'name': 'ref_Fnnvm50itwf7c1c',
                    'display': true,
                    'hidden': false,
                    'computed': {
                        'value': 'MAX(IF(Fz0um50itwf6bbc && Fv92m50itwf6bdc && TIMESTAMP(Fv92m50itwf6bdc) > TIMESTAMP(Fz0um50itwf6bbc), DIFFDAYS(Fz0um50itwf6bbc, Fv92m50itwf6bdc), 0) + IF(Fx9gm50itwf6bec && F730m50itwf6bcc, Fx9gm50itwf6bec - F730m50itwf6bcc + 0.5, 0), 0);'
                    }
                },
                {
                    'type': 'div',
                    'native': true,
                    'children': [
                        '天'
                    ],
                    '_fc_drag_tag': 'text',
                    '_fc_template': 'duration',
                    '_fc_id': 'id_Fatsm50itwf7c4c',
                    'name': 'ref_Fh2rm50itwf7c5c',
                    'display': true,
                    'hidden': false,
                    'style': {
                        'marginTop': '5px',
                        'marginLeft': '10px'
                    }
                }
            ],
            'style': {
                'alignItems': 'flex-start'
            }
        }
    ]
};
