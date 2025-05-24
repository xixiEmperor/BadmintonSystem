<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/modules/order'
import { ORDER_STATUS } from '@/api/pay'

const router = useRouter()
const orderStore = useOrderStore()

// 当前选中的标签
const activeTab = ref('all')
// 分页信息
const currentPage = ref(1)
const pageSize = ref(5)

// 从store获取数据
const { loading, cancelOrder: storeCancelOrder, refreshOrders } = orderStore

// 根据当前标签获取过滤后的订单列表
const filteredOrders = computed(() => {
  return orderStore.getOrdersByStatus(activeTab.value)
})

// 分页后的订单列表
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

// 总数量
const total = computed(() => {
  return filteredOrders.value.length
})

// 标签切换
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  currentPage.value = 1 // 重置到第一页
}

// 分页大小改变
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

// 当前页改变
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

// 查看订单详情
const viewOrderDetail = (orderNo) => {
  router.push(`/order-detail/${orderNo}`)
}

// 支付订单
const payOrder = (order) => {
  const paymentInfo = {
    orderNo: order.orderNo,
    amount: order.totalPrice,
    businessType: 'SHOP_ORDER'
  }

  localStorage.setItem('payment_info', JSON.stringify(paymentInfo))
  router.push('/payment')
}

// 取消订单
const cancelOrder = (orderNumber) => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await storeCancelOrder(orderNumber)
  }).catch(() => {
    // 用户取消操作
  })
}

// 确认收货
const confirmReceipt = (orderNumber) => {
  ElMessageBox.confirm('确定已收到商品吗？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info',
  }).then(async () => {
    try {
      // 这里应该调用确认收货的API，暂时只显示成功消息
      console.log('确认收货订单号:', orderNumber)
      ElMessage.success('确认收货成功')
      // 刷新订单列表
      await refreshOrders()
    } catch (error) {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 去购物
const goShopping = () => {
  router.push('/shop')
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case ORDER_STATUS.UNPAID:
      return 'warning'
    case ORDER_STATUS.PAID:
      return 'success'
    case ORDER_STATUS.CANCELLED:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case ORDER_STATUS.UNPAID:
      return '待支付'
    case ORDER_STATUS.PAID:
      return '已支付'
    case ORDER_STATUS.CANCELLED:
      return '已取消'
    default:
      return '未知状态'
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时初始化数据
onMounted(() => {
  orderStore.fetchOrderList()
})
</script>

<template>
  <div class="order-list-container">
    <div class="order-header">
      <h2>我的订单</h2>
      <div class="order-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部订单" name="all"></el-tab-pane>
          <el-tab-pane label="待支付" name="unpaid"></el-tab-pane>
          <el-tab-pane label="已支付" name="paid"></el-tab-pane>
          <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="paginatedOrders.length === 0" class="empty-container">
      <el-empty description="暂无订单数据">
        <el-button type="primary" @click="goShopping">去购物</el-button>
      </el-empty>
    </div>

    <!-- 订单列表 -->
    <div v-else class="order-list">
      <div v-for="order in paginatedOrders" :key="order.orderNo" class="order-item">
        <div class="order-header-info">
          <div class="order-info">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ formatTime(order.createTime) }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
        </div>

        <div class="order-content">
          <!-- 订单商品列表 -->
          <div class="order-products">
            <div
              v-for="(product, index) in order.orderItemList"
              :key="index"
              class="product-item"
              @click="viewOrderDetail(order.orderNo)">
              <el-image
                :src="product.productImage"
                class="product-image"
                fit="cover">
              </el-image>
              <div class="product-details">
                <div class="product-name">{{ product.productName }}</div>
                <div v-if="product.specs" class="product-specs">
                  规格：{{ Object.entries(product.specs).map(([key, value]) => `${value}`).join('、') }}
                </div>
                <div class="product-price">¥{{ (product.currentUnitPrice + product.priceAdjustment).toFixed(2) }}</div>
              </div>
              <div class="product-quantity">x{{ product.quantity }}</div>
            </div>
          </div>

          <!-- 订单金额和操作 -->
          <div class="order-footer">
            <div class="order-amount">
              <span>共{{ order.orderItemList.reduce((sum, item) => sum + item.quantity, 0) }}件商品，合计：</span>
              <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="viewOrderDetail(order.orderNo)">
                查看详情
              </el-button>
              <el-button
                v-if="order.status === ORDER_STATUS.UNPAID"
                type="primary"
                size="small"
                @click="payOrder(order)">
                立即支付
              </el-button>
              <el-button
                v-if="order.status === ORDER_STATUS.UNPAID"
                type="danger"
                size="small"
                @click="cancelOrder(order.orderNo)">
                取消订单
              </el-button>
              <el-button
                v-if="order.status === ORDER_STATUS.PAID"
                type="success"
                size="small"
                @click="confirmReceipt(order.orderNo)">
                确认收货
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5,10,15,20]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange">
      </el-pagination>
    </div>
  </div>
</template>

<style scoped>
.order-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-header {
  margin-bottom: 20px;
}

.order-header h2 {
  color: #2b6fc2;
  margin: 0 0 20px 0;
}

.order-tabs {
  border-bottom: 1px solid #ebeef5;
}

.loading-container,
.empty-container {
  padding: 40px 0;
  text-align: center;
}

.order-list {
  margin-bottom: 20px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.order-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.order-no {
  font-weight: 600;
  color: #333;
}

.order-time {
  color: #666;
  font-size: 14px;
}

.order-content {
  padding: 20px;
}

.order-products {
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.product-item:hover {
  background-color: #f8f9fa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.product-specs {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.product-quantity {
  color: #666;
  font-size: 14px;
  min-width: 60px;
  text-align: right;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.order-amount {
  font-size: 16px;
  color: #333;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
  margin-left: 10px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-list-container {
    padding: 10px;
  }

  .order-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .product-quantity {
    text-align: left;
    margin-top: 5px;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
