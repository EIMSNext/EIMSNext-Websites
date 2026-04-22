import { defineComponent, ref, watch, computed, nextTick } from "vue";
import { SelectedTags } from "@eimsnext/components";
import { formDataService } from "@eimsnext/services";
import "./style.css";

export default defineComponent({
  name: "fcFormSelectedData",
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Array,
      default: [],
    },
    placeholder: {
      type: String,
      default: "选择数据",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Boolean,
      default: undefined,
    },
    formCreateInject: {
      type: Object,
      default: null,
    },
    selectionProcess: {
      type: Object,
      default: () => ({
        buttonText: "+选择数据",
        selectedFields: []
      }),
    },
    dataSource: {
      type: String,
      default: "",
    },
    fillFields: {
      type: Object,
      default: () => ({
        fillRules: []
      }),
    },
    displayFields: {
      type: Object,
      default: () => ({
        displayRules: []
      }),
    },
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {  
    
    const showDialog = ref(false);

    // 解析选择数据控件的特殊数据格式
    // 格式：[[{key: "label"/"value", value: ...}, {key: "value"/"label", value: ...}], ...]
    const parseSpecialFormat = (val) => {
      if (!val || !Array.isArray(val)) return [];
      
      if (val.length > 0 && Array.isArray(val[0])) {
        // 特殊格式：每个元素是 [{key: "label"/"value", value: ...}, ...] 的数组
        return val.map(item => {
          if (!Array.isArray(item) || item.length < 2) {
            return { label: '未知字段', value: '' };
          }
          
          // 找到 label 和 value 对象
          const labelObj = item.find(obj => obj && obj.key === 'label');
          const valueObj = item.find(obj => obj && obj.key === 'value');
          
          const label = labelObj?.value ?? '未知字段';
          // value 可能是数组，取第一个元素
          const rawValue = valueObj?.value;
          const displayValue = Array.isArray(rawValue) ? rawValue[0] : (rawValue ?? '');
          
          return {
            label: String(label),
            value: String(displayValue)
          };
        });
      }
      
      return [];
    };

    // 规范化显示值：确保总是 {label, value} 格式的数组
    const normalizeDisplayValue = (val) => {
      if (!val || !Array.isArray(val)) return [];
      
      // 先尝试解析特殊格式
      const parsedSpecial = parseSpecialFormat(val);
      if (parsedSpecial.length > 0) {
        return parsedSpecial;
      }
      
      // 标准格式：[{label: ..., value: ...}, ...]
      return val.map((item) => {
        if (typeof item === 'object' && item !== null && 'label' in item && 'value' in item) {
          // 处理 value 可能是数组的情况
          const rawValue = item.value;
          const displayValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
          return { label: item.label, value: String(displayValue ?? "") };
        }
        if (typeof item === 'object' && item !== null) {
          const values = Object.values(item);
          return { label: '未知字段', value: values.length > 0 ? String(values[0]) : "" };
        }
        return { label: '未知字段', value: String(item) };
      });
    };

    const selectedValue = ref(normalizeDisplayValue(props.modelValue));
    const formData = ref([]);
    const loading = ref(false);
    const selectedRecord = ref(null);
    const error = ref("");
    
    // 分页相关状态
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);

    const isPreviewMode = computed(() => {
      if (props.preview !== undefined) {
        return !!props.preview;
      }
      return !!props.formCreateInject?.preview;
    });

    const selectedFields = computed(() => {
      return props.selectionProcess?.selectedFields || [];
    });

    const configuredDisplayFields = computed(() => {
      return (
        props.displayFields?.selectedDisplayFields ||
        props.displayFields?.displayRules ||
        []
      );
    });

    const resolveRecordValue = (record, path) => {
      if (!record || !path) return "";
      if (Object.prototype.hasOwnProperty.call(record, path)) {
        return record[path] ?? "";
      }
      if (record.data && Object.prototype.hasOwnProperty.call(record.data, path)) {
        return record.data[path] ?? "";
      }
      if (path.includes(".")) {
        const pathValue = path.split(".").reduce((acc, key) => {
          if (acc == null) return undefined;
          return acc[key];
        }, record);
        return pathValue ?? "";
      }
      return "";
    };

    const normalizeDisplayField = (field) => {
      if (!field) {
        return null;
      }
      if (field.field?.value) {
        return {
          label: field.label,
          value: field.field.value,
        };
      }
      if (field.value) {
        return {
          label: field.label,
          value: field.value,
        };
      }
      return null;
    };

    // 解析嵌套数组格式的值
    // 格式1: [["4"]] -> 提取 "4"
    // 格式2: [[{key: "label", value: ...}, {key: "value", value: ...}]] -> 提取值
    const parseCellValue = (val) => {
      if (!val || !Array.isArray(val)) return val ?? "";
      
      // 如果是嵌套数组格式 [[...]]
      if (Array.isArray(val[0])) {
        // 检查是否是特殊格式 [[{key, value}, ...]]
        if (val[0]?.length > 0 && typeof val[0][0] === 'object' && 'key' in val[0][0]) {
          // 选择数据控件的格式
          return val.map(item => {
            if (Array.isArray(item)) {
              const labelObj = item.find(obj => obj && obj.key === 'label');
              const valueObj = item.find(obj => obj && obj.key === 'value');
              const label = labelObj?.value ?? '未知';
              const rawValue = valueObj?.value;
              const displayValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
              return `${label}: ${displayValue ?? ''}`;
            }
            return '';
          }).join(' | ');
        } else {
          // 普通嵌套数组 [["4"]] -> "4"
          return val[0][0] ?? "";
        }
      }
      
      return val[0] ?? "";
    };

    const buildDisplayTagsFromForm = () => {
      const displayRules = configuredDisplayFields.value
        .map(normalizeDisplayField)
        .filter(Boolean);
      const fillRules = props.fillFields?.fillRules || [];
      const currentForm = props.formCreateInject?.form || {};
      return displayRules.map((rule) => {
        const matchedFillRule = fillRules.find(
          (fillRule) => fillRule?.field?.value === rule.value && fillRule?.targetField
        );
        const formValue = matchedFillRule
          ? currentForm[matchedFillRule.targetField]
          : "";
        return {
          label: rule.label,
          value: formValue ?? "",
        };
        };
      });
    };

    watch(
      () => props.modelValue,
      (newVal) => {
        // 直接使用规范化函数处理
        selectedValue.value = normalizeDisplayValue(newVal);
      },
      { immediate: true, deep: true }
    );

    const fetchFormData = async (page = 1, size = pageSize.value) => {
      if (!props.dataSource) {
        error.value = "请先选择数据源";
        return;
      }

      loading.value = true;
      error.value = "";
      selectedRecord.value = null; // 重置选择状态

      try {
        // 使用用户提供的正确参数格式
        const query = {
          skip: (page - 1) * size,
          take: size,
          scope: {},
          sort: [{
            field: "createTime",
            type: "timestamp",
            dir: -1
          }],
          filter: {
            rel: "and",
            items: [{
              field: "formId",
              type: "none",
              op: "eq",
              value: props.dataSource // 选择的表单的 id
            }, {}]
          }
        };

        // 调用 formDataService.query 方法获取数据
        const data = await formDataService.query(query);
        
        // 处理数据，提取data字段中的实际表单项值
        formData.value = data.map(item => {
            // 提取data字段中的值，并与其他字段合并
            return {
                ...item,
                ...(item.data || {})
            };
        });
        
        // 更新总记录数 - 由于API返回的是数组，暂时使用数组长度作为总数
        // 实际项目中可能需要调用 count 方法获取真实总数
        total.value = data.length;
      } catch (err) {
        error.value = "获取表单数据失败，请重试";
        console.error("获取表单数据失败:", err);
      } finally {
        loading.value = false;
      }
    };

    const handleDataChange = (data) => {
      showDialog.value = false;
      // 显示选择的字段
      selectedValue.value = data;
      emit("update:modelValue", data);
      emit("change", data);
    };

    const handleCancel = () => {
      showDialog.value = false;
      selectedRecord.value = null;
    };

    const handleSelectRecord = (record) => {
      selectedRecord.value = record;
    };

    const handleConfirm = async () => {
      if (selectedRecord.value) {
        // 构建返回数据
        let selectedData = [];
        
        // 检查是否有显示字段配置
        const displayRules = configuredDisplayFields.value
          .map(normalizeDisplayField)
          .filter(Boolean);
        if (displayRules.length > 0) {
            selectedData = displayRules.map(rule => {
                return {
                    label: rule.label,
                    value: resolveRecordValue(selectedRecord.value, rule.value)
                };
            });
        } else {
            selectedData = selectedFields.value.map(field => {
                return {
                    label: field.label,
                    value: resolveRecordValue(selectedRecord.value, field.value)
                };
            });
        }
        
        // 处理填充规则
        const fillRules = props.fillFields?.fillRules || [];
        
        if (fillRules.length > 0 && props.formCreateInject) {
            
            // 构建要填充的表单数据
            const formData = {};
            
            // 遍历填充规则，将数据填充到对应字段
            fillRules.forEach(rule => {
                if (rule.targetField) {
                    const fieldValue = selectedRecord.value[rule.field.value] || "";                    
                    formData[rule.targetField] = fieldValue;
                }
            });
            
            // 尝试多种方法设置字段值
            try {
                
                // 检查 fillRules 中的 targetField 是否存在于表单字段中
                const formFields = Object.keys(props.formCreateInject.form || {});
                fillRules.forEach(rule => {
                    const fieldExists = formFields.includes(rule.targetField);
                });

                // 方法 1: 先清除所有字段值，然后再设置新值
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    // 先清除所有字段值
                    Object.keys(formData).forEach(field => {
                        props.formCreateInject.api.setValue(field, '');
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 2: 尝试使用 formCreateInject.api.setFormData 一次性设置所有字段
                if (props.formCreateInject.api && props.formCreateInject.api.setFormData) {
                    props.formCreateInject.api.setFormData(formData);
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 3: 尝试使用 formCreateInject.api.setValue 逐个设置字段
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    
                    // 逐个设置字段值
                    Object.keys(formData).forEach(field => {
                        props.formCreateInject.api.setValue(field, formData[field]);
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 4: 尝试使用 formCreateInject.form 直接设置
                if (props.formCreateInject.form) {
                    
                    // 遍历所有字段，直接设置值
                    Object.keys(formData).forEach(field => {
                        // 先设置为一个不同的值，然后再设置新值，强制触发Vue的响应式更新
                        props.formCreateInject.form[field] = null;
                        props.formCreateInject.form[field] = formData[field];
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 5: 刷新表单
                if (props.formCreateInject.api && props.formCreateInject.api.refresh) {
                    props.formCreateInject.api.refresh();
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 6: 再次使用 formCreateInject.api.setValue 逐个设置字段
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    Object.keys(formData).forEach(field => {                        
                        props.formCreateInject.api.setValue(field, formData[field]);
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 7: 再次刷新表单
                if (props.formCreateInject.api && props.formCreateInject.api.refresh) {
                    props.formCreateInject.api.refresh();
                }
                
                // 等待 DOM 更新
                await nextTick();
            } catch (error) {
                console.error('设置字段值时出错:', error);
            }
        } 
        
        handleDataChange(selectedData);
      }
    };

    const handleEditTag = () => {
      currentPage.value = 1; // 重置到第一页
      fetchFormData();
      showDialog.value = true;
    };

    // 处理页码变化
    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchFormData(page, pageSize.value);
    };

    // 处理每页显示条数变化
    const handlePageSizeChange = (size) => {
      pageSize.value = size;
      currentPage.value = 1; // 重置到第一页
      fetchFormData(1, size);
    };

    return () => {
      const { disabled, preview, ...attrs } = props;
      const editable = !(disabled || isPreviewMode.value);
      
      const tagHeight = "60px";
      
      // 直接使用 selectedValue 中的数据（已通过 watch 规范化）
      const displayTags = (selectedValue.value || []).map(tag => ({
        label: tag?.label || '未知字段',
        value: String(tag?.value ?? "暂无内容")
      }));
      
      return (
        <div style={{ width: "100%" }}>
          {/* 编辑状态显示按钮 */}
          {editable && (
            <SelectedTags
              modelValue={[]}
              class={"_fc-form-selected-data"}
              style={{ height: tagHeight }}
              editable={editable}
              emptyText={props.selectionProcess?.buttonText || "+选择数据"}
              onEditTag={handleEditTag}
            ></SelectedTags>
          )}

          {displayTags.length > 0 && (
            <div class="form-selected-data-display-panel">
              {displayTags.map((tag, index) => (
                <div
                  key={index}
                  class="form-selected-data-display-row"
                  style={{
                    borderBottom:
                      index === displayTags.length - 1 ? "none" : "1px solid #ebeef5",
                  }}
                >
                  <span class="form-selected-data-display-label">{tag.label}</span>
                  <span class="form-selected-data-display-value">{tag.value || "暂无内容"}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* 没有选择数据时显示空状态 */}
          {displayTags.length === 0 && editable && (
            <div style={{ padding: "8px 0", color: "#909399" }}>
              暂无数据
            </div>
          )}

          {editable && showDialog.value && (
            <div class="form-selected-data-dialog">
              <div class="form-selected-data-dialog-content">
                <div class="form-selected-data-dialog-header">
                  <h3>选择数据</h3>
                  <button class="form-selected-data-dialog-close" onClick={handleCancel}>
                    ×
                  </button>
                </div>
                <div class="form-selected-data-dialog-body">
                  {/* 错误提示 */}
                  {error.value && (
                    <div style={{ color: "#f56c6c", marginBottom: "15px" }}>
                      {error.value}
                    </div>
                  )}
                  
                  {/* 数据加载状态 */}
                  {loading.value ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      加载中...
                    </div>
                  ) : formData.value.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      暂无数据
                    </div>
                  ) : (
                    <div style={{ marginBottom: "20px", maxHeight: "400px", overflowY: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f5f7fa" }}>
                          <th style={{ padding: "10px", border: "1px solid #e6e6e6", textAlign: "center", width: "80px" }}>
                            选择
                          </th>
                            {selectedFields.value.map(field => (
                              <th key={field.value} style={{ padding: "10px", border: "1px solid #e6e6e6", textAlign: "center" }}>
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formData.value.map((record, index) => (
                            <tr key={index}
                                onClick={() => handleSelectRecord(record)}
                                style={{
                                    backgroundColor: selectedRecord.value === record ? "#ecf5ff" : "",
                                    border: "1px solid #e6e6e6",
                                    cursor: "pointer"
                                }}>
                                <td style={{ padding: "10px", border: "1px solid #e6e6e6", textAlign: "center" }}>
                                    <input type="radio" 
                                           checked={selectedRecord.value === record}
                                           onClick={(e) => {
                                               e.stopPropagation();
                                               handleSelectRecord(record);
                                           }}
                                    />
                                </td>
                                {selectedFields.value.map(field => {
                                    const rawValue = record[field.value];
                                    const displayValue = parseCellValue(rawValue);
                                    return (
                                    <td key={field.value} style={{ padding: "10px", border: "1px solid #e6e6e6" }}>
                                        {displayValue}
                                    </td>
                                    );
                                })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* 分页控件 */}
                  {!loading.value && formData.value.length > 0 && (
                    <div class="form-selected-data-pagination">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: "12px", color: "#606266" }}>
                          共 {total.value} 条记录
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginRight: "10px", fontSize: "12px", color: "#606266" }}>
                            每页显示：
                          </span>
                          <select 
                            value={pageSize.value} 
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            style={{ 
                              padding: "4px 8px", 
                              border: "1px solid #dcdfe6", 
                              borderRadius: "4px",
                              fontSize: "12px"
                            }}
                          >
                            <option value={10}>10条</option>
                            <option value={20}>20条</option>
                            <option value={50}>50条</option>
                          </select>
                          <div style={{ marginLeft: "20px", display: "flex", alignItems: "center" }}>
                            <button 
                              onClick={() => handlePageChange(currentPage.value - 1)}
                              disabled={currentPage.value === 1}
                              style={{ 
                                padding: "4px 8px", 
                                border: "1px solid #dcdfe6", 
                                borderRadius: "4px",
                                marginRight: "5px",
                                backgroundColor: currentPage.value === 1 ? "#f5f7fa" : "#fff",
                                cursor: currentPage.value === 1 ? "not-allowed" : "pointer"
                              }}
                            >
                              上一页
                            </button>
                            <span style={{ margin: "0 10px", fontSize: "12px" }}>
                              {currentPage.value}
                            </span>
                            <button 
                              onClick={() => handlePageChange(currentPage.value + 1)}
                              disabled={currentPage.value * pageSize.value >= total.value}
                              style={{ 
                                padding: "4px 8px", 
                                border: "1px solid #dcdfe6", 
                                borderRadius: "4px",
                                marginLeft: "5px",
                                backgroundColor: currentPage.value * pageSize.value >= total.value ? "#f5f7fa" : "#fff",
                                cursor: currentPage.value * pageSize.value >= total.value ? "not-allowed" : "pointer"
                              }}
                            >
                              下一页
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div class="form-selected-data-dialog-footer">
                  <button 
                    class="form-selected-data-dialog-btn form-selected-data-dialog-btn-confirm"
                    onClick={handleConfirm}
                    disabled={!selectedRecord.value}
                  >
                    确定
                  </button>
                  <button 
                    class="form-selected-data-dialog-btn form-selected-data-dialog-btn-cancel"
                    onClick={handleCancel}
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});
