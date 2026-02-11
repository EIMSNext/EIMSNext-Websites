<template>
    <div :id="divId" v-if="modelValue">
        <div class="page">
            <div v-html="printHtml" class="et-system-print"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IPrintData } from './type';
import { FieldDef, FieldType, SystemField } from '@eimsnext/models';
import { dateFormat, getAttachmentRootPath, getObjectType } from '@/utils/common';

const { t } = useI18n();

interface IFieldValue {
    field: string;
    label: string;
    type: string;
    value?: string
    items?: ITableItem[]
}
interface ITableItem {
    fieldValues: IFieldValue[]
}

// 声明Props
const props = withDefaults(defineProps<{
    modelValue: boolean,
    divId?: string;
    appendToBody?: boolean;
    title?: string;
    printData: IPrintData
}>(), {
    divId: "formprintdiv",
    appendToBody: false,
    title: "",
});

const emit = defineEmits(["update:modelValue"]);

const el = ref<HTMLElement | null>(null);
const printHtml = ref("");
const displayFields = ref<Record<string, boolean>>({})
const fieldValues = ref<IFieldValue[]>([])

// 核心方法：生成表格HTML
const generateTableHtml = () => {
    if (!props.printData) return;

    getDisplayFields();
    getFieldValues();
    generateHtml();
};

// 获取显示字段列表
const getDisplayFields = () => {
    let fields: Record<string, boolean> = {};

    if (props.printData.fieldPerms) {
        props.printData.fieldPerms.forEach(x => {
            fields[x.id] = x.visible;
        });
    }

    displayFields.value = fields;
};

const shouldDisplay = (p: FieldDef): boolean => {
    if (!props.printData.fieldPerms) return true;

    let fp = props.printData.fieldPerms.find(x => x.id == p.field)
    if (!fp) return true;

    return fp.visible;
};

const getFieldValues = () => {
    fieldValues.value = []

    const fields = props.printData.formDef.content?.items
    const data = props.printData.formData.data
    if (!fields || fields.length == 0 || !data) return;

    let ignoreFields: string[] = [SystemField.FlowStatus];
    let values: IFieldValue[] = []

    fields.forEach((f) => {
        if (ignoreFields.includes(f.field)) return;

        if (shouldDisplay(f)) {
            let fv: IFieldValue = { field: f.field, type: f.type, label: "" }

            if (f.i18n) fv.label = t(f.i18n);

            let fdata = data[f.field];
            if (f.type === FieldType.TableForm) {
                let columns = f.columns?.filter((x) => shouldDisplay(x)) || [];
                if (columns.length === 0) return;

                if (!fdata) fdata = []
                let items: ITableItem[] = []

                if (fdata.length > 0) {
                    fdata.forEach((d: any) => {
                        let item: ITableItem = { fieldValues: [] }
                        columns.forEach(c => {
                            let cdata = d[c.field]
                            let cv: IFieldValue = { field: c.field, type: c.type, label: "" }
                            if (c.i18n) cv.label = t(c.i18n);
                            cv.value = getValue(c, cdata)

                            item.fieldValues.push(cv)
                        });
                        items.push(item)
                    });
                }
                else {
                    let item: ITableItem = { fieldValues: [] }
                    columns.forEach(c => {
                        let cv: IFieldValue = { field: c.field, type: c.type, label: "", value: "" }
                        if (c.i18n) cv.label = t(c.i18n);
                        item.fieldValues.push(cv)
                    });
                    items.push(item)
                }
                fv.items = items;
            } else {
                fv.value = getValue(f, fdata);
            }

            // 分离固定字段
            // if (f.field === SystemField.FlowStatus) {
            //     // statusField = p;
            //     return;
            // }

            values.push(fv);
        }
    });

    fieldValues.value = values
};


// 获取字段值（格式化）
const getValue = (el: FieldDef, vObj: any): string => {
    const dType = getObjectType(vObj);
    let dValue = "";

    switch (dType) {
        case "Array":
            const valArray: string[] = [];
            switch (el.type) {
                case FieldType.FileUpload:
                    vObj.forEach((item: { name: string }) => valArray.push(item.name));
                    dValue = `<div>${valArray.join(",")}</div>`;
                    break;
                case FieldType.ImageUpload:
                    vObj.forEach((item: { url: string }) => {
                        let url = item.url;
                        if (!url.startsWith("http://") && !url.startsWith("https://")) {
                            url = getAttachmentRootPath() + url;
                        }
                        valArray.push(`<span style="padding:1px 2px;"><img src="${url}"alt=""/></span>`);
                    });
                    dValue = '<div style="display: -webkit-box; display: flex;">' + valArray.join("") + "</div>";
                    break;
                case FieldType.CheckBox:
                case FieldType.Select2:
                case FieldType.Department2:
                case FieldType.Employee2:
                    vObj.forEach((item: { label: string }) => valArray.push(item.label));
                    dValue = valArray.join(",");
                    break;
                default:
                    dValue = valArray.join(",");
                    break;
            }
            break;

        case "Object":
            switch (el.type) {
                case FieldType.Radio:
                case FieldType.Select1:
                case FieldType.Department1:
                case FieldType.Employee1:
                    dValue = vObj.label || "";
                    break;
                default:
                    dValue = vObj.value || "";
                    break;
            }
            break;

        default:
            switch (el.type) {
                case FieldType.Number:
                    dValue = el.props?.format ? vObj.toFixed(el.props.format) : vObj.toString()
                    break;
                case "textarea":
                    dValue = `<pre>${vObj || ""}</pre>`;
                    break;
                case "timestamp":
                    dValue = dateFormat(vObj, el.props?.format);
                    break;
                // case "signature":
                //     dValue = vObj ? `<img src="${vObj}" alt=""/>` : "";
                //     break;
                // case "status":
                //     switch (vObj) {
                //         case 1: dValue = t("Draft"); break;
                //         case 2: dValue = t("Effective"); break;
                //         case 3: dValue = t("Approval"); break;
                //         case 4: dValue = t("Effective"); break;
                //         case 5: dValue = t("Reject"); break;
                //         default: dValue = "";
                //     }
                //     break;
                default:
                    dValue = vObj || "";
                    break;
            }
            break;
    }

    return dValue;
};

// 生成最终HTML
const generateHtml = () => {
    if (!fieldValues.value || fieldValues.value.length === 0) {
        printHtml.value = "";
        return;
    }

    let pHtml = `<div class="print-title">${props.title}</div>`;
    const sysFields: string[] = [SystemField.CreateBy, SystemField.CreateTime, SystemField.UpdateTime]
    const ignoreFields = [SystemField.CreateBy, SystemField.CreateTime, SystemField.UpdateTime, "wxavatar", "wxname", "openid"];

    // 微信信息展示
    const showWxInfo = false;// !flowPrint.value && paramList.value.some(x => ["wxavatar", "wxname", "openid"].includes(x.id));
    // 系统基础信息展示
    // const showSysInfo = !flowPrint.value && paramList.value.some(x => ["createdBy", "createdTime", "modifiedTime"].includes(x.id));
    const showSysInfo = fieldValues.value.some(x => sysFields.includes(x.field));

    // 渲染微信信息
    if (showWxInfo) {
        const wxAvatar = fieldValues.value.find(x => x.field === "wxavatar");
        const wxNickName = fieldValues.value.find(x => x.field === "wxname");
        const wxOpenId = fieldValues.value.find(x => x.field === "openid");

        pHtml += `<div class="system-info-title">${t("WxSubmitorInfo")}</div>
    <div class="print-info has-wx-info">`;

        if (wxAvatar) {
            pHtml += `<div class="info-item">
        <span class="info-label">${wxAvatar.label}</span>
        <span class="info-text">
          <div class="x-avatar ${wxAvatar.value ? "has-image" : "no-image"}" style="width: 20px; height: 20px; line-height: 20px; font-size: 12px">
            ${wxAvatar.value}
          </div>
        </span>
      </div>`;
        }
        if (wxNickName) {
            pHtml += `<div class="info-item"><span class="info-label">${wxNickName.label}</span><span class="info-text">${wxNickName.value}</span></div>`;
        }
        if (wxOpenId) {
            pHtml += `<div class="info-item"><span class="info-label">${wxOpenId.label}</span><span class="info-text">${wxOpenId.value}</span></div>`;
        }
        pHtml += `</div>`;
    }

    // 渲染系统基础信息
    if (showSysInfo) {
        if (showWxInfo) pHtml += `<div class="system-info-title">${t("BaseInfo")}</div>`;

        const createdBy = fieldValues.value.find(x => x.field === SystemField.CreateBy);
        const createdTime = fieldValues.value.find(x => x.field === SystemField.CreateTime);
        const updatedTime = fieldValues.value.find(x => x.field === SystemField.UpdateTime);

        pHtml += `<div class="print-info has-wx-info with-item-3">`;
        if (createdBy) {
            pHtml += `<div class="info-item"><span class="info-label">${createdBy.label}</span><span class="info-text">${createdBy.value}</span></div>`;
        }
        if (createdTime) {
            pHtml += `<div class="info-item">
        <span class="info-label">${createdTime.label}</span><span class="info-text">${createdTime.value}</span>
      </div>`;
        }
        if (updatedTime) {
            pHtml += `<div class="info-item">
        <span class="info-label">${updatedTime.label}</span><span class="info-text">${updatedTime.value}</span>
      </div>`;
        }
        pHtml += `</div>`;
    }

    // 渲染表单内容表格
    let tableStr = "";
    let tableRendering = false;
    // let timeline: FormField | null = null;

    fieldValues.value.forEach((el) => {
        // if (el.field === "timeline") timeline = el;
        if (ignoreFields.includes(el.field)) return;

        // 子表单（table类型）
        if (el.type === "table") {
            if (tableRendering) {
                tableRendering = false;
                tableStr += "</tbody></table>";
            }
            const colCount = el.items![0].fieldValues.length
            const subColLimit = colCount > 7 && colCount < 11 ? 5 : 7;
            const subTableCount = Math.ceil(colCount / subColLimit);

            for (let t = 1; t <= subTableCount; t++) {
                const startColCount = (t - 1) * subColLimit;
                const endColCount = Math.min(colCount, t * subColLimit);
                const currentChildren = el.items![0].fieldValues?.slice(startColCount, endColCount) || [];

                tableStr += `<table><tbody><tr><td class="print-center" colspan="${currentChildren.length}">${el.label}</td></tr>`;

                // 表头
                let subTh = "<tr>";
                currentChildren.forEach((sub) => {
                    subTh += `<td>${sub.label}</td>`;
                });
                subTh += "</tr>";

                // 表体
                let subTr = "";
                (el.items || []).forEach((row: Record<string, any>) => {
                    subTr += "<tr>";
                    currentChildren.forEach((sub) => {
                        subTr += `<td>${sub.value}</td>`;
                    });
                    subTr += "</tr>";
                });

                tableStr += subTh + subTr;
                tableStr += "</tbody></table>";
            }
        } else {
            // 普通字段
            if (!tableRendering) {
                tableRendering = true;
                tableStr += '<table class="et-print-body"><tbody>';
            }
            tableStr += `<tr><td colspan="1">${el.label}</td><td colspan="3">${el.value}</td></tr>`;
        }
    });

    // 闭合普通字段表格
    if (tableRendering) {
        tableRendering = false;
        tableStr += "</tbody></table>";
    }

    // 渲染审批意见
    // if (usingProcess.value && timeline && timeline.value && timeline.value.length > 0) {
    //     tableStr += `<div>${t("ApprovalComment")}</div>`;
    //     tableStr += '<table class="et-print-body"><tbody>';

    //     (timeline.value as TimelineItem[]).forEach((activity) => {
    //         tableStr += `<tr><td colspan="1">${activity.activityName}</td><td colspan="3">${activity.approveInfo}</td></tr>`;
    //     });

    //     tableStr += "</tbody></table>";
    // }

    printHtml.value = pHtml + tableStr;
};

watch(
    () => props.printData,
    (val) => {
        if (val) {
            generateTableHtml();
        }
    },
    { deep: true }
);

onMounted(() => {
    if (props.appendToBody) {
        document.body.appendChild(<HTMLElement>el.value);
    }
    generateTableHtml();
});

onBeforeUnmount(() => {
    if (props.appendToBody && el.value) {
        document.body.removeChild(<HTMLElement>el.value);
    }
});

</script>

<style scoped></style>