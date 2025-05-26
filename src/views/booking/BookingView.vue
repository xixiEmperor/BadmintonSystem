<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import NoticeList from './components/NoticeList.vue'

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

// 检查当前是否在预约时间内
const isWithinBookingHours = computed(() => {
  const now = new Date()
  const selectedDate = currentDate.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 如果选择的是今天的日期
  if (selectedDate.toDateString() === today.toDateString()) {
    // 今天的场地：只要在开始时间之前就可以预约
    if (!startTime.value) return true

    const [targetHour, targetMinute] = startTime.value.split(':').map(Number)
    const targetTime = new Date(now)
    targetTime.setHours(targetHour, targetMinute, 0, 0)

    return now < targetTime
  }

  // 如果选择的是明天的日期
  if (selectedDate.toDateString() === tomorrow.toDateString()) {
    // 明天的场地：今天18:00后才能预约
    return now.getHours() >= 18
  }

  return false
})

// 添加时间选择
const startTime = ref('18:00')
const endTime = ref('19:00')

// 当日期改变时，重置时间选择
const handleDateChange = (date) => {
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
const courts = ref([
  {
    id: 1,
    name: '羽毛球场1号',
    description: '专业比赛场地，设备齐全，适合高水平比赛和训练。',
    bookedTimes: [], // 存储格式为 {date: '2023-05-20', start: '10:00', end: '11:00'}
  },
  {
    id: 2,
    name: '羽毛球场2号',
    description: '标准场地，光线充足，地面采用专业PVC材料。',
    bookedTimes: [{ date: new Date().toLocaleDateString(), start: '14:00', end: '16:00' }],
  },
  {
    id: 3,
    name: '羽毛球场3号',
    description: '初学者友好场地，空间宽敞，适合教学使用。',
    bookedTimes: [],
  },
  {
    id: 4,
    name: '羽毛球场4号',
    description: '双打专用场地，场地宽敞，四周空间充足。',
    bookedTimes: [],
  },
  {
    id: 5,
    name: '羽毛球场5号',
    description: '高级场地，配备专业照明和空调系统。',
    bookedTimes: [],
    maintenance: true, // 维护中标记
  },
  {
    id: 6,
    name: '羽毛球场6号',
    description: '多功能场地，可调整为单打或双打比赛。',
    bookedTimes: [{ date: new Date().toLocaleDateString(), start: '9:00', end: '12:00' }],
  },
])

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

// 计算价格
const calculatePrice = (start, end) => {
  if (!start || !end) return 0

  // 计算小时差
  const hours = calculateHours(start, end)

  // 小于1小时按1小时计算
  const effectiveHours = Math.max(1, hours)

  // 价格：20元/小时
  const price = Math.ceil(effectiveHours) * 20

  return price
}

// 计算价格（响应式）
const bookingPrice = computed(() => {
  return calculatePrice(startTime.value, endTime.value)
})

// 检查场地在选定时间段是否可用
const isCourAvailable = (court) => {
  // 如果场地在维护中，则不可用
  if (court.maintenance) {
    return false
  }

  // 检查选定日期是否有开放时间
  const availableSlots = getAvailableTimeSlots(currentDate.value)
  if (availableSlots.length === 0) {
    return false
  }

  // 检查所选时间段是否在开放时间内
  const selectedStart = startTime.value
  const selectedEnd = endTime.value

  if (!selectedStart || !selectedEnd) {
    return false
  }

  let isInOpenTime = false
  for (const slot of availableSlots) {
    const [slotStart, slotEnd] = slot.split('-')
    if (selectedStart >= slotStart && selectedEnd <= slotEnd) {
      isInOpenTime = true
      break
    }
  }

  if (!isInOpenTime) {
    return false
  }

  // 检查所选时间段是否与已预约时间重叠
  const selectedDate = currentDate.value.toLocaleDateString()

  for (const bookedTime of court.bookedTimes) {
    // 如果日期不同，跳过
    if (bookedTime.date !== selectedDate) {
      continue
    }

    // 检查时间是否重叠
    if (
      (selectedStart >= bookedTime.start && selectedStart < bookedTime.end) ||
      (selectedEnd > bookedTime.start && selectedEnd <= bookedTime.end) ||
      (selectedStart <= bookedTime.start && selectedEnd >= bookedTime.end)
    ) {
      return false
    }
  }

  return true
}

// 获取场地状态类名
const getStatusClass = (court) => {
  if (court.maintenance) {
    return 'status-maintenance'
  }

  // 检查日期是否可预约
  const availableSlots = getAvailableTimeSlots(currentDate.value)
  if (availableSlots.length === 0) {
    return 'status-closed'
  }

  return isCourAvailable(court) ? 'status-available' : 'status-booked'
}

// 获取场地状态文本
const getStatusText = (court) => {
  if (court.maintenance) {
    return '维护中'
  }

  // 检查日期是否可预约
  const availableSlots = getAvailableTimeSlots(currentDate.value)
  if (availableSlots.length === 0) {
    return '不开放'
  }

  return isCourAvailable(court) ? '可预约' : '已预约'
}

// 监听开始时间变化，确保结束时间始终大于开始时间且不超过3小时
const handleStartTimeChange = (time) => {
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
}

// 监听结束时间变化，确保结束时间始终大于开始时间且不超过3小时
const handleEndTimeChange = (time) => {
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
}

// 打开预约弹窗
const openBookingDialog = (court) => {
  // 检查是否在预约时间内
  if (!isWithinBookingHours.value) {
    const selectedDate = currentDate.value
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let timeMsg = ''

    // 如果选择的是今天的日期
    if (selectedDate.toDateString() === today.toDateString()) {
      timeMsg = `今天${startTime.value}之前可以预约该时间段的场地`
    }
    // 如果选择的是明天的日期
    else if (selectedDate.toDateString() === tomorrow.toDateString()) {
      timeMsg = '今天18:00之后可以预约明天的场地'
    }

    ElMessage.warning(`${timeMsg}，请在规定时间内预约`)
    return
  }

  // 检查选定日期是否开放
  const availableSlots = getAvailableTimeSlots(currentDate.value)
  if (availableSlots.length === 0) {
    ElMessage.warning('选定日期不开放预约')
    return
  }

  // 检查选定的时间是否至少为1小时且不超过3小时
  const hours = calculateHours(startTime.value, endTime.value)
  if (hours < 1) {
    ElMessage.warning('预约时间至少为1小时')
    return
  }
  if (hours > 3) {
    ElMessage.warning('预约时间最长为3小时')
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
</script>

<template>
  <div class="booking-container">
    <h2>场地预约</h2>

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
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="court in courts" :key="court.id">
          <el-card class="court-card" :class="getStatusClass(court)">
            <div class="court-info">
              <div class="court-name">{{ court.name }}</div>
              <div class="court-status">{{ getStatusText(court) }}</div>
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
    </div>

    <div class="booking-legend">
      <div class="legend-item">
        <div class="legend-color available"></div>
        <div class="legend-text">可预约</div>
      </div>
      <div class="legend-item">
        <div class="legend-color booked"></div>
        <div class="legend-text">已预约</div>
      </div>
      <div class="legend-item">
        <div class="legend-color maintenance"></div>
        <div class="legend-text">维护中</div>
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
              <div class="price-info">（每小时20元，最低1小时起订）</div>
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
  </div>
</template>

<style lang="less" scoped>
.booking-container {
  padding: 20px;
}

h2 {
  text-align: center;
  color: #2b6fc2;
  margin-bottom: 30px;
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

.status-maintenance {
  border-left: 4px solid #e6a23c;
}

.status-maintenance .court-status {
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

.legend-color.maintenance {
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
</style>
