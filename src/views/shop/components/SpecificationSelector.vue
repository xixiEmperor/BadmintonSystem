<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { getProductSpecOptions, getProductSpecification } from '@/api/shop'

// 接收props
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  hasSpecification: {
    type: Boolean,
    default: false
  },
  specifications: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['specification-selected', 'specification-change'])

// 所有规格选项
const specOptions = ref([])
// 用户已选择的规格
const selectedSpecs = reactive({})
// 当前匹配的规格组合
const selectedSpecification = ref(null)
// 加载状态
const loading = ref(false)

// 计算显示价格（基础价格+调整值）
const displayPrice = computed(() => {
  if (!selectedSpecification.value) return props.basePrice.toFixed(2)

  const adjustedPrice = props.basePrice + selectedSpecification.value.priceAdjustment
  return adjustedPrice.toFixed(2)
})

// 格式化规格键名
const formatSpecKey = (key) => {
  const keyMap = {
    'color': '颜色',
    'size': '尺码',
    'material': '材质',
    'style': '款式'
  }
  return keyMap[key] || key
}

// 判断规格值是否禁用（无库存或无效组合）
const isSpecValueDisabled = (specKey, specValue) => {
  // 检查是否有任何包含此规格值的组合有库存
  return !props.specifications.some(spec => {
    return spec.specifications[specKey] === specValue && spec.stock > 0
  })
}

// 选择规格
const selectSpec = (specKey, specValue) => {
  // 更新选中的规格
  selectedSpecs[specKey] = specValue

  // 尝试匹配规格组合
  findMatchingSpecification()
}

// 查找匹配的规格组合
const findMatchingSpecification = () => {
  const selectedKeys = Object.keys(selectedSpecs)

  // 检查是否已选择所有必要规格
  const allSpecKeys = []
  for(const key of specOptions.value) {
    allSpecKeys.push(key.specKey)
  }
  if (selectedKeys.length !== allSpecKeys.length) {
    selectedSpecification.value = null
    emit('specification-change', null)
    return
  }

  // 从已加载的规格中查找完全匹配的组合
  const matchedSpec = props.specifications.find(spec => {
    return allSpecKeys.every(key =>
      spec.specifications[key] === selectedSpecs[key]
    )
  })

  if (matchedSpec) {
    selectedSpecification.value = matchedSpec
    emit('specification-selected', matchedSpec)
  } else {
    // 如果本地没找到匹配，从服务器获取
    fetchSpecificationBySelection()
  }
}

// 根据选择获取规格
const fetchSpecificationBySelection = async () => {
  loading.value = true
  try {
    // 对selectedSpecs进行必要的处理，确保格式正确
    const response = await getProductSpecification(props.productId, selectedSpecs)
    if (response.data.code === 0) {
      selectedSpecification.value = response.data.data
    } else {
      ElMessage.warning('获取规格信息失败，请重新选择')
    }
  } catch (error) {
    ElMessage.error(error.msg)
  } finally {
    loading.value = false
  }
}

// 加载规格选项和所有规格组合
const loadSpecOptions = () => {
  if (!props.hasSpecification || !props.productId) return

  loading.value = true

  getProductSpecOptions(props.productId)
    .then(response => {
      if (response.data.code === 0) {
        specOptions.value = response.data.data
      }
    })
    .catch(error => {
      ElMessage.error(error.msg)
    })
    .finally(() => {
      loading.value = false
    })
}



// 监听productId变化
watch(() => props.productId, () => {
  if (props.productId && props.hasSpecification) {
    loadSpecOptions()
  }
}, { immediate: true })

// 监听hasSpecification变化
watch(() => props.hasSpecification, (newVal) => {
  if (newVal && props.productId) {
    loadSpecOptions()
  } else {
    // 清空规格信息
    specOptions.value = {}
    Object.keys(selectedSpecs).forEach(key => delete selectedSpecs[key])
    selectedSpecification.value = null
  }
}, { immediate: true })

// 监听用户选择变化
watch(() => selectedSpecs, () => {
  if (selectedSpecs) {
    fetchSpecificationBySelection()
  }
}, { deep: true })

// 组件挂载时加载规格信息
onMounted(() => {
  if (props.productId && props.hasSpecification) {
    loadSpecOptions()
  }
})
</script>

<template>
  <div class="spec-selector" v-if="hasSpecification">
    <!-- 规格选项组 -->
    <div v-for="options in specOptions" :key="options.id" class="spec-group">
      <div class="spec-title">{{ formatSpecKey(options.specKey) }}:</div>
      <div class="spec-values">
        <span
          v-for="value in options.specValues"
          :key="value"
          :class="['spec-value', selectedSpecs[options.specKey] === value ? 'selected' : '', isSpecValueDisabled(options.specKey, value) ? 'disabled' : '']"
          @click="!isSpecValueDisabled(options.specKey, value) && selectSpec(options.specKey, value)">
          {{ value }}
        </span>
      </div>
    </div>

    <!-- 价格和库存信息 -->
    <div class="spec-info" v-if="selectedSpecification">
      <div class="price-info">
        <span class="label">现价:</span>
        <span class="price">¥{{ displayPrice }}</span>
        <span class="adjustment" v-if="selectedSpecification.priceAdjustment !== 0">
          ({{ selectedSpecification.priceAdjustment > 0 ? '+' : '' }}{{ selectedSpecification.priceAdjustment }})
        </span>
      </div>

      <div class="stock-info">
        <span class="label">库存:</span>
        <span class="stock" :class="{'low-stock': selectedSpecification.stock < 10}">
          {{ selectedSpecification.stock > 0 ? selectedSpecification.stock : '无货' }}
        </span>
      </div>
    </div>

    <!-- 未选完规格或无匹配规格时的提示 -->
    <div class="spec-hint" v-if="!selectedSpecification && Object.keys(selectedSpecs).length > 0">
      <el-alert
        title="请选择完整的规格组合"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<style scoped>
.spec-selector {
  margin: 20px 0;
}

.spec-group {
  margin-bottom: 15px;
}

.spec-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-value {
  padding: 8px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.spec-value:hover:not(.disabled) {
  border-color: #409EFF;
}

.spec-value.selected {
  border-color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  color: #409EFF;
}

.spec-value.disabled {
  color: #c0c4cc;
  background-color: #f5f7fa;
  cursor: not-allowed;
  text-decoration: line-through;
}

.spec-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.price-info, .stock-info {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.label {
  width: 60px;
  color: #606266;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6700;
}

.adjustment {
  margin-left: 8px;
  color: #909399;
}

.stock {
  font-weight: bold;
}

.low-stock {
  color: #E6A23C;
}

.spec-hint {
  margin-top: 15px;
}
</style>
