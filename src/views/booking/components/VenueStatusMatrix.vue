<script setup>
import { ref, watch, computed } from 'vue'
import { getVenueStatusMatrix } from '@/api/venue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 使用 computed 来创建响应式的 visible 引用
const dialogVisible = computed({
  get: () => props.visible,
})

// 监听 props.visible 的变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchMatrixData()
  }
}, { immediate: true })

const emit = defineEmits(['close'])

// 关闭弹窗
const closeDialog = () => {
  emit('close')
}

// 数据状态
const loading = ref(false)
const matrixData = ref({})
const selectedDate = ref(new Date())

// 时间段配置
const timeSlots = ref([])

// 场地列表
const venues = ref([])

// 状态颜色映射 - 支持数字状态值
const statusColors = {
  1: '#67c23a',    // 空闲中 - 绿色
  2: '#909399',    // 使用中 - 灰色
  3: '#f56c6c',    // 已预约 - 红色
  4: '#e6a23c',    // 不开放 - 橙色
}

// 状态文本映射 - 支持数字状态值
const statusText = {
  1: '空闲中',
  2: '使用中',
  3: '已预约',
  4: '不开放',
}

// 通用日期格式化函数，避免时区问题
const formatDateToString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取场地状态矩阵数据
const fetchMatrixData = async () => {
  if (!props.visible) return

  loading.value = true
  try {
    const dateStr = formatDateToString(selectedDate.value)

    const response = await getVenueStatusMatrix({ date: dateStr })

    if (response.data.code === 0) {
      matrixData.value = response.data.data.statusMatrix || {}
      venues.value = response.data.data.venues || []
      timeSlots.value = response.data.data.timeSlots || []
    }
  } catch (error) {
    console.error('获取场地状态矩阵失败:', error)
    ElMessage.error('获取场地状态矩阵失败')
  } finally {
    loading.value = false
  }
}

// 检查是否为工作日
const isWeekday = (date) => {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

// 禁用日期函数 - 只允许选择今天和明天
const disabledDate = (time) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const targetDate = new Date(time)
  targetDate.setHours(0, 0, 0, 0)

  // 只允许今天和明天
  return !(targetDate.getTime() === today.getTime() || targetDate.getTime() === tomorrow.getTime())
}

// 获取单元格状态
const getCellStatus = (venueId, timeSlot) => {
  const venueData = matrixData.value[venueId]
  if (!venueData || !venueData[timeSlot]) {
    return 1  // 默认为空闲中状态
  }
  return venueData[timeSlot].status
}

// 获取单元格样式
const getCellStyle = (venueId, timeSlot) => {
  const status = getCellStatus(venueId, timeSlot)
  return {
    backgroundColor: statusColors[status],
    color: '#fff',
    textAlign: 'center',
    padding: '8px 4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  }
}

// 处理单元格点击
const handleCellClick = (venue, timeSlot) => {
  const venueData = matrixData.value[venue.id]
  if (!venueData || !venueData[timeSlot]) return

  const cellData = venueData[timeSlot]
  const status = cellData.status
  let message = ''
  if(status !== 1){
    message = `${venue.name} ${timeSlot} - ${statusText[status]} - ${cellData.reason}`
  }else{
    message = `${venue.name} ${timeSlot} - ${statusText[status]}`
  }

  if (status === 1) {
    ElMessage.success(message)
  }else if (status === 2) {
    ElMessage.warning(message)
  }else if (status === 3) {
    ElMessage.error(message)
  }else if (status === 4) {
    ElMessage.warning(message)
  }
}

// 日期改变处理
const handleDateChange = () => {
  fetchMatrixData()
}

</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="场地使用情况表"
    width="90%"
    :close-on-click-modal="false"
    @close="closeDialog"
    class="venue-matrix-dialog"
  >
    <div class="matrix-container">
      <!-- 日期选择器 -->
      <div class="date-selector">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择查询日期"
          format="YYYY年MM月DD日"
          @change="handleDateChange"
          :disabled-date="disabledDate"
        />
        <div class="date-info">
          <span v-if="isWeekday(selectedDate)" class="workday-info">
            工作日：白天场地用于校内上课，仅晚上18:00-21:00开放预约
          </span>
          <span v-else class="weekend-info">
            周末：全天开放预约，时间为8:00-21:00
          </span>
        </div>
      </div>

      <!-- 状态图例 -->
      <div class="legend">
        <div class="legend-item" v-for="(color, status) in statusColors" :key="status">
          <div class="legend-color" :style="{ backgroundColor: color }"></div>
          <span class="legend-text">{{ statusText[status] }}</span>
        </div>
      </div>

      <!-- 矩阵表格 -->
      <div class="matrix-table" v-loading="loading">
        <table class="status-matrix">
          <thead>
            <tr>
              <th class="venue-header">场地/时间</th>
              <th v-for="timeSlot in timeSlots" :key="timeSlot" class="time-header">
                {{ timeSlot }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venue in venues" :key="venue.id">
              <td class="venue-name">{{ venue.name }}</td>
              <td
                v-for="timeSlot in timeSlots"
                :key="timeSlot"
                class="status-cell"
                :style="getCellStyle(venue.id, timeSlot)"
                @click="handleCellClick(venue, timeSlot)"
                :title="`${venue.name} ${timeSlot} - ${statusText[getCellStatus(venue.id, timeSlot)]}`"
              >
                {{ statusText[getCellStatus(venue.id, timeSlot)] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 说明信息 -->
      <div class="matrix-info">
        <p><strong>使用说明：</strong></p>
        <ul>
          <li>点击单元格可查看详细信息</li>
          <li>绿色表示可预约，红色表示已预约，橙色表示维护中，灰色表示不开放</li>
          <li>工作日白天时间段场地用于校内上课，不对外开放</li>
          <li>周末全天开放预约</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" @click="fetchMatrixData">刷新数据</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.venue-matrix-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}

.matrix-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;

  .date-info {
    font-size: 14px;
    color: #666;

    .workday-info {
      color: #e6a23c;
    }

    .weekend-info {
      color: #67c23a;
    }
  }
}

.legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .legend-text {
    font-size: 14px;
    color: #333;
  }
}

.matrix-table {
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .status-matrix {
    width: 100%;
    border-collapse: collapse;
    background-color: #fff;

    th, td {
      border: 1px solid #e8e8e8;
      text-align: center;
      vertical-align: middle;
    }

    .venue-header, .time-header {
      background-color: #f5f5f5;
      font-weight: bold;
      padding: 12px 8px;
      color: #333;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .venue-header {
      position: sticky;
      left: 0;
      z-index: 11;
      min-width: 120px;
    }

    .venue-name {
      background-color: #fafafa;
      font-weight: 500;
      padding: 12px 8px;
      color: #333;
      position: sticky;
      left: 0;
      z-index: 9;
      min-width: 120px;
    }

    .time-header {
      min-width: 80px;
      font-size: 14px;
    }

    .status-cell {
      min-width: 80px;
      height: 40px;
      font-size: 12px;
      font-weight: 500;
      border: 1px solid #fff;

      &:hover {
        opacity: 0.8;
        transform: scale(1.05);
        z-index: 5;
        position: relative;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}

.matrix-info {
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #409eff;

  p {
    margin: 0 0 10px 0;
    color: #333;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 5px;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
  }
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .date-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .legend {
    flex-wrap: wrap;
    gap: 15px;
  }

  .matrix-table {
    font-size: 12px;

    .status-matrix {
      .venue-header, .time-header, .venue-name {
        padding: 8px 4px;
        font-size: 12px;
      }

      .status-cell {
        min-width: 60px;
        height: 35px;
        font-size: 10px;
      }
    }
  }
}
</style>
