<template>
  <div class="venue-schedule-management">
    <el-card class="page-header">
      <div class="header-content">
        <div>
          <h2>{{ venueName }} - 时段管理</h2>
          <p>管理场地的时段开放状态和预约情况</p>
        </div>
        <el-button @click="$router.go(-1)">返回</el-button>
      </div>
    </el-card>

    <!-- 日期选择和操作 -->
    <el-card class="date-selector-card">
      <div class="date-controls">
        <div class="date-picker-group">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            @change="loadScheduleData"
            :disabled-date="disabledDate"
          />
          <el-button type="primary" @click="loadScheduleData">查询</el-button>
        </div>
        <div class="batch-controls">
          <el-button @click="batchEnable">批量启用</el-button>
          <el-button @click="batchDisable">批量停用</el-button>
          <el-button type="warning" @click="resetToDefault">恢复默认</el-button>
        </div>
      </div>
    </el-card>

    <!-- 时段管理表格 -->
    <el-card class="schedule-table-card">
      <template #header>
        <div class="card-header">
          <span>时段安排 - {{ formatDate(selectedDate) }}</span>
          <el-tag :type="getDateStatusType()">{{ getDateStatusText() }}</el-tag>
        </div>
      </template>

      <el-table
        :data="scheduleData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="timeSlot" label="时段" width="150">
          <template #default="scope">
            <strong>{{ scope.row.timeSlot }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isAvailable"
              @change="updateTimeSlotStatus(scope.row)"
              active-text="开放"
              inactive-text="关闭"
              :disabled="scope.row.isBooked"
            />
          </template>
        </el-table-column>
        <el-table-column prop="bookingStatus" label="预约状态" width="120">
          <template #default="scope">
            <el-tag :type="getBookingStatusType(scope.row.bookingStatus)">
              {{ getBookingStatusText(scope.row.bookingStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bookedBy" label="预约人" width="120">
          <template #default="scope">
            <span v-if="scope.row.bookedBy">{{ scope.row.bookedBy }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="bookingTime" label="预约时间" width="150">
          <template #default="scope">
            <span v-if="scope.row.bookingTime">{{ formatDateTime(scope.row.bookingTime) }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="200">
          <template #default="scope">
            <el-input
              v-model="scope.row.remark"
              placeholder="添加备注"
              @blur="updateRemark(scope.row)"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button
              v-if="scope.row.isBooked"
              size="small"
              type="danger"
              @click="cancelBooking(scope.row)"
            >
              取消预约
            </el-button>
            <el-button
              v-else
              size="small"
              @click="viewDetails(scope.row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 统计信息 -->
    <el-card class="stats-card">
      <template #header>
        <span>统计信息</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.totalSlots }}</div>
            <div class="stat-label">总时段数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.availableSlots }}</div>
            <div class="stat-label">可预约时段</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.bookedSlots }}</div>
            <div class="stat-label">已预约时段</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">¥{{ stats.totalRevenue }}</div>
            <div class="stat-label">预计收入</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const venueId = route.params.venueId || 1
const venueName = ref(`羽毛球场${venueId}号`)

// 响应式数据
const selectedDate = ref(new Date())
const scheduleData = ref([])
const selectedRows = ref([])

// 统计信息
const stats = reactive({
  totalSlots: 0,
  availableSlots: 0,
  bookedSlots: 0,
  totalRevenue: 0
})

// 时段模板
const timeSlotTemplate = [
  { timeSlot: '08:00-10:00', price: 80 },
  { timeSlot: '10:00-12:00', price: 100 },
  { timeSlot: '12:00-14:00', price: 80 },
  { timeSlot: '14:00-16:00', price: 100 },
  { timeSlot: '16:00-18:00', price: 120 },
  { timeSlot: '18:00-20:00', price: 150 },
  { timeSlot: '20:00-22:00', price: 120 }
]

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

// 获取日期状态类型
const getDateStatusType = () => {
  const today = new Date()
  const selected = new Date(selectedDate.value)

  if (selected.toDateString() === today.toDateString()) {
    return 'primary'
  } else if (selected.getTime() > today.getTime()) {
    return 'success'
  } else {
    return 'info'
  }
}

// 获取日期状态文本
const getDateStatusText = () => {
  const today = new Date()
  const selected = new Date(selectedDate.value)

  if (selected.toDateString() === today.toDateString()) {
    return '今天'
  } else if (selected.getTime() > today.getTime()) {
    return '未来日期'
  } else {
    return '历史日期'
  }
}

// 获取预约状态类型
const getBookingStatusType = (status) => {
  const typeMap = {
    'available': 'success',
    'booked': 'warning',
    'closed': 'danger',
    'maintenance': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取预约状态文本
const getBookingStatusText = (status) => {
  const textMap = {
    'available': '可预约',
    'booked': '已预约',
    'closed': '已关闭',
    'maintenance': '维护中'
  }
  return textMap[status] || '未知'
}

// 加载时段数据
const loadScheduleData = () => {
  // 模拟API调用
  scheduleData.value = timeSlotTemplate.map((slot, index) => ({
    id: index + 1,
    timeSlot: slot.timeSlot,
    price: slot.price,
    isAvailable: Math.random() > 0.2, // 80%概率开放
    bookingStatus: Math.random() > 0.6 ? 'booked' : 'available',
    isBooked: Math.random() > 0.7,
    bookedBy: Math.random() > 0.7 ? `用户${Math.floor(Math.random() * 100)}` : null,
    bookingTime: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
    remark: ''
  }))

  updateStats()
}

// 更新统计信息
const updateStats = () => {
  stats.totalSlots = scheduleData.value.length
  stats.availableSlots = scheduleData.value.filter(item => item.isAvailable && !item.isBooked).length
  stats.bookedSlots = scheduleData.value.filter(item => item.isBooked).length
  stats.totalRevenue = scheduleData.value
    .filter(item => item.isBooked)
    .reduce((sum, item) => sum + item.price, 0)
}

// 更新时段状态
const updateTimeSlotStatus = (row) => {
  ElMessage.success(`时段 ${row.timeSlot} 已${row.isAvailable ? '开放' : '关闭'}`)
  updateStats()
}

// 更新备注
const updateRemark = (row) => {
  // 这里可以调用API保存备注
  console.log('更新备注:', row.timeSlot, row.remark)
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量启用
const batchEnable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要操作的时段')
    return
  }

  selectedRows.value.forEach(row => {
    if (!row.isBooked) {
      row.isAvailable = true
    }
  })

  ElMessage.success(`已启用 ${selectedRows.value.length} 个时段`)
  updateStats()
}

// 批量停用
const batchDisable = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要操作的时段')
    return
  }

  const bookedCount = selectedRows.value.filter(row => row.isBooked).length
  if (bookedCount > 0) {
    ElMessage.warning(`选中的时段中有 ${bookedCount} 个已被预约，无法停用`)
    return
  }

  selectedRows.value.forEach(row => {
    row.isAvailable = false
  })

  ElMessage.success(`已停用 ${selectedRows.value.length} 个时段`)
  updateStats()
}

// 恢复默认设置
const resetToDefault = () => {
  ElMessageBox.confirm(
    '确定要恢复到默认设置吗？这将重置所有时段状态（已预约的时段不受影响）',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    scheduleData.value.forEach(row => {
      if (!row.isBooked) {
        row.isAvailable = true
        row.remark = ''
      }
    })
    ElMessage.success('已恢复默认设置')
    updateStats()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 取消预约
const cancelBooking = (row) => {
  ElMessageBox.confirm(
    `确定要取消 ${row.timeSlot} 的预约吗？`,
    '确认取消',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.isBooked = false
    row.bookedBy = null
    row.bookingTime = null
    row.bookingStatus = 'available'
    ElMessage.success('预约已取消')
    updateStats()
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看详情
const viewDetails = (row) => {
  ElMessage.info(`查看时段 ${row.timeSlot} 详情`)
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

// 格式化日期时间
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

// 组件挂载时加载数据
onMounted(() => {
  loadScheduleData()
})
</script>

<style lang="less" scoped>
.venue-schedule-management {
  .page-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h2 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
      }
    }
  }

  .date-selector-card {
    margin-bottom: 20px;

    .date-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .date-picker-group {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .batch-controls {
        display: flex;
        gap: 8px;
      }
    }
  }

  .schedule-table-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .stats-card {
    .stat-item {
      text-align: center;
      padding: 20px;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      background: #fafafa;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409eff;
        margin-bottom: 8px;
      }

      .stat-label {
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .text-muted {
    color: #c0c4cc;
  }
}
</style>
