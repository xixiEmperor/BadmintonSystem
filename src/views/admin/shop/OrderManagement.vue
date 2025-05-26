<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import { getOrdersByAdmin, closeOrderByAdmin, completeOrderByAdmin } from '@/api/order'
import OrderDetailDialog from '@/components/OrderDetailDialog.vue'

// 数据定义
const loading = ref(false)
const orderList = ref([])

// 订单详情对话框
const showOrderDetail = ref(false)
const currentOrder = ref({})

// 搜索表单
const searchForm = reactive({
  username: '',
  orderNo: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 统计数据
const statistics = ref({
  total: 0,
  unpaid: 0,
  paid: 0,
  shipped: 0,
  completed: 0,
  cancelled: 0,
  totalAmount: 0
})

// 状态标签类型映射
const statusTagType = {
  '10': 'warning',
  '20': 'success',
  '30': 'info',
  '40': 'primary',
  '50': 'danger'
}

// 状态文本映射
const statusText = {
  '10': '待支付',
  '20': '已支付',
  '30': '已取消',
  '40': '已完成',
  '50': '已关闭'
}

// 初始化
onMounted(async () => {
  await loadOrders()
})

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      username: searchForm.username,
      orderNo: searchForm.orderNo
    }

    const response = await getOrdersByAdmin(params)
    if (response.data.code === 0) {
      orderList.value = response.data.data.list || []
      pagination.total = response.data.data.total || 0

      // 计算统计数据
      calculateStatistics()
    } else {
      ElMessage.error(response.data.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表出错', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 计算统计数据
const calculateStatistics = () => {
  const stats = {
    total: pagination.total, // 使用服务器返回的总数
    unpaid: 0,
    paid: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0
  }

  orderList.value.forEach(order => {
    // 使用正确的字段名
    if (order.status === 20 || order.status === 40) {
      stats.totalAmount += order.totalPrice
    }
    switch (order.status) {
      case 10:
        stats.unpaid++
        break
      case 20:
        stats.paid++
        break
      case 30:
        stats.cancelled++
        break
      case 40:
        stats.completed++
        break
      case 50:
        stats.closed++
        break
    }
  })

  statistics.value = stats
}

// 搜索订单
const searchOrders = () => {
  pagination.pageNum = 1
  loadOrders()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  searchOrders()
}

// 分页处理
const handleSizeChange = (val) => {
  pagination.pageSize = val
  loadOrders()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  loadOrders()
}

// 查看订单详情
const handleViewOrder = (order) => {
  console.log(order)
  currentOrder.value = order
  showOrderDetail.value = true
}

// 关闭订单
const handleCloseOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确认关闭该订单吗？关闭后订单状态将变为已关闭',
      '确认关闭订单',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await closeOrderByAdmin(order.orderNo)
    if (response.data.code === 0) {
      ElMessage.success('订单关闭成功')
      await loadOrders()
    } else {
      ElMessage.error(response.data.msg || '关闭订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关闭订单出错', error)
      ElMessage.error('关闭订单失败')
    }
  }
}

// 验证提货码完成订单
const handleCompleteOrder = async (order) => {
  try {
    const { value: pickupCode } = await ElMessageBox.prompt(
      '请输入提货码以完成订单',
      '验证提货码',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /^.+$/,
        inputErrorMessage: '提货码不能为空'
      }
    )

    const response = await completeOrderByAdmin(order.orderNo, pickupCode)
    if (response.data.code === 0) {
      ElMessage.success('订单完成成功')
      await loadOrders()
    } else {
      ElMessage.error(response.data.msg || '完成订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单出错', error)
      ElMessage.error('完成订单失败')
    }
  }
}

// 处理订单详情对话框的完成事件
const handleCompleteOrderFromDialog = async (order) => {
  try {
    const { value: pickupCode } = await ElMessageBox.prompt(
      '请输入提货码以完成订单',
      '验证提货码',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern: /^.+$/,
        inputErrorMessage: '提货码不能为空'
      }
    )

    const response = await completeOrderByAdmin(order.orderNo, pickupCode)
    if (response.data.code === 0) {
      ElMessage.success('订单完成成功')
      showOrderDetail.value = false
      await loadOrders()
    } else {
      ElMessage.error(response.data.msg || '完成订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单出错', error)
      ElMessage.error('完成订单失败')
    }
  }
}

// 处理订单详情对话框的关闭事件
const handleCloseOrderFromDialog = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确认关闭该订单吗？关闭后订单状态将变为已关闭',
      '确认关闭订单',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await closeOrderByAdmin(order.orderNo)
    if (response.data.code === 0) {
      ElMessage.success('订单关闭成功')
      showOrderDetail.value = false
      await loadOrders()
    } else {
      ElMessage.error(response.data.msg || '关闭订单失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关闭订单出错', error)
      ElMessage.error('关闭订单失败')
    }
  }
}
</script>

<template>
  <div class="order-management">
    <div class="page-header">
      <h2>商品订单管理</h2>
      <p>管理所有商品订单，包括待支付和已支付订单</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.total }}</div>
            <div class="stat-label">总订单数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card unpaid">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.unpaid }}</div>
            <div class="stat-label">待支付</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card paid">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.paid }}</div>
            <div class="stat-label">已支付</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card shipped">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card completed">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.cancelled }}</div>
            <div class="stat-label">已取消</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card total-amount">
          <div class="stat-content">
            <div class="stat-number">¥{{ statistics.totalAmount.toFixed(2) }}</div>
            <div class="stat-label">总交易额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="searchOrders">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table
        :data="orderList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="username" label="用户" width="200" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="scope">
            <div class="order-items">
              <div v-for="item in scope.row.orderItemList" :key="item.productName" class="item">
                {{ item.productName }} × {{ item.quantity }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="100">
          <template #default="scope">
            <span class="amount">¥{{ scope.row.totalPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="statusTagType[scope.row.status]">
              {{ statusText[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleViewOrder(scope.row)"
            >
              查看
            </el-button>

            <!-- 只有已支付的订单可以提货 -->
            <el-button
              v-if="scope.row.status === 20"
              type="success"
              size="small"
              @click="handleCompleteOrder(scope.row)"
            >
              完成提货
            </el-button>

            <!-- 未关闭和未完成的订单可以关闭 -->
            <el-button
              v-if="scope.row.status !== 50"
              type="danger"
              size="small"
              @click="handleCloseOrder(scope.row)"
            >
              关闭订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <OrderDetailDialog
      v-model="showOrderDetail"
      :order-data="currentOrder"
      :show-actions="true"
      @complete="handleCompleteOrderFromDialog"
      @close-order="handleCloseOrderFromDialog"
    />
  </div>
</template>

<style lang="less" scoped>
.order-management {
  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
    }

    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;

    .stat-card {
      text-align: center;

      .stat-content {
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }

      &.unpaid .stat-number {
        color: #e6a23c;
      }

      &.paid .stat-number {
        color: #67c23a;
      }

      &.shipped .stat-number {
        color: #409eff;
      }

      &.completed .stat-number {
        color: #909399;
      }

      &.total-amount .stat-number {
        color: #f56c6c;
      }
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .order-items {
      .item {
        margin-bottom: 4px;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .amount {
      font-weight: bold;
      color: #f56c6c;
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
