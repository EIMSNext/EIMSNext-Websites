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
    
    // 处理初始值，确保能正确处理各种格式
    let initialValue = props.modelValue ?? [];
    
    // 如果是字符串，尝试解析为数组
    if (typeof initialValue === 'string') {
      // 检查是否是 [object Object] 格式的字符串
      if (initialValue.includes('[object Object]')) {
        // 根据选择的字段配置构建显示数据
        if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
          initialValue = props.selectionProcess.selectedFields.map(field => {
            return {
              label: field.label,
              value: '已选择数据'
            };
          });
        } else {
          initialValue = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
        }
      } else {
        // 尝试解析 JSON
        try {
          const parsed = JSON.parse(initialValue);
          if (Array.isArray(parsed)) {
            initialValue = parsed;
          }
        } catch (e) {
          // 解析失败，保持原样
          console.log('JSON 解析失败:', e);
        }
      }
    }
    
    // 如果初始值是数组，检查是否需要处理
    if (Array.isArray(initialValue)) {
      // 检查数组元素
      const needsProcessing = initialValue.some(item => {
        if (typeof item === 'string') {
          return item.includes('[object Object]');
        }
        if (typeof item === 'object' && item !== null) {
          // 检查对象是否缺少 label/value 属性
          return !('label' in item && 'value' in item);
        }
        return false;
      });
      
      if (needsProcessing) {
        // 根据选择的字段配置构建显示数据
        if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
          initialValue = props.selectionProcess.selectedFields.map((field, index) => {
            const item = initialValue[index];
            let value = '已选择数据';
            if (item !== undefined) {
              if (typeof item === 'object' && item !== null) {
                // 尝试从对象中提取值
                if (item.value !== undefined) value = String(item.value);
                else if (item.label !== undefined) value = String(item.label);
                else {
                  const values = Object.values(item);
                  value = values.length > 0 ? String(values[0]) : '已选择数据';
                }
              } else {
                value = String(item);
              }
            }
            return {
              label: field.label,
              value: value.includes('[object Object]') ? '已选择数据' : value
            };
          });
        }
      } else {
        // 即使不需要处理，也要确保每个对象都有正确的格式
        initialValue = initialValue.map(item => {
          if (typeof item === 'object' && item !== null) {
            if ('label' in item && 'value' in item) {
              return {
                label: item.label,
                value: String(item.value || "暂无内容")
              };
            } else {
              // 如果对象没有label和value属性，尝试从selectedFields中获取label
              const fieldIndex = initialValue.indexOf(item);
              if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields[fieldIndex]) {
                const field = props.selectionProcess.selectedFields[fieldIndex];
                return {
                  label: field.label,
                  value: String(Object.values(item)[0] || "暂无内容")
                };
              } else {
                return {
                  label: '未知字段',
                  value: String(item) === '[object Object]' ? '已选择数据' : String(item)
                };
              }
            }
          } else {
            return {
              label: '未知字段',
              value: String(item)
            };
          }
        });
      }
    }
    
    console.log('处理后的初始值:', initialValue);
    const selectedValue = ref(initialValue);
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
      });
    };

    watch(
      () => props.modelValue,
      (newVal) => {
        let processedValue = newVal ?? [];
        
        // 如果是字符串，尝试解析
        if (typeof processedValue === 'string') {
          if (processedValue.includes('[object Object]')) {
            if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
              processedValue = props.selectionProcess.selectedFields.map(field => ({
                label: field.label,
                value: '已选择数据'
              }));
            } else {
              processedValue = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
            }
          } else {
            // 尝试解析 JSON
            try {
              const parsed = JSON.parse(processedValue);
              if (Array.isArray(parsed)) {
                processedValue = parsed;
              }
            } catch (e) {
              console.log('JSON 解析失败:', e);
            }
          }
        }
        
        // 如果是数组，检查是否需要处理
        if (Array.isArray(processedValue)) {
         
          const needsProcessing = processedValue.some(item => {
            if (typeof item === 'string') {
              return item.includes('[object Object]');
            }
            if (typeof item === 'object' && item !== null) {
              return !('label' in item && 'value' in item);
            }
            return false;
          });
          
          if (needsProcessing) {
            if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
              processedValue = props.selectionProcess.selectedFields.map((field, index) => {
                const item = processedValue[index];
                let value = '已选择数据';
                if (item !== undefined) {
                  if (typeof item === 'object' && item !== null) {
                    if (item.value !== undefined) value = String(item.value);
                    else if (item.label !== undefined) value = String(item.label);
                    else {
                      const values = Object.values(item);
                      value = values.length > 0 ? String(values[0]) : '已选择数据';
                    }
                  } else {
                    value = String(item);
                  }
                }
                return {
                  label: field.label,
                  value: value.includes('[object Object]') ? '已选择数据' : value
                };
              });
            }
          } else {
            // 即使不需要处理，也要确保每个对象都有正确的格式
            processedValue = processedValue.map(item => {
              if (typeof item === 'object' && item !== null) {
                if ('label' in item && 'value' in item) {
                  return {
                    label: item.label,
                    value: String(item.value || "暂无内容")
                  };
                } else {
                  // 如果对象没有label和value属性，尝试从selectedFields中获取label
                  const fieldIndex = processedValue.indexOf(item);
                  if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields[fieldIndex]) {
                    const field = props.selectionProcess.selectedFields[fieldIndex];
                    return {
                      label: field.label,
                      value: String(Object.values(item)[0] || "暂无内容")
                    };
                  } else {
                    return {
                      label: '未知字段',
                      value: String(item) === '[object Object]' ? '已选择数据' : String(item)
                    };
                  }
                }
              } else {
                return {
                  label: '未知字段',
                  value: String(item)
                };
              }
            });
          }
        }
        
        selectedValue.value = processedValue;
      },
      { immediate: true }
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
      
      let displayTags = selectedValue.value || [];
      
      const tagHeight = "60px";
      
      // 在预览模式下，优先使用 selectedValue 中的数据
      if (isPreviewMode.value && Array.isArray(selectedValue.value) && selectedValue.value.length > 0) {
        displayTags = selectedValue.value.map(tag => {
          if (typeof tag === 'object' && tag !== null) {
            return {
              label: tag.label || '未知字段',
              value: String(tag.value || "暂无内容")
            };
          } else {
            return {
              label: '未知字段',
              value: String(tag)
            };
          }
        });
      } else {
        // 非预览模式，尝试从表单中获取值来显示
        const fallbackDisplayTags = buildDisplayTagsFromForm().filter(
          (tag) => tag.label
        );
        
        if (fallbackDisplayTags.length > 0) {
          displayTags = fallbackDisplayTags.map((tag) => ({
            label: tag.label,
            value: tag.value === "" ? "暂无内容" : String(tag.value),
          }));
        } else {
          // 如果没有从表单获取到数据，再尝试处理 selectedValue
          // 确保 displayTags 是数组
          if (!Array.isArray(displayTags)) {
            displayTags = [];
          }
          
          // 直接使用 selectedValue 的数据
          if (Array.isArray(displayTags) && displayTags.length > 0) {
            // 确保每个标签都有正确的格式
            displayTags = displayTags.map(tag => {
              if (typeof tag === 'object' && tag !== null) {
                return {
                  label: tag.label || '未知字段',
                  value: String(tag.value || "暂无内容")
                };
              } else {
                return {
                  label: '未知字段',
                  value: String(tag)
                };
              }
            });
          } else {
            // 如果 selectedValue 是空的，尝试直接从 props.modelValue 处理
            let rawValue = props.modelValue;
            
            // 处理各种数据格式
            if (typeof rawValue === 'string' && rawValue.includes('[object Object]')) {
              if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
                displayTags = props.selectionProcess.selectedFields.map(field => ({
                  label: field.label,
                  value: '已选择数据'
                }));
              }
            } else if (Array.isArray(rawValue) && rawValue.length > 0) {
              // 检查数组元素
              const needsProcessing = rawValue.some(item => {
                if (typeof item === 'string') {
                  return item.includes('[object Object]');
                }
                if (typeof item === 'object' && item !== null) {
                  return !('label' in item && 'value' in item);
                }
                return false;
              });
              
              if (needsProcessing && props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
                displayTags = props.selectionProcess.selectedFields.map((field, index) => {
                  const item = rawValue[index];
                  let value = '已选择数据';
                  if (item !== undefined) {
                    if (typeof item === 'object' && item !== null) {
                      if (item.value !== undefined) value = String(item.value);
                      else if (item.label !== undefined) value = String(item.label);
                      else {
                        const values = Object.values(item);
                        value = values.length > 0 ? String(values[0]) : '已选择数据';
                      }
                    } else {
                      value = String(item);
                    }
                  }
                  return {
                    label: field.label,
                    value: value.includes('[object Object]') ? '已选择数据' : value
                  };
                });
              } else if (!needsProcessing) {
                // 如果不需要处理，直接使用原始数据，但确保格式正确
                displayTags = rawValue.map(item => {
                  if (typeof item === 'object' && item !== null) {
                    if ('label' in item && 'value' in item) {
                      return {
                        label: item.label,
                        value: String(item.value || "暂无内容")
                      };
                    } else {
                      // 如果对象没有label和value属性，尝试从selectedFields中获取label
                      const fieldIndex = rawValue.indexOf(item);
                      if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields[fieldIndex]) {
                        const field = props.selectionProcess.selectedFields[fieldIndex];
                        return {
                          label: field.label,
                          value: String(Object.values(item)[0] || "暂无内容")
                        };
                      } else {
                        return {
                          label: '未知字段',
                          value: String(item) === '[object Object]' ? '已选择数据' : String(item)
                        };
                      }
                    }
                  } else {
                    return {
                      label: '未知字段',
                      value: String(item)
                    };
                  }
                });
              }
            }
          }
          
          // 过滤掉无效的标签
          displayTags = displayTags.filter(tag => tag && typeof tag === 'object' && 'label' in tag);
        }
      }
      
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
                                {selectedFields.value.map(field => (
                                    <td key={field.value} style={{ padding: "10px", border: "1px solid #e6e6e6" }}>
                                        {record[field.value] || ""}
                                    </td>
                                ))}
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
