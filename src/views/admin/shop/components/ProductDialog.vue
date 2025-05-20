<script setup>
import { ref, reactive, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { addProduct, updateProduct, uploadProductImages, updateSpecificationStock } from '@/api/shop'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref(null)
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  subtitle: '',
  categoryId: '',
  price: 0,
  stock: 0,
  status: 1,
  mainImage: '',
  subImages: '',
  detail: '',
  hasSpecification: 0  // 添加规格启用标志
})

// 原始库存值，用于检测是否修改了库存
const originalStock = ref(0)

// 如果product存在，则将product的值赋给form
if (props.product) {
  Object.keys(form).forEach(key => {
    if (props.product[key] !== undefined) {
      form[key] = props.product[key]
    }
  })

  // 记录原始库存值
  originalStock.value = props.product.stock || 0
}
// 子图数组，用于前端展示和提交时转换为字符串
const subImagesArray = ref([])

// 主图文件和子图文件
const mainImageFile = ref(null)
const subImageFiles = ref([])

// 上传进度
const uploadLoading = ref(false)

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在2到100个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
  ],
  mainImage: [
    { required: true, message: '请上传商品主图', trigger: 'change' }
  ]
}

// 监听product变化，初始化表单
watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      Object.keys(form).forEach(key => {
        if (newVal[key] !== undefined) {
          form[key] = newVal[key]
        }
      })

      // 处理子图
      if (newVal.subImages) {
        const subImagesStr = newVal.subImages
        subImagesArray.value = subImagesStr.split(',').map(url => ({
          url,
          name: url.substring(url.lastIndexOf('/') + 1)
        }))
      } else {
        subImagesArray.value = []
      }
    } else {
      // 新增时重置表单
      resetForm()
    }
  }
)

// 重置表单
const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'price' || key === 'stock') {
      form[key] = 0
    } else if (key === 'status') {
      form[key] = 1
    } else {
      form[key] = ''
    }
  })
  subImagesArray.value = []
  mainImageFile.value = null
  subImageFiles.value = []
}

// 图片上传前的校验
const beforeImageUpload = (file) => {
  const isLessThan5M = file.size / 1024 / 1024 < 5
  if (!isLessThan5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

// 选择主图
const handleMainImageChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (beforeImageUpload(file)) {
    mainImageFile.value = file
    // 创建临时预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      form.mainImage = e.target.result // 临时预览
    }
    reader.readAsDataURL(file)
  }
}

// 选择子图
const handleSubImageChange = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  // 检查上传数量限制
  if (subImagesArray.value.length + files.length > 5) {
    ElMessage.warning('最多上传5张子图')
    return
  }

  // 遍历并创建临时预览
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!beforeImageUpload(file)) continue

    subImageFiles.value.push(file)

    // 创建临时预览
    const reader = new FileReader()
    reader.onload = (e) => {
      subImagesArray.value.push({
        url: e.target.result,
        name: file.name,
        isTemp: true // 标记为临时预览图
      })
    }
    reader.readAsDataURL(file)
  }

  // 重置input，允许选择相同的文件
  e.target.value = ''
}

// 上传所有图片（主图和子图一起上传）
const uploadAllImages = async () => {
  if (!mainImageFile.value && subImageFiles.value.length === 0) {
    return Promise.resolve()
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()

    // 添加主图
    if (mainImageFile.value) {
      formData.append('mainImage', mainImageFile.value)
    }

    // 添加子图（多张）
    subImageFiles.value.forEach(file => {
      formData.append('subImages', file)
    })

    const res = await uploadProductImages(formData)

    if (res.data.code === 0) {
      // 处理主图
      if (res.data.data.mainImage) {
        form.mainImage = res.data.data.mainImage
      }

      // 处理子图
      if (res.data.data.subImages && res.data.data.subImages.length > 0) {
        // 移除临时图片
        subImagesArray.value = subImagesArray.value.filter(img => !img.isTemp)

        // 添加新上传的图片
        res.data.data.subImages.forEach(url => {
          subImagesArray.value.push({
            url,
            name: url.substring(url.lastIndexOf('/') + 1)
          })
        })

        // 更新子图字符串
        updateSubImagesString()
      }

      ElMessage.success('图片上传成功')
      return Promise.resolve()
    } else {
      ElMessage.error(res.data.msg || '图片上传失败')
      return Promise.reject('图片上传失败')
    }
  } catch (error) {
    console.error('上传图片出错', error)
    ElMessage.error('图片上传失败')
    return Promise.reject(error)
  } finally {
    uploadLoading.value = false
    mainImageFile.value = null
    subImageFiles.value = []
  }
}

// 子图删除回调
const handleSubImageRemove = (index) => {
  subImagesArray.value.splice(index, 1)
  updateSubImagesString()
}

// 更新子图字符串
const updateSubImagesString = () => {
  // 过滤掉临时图片
  const realImages = subImagesArray.value.filter(img => !img.isTemp)
  form.subImages = realImages.map(item => item.url).join(',')
}

// 提交表单
const submitForm = async () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 先上传所有图片
      await uploadAllImages()

      // 检查是否需要单独更新库存
      const needUpdateStock = props.product && form.stock !== originalStock.value
      const productId = props.product?.id

      let res
      if (props.product) {
        // 编辑商品
        res = await updateProduct(productId, form)
      } else {
        // 添加商品
        res = await addProduct(form)
      }

      // 如果商品有规格，并且修改了库存，则使用规格库存更新接口
      if (res.data.code === 0 && needUpdateStock && productId) {
        try {
          // 更新规格库存
          await updateSpecificationStock(productId, form.stock)
          ElMessage.success('库存更新成功')
        } catch (stockError) {
          console.error('更新库存失败:', stockError)
          ElMessage.warning(res.data.msg || '库存更新失败')
        }
      }

      if (res.data.code === 0) {
        ElMessage.success(props.product ? '编辑商品成功' : '添加商品成功')
        emit('success')
      } else {
        ElMessage.error(res.data.msg || (props.product ? '编辑商品失败' : '添加商品失败'))
      }
    } catch (error) {
      console.error('提交商品数据出错', error)
      ElMessage.error('系统错误，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}
</script>

<template>
  <el-dialog
    :title="product ? '编辑商品' : '添加商品'"
    :modelValue="visible"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称" />
      </el-form-item>

      <el-form-item label="商品副标题" prop="subtitle">
        <el-input v-model="form.subtitle" placeholder="请输入商品副标题" />
      </el-form-item>

      <el-form-item label="商品分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择商品分类" style="width: 100%">
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商品价格" prop="price">
        <el-input-number
          v-model="form.price"
          :min="0"
          :precision="2"
          :step="10"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="商品库存" prop="stock">
        <el-input-number
          v-model="form.stock"
          :min="0"
          :precision="0"
          :step="1"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="商品状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">上架</el-radio>
          <el-radio :label="2">下架</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="启用规格">
        <el-switch
          v-model="form.hasSpecification"
          :active-value="1"
          :inactive-value="0"
          inactive-text="单规格"
          active-text="多规格"
        />
        <div class="spec-tip" v-if="form.hasSpecification === 1">
          <el-alert
            type="info"
            :closable="false"
          >
            <p>启用多规格功能后，请保存商品信息，然后在商品列表中点击"规格"按钮进行规格管理。</p>
            <p>多规格商品的库存将由规格库存管理，这里设置的库存将作为默认值。</p>
          </el-alert>
        </div>
      </el-form-item>

      <el-form-item label="商品主图" prop="mainImage">
        <div class="upload-box">
          <div v-if="form.mainImage" class="image-preview">
            <img :src="form.mainImage" class="avatar" />
            <div class="preview-actions">
              <el-button size="small" type="danger" @click="form.mainImage = ''; mainImageFile = null">
                删除
              </el-button>
            </div>
          </div>
          <div v-else class="upload-trigger" @click="$refs.mainImageInput.click()">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <span>上传主图</span>
          </div>
          <input
            ref="mainImageInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleMainImageChange"
          />
        </div>
        <div class="upload-tip">* 建议上传比例为1:1的图片，大小不超过2MB</div>
      </el-form-item>

      <el-form-item label="商品图片集">
        <div class="sub-image-list">
          <div
            v-for="(image, index) in subImagesArray"
            :key="index"
            class="sub-image-item"
          >
            <img :src="image.url" class="sub-image" />
            <div class="preview-actions">
              <el-button size="small" type="danger" @click="handleSubImageRemove(index)">
                删除
              </el-button>
            </div>
          </div>

          <div
            v-if="subImagesArray.length < 5"
            class="upload-trigger sub-trigger"
            @click="$refs.subImageInput.click()"
          >
            <el-icon class="upload-icon"><Plus /></el-icon>
            <span>添加图片</span>
          </div>
          <input
            ref="subImageInput"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleSubImageChange"
          />
        </div>
        <div class="upload-tip">* 最多上传5张商品详情图，每张大小不超过5MB</div>
      </el-form-item>

      <el-form-item label="商品详情" prop="detail">
        <el-input
          v-model="form.detail"
          type="textarea"
          :rows="6"
          placeholder="请输入商品详情描述，支持HTML格式"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting || uploadLoading" @click="submitForm">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.upload-box {
  display: flex;
  align-items: center;
}

.upload-trigger {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    border-color: #409EFF;
  }

  .upload-icon {
    font-size: 28px;
    color: #8c939d;
  }
}

.sub-trigger {
  width: 100px;
  height: 100px;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;

  .avatar {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    border-radius: 6px;
  }

  .preview-actions {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    padding: 8px 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover .preview-actions {
    opacity: 1;
  }
}

.sub-image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .sub-image-item {
    position: relative;
    width: 100px;
    height: 100px;

    .sub-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .preview-actions {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      padding: 8px 0;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover .preview-actions {
      opacity: 1;
    }
  }
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.spec-tip {
  margin-top: 10px;
}
</style>
