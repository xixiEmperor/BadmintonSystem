<script setup>
import { ref, computed, onMounted } from 'vue'
import NoticeList from './components/NoticeList.vue'
import VenueStatusMatrix from './components/VenueStatusMatrix.vue'
import CreateOrderForm from './components/CreateOrderForm.vue'
import { Calendar } from '@element-plus/icons-vue'
import { getVenueList, getVenueAvailability} from '@/api/venue'

// 通用日期格式化函数，避免时区问题
const formatDateToString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 检查是否为工作日（周一到周五）
const isWeekday = (date) => {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

// 检查是否为周末（周六、周日）
const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

// 检查指定日期和时间是否在可预约时间范围内
const isBookingTimeValid = (date, startTime) => {
  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)

  // 如果选择的是今天
  if (selectedDate.getTime() === today.getTime()) {
    // 今天场地：只要在开始时间之前都可以预约
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const startDateTime = new Date()
    startDateTime.setHours(startHour, startMinute, 0, 0)

    return now < startDateTime
  }

  // 如果选择的是明天
  if (selectedDate.getTime() === tomorrow.getTime()) {
    // 明天场地：今天18:00之后才能开始预约
    const currentHour = now.getHours()
    return currentHour >= 18
  }

  // 其他日期不允许预约
  return false
}

// 获取时间限制状态文本
const getTimeRestrictionText = (date) => {
  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const selectedDate = new Date(date)
  selectedDate.setHours(0, 0, 0, 0)

  // 如果选择的是明天且当前时间还没到18:00
  if (selectedDate.getTime() === tomorrow.getTime() && now.getHours() < 18) {
    return '不在可预约时间（明天场地需今天18:00后预约）'
  }

  return null
}

// 获取指定日期的开放时间段
const getAvailableTimeSlots = (date) => {
  // 工作日：只有晚上18:00-21:00开放
  if (isWeekday(date)) {
    return ['18:00-21:00']
  }

  // 周末：全天开放8:00-21:00
  if (isWeekend(date)) {
    return ['8:00-21:00']
  }

  return []
}

// 根据开放时间段生成可选时间选项
const getTimeOptionsForDate = (date) => {
  const timeSlots = getAvailableTimeSlots(date)
  if (timeSlots.length === 0) return { startOptions: [], endOptions: [] }

  const startOptions = []
  const endOptions = []

  // 直接处理第一个（也是唯一的）时间段
  const slot = timeSlots[0]
  const [startTime, endTime] = slot.split('-')
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  // 生成起始时间选项（最后一个选项是结束时间前1小时）
  let currentHour = startHour // 18
  let currentMinute = startMinute // 0

  // 计算最晚的起始时间（结束时间前1小时）
  let maxStartHour = endHour - 1 // 20
  let maxStartMinute = endMinute // 0

  // 如果结束时间的分钟数小于起始分钟数，需要调整
  if (maxStartMinute < currentMinute) {
    maxStartHour -= 1
    maxStartMinute += 60
  }

  while (currentHour < maxStartHour || (currentHour === maxStartHour && currentMinute <= maxStartMinute)) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

    // 检查时间限制：只有在可预约时间范围内的时间才添加到选项中
    if (isBookingTimeValid(date, timeStr)) {
      startOptions.push(timeStr)
    }

    // 改为1小时步长
    currentHour += 1
  }

  // 生成结束时间选项（从起始时间+1小时开始，到结束时间，最多3小时）
  let endCurrentHour = startHour + 1
  let endCurrentMinute = startMinute

  while (endCurrentHour < endHour || (endCurrentHour === endHour && endCurrentMinute <= endMinute)) {
    const timeStr = `${endCurrentHour.toString().padStart(2, '0')}:${endCurrentMinute.toString().padStart(2, '0')}`
    endOptions.push(timeStr)

    // 改为1小时步长
    endCurrentHour += 1
  }

  // 去重并排序
  const uniqueStartOptions = [...new Set(startOptions)].sort()
  const uniqueEndOptions = [...new Set(endOptions)].sort()

  return {
    startOptions: uniqueStartOptions,
    endOptions: uniqueEndOptions
  }
}

// 可选时间段（根据选择的日期动态计算）
const timeOptions = computed(() => {
  const options = getTimeOptionsForDate(currentDate.value)
  return options.startOptions || []
})

// 结束时间选项
const endTimeOptions = computed(() => {
  const options = getTimeOptionsForDate(currentDate.value)
  if (!startTime.value || options.endOptions.length === 0) {
    return options.endOptions || []
  }

  // 根据开始时间过滤结束时间选项，最多3小时
  const [startHour, startMinute] = startTime.value.split(':').map(Number)
  const maxEndHour = startHour + 3
  const maxEndTime = `${maxEndHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`

  return options.endOptions.filter(time => time <= maxEndTime && time > timeOptions.value[0])
})

const currentDate = ref(new Date()) // 默认选择今天

const startTime = ref('18:00')
const endTime = ref('19:00')

// 添加时间选择
if(isWeekday(currentDate.value)) {
  startTime.value = '18:00'
  endTime.value = '21:00'
} else {
  startTime.value = '8:00'
  endTime.value = '21:00'
}

// 当日期改变时，重置时间选择并检查场地可用性
const handleDateChange = async (date) => {
  const options = getTimeOptionsForDate(date)
  if (options.startOptions.length > 0) {
    startTime.value = options.startOptions[0]
    // 设置结束时间为开始时间后1小时
    endTime.value = options.endOptions[0]
  } else {
    startTime.value = ''
    endTime.value = ''
  }

  // 检查场地可用性
  if (startTime.value && endTime.value && startTime.value < endTime.value) {
    await checkVenueAvailability(date, startTime.value, endTime.value)
  }
}

// 获取日期状态文本
const getDateStatusText = (date) => {
  let statusText = ''

  if (isWeekday(date)) {
    statusText = '工作日（仅晚上18:00-21:00开放）'
  } else if (isWeekend(date)) {
    statusText = '周末（全天开放8:00-21:00）'
  }

  // 添加时间限制提示
  const timeRestrictionText = getTimeRestrictionText(date)
  if (timeRestrictionText) {
    statusText += ` - ${timeRestrictionText}`
  }

  return statusText
}

const courts = ref([])
const loading = ref(false)

// 获取场地列表
const fetchVenueList = async () => {
  loading.value = true
  try {
    const response = await getVenueList()
    if (response.data.code === 0) {
      // 转换API数据格式为组件需要的格式
      courts.value = response.data.data.map(venue => ({
        id: venue.id,
        name: venue.name,
        description: venue.description,
        price: venue.pricePerHour || 20, // 每小时价格
        status: venue.status,
        bookable: false, // 初始化为不可预约，等待时间选择后再检查
        availabilityReason: '请选择时间段', // 初始化原因
        location: venue.location,
      }))
    } else {
      ElMessage.error(response.message || '获取场地列表失败')
    }
  } catch (error) {
    console.error('获取场地列表失败:', error)
    ElMessage.error('获取场地列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 检查场地可用性
const checkVenueAvailability = async (date, startTime, endTime) => {
  try {
    // 首先检查时间限制
    const timeRestrictionText = getTimeRestrictionText(date)
    if (timeRestrictionText || !isBookingTimeValid(date, startTime)) {
      // 如果不在可预约时间，将所有场地设置为不可预约
      courts.value.forEach(court => {
        court.bookable = false
        court.availabilityReason = timeRestrictionText || '不在可预约时间'
      })
      return
    }
    // 使用通用日期格式化函数
    const dateStr = formatDateToString(date)

    const response = await getVenueAvailability({
      date: dateStr,
      startTime,
      endTime
    })
    if (response.data.code === 0) {
      const { availableVenues, unavailableVenues } = response.data.data

      // 重置所有场地的可预约状态
      courts.value.forEach(court => {
        court.bookable = false
        court.availabilityReason = '未知状态'
      })

      // 设置可预约场地
      if (availableVenues && availableVenues.length > 0) {
        availableVenues.forEach(availableVenue => {
          const court = courts.value.find(c => c.id === availableVenue.id)
          if (court) {
            court.bookable = true
            court.availabilityReason = '可预约'
            // 更新场地价格信息（如果API返回了新的价格）
            if (availableVenue.pricePerHour !== undefined) {
              court.price = availableVenue.pricePerHour
            }
          }
        })
      }

      // 设置不可预约场地
      if (unavailableVenues && unavailableVenues.length > 0) {
        unavailableVenues.forEach(unavailableVenue => {
          const court = courts.value.find(c => c.id === unavailableVenue.id)
          if (court) {
            court.bookable = false
            court.availabilityReason = unavailableVenue.reason || '不可预约'
          }
        })
      }
    }
  } catch (error) {
    console.error('检查场地可用性失败:', error)
    // 如果API调用失败，将所有场地设置为不可预约
    courts.value.forEach(court => {
      court.bookable = false
      court.availabilityReason = '检查失败'
    })
  }
}

// 组件挂载时获取场地列表
onMounted(async () => {
  await fetchVenueList()
  // 直接调用handleDateChange来初始化时间选择，避免重复代码
  await handleDateChange(currentDate.value)
  await handleStartTimeChange(startTime.value)
})

// 预约弹窗相关
const bookingDialogVisible = ref(false)
const selectedCourt = ref(null)

// 创建订单表单引用
const createOrderFormRef = ref(null)

// 打开预约弹窗
const openBookingDialog = (court) => {
  selectedCourt.value = court
  bookingDialogVisible.value = true
}

// 关闭预约弹窗
const closeBookingDialog = () => {
  bookingDialogVisible.value = false
  selectedCourt.value = null
}

// 取消预约
const cancelBooking = () => {
  closeBookingDialog()
}

// 场地使用情况矩阵弹窗控制
const matrixDialogVisible = ref(false)

// 关闭场地使用情况矩阵弹窗
const closeMatrixDialog = () => {
  matrixDialogVisible.value = false
}

// 打开场地使用情况表
const openMatrixDialog = () => {
  matrixDialogVisible.value = true
}

// 检查场地是否可以预约（综合检查场地状态和时间限制）
const isCourtBookable = (court) => {
  // 首先检查场地本身是否可用
  if (!court.bookable) {
    return false
  }

  // 然后检查时间限制
  if (!startTime.value || !endTime.value) {
    return false
  }

  // 检查当前选择的时间是否符合预约规则
  return isBookingTimeValid(currentDate.value, startTime.value)
}

// 获取场地状态类名
const getStatusClass = (court) => {
  // 根据场地的可预约状态返回对应的样式类
  if (court.bookable === true) {
    return 'status-available'
  } else {
    // 根据不可预约的原因返回不同的样式
    const reason = court.availabilityReason || ''
    if (reason.includes('使用中') || court.status === 2) {
      return 'status-occupied'
    } else if (reason.includes('维护') || court.status === 4) {
      return 'status-closed'
    } else {
      return 'status-booked'
    }
  }
}

// 获取场地状态文本
const getStatusText = (court) => {
  // 根据场地的可预约状态返回对应的文本
  if (court.bookable === true) {
    return '可预约'
  } else {
    // 返回具体的不可预约原因
    return court.availabilityReason || '不可预约'
  }
}

// 监听开始时间变化，确保结束时间始终大于开始时间且不超过3小时
const handleStartTimeChange = async (time) => {
  const options = getTimeOptionsForDate(currentDate.value)
  if (options.startOptions.length === 0) return

  // 如果开始时间大于等于结束时间，自动调整结束时间
  if (time >= endTime.value) {
    const [hour, minute] = time.split(':').map(Number)
    let endHour = hour + 1
    let endMinute = minute

    const targetEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    // 在结束时间选项中找到最接近的时间，但不超过3小时
    const maxEndHour = hour + 3
    const maxEndTime = `${maxEndHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    const availableEndTimes = options.endOptions.filter(t => t >= targetEndTime && t <= maxEndTime)
    if (availableEndTimes.length > 0) {
      endTime.value = availableEndTimes[0]
    } else if (options.endOptions.length > 0) {
      // 如果没有合适的时间，选择最后一个可用时间
      const validEndTimes = options.endOptions.filter(t => t <= maxEndTime)
      if (validEndTimes.length > 0) {
        endTime.value = validEndTimes[validEndTimes.length - 1]
      }
    }
  }

  // 检查场地可用性
  if (endTime.value) {
    await checkVenueAvailability(currentDate.value, time, endTime.value)
  }
}

// 监听结束时间变化，确保结束时间始终大于开始时间且不超过3小时
const handleEndTimeChange = async (time) => {
  // 如果结束时间小于开始时间，则自动调整开始时间
  if (time <= startTime.value) {
    if (isWeekday(currentDate.value)) {
      const endTimeIndex = endTimeOptions.value.indexOf(time)
      startTime.value = timeOptions.value[endTimeIndex]
    } else {
      startTime.value = '18:00'
    }
  }

  // 检查场地可用性
  if (startTime.value) {
    await checkVenueAvailability(currentDate.value, startTime.value, time)
  }
}
</script>

<template>
  <div class="booking-container">
    <div class="page-header">
      <h2>场地预约</h2>
    </div>

    <!-- 通知公告区域 -->
    <NoticeList />

    <div class="booking-tools">
      <div class="date-time-selector">
        <div class="selector-group">
          <p>选择日期：</p>
          <el-date-picker
            v-model="currentDate"
            type="date"
            placeholder="选择预约日期"
            :disabled-date="
              (time) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)

                // 只允许选择今天和明天
                return !(time.toDateString() === today.toDateString() ||
                        time.toDateString() === tomorrow.toDateString())
              }
            "
            format="YYYY年MM月DD日"
            @change="handleDateChange"
          />
        </div>

        <!-- 查看场地使用情况表按钮 - 新位置 -->
        <div class="matrix-button-container">
          <el-button
            type="primary"
            :icon="Calendar"
            @click="openMatrixDialog"
            class="matrix-button-enhanced"
            size="large"
          >
            <span class="button-text">查看场地使用情况表</span>
            <span class="button-subtitle">实时查看所有场地状态</span>
          </el-button>
        </div>

        <!-- 日期状态显示 -->
        <div class="date-status">
          <span class="status-text">{{ getDateStatusText(currentDate) }}</span>
        </div>

        <!-- 移动到主页面的时间选择器 -->
        <div class="selector-group time-selector" v-if="timeOptions.length > 0">
          <p>时间段：</p>
          <div class="time-picker-container">
            <div class="time-picker">
              <el-select
                v-model="startTime"
                placeholder="开始时间"
                @change="handleStartTimeChange"
                class="time-select"
              >
                <el-option
                  v-for="time in timeOptions"
                  :key="time"
                  :label="time"
                  :value="time"
                ></el-option>
              </el-select>
            </div>
            <span class="time-separator">至</span>
            <div class="time-picker">
              <el-select
                v-model="endTime"
                placeholder="结束时间"
                @change="handleEndTimeChange"
                class="time-select"
              >
                <el-option
                  v-for="time in endTimeOptions"
                  :key="time"
                  :label="time"
                  :value="time"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <div class="booking-rules">
        <p><strong>预约规则：</strong></p>
        <ul>
          <li>工作日（周一至周五）：白天场地用于校内上课，仅晚上18:00-21:00开放预约</li>
          <li>周末（周六、周日）：全天开放预约，时间为8:00-21:00</li>
          <li>预约时长为1-3小时，每小时20元，时间选择步长为1小时</li>
          <li>一人一天只能预约一次，如果当天已预约则无法再次预约</li>
          <li>只能预约今天和明天的场地</li>
          <li>今天场地：只要在开始时间之前都可以预约（如果有剩余）</li>
          <li>明天场地：今天18:00之后才能开始预约</li>
        </ul>
      </div>
    </div>

    <div class="courts-container">
      <h3>场地状态</h3>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
        <p class="loading-text">正在加载场地信息...</p>
      </div>

      <!-- 场地列表 -->
      <el-row v-else :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="court in courts" :key="court.id">
          <el-card class="court-card" :class="getStatusClass(court)">
            <div class="court-info">
              <div class="court-name">{{ court.name }}</div>
              <div class="court-status">{{ getStatusText(court) }}</div>
              <div class="court-price" v-if="court.price">
                {{ court.price }}元/小时
              </div>
            </div>
            <div class="court-actions">
              <el-button
                type="primary"
                :disabled="!isCourtBookable(court)"
                @click="openBookingDialog(court)"
              >
                预约
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!loading && courts.length === 0" class="empty-state">
        <p>暂无可用场地</p>
      </div>
    </div>

    <div class="booking-legend">
      <div class="legend-item">
        <div class="legend-color available"></div>
        <div class="legend-text">空闲中</div>
      </div>
      <div class="legend-item">
        <div class="legend-color booked"></div>
        <div class="legend-text">已预约</div>
      </div>
      <div class="legend-item">
        <div class="legend-color occupied"></div>
        <div class="legend-text">使用中</div>
      </div>
      <div class="legend-item">
        <div class="legend-color closed"></div>
        <div class="legend-text">不开放</div>
      </div>
    </div>

    <!-- 预约弹窗 -->
    <el-dialog
      v-model="bookingDialogVisible"
      title="创建预约订单"
      width="700px"
      :close-on-click-modal="false"
      :before-close="closeBookingDialog"
    >
      <!-- 创建订单表单 -->
      <CreateOrderForm
        v-if="selectedCourt"
        ref="createOrderFormRef"
        :selected-venue="selectedCourt"
        :reservation-date="formatDateToString(currentDate)"
        :start-time="startTime"
        :end-time="endTime"
        @cancel="cancelBooking"
      />
    </el-dialog>

    <!-- 场地使用情况矩阵弹窗 -->
    <VenueStatusMatrix
    :visible="matrixDialogVisible"
    @close="closeMatrixDialog"
    />
  </div>
</template>

<style lang="less" scoped>
.booking-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

h2 {
  text-align: center;
  color: #2b6fc2;
  margin-bottom: 0;
}

h3,
h4,
h5 {
  color: #2b6fc2;
  margin: 20px 0;
}

h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.booking-tools {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  margin-top: 40px;
}

.date-time-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.selector-group {
  display: flex;
  align-items: center;
}

.selector-group p {
  margin-right: 10px;
  margin-bottom: 0;
  white-space: nowrap;
}

.time-selector {
  flex-wrap: wrap;
}

.time-picker-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-picker {
  display: flex;
  align-items: center;
}

.time-separator {
  margin: 0 5px;
}

.time-select {
  width: 120px;
}

.price-info-group {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.booking-hours-info,
.booking-price-info {
  font-size: 14px;
  margin-bottom: 5px;
}

.highlight {
  color: #2b6fc2;
  font-weight: bold;
}

.courts-container {
  margin: 30px 0;
}

.court-card {
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.court-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.court-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.court-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.court-status {
  font-size: 14px;
}

.court-price {
  font-size: 12px;
  color: #f56c6c;
  font-weight: bold;
  margin-top: 5px;
}

.court-actions {
  display: flex;
  justify-content: center;
}

.status-available {
  border-left: 4px solid #67c23a;
}

.status-available .court-status {
  color: #67c23a;
}

.status-booked {
  border-left: 4px solid #f56c6c;
}

.status-booked .court-status {
  color: #f56c6c;
}

.status-occupied {
  border-left: 4px solid #e6a23c;
}

.status-occupied .court-status {
  color: #e6a23c;
}

.booking-legend {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 15px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-color.available {
  background-color: #67c23a;
}

.legend-color.booked {
  background-color: #f56c6c;
}

.legend-color.occupied {
  background-color: #e6a23c;
}

.legend-color.closed {
  background-color: #909399;
}

/* 预约弹窗样式 */
.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

@media screen and (max-width: 768px) { //当在任何屏幕设备上，且屏幕宽度不超过768像素时，应用这些样式
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .matrix-button-container {
    margin: 15px 0;
    width: 100%;
  }

  .matrix-button-enhanced {
    min-width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }

  .date-time-selector {
    flex-direction: column;
    gap: 15px;
  }

  .selector-group {
    width: 100%;
  }

  .time-picker-container {
    flex-wrap: wrap;
  }

  .price-info-group {
    margin-left: 0;
    align-items: flex-start;
  }
}

.booking-rules {
  margin-top: 15px;
  font-size: 13px;
  color: #909399;

  p {
    margin-bottom: 10px;
    font-weight: bold;
    color: #333;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
  }
}

.date-status {
  margin-left: 15px;

  .status-text {
    font-size: 14px;
    color: #666;
    background-color: #f5f5f5;
    padding: 5px 10px;
    border-radius: 4px;
  }
}

.status-closed {
  border-left: 4px solid #909399;
}

.status-closed .court-status {
  color: #909399;
}

/* 新的增强按钮样式 */
.matrix-button-container {
  display: flex;
  justify-content: center;
  margin: 0 20px;
}

.matrix-button-enhanced {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  min-width: 280px;
  height: auto;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.matrix-button-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #66b1ff 0%, #85ce61 100%);
}

.matrix-button-enhanced:active {
  transform: translateY(0);
}

.matrix-button-enhanced .button-text {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.matrix-button-enhanced .button-subtitle {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.matrix-button-enhanced::before {
  /* 创建一个伪元素，用于实现按钮的光泽扫过动画效果 */
  // 视觉效果：用户看到一道白色光泽从左到右快速扫过按钮表面
  content: '';                    /* 必须设置content才能显示伪元素 */
  position: absolute;             /* 绝对定位，相对于父元素（按钮）定位 */
  top: 0;                        /* 从按钮顶部开始 */
  left: -100%;                   /* 初始位置在按钮左侧外部（完全隐藏） */
  width: 100%;                   /* 宽度与按钮相同 */
  height: 100%;                  /* 高度与按钮相同 */
  /* 创建从透明到半透明白色再到透明的水平渐变，形成光泽条效果 */
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;         /* 设置left属性的过渡动画，持续0.5秒 */
}

.matrix-button-enhanced:hover::before {
  left: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-text {
  margin-top: 10px;
  color: #909399;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #909399;
}
</style>
