<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  courtId: '',
  startTime: '',
  endTime: '',
  reviewType: 'all', // 新增审核类型筛选
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 所有预定列表数据 (模拟数据)
const allBookingList = ref([
  {
    id: 1001,
    username: '张三',
    courtName: '1号场地',
    courtId: '1',
    bookingDate: '2023-11-10',
    timeSlot: '18:00-19:00',
    createTime: '2023-11-08 15:30:45',
    reviewType: 'booking', // 新预约
  },
  {
    id: 1002,
    username: '李四',
    courtName: '2号场地',
    courtId: '2',
    bookingDate: '2023-11-11',
    timeSlot: '19:00-20:00',
    createTime: '2023-11-08 16:20:15',
    reviewType: 'booking',
  },
  {
    id: 1003,
    username: '王五',
    courtName: '3号场地',
    courtId: '3',
    bookingDate: '2023-11-12',
    timeSlot: '20:00-21:00',
    createTime: '2023-11-09 09:15:30',
    reviewType: 'booking',
  },
  {
    id: 1004,
    username: '赵六',
    courtName: '2号场地',
    courtId: '2',
    bookingDate: '2023-11-13',
    timeSlot: '14:00-15:00',
    createTime: '2023-11-09 11:45:20',
    reviewType: 'booking',
  },
  {
    id: 1005,
    username: '孙七',
    courtName: '4号场地',
    courtId: '4',
    bookingDate: '2023-11-14',
    timeSlot: '16:00-17:00',
    createTime: '2023-11-09 14:30:00',
    reviewType: 'booking',
  },
  // 新增取消预约审核数据
  {
    id: 2001,
    username: '张三',
    courtName: '1号场地',
    courtId: '1',
    bookingDate: '2023-11-25',
    timeSlot: '19:00-20:00',
    createTime: '2023-11-18 15:30:45',
    reviewType: 'cancel',
    cancelReason: '个人原因，无法前往',
    cancelTime: '2023-11-18 16:20:30',
  },
  {
    id: 2002,
    username: '李四',
    courtName: '3号场地',
    courtId: '3',
    bookingDate: '2023-11-26',
    timeSlot: '20:00-21:00',
    createTime: '2023-11-19 10:15:22',
    reviewType: 'cancel',
    cancelReason: '时间冲突',
    cancelTime: '2023-11-20 09:45:10',
  },
])

// 筛选后的列表
const filteredBookings = computed(() => {
  let result = [...allBookingList.value]

  // 审核类型筛选
  if (filterForm.reviewType !== 'all') {
    result = result.filter((item) => item.reviewType === filterForm.reviewType)
  }

  // 场地号筛选
  if (filterForm.courtId) {
    result = result.filter((item) => item.courtId === filterForm.courtId)
  }

  // 时间段筛选
  if (filterForm.startTime && filterForm.endTime) {
    const start = filterForm.startTime.split(':').map(Number)[0]
    const end = filterForm.endTime.split(':').map(Number)[0]

    result = result.filter((item) => {
      const timeRange = item.timeSlot.split('-')
      const bookingStart = parseInt(timeRange[0].split(':')[0])
      const bookingEnd = parseInt(timeRange[1].split(':')[0])

      return bookingStart >= start && bookingEnd <= end
    })
  }

  return result
})

// 计算总数
const computedTotal = computed(() => {
  return filteredBookings.value.length
})

// 分页后的列表
const bookingList = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredBookings.value.slice(startIndex, endIndex)
})

// 更新总数函数
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
  setTimeout(() => {
    loading.value = false
    currentPage.value = 1 // 重置到第一页
  }, 300)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.courtId = ''
  filterForm.startTime = ''
  filterForm.endTime = ''
  filterForm.reviewType = 'all'
  updateTotal()
  handleFilter()
}

// 获取审核类型文本
const getReviewTypeText = (type) => {
  return type === 'booking' ? '新预约' : '取消预约'
}

// 取消预约申请审核
const handleCancelReview = (row, approved) => {
  const action = approved ? '批准' : '拒绝'
  ElMessageBox.confirm(
    `确定要${action}用户 ${row.username} 取消 ${row.bookingDate} ${row.timeSlot} 的 ${row.courtName} 预约申请吗？`,
    `${action}取消预约申请`,
    {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '返回',
      type: approved ? 'warning' : 'info',
      center: true,
      customClass: 'custom-message-box',
    },
  )
    .then(() => {
      // TODO: 调用API处理取消预约申请
      // 模拟处理成功
      const index = allBookingList.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        // 从列表中删除审核项
        allBookingList.value.splice(index, 1)
        ElMessage({
          type: 'success',
          message: `已${action}取消预约申请`,
          duration: 2000,
        })
      }
    })
    .catch(() => {
      // 用户点击取消按钮
      ElMessage({
        type: 'info',
        message: '已取消操作',
        duration: 2000,
      })
    })
}

// 取消场地
const handleCancel = (row) => {
  ElMessageBox.confirm(
    `确定要取消 ${row.username} 在 ${row.bookingDate} ${row.timeSlot} 的 ${row.courtName} 预定吗？`,
    '取消场地确认',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '返回',
      type: 'warning',
      center: true,
      customClass: 'custom-message-box',
    },
  )
    .then(() => {
      // TODO: 调用API取消预定
      // 模拟取消成功
      const index = allBookingList.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        allBookingList.value.splice(index, 1)
        ElMessage({
          type: 'success',
          message: '场地预定已取消',
          duration: 2000,
        })
      }
    })
    .catch(() => {
      // 用户点击取消按钮
      ElMessage({
        type: 'info',
        message: '已取消操作',
        duration: 2000,
      })
    })
}

// 查看详情
const handleDetail = (row) => {
  currentBooking.value = row
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 时间段选项
const timeOptions = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
]

// 初始化
onMounted(() => {
  // TODO: 调用API获取预定列表
  // 设置初始总数
  updateTotal()
})
</script>

<template>
  <div class="booking-info">
    <h2 class="page-title">预定信息</h2>

    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="form-inline">
        <el-form-item label="审核类型">
          <el-select
            v-model="filterForm.reviewType"
            placeholder="审核类型"
            size="large"
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option label="全部" value="all"></el-option>
            <el-option label="新预约" value="booking"></el-option>
            <el-option label="取消预约" value="cancel"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="场地号">
          <el-select
            v-model="filterForm.courtId"
            placeholder="场地号"
            size="large"
            style="width: 120px"
            clearable
            @change="handleFilter"
          >
            <el-option label="1号场地" value="1"></el-option>
            <el-option label="2号场地" value="2"></el-option>
            <el-option label="3号场地" value="3"></el-option>
            <el-option label="4号场地" value="4"></el-option>
            <el-option label="5号场地" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间段">
          <el-select
            v-model="filterForm.startTime"
            placeholder="开始时间"
            style="width: 120px"
            clearable
          >
            <el-option
              v-for="time in timeOptions.slice(0, -1)"
              :key="time"
              :label="time"
              :value="time"
            ></el-option>
          </el-select>
          <span class="separator">至</span>
          <el-select
            v-model="filterForm.endTime"
            placeholder="结束时间"
            style="width: 120px"
            clearable
          >
            <el-option
              v-for="time in timeOptions.slice(1)"
              :key="time"
              :label="time"
              :value="time"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="bookingList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" fixed></el-table-column>
        <el-table-column prop="reviewType" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.reviewType === 'booking' ? 'success' : 'warning'">
              {{ getReviewTypeText(scope.row.reviewType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="预定用户" width="100"></el-table-column>
        <el-table-column prop="courtName" label="场地名称" width="100"></el-table-column>
        <el-table-column prop="bookingDate" label="预定日期" width="110"></el-table-column>
        <el-table-column prop="timeSlot" label="时间段" width="120"></el-table-column>
        <el-table-column label="提交时间" min-width="150">
          <template #default="scope">
            <div>
              {{ scope.row.reviewType === 'booking' ? scope.row.createTime : scope.row.cancelTime }}
            </div>
            <div v-if="scope.row.reviewType === 'cancel'" class="cancel-info">
              <el-tooltip :content="scope.row.cancelReason" placement="top">
                <el-tag size="small" type="info">取消原因</el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <!-- 预约审核操作 -->
            <template v-if="scope.row.reviewType === 'booking'">
              <el-button size="small" type="danger" @click="handleCancel(scope.row)"
                >取消场地</el-button
              >
              <el-button size="small" type="info" @click="handleDetail(scope.row)">详情</el-button>
            </template>

            <!-- 取消预约审核操作 -->
            <template v-else>
              <el-button size="small" type="success" @click="handleCancelReview(scope.row, true)"
                >批准取消</el-button
              >
              <el-button size="small" type="danger" @click="handleCancelReview(scope.row, false)"
                >拒绝取消</el-button
              >
              <el-button size="small" type="info" @click="handleDetail(scope.row)">详情</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[5, 8, 10, 15]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="预定详情" width="40%">
      <div class="booking-detail" v-if="currentBooking">
        <div class="detail-item">
          <span class="label">预定ID：</span>
          <span class="value">{{ currentBooking.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">审核类型：</span>
          <span class="value">
            <el-tag :type="currentBooking.reviewType === 'booking' ? 'success' : 'warning'">
              {{ getReviewTypeText(currentBooking.reviewType) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">预定用户：</span>
          <span class="value">{{ currentBooking.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">场地名称：</span>
          <span class="value">{{ currentBooking.courtName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预定日期：</span>
          <span class="value">{{ currentBooking.bookingDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间段：</span>
          <span class="value">{{ currentBooking.timeSlot }}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ currentBooking.createTime }}</span>
        </div>
        <template v-if="currentBooking.reviewType === 'cancel'">
          <div class="detail-item">
            <span class="label">取消时间：</span>
            <span class="value">{{ currentBooking.cancelTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">取消原因：</span>
            <span class="value">{{ currentBooking.cancelReason }}</span>
          </div>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- 不同审核类型显示不同操作按钮 -->
          <template v-if="currentBooking && currentBooking.reviewType === 'booking'">
            <el-button type="danger" @click="handleCancel(currentBooking)">取消预定</el-button>
          </template>
          <template v-else-if="currentBooking">
            <el-button type="success" @click="handleCancelReview(currentBooking, true)"
              >批准取消</el-button
            >
            <el-button type="danger" @click="handleCancelReview(currentBooking, false)"
              >拒绝取消</el-button
            >
          </template>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.booking-info {
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  .filter-container {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .separator {
      margin: 0 8px;
    }
  }

  .table-container {
    background: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    overflow-x: auto; // 添加横向滚动

    .el-table {
      width: 100% !important; // 确保表格宽度100%
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }

    .cancel-info {
      margin-top: 5px;
    }
  }

  .booking-detail {
    .detail-item {
      margin-bottom: 15px;
      display: flex;

      .label {
        width: 100px;
        font-weight: bold;
        color: #606266;
      }

      .value {
        flex: 1;
      }
    }
  }
}
</style>

<style>
/* 全局样式，不使用scoped */
.custom-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  max-width: 50% !important;
  margin: 0 !important;
}
</style>
