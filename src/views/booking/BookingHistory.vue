<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores'

// 用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.userinfo)

// 数据加载状态
const loading = ref(false)

// 筛选表单
const filterForm = reactive({
  status: 'all',
  dateRange: [],
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 预订记录数据（模拟数据）
const allBookings = ref([
  {
    id: 10001,
    courtId: 1,
    courtName: '羽毛球场地1号',
    date: '2023-11-20',
    timeSlot: '19:00-20:00',
    price: 40,
    status: 'reserved', // reserved, reviewing, cancelled
    createTime: '2023-11-15 10:30:45',
    name: '张三',
    phone: '13812345678',
    remark: '希望场地干净整洁',
  },
  {
    id: 10002,
    courtId: 2,
    courtName: '羽毛球场地2号',
    date: '2023-11-25',
    timeSlot: '18:00-19:00',
    price: 40,
    status: 'reserved',
    createTime: '2023-11-15 14:20:30',
    name: '张三',
    phone: '13812345678',
  },
  {
    id: 10003,
    courtId: 3,
    courtName: '羽毛球场地3号',
    date: '2023-10-15',
    timeSlot: '10:00-11:00',
    price: 30,
    status: 'cancelled',
    createTime: '2023-10-10 09:15:22',
    name: '张三',
    phone: '13812345678',
  },
  {
    id: 10004,
    courtId: 1,
    courtName: '羽毛球场地1号',
    date: '2023-12-05',
    timeSlot: '20:00-21:00',
    price: 40,
    status: 'reviewing',
    createTime: '2023-11-18 16:45:00',
    name: '张三',
    phone: '13812345678',
  },
  {
    id: 10005,
    courtId: 4,
    courtName: '羽毛球场地4号',
    date: '2025-04-15',
    timeSlot: '14:00-16:00',
    price: 80,
    status: 'reserved',
    createTime: '2025-03-28 15:20:10',
    name: '张三',
    phone: '13812345678',
    remark: '测试未过期数据',
  },
])

// 过滤后的预订记录
const filteredBookings = computed(() => {
  let result = [...allBookings.value]

  // 根据状态筛选
  if (filterForm.status && filterForm.status !== 'all') {
    result = result.filter((item) => item.status === filterForm.status)
  }

  // 根据日期范围筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    result = result.filter((item) => {
      const bookingDate = new Date(item.date)
      return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate)
    })
  }

  return result
})

// 计算总数
const computedTotal = computed(() => {
  return filteredBookings.value.length
})

// 分页后的预订记录
const bookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBookings.value.slice(start, end)
})

// 更新总数方法
const updateTotal = () => {
  total.value = computedTotal.value
}

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentBooking = ref(null)

// 筛选处理
const handleFilter = () => {
  loading.value = true
  // 更新总数
  updateTotal()
  // 使用计算属性，自动过滤
  setTimeout(() => {
    loading.value = false
    currentPage.value = 1
  }, 300)
}

// 重置筛选
const resetFilter = () => {
  filterForm.status = 'all'
  filterForm.dateRange = []
  updateTotal()
  handleFilter()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

// 显示预订详情
const showDetail = (booking) => {
  currentBooking.value = booking
  detailDialogVisible.value = true
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
  return booking.status === 'reserved'
}

// 获取取消按钮文本
const getCancelButtonText = (booking) => {
  if (!booking) return '取消预订'
  if (booking.status === 'reviewing') return '审核中'
  if (booking.status === 'cancelled') return '已取消'
  return '取消预订'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    reserved: '已预约',
    reviewing: '审核中',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    reserved: 'success',
    cancelled: 'info',
    reviewing: 'primary',
  }
  return typeMap[status] || ''
}

// 取消预订
const cancelBooking = (booking) => {
  ElMessageBox.confirm(
    `确定要取消 ${booking.date} ${booking.timeSlot} ${booking.courtName} 的预订吗？取消后需要管理员审核，且无法恢复。`,
    '取消预订',
    {
      confirmButtonText: '确定',
      cancelButtonText: '返回',
      type: 'warning',
    },
  )
    .then(() => {
      loading.value = true

      // 模拟API请求
      setTimeout(() => {
        // 更新预订状态为审核中
        const index = allBookings.value.findIndex((item) => item.id === booking.id)
        if (index !== -1) {
          allBookings.value[index].status = 'reviewing'
          ElMessage({
            type: 'success',
            message: '取消请求已提交，等待管理员审核',
          })
          // TODO: 向后端发送取消预订请求，并更新到审核系统中
        }
        loading.value = false
      }, 500)
    })
    .catch(() => {
      // 用户取消操作
      ElMessage({
        type: 'info',
        message: '已取消操作',
      })
    })
}

// 从详情对话框中取消预订
const cancelBookingFromDetail = () => {
  if (currentBooking.value) {
    cancelBooking(currentBooking.value)
  }
}

// 初始化
onMounted(() => {
  // TODO: 调用API获取用户预订记录
  updateTotal()
  handleFilter()
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
            <el-select v-model="filterForm.status" placeholder="预订状态" clearable style="width: 100px">
              <el-option label="全部" value="all" />
              <el-option label="已预约" value="reserved" />
              <el-option label="审核中" value="reviewing" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabledDate="() => false"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <div class="table-container" v-loading="loading">
        <el-empty v-if="bookings.length === 0" description="暂无预订记录" />
        <el-table v-else :data="bookings" style="width: 100%" border>
          <el-table-column prop="id" label="预订号" width="80" />
          <el-table-column prop="courtName" label="场地名称" width="120" />
          <el-table-column prop="date" label="预订日期" width="120" />
          <el-table-column prop="timeSlot" label="时间段" width="120" />
          <el-table-column prop="price" label="金额(元)" width="100" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="预订时间" width="160" />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="scope">
              <el-button type="primary" size="small" @click="showDetail(scope.row)">
                查看详情
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="cancelBooking(scope.row)"
                :disabled="isBookingExpired(scope.row) || !canCancel(scope.row)"
              >
                {{ getCancelButtonText(scope.row) }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination" v-if="bookings.length > 0">
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
        <el-descriptions :column="1" border>
          <el-descriptions-item label="预订编号">{{ currentBooking.id }}</el-descriptions-item>
          <el-descriptions-item label="场地名称">{{
            currentBooking.courtName
          }}</el-descriptions-item>
          <el-descriptions-item label="预订日期">{{ currentBooking.date }}</el-descriptions-item>
          <el-descriptions-item label="预订时段">{{
            currentBooking.timeSlot
          }}</el-descriptions-item>
          <el-descriptions-item label="预订价格"
            >{{ currentBooking.price }} 元</el-descriptions-item
          >
          <el-descriptions-item label="预订状态">
            <el-tag :type="getStatusTagType(currentBooking.status)">
              {{ getStatusText(currentBooking.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预订人">{{
            currentBooking.name || userInfo.username
          }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentBooking.phone }}</el-descriptions-item>
          <el-descriptions-item label="预订时间">{{
            currentBooking.createTime
          }}</el-descriptions-item>
          <el-descriptions-item label="备注" v-if="currentBooking.remark">
            {{ currentBooking.remark }}
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
            v-if="currentBooking"
          >
            {{ getCancelButtonText(currentBooking) }}
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
