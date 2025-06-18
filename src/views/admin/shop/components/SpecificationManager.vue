<script setup>
import { ref,  onMounted } from 'vue'
import { Delete, Plus, Loading, Check, Warning } from '@element-plus/icons-vue'
import {
  getProductSpecifications,
  getProductSpecOptions,
  addProductSpecification,
  updateSpecification,
  deleteSpecification,
  // updateProduct
} from '@/api/shop'
import TaskQueue from '@/utils/TaskQueue'

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

// 任务队列实例
const taskQueue = ref(null)
const queueStatus = ref({
  pending: 0,
  running: 0,
  completed: 0,
  failed: 0,
  total: 0,
  isProcessing: false
})

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

// 初始化任务队列
const initTaskQueue = () => {
  taskQueue.value = new TaskQueue({
    maxConcurrency: 1, // 最大并发数设为1，避免数据库压力过大
    delay: 50, // 任务间延迟50ms
    retryTimes: 3 // 失败重试3次
  })

  // 订阅队列事件
  taskQueue.value.subscribe('queueStarted', (data) => {
    console.log('队列开始处理:', data)
    ElMessage.info(`开始处理 ${data.totalTasks} 个规格保存任务`)
  })

  taskQueue.value.subscribe('taskCompleted', (taskItem) => {
    queueStatus.value = taskQueue.value.getStatus()
    console.log('任务完成:', taskItem.id)
  })

  taskQueue.value.subscribe('taskFailed', (taskItem) => {
    queueStatus.value = taskQueue.value.getStatus()
    console.error('任务失败:', taskItem.id, taskItem.error)
  })

  taskQueue.value.subscribe('taskRetry', (taskItem) => {
    console.log('任务重试:', taskItem.id, `第${taskItem.retryCount}次重试`)
  })

  taskQueue.value.subscribe('queueCompleted', (data) => {
    queueStatus.value = taskQueue.value.getStatus()
    console.log('队列处理完成:', data)

    if (data.failed > 0) {
      ElMessage.warning(`规格保存完成！成功: ${data.completed}个，失败: ${data.failed}个`)

      // 询问是否重试失败的任务
      ElMessageBox.confirm(
        `有 ${data.failed} 个规格保存失败，是否重试？`,
        '保存结果',
        {
          confirmButtonText: '重试失败任务',
          cancelButtonText: '忽略',
          type: 'warning'
        }
      ).then(() => {
        taskQueue.value.retryFailedTasks()
      }).catch(() => {
        // 用户选择忽略失败任务
        finalizeSaveProcess()
      })
    } else {
      ElMessage.success(`所有 ${data.completed} 个规格保存成功！`)
      finalizeSaveProcess()
    }
  })
}

// 完成保存流程
const finalizeSaveProcess = async () => {
  await loadProductSpecifications()
  specCombinations.value = []
  submitting.value = false
}

// 保存所有规格
const saveAllSpecifications = async () => {
  if (specCombinations.value.length === 0) {
    ElMessage.warning('请先生成规格组合')
    return
  }

  submitting.value = true

  // 初始化任务队列
  if (!taskQueue.value) {
    initTaskQueue()
  } else {
    // 清空之前的队列
    taskQueue.value.clear()
  }

  // 创建加载提示
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在准备保存规格...',
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

    // 创建保存规格的任务函数
    const createSpecificationTask = () => {
      return async (data) => {
        const result = await addProductSpecification(props.productId, {
          specifications: data.specs,
          priceAdjustment: data.priceAdjustment,
          stock: data.stock
        })
        return result
      }
    }

    // 将所有规格组合添加到任务队列
    const tasks = specCombinations.value.map((combo, index) => ({
      task: createSpecificationTask(),
      data: combo,
      id: `spec_${index}_${Date.now()}`
    }))

    // 批量添加任务到队列
    taskQueue.value.addTasks(tasks)

    // 更新加载提示
    loadingInstance.setText('正在保存规格，请稍候...')

    // 创建进度监控
    const progressInterval = setInterval(() => {
      const status = taskQueue.value.getStatus()
      queueStatus.value = status

      if (status.total > 0) {
        const progress = Math.round(((status.completed + status.failed) / status.total) * 100)
        loadingInstance.setText(`正在保存规格... ${progress}% (${status.completed + status.failed}/${status.total})`)
      }

      // 如果队列处理完成，清除定时器
      if (!status.isProcessing && status.pending === 0 && status.running === 0) {
        clearInterval(progressInterval)
        loadingInstance.close()
      }
    }, 500)

  } catch (error) {
    console.error('保存规格失败:', error)
    ElMessage.error('保存规格失败，请稍后重试')
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

            <!-- 任务队列状态显示 -->
            <div v-if="queueStatus.isProcessing || queueStatus.total > 0" class="queue-status">
              <el-card class="status-card">
                <div class="status-header">
                  <el-icon class="status-icon">
                    <Loading v-if="queueStatus.isProcessing" />
                    <Check v-else-if="queueStatus.failed === 0" />
                    <Warning v-else />
                  </el-icon>
                  <span class="status-text">
                    {{ queueStatus.isProcessing ? '正在处理任务队列...' : '队列处理完成' }}
                  </span>
                </div>

                <div class="status-details">
                  <div class="status-item">
                    <span class="label">总任务:</span>
                    <span class="value">{{ queueStatus.total }}</span>
                  </div>
                  <div class="status-item">
                    <span class="label">等待中:</span>
                    <span class="value pending">{{ queueStatus.pending }}</span>
                  </div>
                  <div class="status-item">
                    <span class="label">执行中:</span>
                    <span class="value running">{{ queueStatus.running }}</span>
                  </div>
                  <div class="status-item">
                    <span class="label">已完成:</span>
                    <span class="value completed">{{ queueStatus.completed }}</span>
                  </div>
                  <div class="status-item">
                    <span class="label">失败:</span>
                    <span class="value failed">{{ queueStatus.failed }}</span>
                  </div>
                </div>

                <!-- 进度条 -->
                <div v-if="queueStatus.total > 0" class="progress-section">
                  <el-progress
                    :percentage="Math.round(((queueStatus.completed + queueStatus.failed) / queueStatus.total) * 100)"
                    :status="queueStatus.failed > 0 ? 'warning' : (queueStatus.isProcessing ? 'active' : 'success')"
                    :stroke-width="8">
                  </el-progress>
                </div>
              </el-card>
            </div>
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

.queue-status {
  margin-top: 10px;

  .status-card {
    max-width: 300px;

    .status-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .status-icon {
        margin-right: 5px;
        font-size: 16px;
      }

      .status-text {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .status-details {
      margin-bottom: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: #f5f7fa;

        .label {
          font-size: 12px;
          font-weight: 600;
          color: #606266;
        }

        .value {
          font-size: 14px;
          font-weight: 700;

          &.pending {
            color: #909399;
          }

          &.running {
            color: #409eff;
          }

          &.completed {
            color: #67c23a;
          }

          &.failed {
            color: #f56c6c;
          }
        }
      }
    }

    .progress-section {
      margin-top: 10px;
    }
  }
}
</style>
