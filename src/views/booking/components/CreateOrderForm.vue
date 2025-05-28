<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar, Clock, MapLocation, Edit } from '@element-plus/icons-vue'
import { createReservation } from '@/api/venueOrder'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  selectedVenue: {
    type: Object,
    default: () => ({})
  },
  reservationDate: {
    type: String,
    default: ''
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['submit', 'cancel'])

// 表单引用
const formRef = ref(null)

// 加载状态
const loading = ref(false)

// 表单数据
const formData = ref({
  venueId: '',
  contactName: '',
  contactPhone: '',
  remark: '',
})

// 表单验证规则
const formRules = {
  venueId: [
    { required: true, message: '请选择场地', trigger: 'change' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, message: '姓名只能包含中文、英文和空格', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  remark: [
    { max: 200, message: '备注不能超过200个字符', trigger: 'blur' }
  ]
}

// 计算时长（小时）
const duration = computed(() => {
  if (!props.startTime || !props.endTime) return 0

  const [startHour, startMinute] = props.startTime.split(':').map(Number)
  const [endHour, endMinute] = props.endTime.split(':').map(Number)

  let hours = endHour - startHour
  if (endMinute > startMinute) {
    hours += 0.5
  } else if (endMinute < startMinute) {
    hours -= 0.5
  }

  return Math.max(1, hours) // 最少1小时
})

// 计算总价格
const totalPrice = computed(() => {
  const pricePerHour = props.selectedVenue?.price || 30
  return Math.ceil(duration.value) * pricePerHour
})

// 获取支付方式显示名称
const paymentMethodName = computed(() => {
  return formData.value.payType === 1 ? '支付宝' : '微信支付'
})

// 监听props变化，更新表单数据
watch(() => props.selectedVenue, (newVenue) => {
  if (newVenue?.id) {
    formData.value.venueId = newVenue.id
  }
}, { immediate: true })

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return false

  try {
    await formRef.value.validate()

    const orderData = {
      venueId: props.selectedVenue.id,
      reservationDate: props.reservationDate,
      startTime: props.startTime,
      endTime: props.endTime,
      remark: formData.value.contactName + ' ' + formData.value.contactPhone + ' ' + formData.value.remark
    }

    // 设置加载状态
    loading.value = true

    try {
      ElMessage.info('正在创建订单...')

      const response = await createReservation(orderData)

      if (response.data.code === 0) {
        router.push({
          path: '/payment',
          query: {
            orderNo: response.data.data.orderNo,
          },
          state: {
            orderDetail: {
              id: response.data.data.id,
              venueName: props.selectedVenue.name,
              venueId: props.selectedVenue.id,
              reservationDate: orderData.reservationDate,
              startTime: orderData.startTime,
              endTime: orderData.endTime,
              duration: duration.value,
              contactName: formData.value.contactName,
              contactPhone: formData.value.contactPhone,
              remark: response.data.data.remark,
              payTypeDesc: response.data.data.payTypeDesc,
              pricePerHour: response.data.data.pricePerHour || 30,
              totalAmount: response.data.data.totalAmount
            }
          }
        })
        // 订单创建成功，传递订单信息给父组件
        const orderInfo = {
          orderNo: response.data.data.orderNo,
          id: response.data.data.id,
          venueName: props.selectedVenue.name,
          reservationDate: orderData.reservationDate,
          startTime: orderData.startTime,
          endTime: orderData.endTime,
          contactName: orderData.contactName,
          contactPhone: orderData.contactPhone,
          totalAmount: orderData.totalAmount,
          remark: orderData.remark,
          paymentMethodName: paymentMethodName.value
        }

        ElMessage.success('订单创建成功，请完成支付')
        emit('submit', orderInfo)
        return true
      } else {
        ElMessage.error(response.data.message || '创建订单失败')
        return false
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      ElMessage.error('创建订单失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  } catch (error) {
    console.error('表单验证失败:', error)
    return false
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}

// 暴露方法给父组件
defineExpose({
  handleSubmit,
  handleCancel,
  loading
})
</script>

<template>
  <div class="create-order-form">
    <!-- 表单标题 -->
    <div class="form-header">
      <h3 class="form-title">
        <el-icon><Edit /></el-icon>
        创建预约订单
      </h3>
      <p class="form-subtitle">请填写完整的预约信息，确保信息准确无误</p>
    </div>

    <!-- 主要表单 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="order-form"
      size="large"
    >
      <!-- 场地信息卡片 -->
      <div class="form-section venue-section">
        <div class="section-header">
          <el-icon class="section-icon"><MapLocation /></el-icon>
          <h4 class="section-title">场地信息</h4>
        </div>

        <div class="venue-card" v-if="props.selectedVenue?.id">
          <div class="venue-info">
            <h5 class="venue-name">{{ props.selectedVenue.name }}</h5>
            <p class="venue-description">{{ props.selectedVenue.description || '标准羽毛球场地，配备专业羽毛球网和照明设备' }}</p>
            <div class="venue-features" v-if="props.selectedVenue.features">
              <el-tag v-for="feature in props.selectedVenue.features" :key="feature" size="small" type="success">
                {{ feature }}
              </el-tag>
            </div>
            <div class="venue-price">
              <span class="price-label">价格：</span>
              <span class="price-value">{{ props.selectedVenue.price || 30 }}元/小时</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="form-section time-section">
        <div class="section-header">
          <el-icon class="section-icon"><Calendar /></el-icon>
          <h4 class="section-title">预约时间</h4>
        </div>

        <div class="time-display-grid">
          <div class="time-display-item">
            <span class="time-label">预约日期</span>
            <div class="time-value">{{ props.reservationDate || '未选择' }}</div>
          </div>

          <div class="time-display-item">
            <span class="time-label">开始时间</span>
            <div class="time-value">{{ props.startTime || '未选择' }}</div>
          </div>

          <div class="time-display-item">
            <span class="time-label">结束时间</span>
            <div class="time-value">{{ props.endTime || '未选择' }}</div>
          </div>
        </div>

        <!-- 时长和费用预览 -->
        <div class="booking-summary" v-if="duration > 0">
          <div class="summary-item">
            <el-icon><Clock /></el-icon>
            <span class="summary-label">预约时长：</span>
            <span class="summary-value">{{ duration }}小时</span>
          </div>
          <div class="summary-item total-price">
            <el-icon><Edit /></el-icon>
            <span class="summary-label">预计费用：</span>
            <span class="summary-value price">¥{{ totalPrice }}</span>
          </div>
          <div class="price-note">
            （按{{ props.selectedVenue?.price || 30 }}元/小时计算，不足1小时按1小时计费）
          </div>
        </div>
      </div>

      <!-- 联系人信息 -->
      <div class="form-section contact-section">
        <div class="section-header">
          <el-icon class="section-icon"><Edit /></el-icon>
          <h4 class="section-title">联系人信息</h4>
        </div>

        <div class="contact-form-grid">
          <el-form-item label="联系人姓名" prop="contactName">
            <el-input
              v-model="formData.contactName"
              placeholder="请输入联系人姓名"
              :disabled="loading"
              clearable
              size="large"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input
              v-model="formData.contactPhone"
              placeholder="请输入手机号码"
              :disabled="loading"
              clearable
              size="large"
              maxlength="11"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <el-form-item label="备注信息" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注信息（选填）"
            :disabled="loading"
            :rows="3"
            maxlength="200"
            show-word-limit
            resize="none"
          />
        </el-form-item>
      </div>

      <!-- 预约须知 -->
      <div class="form-section notice-section">
        <div class="section-header">
          <el-icon class="section-icon"><Edit /></el-icon>
          <h4 class="section-title">预约须知</h4>
        </div>

        <div class="notice-content">
          <el-alert
            title="重要提醒"
            type="warning"
            :closable="false"
            show-icon
          >
            <ul class="notice-list">
              <li>请确保预约信息准确无误，提交后不可修改</li>
              <li>如需取消预约，请至少提前半小时联系管理员</li>
              <li>请爱护场地设施，如有损坏需要赔偿</li>
              <li>场地内禁止吸烟，请保持环境整洁</li>
            </ul>
          </el-alert>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button size="large" :disabled="loading" @click="handleCancel">
          取消
        </el-button>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ loading ? '创建中...' : '确认预约' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style lang="less" scoped>
.create-order-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f2f5;

  .form-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 0 8px 0;
    color: #1890ff;
    font-size: 24px;
    font-weight: 600;
  }

  .form-subtitle {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafbfc;
  border: 1px solid #e8eaec;
  border-radius: 12px;

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e8eaec;

    .section-icon {
      color: #1890ff;
      font-size: 18px;
    }

    .section-title {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.venue-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #bae7ff;

  .venue-card {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .venue-image {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      background: #f5f5f5;
      border: 2px dashed #d9d9d9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;

      .el-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }
    }
  }

  .venue-info {
    flex: 1;

    .venue-name {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .venue-description {
      margin: 0 0 12px 0;
      color: #666;
      line-height: 1.5;
      font-size: 14px;
    }

    .venue-features {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .venue-price {
      .price-label {
        color: #666;
        font-size: 14px;
      }

      .price-value {
        color: #f5222d;
        font-size: 16px;
        font-weight: 600;
        margin-left: 4px;
      }
    }
  }
}

.time-section {
  background: linear-gradient(135deg, #fff7e6 0%, #fff2e8 100%);
  border-color: #ffd591;

  .time-display-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 20px;
  }

  .time-display-item {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ffd591;
    text-align: center;

    .time-label {
      display: block;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .time-value {
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .booking-summary {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ffd591;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      &.total-price {
        padding-top: 8px;
        border-top: 1px dashed #ffd591;
        font-size: 16px;
        font-weight: 600;

        .summary-value.price {
          color: #f5222d;
          font-size: 18px;
          font-weight: 700;
        }
      }

      .el-icon {
        color: #fa8c16;
      }

      .summary-label {
        color: #666;
      }

      .summary-value {
        color: #333;
        font-weight: 500;
      }
    }

    .price-note {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  }
}

.contact-section {
  background: linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%);
  border-color: #b7eb8f;

  .contact-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
}

.payment-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #bae7ff;

  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .payment-option {
    margin: 0 !important;
    width: 100%;

    .el-radio__input {
      margin-right: 12px;
    }

    .el-radio__label {
      width: 100%;
      padding: 0;
    }

    .payment-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fff;
      border: 2px solid #e8eaec;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
      width: 100%;

      &:hover {
        border-color: #1890ff;
        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
      }
    }

    &.is-checked .payment-content {
      border-color: #1890ff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
    }

    &:has(.el-radio__input.is-checked) .payment-content {
      border-color: #1890ff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
    }

    .payment-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      flex-shrink: 0;

      &.wechat-icon {
        background: #f0f9ff;
      }

      &.alipay-icon {
        background: #f6ffed;
      }

      img {
        width: 24px;
        height: 24px;
      }
    }

    .payment-info {
      flex: 1;

      .payment-name {
        margin: 0 0 4px 0;
        color: #333;
        font-size: 16px;
        font-weight: 600;
      }

      .payment-desc {
        margin: 0;
        color: #666;
        font-size: 13px;
        line-height: 1.4;
      }
    }

    .payment-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      flex-shrink: 0;

      &.recommended {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
        color: #fff;
        box-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
      }
    }
  }
}

.notice-section {
  background: linear-gradient(135deg, #fff1f0 0%, #fff2e8 100%);
  border-color: #ffccc7;

  .notice-content {
    .notice-list {
      margin: 8px 0 0 0;
      padding-left: 20px;

      li {
        margin-bottom: 6px;
        color: #d46b08;
        line-height: 1.5;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  .el-button {
    min-width: 120px;
    height: 44px;
    font-size: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .create-order-form {
    padding: 16px;
  }

  .time-display-grid {
    grid-template-columns: 1fr !important;
  }

  .contact-form-grid {
    grid-template-columns: 1fr !important;
  }

  .venue-card {
    flex-direction: column !important;

    .venue-image {
      width: 100% !important;
      height: 200px !important;
    }
  }

  .payment-section {
    .payment-option {
      .payment-content {
        padding: 12px;
        gap: 10px;
      }

      .payment-icon {
        width: 28px;
        height: 28px;

        img {
          width: 20px;
          height: 20px;
        }
      }

      .payment-info {
        .payment-name {
          font-size: 14px;
        }

        .payment-desc {
          font-size: 12px;
        }
      }
    }
  }

  .form-actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .form-header .form-title {
    font-size: 20px;
  }

  .form-section {
    padding: 16px;
  }
}
</style>
