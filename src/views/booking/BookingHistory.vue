<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useUserStore } from '@/stores'
import { getMyOrders, getReservationById, cancelReservation, applyRefund, ORDER_STATUS_TEXT, ORDER_STATUS_COLOR } from '@/api/venueOrder'

// 用户信息
// const userStore = useUserStore()
// const userInfo = computed(() => userStore.userinfo)

const router = useRouter()

// 数据加载状态
const loading = ref(false)

// 筛选表单
const status = ref('')

watch(status, (newVal) => {
  fetchMyOrders(newVal)
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 预订记录数据
const allBookings = ref([])

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentBooking = ref(null)

// 获取我的订单列表
const fetchMyOrders = async (status) => {
  try {
    loading.value = true
    const response = await getMyOrders(status)
    if (response.data.code === 0) {
      allBookings.value = response.data.data || []
      total.value = allBookings.value.length
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}


// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 显示预订详情
const showDetail = async (booking) => {
  try {
    loading.value = true
    const response = await getReservationById(booking.id)
    if (response.data.code === 0) {
      currentBooking.value = response.data.data
      currentBooking.value.contactName = response.data.data.remark.split(' ')[0]
      currentBooking.value.contactPhone = response.data.data.remark.split(' ')[1]
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 判断预订是否已过期
const isBookingExpired = (booking) => {
  if (!booking) return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bookingDate = new Date(booking.date)
  bookingDate.setHours(0, 0, 0, 0)

  // 如果预订日期早于今天，则已过期
  return bookingDate < today
}

// 判断预订是否可以取消
const canCancel = (booking) => {
  if (!booking) return false
  return booking.status === 'reserved' || booking.status === 1
}

// 获取取消按钮文本
const getCancelButtonText = (booking) => {
  if (!booking) return '取消预订'
  if (booking.status === 'cancelled' || booking.status === 4) return '已取消'
  return '取消预订'
}

// 获取状态文本
const getStatusText = (status) => {
  return ORDER_STATUS_TEXT[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  return ORDER_STATUS_COLOR[status] || ''
  }

// 立即支付
const payBooking = async (booking) => {
  const remark = booking.remark
  const [contactName, contactPhone, remarkMessage] = remark.split(' ')
  router.push({
    path: '/payment',
    query: {
      orderNo: booking.orderNo,
    },
    state: {
      booking: {
        id: booking.id,
        venueName: booking.venueName,
        venueId: booking.venueId,
        reservationDate: booking.reservationDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        contactName,
        contactPhone,
        remarkMessage,
        pricePerHour: booking.pricePerHour,
        totalAmount: booking.totalAmount,
        createTime: booking.createTime,
      }
    },
  })
}

// 取消预订
const cancelBooking = async (booking) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消 ${booking.reservationDate} ${booking.timeSlot} ${booking.venueName} 的预订吗？取消后无法恢复。`,
      '取消预订',
      {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning',
      },
    )

    loading.value = true
    const response = await cancelReservation(booking.id, {
      reason: '用户主动取消'
    })

    if (response.data.code === 0) {
      ElMessage.success(response.data.data)
      // 刷新订单列表
      await fetchMyOrders()
    } else {
      ElMessage.error(response.message || '取消预订失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消操作')
    } else {
      console.error('取消预订失败:', error)
      ElMessage.error('取消预订失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 从详情对话框中取消预订
const cancelBookingFromDetail = async () => {
  if (currentBooking.value) {
    await cancelBooking(currentBooking.value)
    detailDialogVisible.value = false
  }
}

// 申请退款
const handleRefund = async (booking) => {
  try {
    await ElMessageBox.confirm(
      `确定要申请退款吗？退款申请提交后需要管理员审核,并需要到线下退款。`,
      '申请退款',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    loading.value = true
    const response = await applyRefund(booking.id, {
      reason: '用户申请退款'
    })

    if (response.data.code === 0) {
      ElMessage.success('退款申请已提交，等待管理员审核')
      // 刷新订单列表
      await fetchMyOrders()
    } else {
      ElMessage.error(response.message || '申请退款失败')
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消操作')
    } else {
      console.error('申请退款失败:', error)
      ElMessage.error('申请退款失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchMyOrders()
})
</script>

<template>
  <div class="booking-history">
    <div class="container">
      <h2 class="page-title">我的预订记录</h2>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="预订状态">
            <el-select v-model="status" placeholder="预订状态" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="待支付" value="1" />
              <el-option label="已支付" value="2" />
              <el-option label="已完成" value="3" />
              <el-option label="已取消" value="4" />
              <el-option label="已退款" value="5" />
              <el-option label="退款中" value="6" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-container" v-loading="loading">
        <el-empty v-if="allBookings.length === 0 && !loading" description="暂无预订记录" />
        <el-table v-else :data="allBookings" style="width: 100%" border>
          <el-table-column prop="id" label="预订号" width="80" />
          <el-table-column prop="venueName" label="场地名称" width="120" />
          <el-table-column prop="reservationDate" label="预订日期" width="120" />
          <el-table-column prop="timeSlot" label="时间段" width="120" />
          <el-table-column prop="totalAmount" label="金额(元)" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="预订时间" width="160" />
          <el-table-column label="操作" fixed="right" width="300">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showDetail(scope.row)">
                查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="payBooking(scope.row)"
                v-if="scope.row.status === 1"
              >
                立即支付
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="cancelBooking(scope.row)"
                :disabled="isBookingExpired(scope.row) || !canCancel(scope.row)"
                v-if="scope.row.status === 1"
              >
                {{ getCancelButtonText(scope.row) }}
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleRefund(scope.row)"
                :disabled="scope.row.status !== 2"
                v-if="scope.row.status === 2"
              >
                申请退款
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination" v-if="allBookings.length > 0">
          <el-pagination
            background
            layout="prev, pager, next, total"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 预订详情对话框 -->
    <el-dialog title="预订详情" v-model="detailDialogVisible" width="500px" center>
      <div class="booking-detail" v-if="currentBooking">
        <el-descriptions :column="1" :border="true">
          <el-descriptions-item label="预订编号">{{ currentBooking.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号" v-if="currentBooking.orderNo">{{ currentBooking.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="场地名称">{{
            currentBooking.courtName || currentBooking.venueName
          }}</el-descriptions-item>
          <el-descriptions-item label="预订日期">{{ currentBooking.date || currentBooking.reservationDate }}</el-descriptions-item>
          <el-descriptions-item label="预订时段">{{
            currentBooking.timeSlot || `${currentBooking.startTime}-${currentBooking.endTime}`
          }}</el-descriptions-item>
          <el-descriptions-item label="预订价格"
            >{{ currentBooking.price || currentBooking.totalAmount }} 元</el-descriptions-item
          >
          <el-descriptions-item label="预订状态">
            <el-tag :type="getStatusTagType(currentBooking.status)">
              {{ getStatusText(currentBooking.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预订人">{{
            currentBooking.contactName
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentBooking.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="预订时间">{{
            currentBooking.createTime || currentBooking.createdAt
          }}</el-descriptions-item>
          <el-descriptions-item label="备注" v-if="currentBooking.remark || currentBooking.note">
            {{ currentBooking.remark.split(' ')[2] }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            type="danger"
            @click="cancelBookingFromDetail"
            :disabled="isBookingExpired(currentBooking) || !canCancel(currentBooking)"
            v-if="currentBooking && canCancel(currentBooking)"
          >
            {{ getCancelButtonText(currentBooking) }}
          </el-button>
          <el-button
            type="warning"
            @click="handleRefund(currentBooking)"
            v-if="currentBooking && (currentBooking.status === 1 || currentBooking.status === 'reserved')"
          >
            申请退款
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.booking-history {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .filter-section {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .table-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    width: 100%;

    .el-table {
      width: 100% !important;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .booking-detail {
    padding: 10px;
  }
}
</style>
