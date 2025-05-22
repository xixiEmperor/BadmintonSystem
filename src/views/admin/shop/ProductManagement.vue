<script setup>
import { ref, reactive, onMounted } from 'vue'
import ProductDialog from './components/ProductDialog.vue'
import SpecificationManager from './components/SpecificationManager.vue'
import {
  getProductsByAdmin,
  getCategories,
  onSaleProduct,
  offSaleProduct,
  deleteProduct,
  getProductSpecOptions,
  getProductDetail
} from '@/api/shop'

// 数据定义
const loading = ref(false)
const dialogVisible = ref(false) // 对话框是否可见
const currentProduct = ref(null) // 当前编辑的商品

// 规格管理
const specDialogVisible = ref(false)
const currentProductId = ref(null)

// 商品列表
const productList = ref([])
// 分类列表
const categories = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 6,
  total: 0
})

// 初始化
onMounted(async () => {
  await Promise.all([
    loadProducts(),
    loadCategories()
  ])
})

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      categoryId: searchForm.categoryId,
      status: searchForm.status
    }
    const res = await getProductsByAdmin(params)
    if (res.data.code === 0) {
      productList.value = res.data.data.list || []
      pagination.total = res.data.data.total || 0
    } else {
      ElMessage.error(res.data.msg || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表出错', error)
    ElMessage.error('获取商品列表出错')
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategories()
    if (res.data.code === 0) {
      categories.value = res.data.data || []
    } else {
      ElMessage.error(res.data.msg || '获取分类列表失败')
    }
  } catch (error) {
    console.error('获取分类列表出错', error)
    ElMessage.error('获取分类列表出错')
  }
}

// 搜索商品
const searchProducts = () => {
  pagination.pageNum = 1
  loadProducts()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchProducts()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadProducts()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  loadProducts()
}

// 添加商品
const handleAddProduct = () => {
  currentProduct.value = null
  dialogVisible.value = true
}

// 编辑商品
const handleEditProduct = async (product) => {
  try {
    loading.value = true
    // 获取商品详情
    const res = await getProductDetail(product.id)
    if (res.data.code === 0) {
      // 将详情数据和列表数据合并
      currentProduct.value = {
        ...product,
        ...res.data.data,
        // 确保即使在详情接口中没有的字段也被保留
        id: product.id,
        categoryId: product.categoryId,
        categoryName: product.categoryName
      }
      dialogVisible.value = true
      console.log(currentProduct.value)
    } else {
      ElMessage.error(res.data.msg || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情出错', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 处理商品状态（上架/下架）
const handleProductStatus = async (productId, action) => {
  try {
    let res
    if (action === 'on') {
      res = await onSaleProduct(productId)
    } else {
      res = await offSaleProduct(productId)
    }

    if (res.data.code === 0) {
      ElMessage.success(action === 'on' ? '商品上架成功' : '商品下架成功')
      loadProducts()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('操作商品状态出错', error)
    ElMessage.error('操作失败')
  }
}

// 删除商品
const handleDeleteProduct = (productId) => {
  ElMessageBox.confirm('确认删除该商品？此操作不可恢复', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const res = await deleteProduct(productId)
        if (res.data.code === 0) {
          ElMessage.success('删除商品成功')
          loadProducts()
        } else {
          ElMessage.error(res.data.msg || '删除商品失败')
        }
      } catch (error) {
        console.error('删除商品出错', error)
        ElMessage.error('删除商品失败')
      }
    })
    .catch(() => {})
}

// 记录商品规格选项
const productSpecOptions = new Map()
// 管理商品规格
const handleManageSpecifications = async (productId) => {
  currentProductId.value = productId
  const res = await getProductSpecOptions(productId)
  if (res.data.code === 0) {
    for (const item of res.data.data) {
      productSpecOptions.set(item.specKey, item.specValues)
    }
    console.log(productSpecOptions)
  } else {
    ElMessage.error(res.data.msg || '获取商品规格失败')
  }

  specDialogVisible.value = true
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
  currentProduct.value = null
}

// 关闭规格管理对话框
const closeSpecDialog = () => {
  specDialogVisible.value = false
  currentProductId.value = null
}

// 对话框提交成功
const handleDialogSuccess = () => {
  loadProducts()
  closeDialog()
}

// 规格管理成功
const handleSpecSuccess = () => {
  loadProducts()
  closeSpecDialog()
}
</script>

<template>
  <div class="product-management">
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <h2>商品管理</h2>
          <el-button type="primary" @click="handleAddProduct">添加商品</el-button>
        </div>
      </template>

      <!-- 搜索和过滤区 -->
      <div class="search-filter">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="商品名称" clearable />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 160px;">
              <el-option label="全部分类" value="" />
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 160px;">
              <el-option label="全部状态" value="" />
              <el-option label="在售" :value="1" />
              <el-option label="下架" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchProducts">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品列表表格 -->
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image
              style="width: 60px; height: 60px"
              :src="scope.row.mainImage"
              :preview-src-list="[scope.row.mainImage]"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="subtitle" label="副标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规格" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.hasSpecification === 1" type="warning">多规格</el-tag>
            <el-tag v-else type="info">单规格</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 2"
              type="success"
              size="small"
              @click="handleProductStatus(scope.row.id, 'on')"
            >
              上架
            </el-button>
            <el-button
              v-else
              type="warning"
              size="small"
              @click="handleProductStatus(scope.row.id, 'off')"
            >
              下架
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleEditProduct(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleManageSpecifications(scope.row.id)"
            >
              规格
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteProduct(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :page-sizes="[6, 8, 10, 15]"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑商品对话框 -->
    <ProductDialog
      v-if="dialogVisible"
      :visible="dialogVisible"
      :product="currentProduct"
      :categories="categories"
      @close="closeDialog"
      @success="handleDialogSuccess"
    />

    <!-- 商品规格管理对话框 -->
    <SpecificationManager
      v-if="specDialogVisible"
      :visible="specDialogVisible"
      :product-id="currentProductId"
      :product-spec-options="productSpecOptions"
      @close="closeSpecDialog"
      @success="handleSpecSuccess"
    />
  </div>
</template>

<style lang="less" scoped>
.product-management {
  .management-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: 18px;
      margin: 0;
    }
  }

  .search-filter {
    margin-bottom: 20px;

    .search-form {
      display: flex;
      flex-wrap: wrap;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
