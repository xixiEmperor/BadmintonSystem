<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import NoticeList from './components/NoticeList.vue'
import VenueStatusMatrix from './components/VenueStatusMatrix.vue'
import { Calendar } from '@element-plus/icons-vue'
import { getVenueList, getVenueAvailability, VENUE_STATUS } from '@/api/venue'

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

  timeSlots.forEach(slot => {
    const [startTime, endTime] = slot.split('-')
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    // 生成起始时间选项（最后一个选项是结束时间前1小时）
    let currentHour = startHour
    let currentMinute = startMinute

    // 计算最晚的起始时间（结束时间前1小时）
    let maxStartHour = endHour - 1
    let maxStartMinute = endMinute

    // 如果结束时间的分钟数小于起始分钟数，需要调整
    if (maxStartMinute < currentMinute) {
      maxStartHour -= 1
      maxStartMinute += 60
    }

    while (currentHour < maxStartHour || (currentHour === maxStartHour && currentMinute <= maxStartMinute)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      startOptions.push(timeStr)

      // 改为1小时步长
      currentHour += 1
    }

    // 生成结束时间选项（从起始时间+1小时开始，到结束时间，最多3小时）
    let endCurrentHour = startHour
    let endCurrentMinute = startMinute + 60 // 最少1小时

    if (endCurrentMinute >= 60) {
      endCurrentMinute -= 60
      endCurrentHour++
    }

    while (endCurrentHour < endHour || (endCurrentHour === endHour && endCurrentMinute <= endMinute)) {
      const timeStr = `${endCurrentHour.toString().padStart(2, '0')}:${endCurrentMinute.toString().padStart(2, '0')}`
      endOptions.push(timeStr)

      // 改为1小时步长
      endCurrentHour += 1
    }
  })

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

  return options.endOptions.filter(time => time <= maxEndTime)
})

const currentDate = ref(new Date()) // 默认选择今天

// 添加时间选择
const startTime = ref('18:00')
const endTime = ref('19:00')

// 当日期改变时，重置时间选择并检查场地可用性
const handleDateChange = async (date) => {
  const options = getTimeOptionsForDate(date)
  if (options.startOptions.length > 0) {
    startTime.value = options.startOptions[0]
    // 设置结束时间为开始时间后1小时
    const [hour, minute] = startTime.value.split(':').map(Number)
    let endHour = hour + 1
    let endMinute = minute

    if (endHour > 23) {
      endHour = 23
      endMinute = 30
    }

    const targetEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

    // 在结束时间选项中找到最接近的时间
    const availableEndTime = options.endOptions.find(t => t >= targetEndTime)
    if (availableEndTime) {
      endTime.value = availableEndTime
    } else if (options.endOptions.length > 0) {
      endTime.value = options.endOptions[0]
    } else {
      endTime.value = startTime.value
    }
  } else {
    startTime.value = ''
    endTime.value = ''
  }

  // 检查场地可用性
  if (startTime.value && endTime.value) {
    await checkVenueAvailability(date, startTime.value, endTime.value)
  }
}

// 获取日期状态文本
const getDateStatusText = (date) => {
  if (isWeekday(date)) {
    return '工作日（仅晚上18:00-21:00开放）'
  }

  if (isWeekend(date)) {
    return '周末（全天开放8:00-21:00）'
  }

  return ''
}

// 修改场地数据结构，添加bookedTimes数组表示已预约时间段
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
        isRecommended: venue.status === 1 ? true : false,
        maintenance: venue.status === VENUE_STATUS.MAINTENANCE
      }))
    } else {
      ElMessage.error(response.message || '获取场地列表失败')
      // 如果API失败，使用默认数据
      setDefaultVenues()
    }
  } catch (error) {
    console.error('获取场地列表失败:', error)
    ElMessage.error('获取场地列表失败，请稍后重试')
    // 如果API失败，使用默认数据
    setDefaultVenues()
  } finally {
    loading.value = false
  }
}

// 检查场地可用性
const checkVenueAvailability = async (date, startTime, endTime) => {
  try {
    const dateStr = date.toISOString().split('T')[0] // 格式化为 yyyy-MM-dd
    const response = await getVenueAvailability({
      date: dateStr,
      startTime,
      endTime
    })

    if (response.data.code === 0) {
      // 更新场地的预约状态
      const availabilityData = response.data.data
      courts.value.forEach(court => {
        const venueData = availabilityData.find(item => item.venueId === court.id)
        if (venueData) {
          court.isRecommended = venueData.isRecommended || false
        }
      })
    }
  } catch (error) {
    console.error('检查场地可用性失败:', error)
  }
}

// 组件挂载时获取场地列表
onMounted(async () => {
  await fetchVenueList()

  // 初始化时间选择
  const options = getTimeOptionsForDate(currentDate.value)
  if (options.startOptions.length > 0) {
    startTime.value = options.startOptions[0]

    // 设置结束时间为开始时间后1小时
    const [hour, minute] = startTime.value.split(':').map(Number)
    let endHour = hour + 1
    let endMinute = minute

    if (endHour > 23) {
      endHour = 23
      endMinute = 0
    }

    const targetEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
    const availableEndTime = options.endOptions.find(t => t >= targetEndTime)
    if (availableEndTime) {
      endTime.value = availableEndTime
    } else if (options.endOptions.length > 0) {
      endTime.value = options.endOptions[0]
    }

    // 检查场地可用性
    if (startTime.value && endTime.value) {
      await checkVenueAvailability(currentDate.value, startTime.value, endTime.value)
    }
  }
})

// 预约弹窗相关
const bookingDialogVisible = ref(false)
const selectedCourt = ref(null)
const currentStep = ref(1) // 预约步骤：1-选择时间和填写信息，2-支付
const paymentMethod = ref('alipay') // 支付方式：alipay-支付宝，wechat-微信

// 用户信息
const userForm = reactive({
  name: '',
  phone: '',
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
}

// 用户表单引用
const userFormRef = ref(null)

// 计算时间间隔（小时）
const calculateHours = (start, end) => {
  if (!start || !end) return 0

  // 解析时间
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  // 计算小时差
  let hours = endHour - startHour
  if (endMinute < startMinute) {
    hours -= 0.5
  } else if (endMinute > startMinute) {
    hours += 0.5
  }

  return hours
}

// 计算价格（使用场地的实际价格）
const calculatePrice = (start, end, court = null) => {
  if (!start || !end) return 0

  // 计算小时差
  const hours = calculateHours(start, end)

  // 小于1小时按1小时计算
  const effectiveHours = Math.max(1, hours)

  // 获取场地价格，如果没有指定场地则使用默认价格20元/小时
  const hourlyPrice = court?.price || 20

  const price = Math.ceil(effectiveHours) * hourlyPrice

  return price
}

// 计算价格（响应式）
const bookingPrice = computed(() => {
  return calculatePrice(startTime.value, endTime.value, selectedCourt.value)
})

// 检查场地在选定时间段是否可用
const isCourAvailable = (court) => {
  // 直接使用isRecommended字段判断场地是否可预约
  return court.isRecommended === true
}

// 获取场地状态类名
const getStatusClass = (court) => {
  // 根据场地状态返回对应的样式类
  switch (court.status) {
    case 1: // 空闲中
      return court.isRecommended ? 'status-available' : 'status-booked'
    case 2: // 使用中
      return 'status-occupied'
    case 3: // 已预约
      return 'status-booked'
    case 4: // 不开放
      return 'status-closed'
    default:
      return 'status-closed'
  }
}

// 获取场地状态文本
const getStatusText = (court) => {
  // 根据场地状态返回对应的文本
  switch (court.status) {
    case 1: // 空闲中
      return court.isRecommended ? '可预约' : '已预约'
    case 2: // 使用中
      return '使用中'
    case 3: // 已预约
      return '已预约'
    case 4: // 不开放
      return '不开放'
    default:
      return '未知状态'
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

    if (endHour > 23) {
      endHour = 23
      endMinute = 0
    }

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

  // 检查时间间隔是否超过3小时，如果超过则调整结束时间
  const hours = calculateHours(time, endTime.value)
  if (hours > 3) {
    const [hour, minute] = time.split(':').map(Number)
    const maxEndHour = hour + 3
    const maxEndTime = `${maxEndHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

    const availableEndTimes = options.endOptions.filter(t => t <= maxEndTime)
    if (availableEndTimes.length > 0) {
      endTime.value = availableEndTimes[availableEndTimes.length - 1]
    }
  }

  // 检查场地可用性
  if (endTime.value) {
    await checkVenueAvailability(currentDate.value, time, endTime.value)
  }
}

// 监听结束时间变化，确保结束时间始终大于开始时间且不超过3小时
const handleEndTimeChange = async (time) => {
  const options = getTimeOptionsForDate(currentDate.value)
  if (options.endOptions.length === 0) return

  // 如果结束时间小于等于开始时间，自动调整开始时间
  if (time <= startTime.value) {
    const [hour, minute] = time.split(':').map(Number)
    let startHour = hour - 1
    let startMinute = minute

    if (startHour < 0) {
      startHour = 0
      startMinute = 0
    }

    const targetStartTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`

    // 在开始时间选项中找到最接近的时间
    const availableStartTimes = options.startOptions.filter(t => t <= targetStartTime)
    if (availableStartTimes.length > 0) {
      startTime.value = availableStartTimes[availableStartTimes.length - 1]
    } else if (options.startOptions.length > 0) {
      startTime.value = options.startOptions[0]
    }
  }

  // 检查时间间隔是否超过3小时，如果超过则调整开始时间
  const hours = calculateHours(startTime.value, time)
  if (hours > 3) {
    const [hour, minute] = time.split(':').map(Number)
    let startHour = hour - 3
    let startMinute = minute

    if (startHour < 0) {
      startHour = 0
      startMinute = 0
    }

    const targetStartTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`

    // 在开始时间选项中找到最接近的时间
    const availableStartTimes = options.startOptions.filter(t => t >= targetStartTime)
    if (availableStartTimes.length > 0) {
      startTime.value = availableStartTimes[0]
    } else if (options.startOptions.length > 0) {
      startTime.value = options.startOptions[0]
    }
  }

  // 检查场地可用性
  if (startTime.value) {
    await checkVenueAvailability(currentDate.value, startTime.value, time)
  }
}

// 打开预约弹窗
const openBookingDialog = (court) => {
  // 直接检查场地是否可预约（基于isRecommended字段）
  if (!court.isRecommended) {
    ElMessage.warning('该场地当前不可预约')
    return
  }

  selectedCourt.value = court
  bookingDialogVisible.value = true
  currentStep.value = 1

  // 重置表单
  userForm.name = ''
  userForm.phone = ''
  paymentMethod.value = 'alipay'
}

// 关闭预约弹窗
const closeBookingDialog = () => {
  bookingDialogVisible.value = false
  selectedCourt.value = null
  currentStep.value = 1
}

// 进入支付步骤
const goToPayment = async () => {
  // 验证表单
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()

    // 检查用户当天是否已经预约
    if (hasUserBookedToday(userForm.phone, currentDate.value)) {
      ElMessage.warning('您今天已经预约过场地，一人一天只能预约一次')
      return
    }

    // 检查预约时间是否有效（1-3小时）
    if (!isBookingTimeValid(startTime.value, endTime.value)) {
      ElMessage.warning('预约时间必须在1-3小时之间')
      return
    }

    currentStep.value = 2
  } catch {
    ElMessage.warning('请完善预约信息')
  }
}

// 返回信息填写步骤
const backToInfo = () => {
  currentStep.value = 1
}

// 确认预约
const confirmBooking = () => {
  // TODO: 调用API提交预约信息到后端

  // 添加用户预约记录
  userBookings.value.push({
    phone: userForm.phone,
    date: currentDate.value.toLocaleDateString(),
    courtId: selectedCourt.value.id,
    startTime: startTime.value,
    endTime: endTime.value,
  })

  // 更新场地预约状态
  const courtIndex = courts.value.findIndex((c) => c.id === selectedCourt.value.id)
  if (courtIndex !== -1) {
    // 添加新的预约时间段
    courts.value[courtIndex].bookedTimes.push({
      date: currentDate.value.toLocaleDateString(),
      start: startTime.value,
      end: endTime.value,
    })
  }

  ElMessage.success(
    `您已成功预约${selectedCourt.value.name}，时间：${currentDate.value.toLocaleDateString()} ${startTime.value}-${endTime.value}，付款金额：${bookingPrice.value}元`,
  )
  closeBookingDialog()
}

// 用户预约记录（模拟数据，实际应该从后端获取）
const userBookings = ref([
  // 格式：{ phone: '手机号', date: '日期', courtId: 场地ID, startTime: '开始时间', endTime: '结束时间' }
])

// 检查用户当天是否已经预约
const hasUserBookedToday = (phone, date) => {
  const dateStr = date.toLocaleDateString()
  return userBookings.value.some(booking =>
    booking.phone === phone && booking.date === dateStr
  )
}

// 检查预约时间是否超过3小时
const isBookingTimeValid = (startTime, endTime) => {
  const hours = calculateHours(startTime, endTime)
  return hours >= 1 && hours <= 3
}

// 场地使用情况矩阵弹窗控制
const matrixDialogVisible = ref(false)

// 打开场地使用情况表
const openMatrixDialog = () => {
  matrixDialogVisible.value = true
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

        <div class="selector-group price-info-group" v-if="timeOptions.length > 0">
          <div class="booking-hours-info">
            预订时长：<span class="highlight">{{
              Math.max(1, calculateHours(startTime, endTime))
            }}</span>
            小时
          </div>
          <div class="booking-price-info">
            预计费用：<span class="price">{{ bookingPrice }}</span> 元
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
                :disabled="!isCourAvailable(court)"
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
      :title="currentStep === 1 ? '场地预约' : '支付'"
      width="600px"
      :close-on-click-modal="false"
    >
      <!-- 第一步：选择时间和填写信息 -->
      <div v-if="selectedCourt && currentStep === 1" class="booking-dialog-content">
        <!-- 上层：预约时间显示 -->
        <div class="booking-time-selection">
          <h4>预约时间</h4>
          <div class="selected-time-info">
            <div class="selected-date">日期：{{ currentDate.toLocaleDateString() }}</div>
            <div class="selected-time">时间段：{{ startTime }} - {{ endTime }}</div>
            <div class="booking-price">
              预计费用：<span class="price">{{ bookingPrice }}</span> 元
              <div class="price-info">（每小时{{ selectedCourt?.price || 20 }}元，最低1小时起订）</div>
            </div>
          </div>
        </div>

        <!-- 中间：场地信息 -->
        <div class="court-detail">
          <h4>场地信息</h4>
          <div class="court-detail-content">
            <div class="court-image-placeholder">
              <div class="placeholder-text">场地图片</div>
            </div>
            <div class="court-detail-info">
              <h5>{{ selectedCourt.name }}</h5>
              <p>{{ selectedCourt.description }}</p>
            </div>
          </div>
        </div>

        <!-- 用户信息表单 -->
        <div class="user-form-container">
          <h4>预约人信息</h4>
          <el-form ref="userFormRef" :model="userForm" :rules="formRules" label-width="80px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 第二步：支付 -->
      <div v-if="selectedCourt && currentStep === 2" class="payment-dialog-content">
        <div class="payment-summary">
          <h4>订单信息</h4>
          <div class="summary-item">
            <span class="label">预约场地：</span>
            <span class="value">{{ selectedCourt.name }}</span>
          </div>
          <div class="summary-item">
            <span class="label">预约日期：</span>
            <span class="value">{{ currentDate.toLocaleDateString() }}</span>
          </div>
          <div class="summary-item">
            <span class="label">预约时间段：</span>
            <span class="value">{{ startTime }} - {{ endTime }}</span>
          </div>
          <div class="summary-item">
            <span class="label">预约人：</span>
            <span class="value">{{ userForm.name }}</span>
          </div>
          <div class="summary-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ userForm.phone }}</span>
          </div>
          <div class="summary-item total">
            <span class="label">应付金额：</span>
            <span class="value price">{{ bookingPrice }}元</span>
          </div>
        </div>

        <div class="payment-method">
          <h4>选择支付方式</h4>
          <div class="payment-options">
            <div
              class="payment-option"
              :class="{ active: paymentMethod === 'alipay' }"
              @click="paymentMethod = 'alipay'"
            >
              <div class="payment-icon alipay"></div>
              <div class="payment-name">支付宝</div>
            </div>
            <div
              class="payment-option"
              :class="{ active: paymentMethod === 'wechat' }"
              @click="paymentMethod = 'wechat'"
            >
              <div class="payment-icon wechat"></div>
              <div class="payment-name">微信支付</div>
            </div>
          </div>
        </div>

        <div class="payment-qrcode">
          <div v-if="paymentMethod === 'alipay'" class="qrcode alipay">
            <div class="qrcode-placeholder">支付宝付款码</div>
          </div>
          <div v-else-if="paymentMethod === 'wechat'" class="qrcode wechat">
            <div class="qrcode-placeholder">微信付款码</div>
          </div>
          <div class="payment-instructions">
            请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付
          </div>
        </div>
      </div>

      <!-- 弹窗按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeBookingDialog">取消</el-button>

          <!-- 第一步按钮 -->
          <el-button v-if="currentStep === 1" type="primary" @click="goToPayment">
            去支付
          </el-button>

          <!-- 第二步按钮 -->
          <template v-if="currentStep === 2">
            <el-button @click="backToInfo">返回修改</el-button>
            <el-button type="primary" @click="confirmBooking">完成支付</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 场地使用情况矩阵弹窗 -->
    <VenueStatusMatrix v-model:visible="matrixDialogVisible" />
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
.booking-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.booking-time-selection {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.selected-time-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.selected-date,
.selected-time {
  font-size: 16px;
  font-weight: 500;
}

.booking-price {
  margin-top: 15px;
  font-size: 16px;
  color: #333;
}

.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.price-info {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.selected-date {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.court-detail {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.court-detail-content {
  display: flex;
  gap: 20px;
}

.court-image-placeholder {
  width: 150px;
  height: 150px;
  background-color: #eee;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.placeholder-text {
  color: #999;
  font-size: 14px;
}

.court-detail-info {
  flex: 1;
}

.court-detail-info h5 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.court-detail-info p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.user-form-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

/* 支付相关样式 */
.payment-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.payment-summary {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  margin-bottom: 10px;
}

.summary-item.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.summary-item .label {
  width: 120px;
  color: #666;
}

.summary-item .value {
  flex: 1;
  color: #333;
}

.payment-method {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.payment-options {
  display: flex;
  gap: 20px;
}

.payment-option {
  width: 120px;
  height: 60px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.payment-icon {
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.payment-icon.alipay {
  background-color: #00a0e9;
  border-radius: 50%;
}

.payment-icon.wechat {
  background-color: #09bb07;
  border-radius: 50%;
}

.payment-name {
  margin-top: 5px;
  font-size: 14px;
}

.payment-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.qrcode {
  width: 200px;
  height: 200px;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-placeholder {
  color: #999;
  font-size: 14px;
  text-align: center;
}

.payment-instructions {
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

@media screen and (max-width: 768px) {
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

  .court-detail-content {
    flex-direction: column;
  }

  .court-image-placeholder {
    width: 100%;
  }

  .payment-options {
    flex-direction: column;
    gap: 10px;
  }

  .payment-option {
    width: 100%;
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
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
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
