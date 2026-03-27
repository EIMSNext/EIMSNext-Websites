import { defineComponent, ref, watch, computed, nextTick, reactive } from "vue";
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
    console.log('=== formSelectedData 组件初始化 ===');
    console.log('props.modelValue:', props.modelValue);
    console.log('props.modelValue 类型:', typeof props.modelValue);
    
    const showDialog = ref(false);
    // 初始化时检查props.modelValue是否是包含 [object Object] 的字符串
    let initialValue = props.modelValue ?? [];
    console.log('初始值 before:', initialValue);
    console.log('初始值类型:', typeof initialValue);
    console.log('初始值是否为字符串:', typeof initialValue === 'string');
    if (typeof initialValue === 'string') {
      console.log('初始值是否包含[object Object]:', initialValue.includes('[object Object]'));
      if (initialValue.includes('[object Object]')) {
        console.log('检测到 [object Object] 格式字符串，转换为结构化数据');
        // 检查是否有选择的字段配置
        if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
          console.log('使用 selectedFields 配置构建显示数据');
          initialValue = props.selectionProcess.selectedFields.map(field => {
            return {
              label: field.label,
              value: '已选择数据'
            };
          });
        } else {
          initialValue = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
        }
      }
    } else if (Array.isArray(initialValue)) {
      console.log('初始值是数组，检查数组元素');
      // 检查数组元素是否包含[object Object]字符串
      const hasObjectString = initialValue.some(item => {
        if (typeof item === 'string') {
          return item.includes('[object Object]');
        }
        return false;
      });
      if (hasObjectString) {
        console.log('检测到数组中包含[object Object]字符串，转换为结构化数据');
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
      }
    }
    console.log('初始值 after:', initialValue);
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

    watch(
      () => props.modelValue,
      (newVal) => {
        console.log('=== props.modelValue 变化 ===');
        console.log('newVal:', newVal);
        console.log('newVal 类型:', typeof newVal);
        
        let processedValue = newVal ?? [];
        console.log('处理前的值:', processedValue);
        console.log('处理前的值类型:', typeof processedValue);
        
        if (typeof processedValue === 'string') {
          console.log('值是字符串，是否包含[object Object]:', processedValue.includes('[object Object]'));
          if (processedValue.includes('[object Object]')) {
            console.log('检测到 [object Object] 格式字符串，转换为结构化数据');
            // 检查是否有选择的字段配置
            if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
              console.log('使用 selectedFields 配置构建显示数据');
              processedValue = props.selectionProcess.selectedFields.map(field => {
                return {
                  label: field.label,
                  value: '已选择数据'
                };
              });
            } else {
              processedValue = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
            }
          }
        } else if (Array.isArray(processedValue)) {
          console.log('值是数组，检查数组元素');
          // 检查数组元素是否包含[object Object]字符串
          const hasObjectString = processedValue.some(item => {
            if (typeof item === 'string') {
              return item.includes('[object Object]');
            }
            return false;
          });
          if (hasObjectString) {
            console.log('检测到数组中包含[object Object]字符串，转换为结构化数据');
            if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
              processedValue = props.selectionProcess.selectedFields.map(field => {
                return {
                  label: field.label,
                  value: '已选择数据'
                };
              });
            } else {
              processedValue = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
            }
          }
        }
        
        selectedValue.value = processedValue;
        console.log('selectedValue.value:', selectedValue.value);
      },
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
        const displayRules = props.displayFields?.displayRules || [];
        if (displayRules.length > 0) {
            console.log('使用 displayFields 配置构建显示数据');
            selectedData = displayRules.map(rule => {
                return {
                    label: rule.label,
                    value: selectedRecord.value[rule.field.value] || ""
                };
            });
        } else {
            console.log('使用默认 selectedFields 构建显示数据');
            selectedData = selectedFields.value.map(field => {
                return {
                    label: field.label,
                    value: selectedRecord.value[field.value] || ""
                };
            });
        }
        
        // 处理填充规则
        const fillRules = props.fillFields?.fillRules || [];
        console.log('=== 填充规则调试信息 ===');
        console.log('fillRules:', fillRules);
        console.log('formCreateInject:', props.formCreateInject);
        console.log('formCreateInject.api:', props.formCreateInject?.api);
        console.log('formCreateInject.api 方法:', props.formCreateInject?.api ? Object.keys(props.formCreateInject.api) : '无');
        console.log('selectedRecord:', selectedRecord.value);
        
        if (fillRules.length > 0 && props.formCreateInject) {
            console.log('开始处理填充规则');
            
            // 构建要填充的表单数据
            const formData = {};
            
            // 遍历填充规则，将数据填充到对应字段
            fillRules.forEach(rule => {
                console.log('处理规则:', rule);
                if (rule.targetField) {
                    const fieldValue = selectedRecord.value[rule.field.value] || "";
                    console.log('填充字段:', rule.targetField, '值:', fieldValue);
                    formData[rule.targetField] = fieldValue;
                }
            });
            
            // 尝试多种方法设置字段值
            try {
                console.log('当前表单数据:', props.formCreateInject.form);
                console.log('要填充的表单数据:', formData);
                console.log('表单字段列表:', Object.keys(props.formCreateInject.form || {}));
                
                // 检查 fillRules 中的 targetField 是否存在于表单字段中
                console.log('=== 检查填充规则 ===');
                const formFields = Object.keys(props.formCreateInject.form || {});
                fillRules.forEach(rule => {
                    const fieldExists = formFields.includes(rule.targetField);
                    console.log('规则:', rule.targetField, '存在于表单中:', fieldExists);
                });
                
                // 检查 formCreateInject 的完整结构
                console.log('=== 检查 formCreateInject 结构 ===');
                console.log('formCreateInject 所有属性:', Object.keys(props.formCreateInject));
                console.log('formCreateInject.api 所有方法:', props.formCreateInject.api ? Object.keys(props.formCreateInject.api) : '无');
                console.log('formCreateInject.form 所有属性:', props.formCreateInject.form ? Object.keys(props.formCreateInject.form) : '无');
                
                // 检查 formCreateInject.formCreate 结构
                if (props.formCreateInject.formCreate) {
                    console.log('=== 检查 formCreateInject.formCreate 结构 ===');
                    console.log('formCreateInject.formCreate 所有属性:', Object.keys(props.formCreateInject.formCreate));
                    if (props.formCreateInject.formCreate.api) {
                        console.log('formCreateInject.formCreate.api 所有方法:', Object.keys(props.formCreateInject.formCreate.api));
                    }
                }
                
                // 方法 1: 先清除所有字段值，然后再设置新值
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    console.log('=== 清除字段值 ===');
                    // 先清除所有字段值
                    Object.keys(formData).forEach(field => {
                        console.log('清除字段:', field);
                        props.formCreateInject.api.setValue(field, '');
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 2: 尝试使用 formCreateInject.api.setFormData 一次性设置所有字段
                if (props.formCreateInject.api && props.formCreateInject.api.setFormData) {
                    console.log('=== 填充表单数据 ===');
                    console.log('使用 formCreateInject.api.setFormData 方法');
                    console.log('要填充的表单数据:', formData);
                    props.formCreateInject.api.setFormData(formData);
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 3: 尝试使用 formCreateInject.api.setValue 逐个设置字段
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    console.log('使用 formCreateInject.api.setValue 方法');
                    
                    // 逐个设置字段值
                    Object.keys(formData).forEach(field => {
                        console.log('设置字段:', field, '值:', formData[field]);
                        props.formCreateInject.api.setValue(field, formData[field]);
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 4: 尝试使用 formCreateInject.form 直接设置
                if (props.formCreateInject.form) {
                    console.log('使用 formCreateInject.form 直接设置');
                    
                    // 遍历所有字段，直接设置值
                    Object.keys(formData).forEach(field => {
                        console.log('直接设置字段:', field, '值:', formData[field]);
                        // 先设置为一个不同的值，然后再设置新值，强制触发Vue的响应式更新
                        props.formCreateInject.form[field] = null;
                        props.formCreateInject.form[field] = formData[field];
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 5: 刷新表单
                if (props.formCreateInject.api && props.formCreateInject.api.refresh) {
                    console.log('使用 formCreateInject.api.refresh 方法');
                    props.formCreateInject.api.refresh();
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 6: 再次使用 formCreateInject.api.setValue 逐个设置字段
                if (props.formCreateInject.api && props.formCreateInject.api.setValue) {
                    console.log('再次使用 formCreateInject.api.setValue 方法');
                    Object.keys(formData).forEach(field => {
                        console.log('再次设置字段:', field, '值:', formData[field]);
                        props.formCreateInject.api.setValue(field, formData[field]);
                    });
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                // 方法 7: 再次刷新表单
                if (props.formCreateInject.api && props.formCreateInject.api.refresh) {
                    console.log('再次使用 formCreateInject.api.refresh 方法');
                    props.formCreateInject.api.refresh();
                }
                
                // 等待 DOM 更新
                await nextTick();
                
                console.log('填充规则处理完成');
                console.log('更新后表单数据:', props.formCreateInject.form);
            } catch (error) {
                console.error('设置字段值时出错:', error);
            }
        } else {
            console.log('没有填充规则或 formCreateInject');
            console.log('fillRules.length:', fillRules.length);
            console.log('formCreateInject:', props.formCreateInject);
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
      console.log('=== formSelectedData 渲染函数执行 ===');
      console.log('props.modelValue:', props.modelValue);
      console.log('props.modelValue 类型:', typeof props.modelValue);
      console.log('selectedValue.value:', selectedValue.value);
      console.log('selectedValue.value 类型:', typeof selectedValue.value);
      
      const { disabled, preview, ...attrs } = props;
      const editable = !(disabled || isPreviewMode.value);
      console.log('editable:', editable);
      console.log('isPreviewMode.value:', isPreviewMode.value);
      
      let tags = selectedValue.value || [];
      console.log('tags before:', tags);
      console.log('tags 类型:', typeof tags);
      
      const tagHeight = "60px";

      // 直接检查 tags 是否是包含 [object Object] 的字符串
      if (typeof tags === 'string' && tags.includes('[object Object]')) {
        console.log('检测到 [object Object] 格式字符串，转换为结构化数据');
        // 尝试从字符串中提取有意义的信息
        // 检查是否有选择的字段配置
        if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
          console.log('使用 selectedFields 配置构建显示数据');
          tags = props.selectionProcess.selectedFields.map(field => {
            return {
              label: field.label,
              value: '已选择数据'
            };
          });
        } else {
          tags = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
        }
      }
      console.log('tags after:', tags);

      // 简化数据处理逻辑，确保能正确处理各种数据格式
      let displayTags = [];
      
      try {
        // 首先尝试将 tags 转换为字符串，然后解析为 JSON
        let processedTags = tags;
        
        // 如果 tags 是字符串，尝试解析
        if (typeof tags === 'string') {
          try {
            processedTags = JSON.parse(tags);
          } catch (e) {
            // 解析失败，检查是否是 "[object Object]" 格式
            if (tags.includes('[object Object]')) {
              // 尝试从字符串中提取有意义的信息
              if (props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0) {
                processedTags = props.selectionProcess.selectedFields.map(field => {
                  return {
                    label: field.label,
                    value: '[已选择数据]'
                  };
                });
              } else {
                processedTags = [{ label: '已选择数据', value: '数据已选择但无法显示详细信息' }];
              }
            } else {
              // 保持原样
            }
          }
        }
        
        // 处理数组类型
        if (Array.isArray(processedTags)) {
          displayTags = processedTags.map(tag => {
            // 如果是对象且有 label 和 value 属性，直接使用
            if (typeof tag === 'object' && tag !== null && 'label' in tag && 'value' in tag) {
              return tag;
            }
            // 否则，尝试转换为字符串
            return { label: '未知字段', value: String(tag) };
          });
        } else if (typeof processedTags === 'object' && processedTags !== null) {
          // 处理对象类型
          displayTags = Object.entries(processedTags).map(([key, value]) => {
            return { label: key, value: String(value) };
          });
        } else {
          // 处理其他类型
          displayTags = [{ label: '未知字段', value: String(processedTags) }];
        }
      } catch (e) {
        // 处理任何错误，确保组件不会崩溃
        console.error('处理数据时出错:', e);
        // 检查是否是 "[object Object]" 格式
        if (typeof tags === 'string' && tags.includes('[object Object]')) {
          displayTags = [];
        } else {
          displayTags = [{ label: '未知字段', value: String(tags) }];
        }
      }
      
      // 确保 displayTags 是数组
      if (!Array.isArray(displayTags)) {
        displayTags = [{ label: '未知字段', value: String(displayTags) }];
      }
      
      // 确保数组中的每个元素都有 label 和 value 属性
      displayTags = displayTags.map(tag => {
        if (typeof tag === 'object' && tag !== null) {
          let value = tag.value;
          // 处理对象类型的value
          if (typeof value === 'object' && value !== null) {
            // 尝试将对象转换为字符串
            try {
              value = JSON.stringify(value);
            } catch (e) {
              value = String(value);
            }
          } else if (value !== undefined) {
            value = String(value);
            // 处理包含[object Object]的字符串
            if (value.includes('[object Object]')) {
              value = '已选择数据';
            }
          } else {
            value = '';
          }
          return {
            label: tag.label || '未知字段',
            value: value
          };
        }
        // 处理字符串类型的tag
        const tagStr = String(tag);
        if (tagStr.includes('[object Object]')) {
          return { label: '已选择数据', value: '数据已选择但无法显示详细信息' };
        }
        return { label: '未知字段', value: tagStr };
      });

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
          
          {/* 只读状态显示 */}
          {!editable && (
            <>
              <div class="_fc-form-selected-data" style={{ height: tagHeight, display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #dcdfe6', borderRadius: '4px', backgroundColor: '#f5f7fa' }}>
                已选择数据
              </div>
              
              {/* 显示选择的数据，每一个字段名+字段值占一行 */}
              <div class="form-selected-data-display" style={{ marginTop: "8px" }}>
                {props.selectionProcess?.selectedFields && props.selectionProcess.selectedFields.length > 0 ? (
                  props.selectionProcess.selectedFields.map((field, index) => (
                    <div key={index} style={{ marginBottom: "4px", display: "flex" }}>
                      <span style={{ marginRight: "8px", color: "#909399" }}>{field.label}:</span>
                      <span style={{ color: "#303133" }}>已选择数据</span>
                    </div>
                  ))
                ) : (
                  <div style={{ marginBottom: "4px" }}>
                    <span style={{ color: "#303133" }}>数据已选择但无法显示详细信息</span>
                  </div>
                )}
              </div>
            </>
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
