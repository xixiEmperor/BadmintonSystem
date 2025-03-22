<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 通知公告相关
const notices = ref([])
const showNotices = ref(true) // 控制通知区域显示/隐藏

// 切换通知区域显示/隐藏
const toggleNotices = () => {
  showNotices.value = !showNotices.value
}

// 获取通知公告
const fetchNotices = async () => {
  try {
    // 实际项目中应调用API获取通知
    // 这里使用模拟数据
    notices.value = [
      {
        id: 1,
        title: '场馆维修通知',
        content: '2号场地将于2023年11月15日进行维修，当天不可预约，敬请谅解。',
        type: 'normal',
        createTime: '2023-11-10 10:30:45',
      },
      {
        id: 2,
        title: '春节期间场地预约通知',
        content:
          '春节期间（2024年2月10日至2月17日）场馆开放时间调整为上午9:00至下午5:00，请各位用户知悉。',
        type: 'important',
        createTime: '2023-11-12 14:20:30',
      },
      {
        id: 3,
        title: '系统升级维护通知',
        content:
          '系统将于2023年11月20日凌晨2:00-4:00进行升级维护，期间预约功能暂停使用，给您带来不便敬请谅解。',
        type: 'urgent',
        createTime: '2023-11-13 09:15:20',
      },
    ]
  } catch (error) {
    console.error('获取通知失败', error)
    ElMessage.error('获取通知失败')
  }
}

// 获取通知类型对应的标签类型
const getNoticeTagType = (type) => {
  const typeMap = {
    normal: '',
    important: 'warning',
    urgent: 'danger',
  }
  return typeMap[type] || ''
}

// 组件挂载时获取通知
onMounted(() => {
  fetchNotices()
})

const currentDate = ref(new Date(new Date().getTime() + 24 * 60 * 60 * 1000)) // 默认选择第二天
const isWithinBookingHours = computed(() => {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 12 && hours < 22
})

// 添加时间选择
const startTime = ref('8:00')
const endTime = ref('9:00')

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

// 可选时间段
const timeOptions = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour}:${minute}`
}).filter((time) => {
  const [hour] = time.split(':')
  return parseInt(hour) < 22
})

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

  // 检查所选时间段是否与已预约时间重叠
  const selectedDate = currentDate.value.toLocaleDateString()

  for (const bookedTime of court.bookedTimes) {
    // 如果日期不同，跳过
    if (bookedTime.date !== selectedDate) {
      continue
    }

    // 检查时间是否重叠
    // 情况1：所选开始时间在已预约时间段内
    // 情况2：所选结束时间在已预约时间段内
    // 情况3：所选时间段完全包含已预约时间段
    if (
      (startTime.value >= bookedTime.start && startTime.value < bookedTime.end) ||
      (endTime.value > bookedTime.start && endTime.value <= bookedTime.end) ||
      (startTime.value <= bookedTime.start && endTime.value >= bookedTime.end)
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

  return isCourAvailable(court) ? 'status-available' : 'status-booked'
}

// 获取场地状态文本
const getStatusText = (court) => {
  if (court.maintenance) {
    return '维护中'
  }

  return isCourAvailable(court) ? '可预约' : '已预约'
}

// 监听开始时间变化，确保结束时间始终大于开始时间
const handleStartTimeChange = (time) => {
  // 如果开始时间大于等于结束时间，自动调整结束时间
  if (time >= endTime.value) {
    // 找到当前开始时间在选项中的索引
    const timeIndex = timeOptions.findIndex((t) => t === time)
    if (timeIndex !== -1 && timeIndex < timeOptions.length - 1) {
      // 至少预约1小时（即开始时间+2个时间点，因为每个时间点间隔30分钟）
      const endIndex = timeIndex + 2
      if (endIndex < timeOptions.length) {
        endTime.value = timeOptions[endIndex]
      } else {
        endTime.value = timeOptions[timeOptions.length - 1]
      }
    }
  }

  // 检查时间间隔是否至少为1小时，如果小于1小时则调整结束时间
  const hours = calculateHours(time, endTime.value)
  if (hours < 1) {
    // 找到当前开始时间在选项中的索引
    const timeIndex = timeOptions.findIndex((t) => t === time)
    if (timeIndex !== -1 && timeIndex < timeOptions.length - 1) {
      // 调整为1小时
      const endIndex = timeIndex + 2
      if (endIndex < timeOptions.length) {
        endTime.value = timeOptions[endIndex]
      } else {
        endTime.value = timeOptions[timeOptions.length - 1]
      }
    }
  }
}

// 监听结束时间变化，确保结束时间始终大于开始时间
const handleEndTimeChange = (time) => {
  // 如果结束时间小于等于开始时间，自动调整开始时间
  if (time <= startTime.value) {
    // 找到当前结束时间在选项中的索引
    const timeIndex = timeOptions.findIndex((t) => t === time)
    if (timeIndex > 1) {
      // 至少预约1小时（即结束时间-2个时间点）
      startTime.value = timeOptions[timeIndex - 2]
    } else {
      startTime.value = timeOptions[0]
    }
  }

  // 检查时间间隔是否至少为1小时，如果小于1小时则调整开始时间
  const hours = calculateHours(startTime.value, time)
  if (hours < 1) {
    // 找到当前结束时间在选项中的索引
    const timeIndex = timeOptions.findIndex((t) => t === time)
    if (timeIndex > 1) {
      // 调整为1小时
      startTime.value = timeOptions[timeIndex - 2]
    } else if (timeIndex === 1) {
      startTime.value = timeOptions[0]
    } else {
      // 如果结束时间是第一个选项，将开始时间设为第一个选项（理论上不应该发生）
      startTime.value = timeOptions[0]
    }
  }
}

// 打开预约弹窗
const openBookingDialog = (court) => {
  // 检查是否在预约时间内
  if (!isWithinBookingHours.value) {
    ElMessage.warning('预约时间为每天中午12:00-22:00，请在规定时间内预约')
    return
  }

  // 检查选定的时间是否至少为1小时
  const hours = calculateHours(startTime.value, endTime.value)
  if (hours < 1) {
    ElMessage.warning('预约时间至少为1小时')
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
</script>

<template>
  <div class="booking-container">
    <!-- 通知公告区域 -->
    <div class="notice-container" v-if="showNotices && notices.length > 0">
      <div class="notice-header">
        <h3>官方公告</h3>
        <el-button type="text" @click="toggleNotices">
          {{ showNotices ? '收起' : '展开' }}
        </el-button>
      </div>
      <div class="notice-list" v-if="showNotices">
        <el-carousel height="120px" indicator-position="none" :autoplay="true" arrow="always">
          <el-carousel-item v-for="notice in notices" :key="notice.id">
            <div class="notice-item">
              <div class="notice-title">
                <el-tag
                  :type="getNoticeTagType(notice.type)"
                  size="small"
                  v-if="notice.type !== 'normal'"
                >
                  {{ notice.type === 'important' ? '重要' : '紧急' }}
                </el-tag>
                <span>{{ notice.title }}</span>
              </div>
              <div class="notice-content">{{ notice.content }}</div>
              <div class="notice-time">{{ notice.createTime }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
    </div>

    <h2>场地预约</h2>

    <div class="booking-tools">
      <div class="date-time-selector">
        <div class="selector-group">
          <p>选择日期：</p>
          <el-date-picker
            v-model="currentDate"
            type="date"
            placeholder="选择预约日期"
            :disabled="!isWithinBookingHours"
            :disabled-date="
              (time) => {
                // 只能预约第二天
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(0, 0, 0, 0)

                const dayAfterTomorrow = new Date()
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
                dayAfterTomorrow.setHours(0, 0, 0, 0)

                return (
                  time.getTime() < tomorrow.getTime() ||
                  time.getTime() >= dayAfterTomorrow.getTime()
                )
              }
            "
            format="YYYY年MM月DD日"
          />
        </div>

        <!-- 移动到主页面的时间选择器 -->
        <div class="selector-group time-selector">
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
                  v-for="time in timeOptions"
                  :key="time"
                  :label="time"
                  :value="time"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>

        <div class="selector-group price-info-group">
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
        <p>预约规则：每天12:00-22:00开放预约，且只能预约次日场地。</p>
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

/* 通知区域样式 */
.notice-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-bottom: 20px;
  overflow: hidden;

  .notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .notice-list {
    padding: 10px;
  }

  .notice-item {
    padding: 10px;
    height: 100px;

    .notice-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      .el-tag {
        margin-right: 8px;
      }
    }

    .notice-content {
      font-size: 14px;
      color: #606266;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .notice-time {
      font-size: 12px;
      color: #909399;
      text-align: right;
    }
  }
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
  text-align: center;
}
</style>
