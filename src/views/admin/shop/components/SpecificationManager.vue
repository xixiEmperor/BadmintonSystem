<script setup>
import { ref,  onMounted } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import {
  getProductSpecifications,
  getProductSpecOptions,
  addProductSpecification,
  updateSpecification,
  deleteSpecification,
  // updateProduct
} from '@/api/shop'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  productId: {
    type: Number,
    required: true
  },
  productSpecOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 规格选项表单
const specOptionsForm = ref([{ key: 'color', customKey: '', values: [] }])

// 生成的规格组合
const specCombinations = ref([])

// 现有规格列表
const existingSpecifications = ref([])

// 编辑模式规格
const editingSpec = ref(null)

// 规格选项映射
const specKeyMap = {
  'color': '颜色',
  'size': '尺寸',
  'material': '材质',
  'style': '款式',
  'custom': '自定义'
}

// 初始化
onMounted(async () => {
  if (props.productId) {
    await Promise.all([
      loadProductSpecifications(),
      loadProductSpecOptions()
    ])
  }
})

// 加载商品规格列表
const loadProductSpecifications = async () => {
  loading.value = true
  try {
    const res = await getProductSpecifications(props.productId)
    if (res.data.code === 0) {
      existingSpecifications.value = res.data.data || []
    } else {
      ElMessage.error(res.data.msg || '获取商品规格失败')
    }
  } catch (error) {
    console.error('获取商品规格出错', error)
    ElMessage.error('获取商品规格出错')
  } finally {
    loading.value = false
  }
}

// 加载商品规格选项
const loadProductSpecOptions = async () => {
  try {
    const res = await getProductSpecOptions(props.productId)
    if (res.data.code === 0 && res.data.data) {
      const options = res.data.data
      console.log('规格选项:', options)

      // 重置规格选项表单
      specOptionsForm.value = []

      // 将已有规格选项加入表单
      options.forEach(item => {
        // 检查是否是预定义的规格类型
        const isPreDefinedKey = Object.keys(specKeyMap).includes(item.specKey)
        specOptionsForm.value.push({
          key: isPreDefinedKey ? item.specKey : 'custom',
          customKey: isPreDefinedKey ? '' : item.specKey,  // 如果不是预定义类型，保存为自定义类型
          values: item.specValues || []
        })
      })

      // 确保至少有一行
      if (specOptionsForm.value.length === 0) {
        specOptionsForm.value.push({ key: 'color', customKey: '', values: [] })
      }
    }
  } catch (error) {
    console.error('获取规格选项出错', error)
  }
}

// 格式化规格键名
const formatSpecKey = (key) => {
  return specKeyMap[key] || key
}

// 添加规格选项行
const addSpecOptionRow = () => {
  specOptionsForm.value.push({ key: '', customKey: '', values: [] })
}

// 移除规格选项行
const removeSpecOptionRow = (index) => {
  specOptionsForm.value.splice(index, 1)
}

// 生成规格组合
const generateSpecCombinations = () => {
  // 过滤有效的规格选项
  const validOptions = specOptionsForm.value.filter(opt => {
    return opt.key && opt.values && opt.values.length > 0 &&
           (opt.key !== 'custom' || (opt.key === 'custom' && opt.customKey))
  })

  if (validOptions.length === 0) {
    ElMessage.warning('请至少添加一个有效的规格选项')
    return
  }

  // 生成规格选项数据结构
  const optionsData = {}
  validOptions.forEach(opt => {
    const key = opt.key === 'custom' ? opt.customKey : opt.key
    optionsData[key] = opt.values
  })

  // 生成所有可能的组合
  specCombinations.value = generateCombinations(optionsData)
}

// 生成所有可能的规格组合(全排列)
const generateCombinations = (optionsData) => {
  const keys = Object.keys(optionsData)
  if (keys.length === 0) return []

  // 递归生成所有组合
  const combine = (index, current) => {
    if (index === keys.length) {
      return [{
        specs: { ...current },
        priceAdjustment: 0,
        stock: 100
      }]
    }

    const key = keys[index]
    const values = optionsData[key]
    const result = []

    values.forEach(value => {
      const newCurrent = { ...current }
      newCurrent[key] = value
      result.push(...combine(index + 1, newCurrent))
    })

    return result
  }

  return combine(0, {})
}

// 保存所有规格
const saveAllSpecifications = async () => {
  if (specCombinations.value.length === 0) {
    ElMessage.warning('请先生成规格组合')
    return
  }

  submitting.value = true

  // 创建加载提示
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在保存所有规格...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    // 先保存规格选项
    const specOptions = {}
    specOptionsForm.value.forEach(opt => {
      if (opt.values && opt.values.length > 0) {
        const key = opt.key === 'custom' ? opt.customKey : opt.key
        if (key) {
          specOptions[key] = opt.values
        }
      }
    })

    // 更新商品以启用规格
      // const productUpdate = {
      //   hasSpecification: 1,
      //   specOptions: JSON.stringify(specOptions)
      // }

    // 更新商品规格设置
    // await updateProduct(props.productId, productUpdate)

    // 保存所有规格组合
    // 使用定时器控制请求发送速率
    const results = []
    const failedSpecs = []
    const totalSpecs = specCombinations.value.length

    // 创建进度提示组件
    const progressMessage = ElMessage({
      type: 'info',
      message: `正在保存规格...`,
      duration: 0,
      showClose: true
    })

    // 使用Promise完成所有保存任务
    await new Promise((resolve) => {
      let index = 0

      const saveNext = async () => {
        if (index >= specCombinations.value.length) {
          resolve()
          return
        }

        const combo = specCombinations.value[index]

        // 更新进度消息
        progressMessage.message = `正在保存规格... (${index + 1}/${totalSpecs})`

        try {
          const result = await addProductSpecification(props.productId, {
            specifications: combo.specs,
            priceAdjustment: combo.priceAdjustment,
            stock: combo.stock
          })
          results.push(result)
        } catch (error) {
          console.error('保存规格失败:', error)
          failedSpecs.push(combo)
        }

        index++
        setTimeout(saveNext, 30) // 每隔30ms发送一次请求
      }

      saveNext()
    })

    // 关闭进度消息
    progressMessage.close()

    // 根据结果显示消息
    if (failedSpecs.length === 0) {
      ElMessage.success('所有规格保存成功')
    } else {
      ElMessage.warning(`保存完成，但有${failedSpecs.length}个规格保存失败`)
      console.error('保存失败的规格:', failedSpecs)
    }

    await loadProductSpecifications()
    specCombinations.value = []
  } catch (error) {
    console.error('保存规格失败:', error)
    ElMessage.error('保存规格失败，请稍后重试')
  } finally {
    // 关闭加载提示
    loadingInstance.close()
    submitting.value = false
  }
}

// 编辑规格
const editSpecification = (spec) => {
  editingSpec.value = { ...spec }
}

// 保存编辑的规格
const saveEditingSpec = async () => {
  if (!editingSpec.value) return

  try {
    const res = await updateSpecification(editingSpec.value.id, {
      priceAdjustment: editingSpec.value.priceAdjustment,
      stock: editingSpec.value.stock
    })

    if (res.data.code === 0) {
      ElMessage.success('更新规格成功')
      await loadProductSpecifications()
      editingSpec.value = null
    } else {
      ElMessage.error(res.data.msg || '更新规格失败')
    }
  } catch (error) {
    console.error('更新规格出错', error)
    ElMessage.error('更新规格失败')
  }
}

// 取消编辑
const cancelEditing = () => {
  editingSpec.value = null
}

// 删除规格
const handleDeleteSpec = (specId) => {
  ElMessageBox.confirm('确认删除该规格？此操作不可恢复', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteSpecification(specId)
        if (res.data.code === 0) {
          ElMessage.success('删除规格成功')
          await loadProductSpecifications()
        } else {
          ElMessage.error(res.data.msg || '删除规格失败')
        }
      } catch (error) {
        console.error('删除规格出错', error)
        ElMessage.error('删除规格失败')
      }
    })
    .catch(() => {})
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 规格操作完成
const handleSuccess = () => {
  emit('success')
  handleClose()
}
</script>

<template>
  <el-dialog
    title="商品规格管理"
    :modelValue="visible"
    width="800px"
    @close="handleClose"
  >
    <div class="specification-manager" v-loading="loading">
      <!-- 规格选项管理 -->
      <div class="spec-options-section">
        <h4>步骤1: 添加规格类型和选项</h4>
        <div v-for="(options, index) in specOptionsForm" :key="index" class="spec-option-row">
          <el-select v-model="options.key" placeholder="规格类型" style="width: 120px;">
            <el-option label="颜色" value="color"></el-option>
            <el-option label="尺寸" value="size"></el-option>
            <el-option label="材质" value="material"></el-option>
            <el-option label="款式" value="style"></el-option>
            <el-option label="自定义" value="custom"></el-option>
          </el-select>

          <!-- 自定义规格类型输入框 -->
          <el-input
            v-if="options.key === 'custom'"
            v-model="options.customKey"
            placeholder="请输入规格类型名称"
            style="width: 150px; margin: 0 10px;">
          </el-input>

          <el-select
            v-model="options.values"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="规格选项值"
            style="width: 450px; margin: 0 10px;">
            <el-option
              v-for="item in (productSpecOptions.get && options.key ? productSpecOptions.get(options.key) : [])"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>

          <el-button
            v-if="index === specOptionsForm.length - 1"
            type="primary"
            circle
            @click="addSpecOptionRow">
            <el-icon><Plus /></el-icon>
          </el-button>

          <el-button
            v-if="specOptionsForm.length > 1"
            type="danger"
            circle
            @click="removeSpecOptionRow(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 规格组合生成 -->
      <div class="spec-combinations-section">
        <h4>步骤2: 生成规格组合</h4>
        <el-button type="primary" @click="generateSpecCombinations">生成规格组合</el-button>

        <div v-if="specCombinations.length > 0" class="combinations-table">
          <el-table :data="specCombinations" border style="width: 100%; margin-top: 20px;">
            <el-table-column label="规格组合">
              <template #default="scope">
                <div v-for="(value, key) in scope.row.specs" :key="key">
                  {{ formatSpecKey(key) }}: {{ value }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="价格调整" width="150">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.priceAdjustment"
                  :precision="2"
                  :step="10"
                  :min="-1000"
                  :max="1000">
                </el-input-number>
              </template>
            </el-table-column>

            <el-table-column label="库存" width="150">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.stock"
                  :min="0"
                  :max="9999">
                </el-input-number>
              </template>
            </el-table-column>
          </el-table>

          <div class="actions">
            <el-button type="primary" :loading="submitting" @click="saveAllSpecifications">
              保存所有规格
            </el-button>
          </div>
        </div>
      </div>

      <!-- 现有规格管理 -->
      <div class="existing-specs-section" v-if="existingSpecifications.length > 0">
        <h4>现有规格组合</h4>
        <el-table :data="existingSpecifications" border style="width: 100%">
          <el-table-column label="规格组合">
            <template #default="scope">
              <div v-for="(value, key) in scope.row.specifications" :key="key">
                {{ formatSpecKey(key) }}: {{ value }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="价格调整" width="120">
            <template #default="scope">
              <span v-if="editingSpec && editingSpec.id === scope.row.id">
                <el-input-number
                  v-model="editingSpec.priceAdjustment"
                  :precision="2"
                  :step="10"
                  :min="-1000"
                  :max="1000"
                  size="small"
                  style="width: 100px;">
                </el-input-number>
              </span>
              <span v-else>{{ scope.row.priceAdjustment }}</span>
            </template>
          </el-table-column>

          <el-table-column label="库存" width="100">
            <template #default="scope">
              <span v-if="editingSpec && editingSpec.id === scope.row.id">
                <el-input-number
                  v-model="editingSpec.stock"
                  :min="0"
                  :max="9999"
                  size="small"
                  style="width: 90px;">
                </el-input-number>
              </span>
              <span v-else>{{ scope.row.stock }}</span>
            </template>
          </el-table-column>

          <el-table-column label="销量" width="100">
            <template #default="scope">
              {{ scope.row.sales || 0 }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="160">
            <template #default="scope">
              <div v-if="editingSpec && editingSpec.id === scope.row.id">
                <el-button type="success" size="small" @click="saveEditingSpec">
                  保存
                </el-button>
                <el-button size="small" @click="cancelEditing">
                  取消
                </el-button>
              </div>
              <div v-else>
                <el-button type="primary" size="small" @click="editSpecification(scope.row)">
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteSpec(scope.row.id)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleSuccess">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.specification-manager {
  padding: 10px;

  .spec-options-section, .spec-combinations-section, .existing-specs-section {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  }

  .spec-option-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .actions {
    margin-top: 15px;
    text-align: right;
  }

  h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 16px;
    color: #303133;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
