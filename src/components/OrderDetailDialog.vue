<script setup>
import { computed } from 'vue'
import { Key } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orderData: {
    type: Object,
    default: () => ({})
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'complete', 'close-order'])

// 控制对话框显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 状态映射
const statusTypeMap = {
  10: 'warning',
  20: 'success',
  30: 'info',
  40: 'primary',
  50: 'danger'
}

const statusTextMap = {
  10: '待支付',
  20: '已支付',
  30: '已取消',
  40: '已完成',
  50: '已关闭'
}

// 获取状态类型
const getStatusType = (status) => {
  return statusTypeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  return statusTextMap[status] || '未知状态'
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 完成订单
const handleComplete = () => {
  emit('complete', props.orderData)
}

// 关闭订单
const handleCloseOrder = () => {
  emit('close-order', props.orderData)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="订单详情"
    width="800px"
    :before-close="handleClose"
    class="order-detail-dialog"
  >
    <div v-if="orderData" class="order-detail">
      <!-- 订单基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">订单信息</span>
            <el-tag :type="getStatusType(orderData.status)" size="large">
              {{ getStatusText(orderData.status) }}
            </el-tag>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span class="value">{{ orderData.orderNo }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ orderData.username || orderData.userName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">订单金额：</span>
              <span class="value amount">¥{{ (orderData.totalPrice || orderData.totalAmount || 0).toFixed(2) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ orderData.createTime || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 时间轴 -->
      <el-card class="timeline-card" shadow="never">
        <template #header>
          <span class="title">订单状态</span>
        </template>

        <el-timeline>
          <el-timeline-item
            v-if="orderData.createTime"
            timestamp="订单创建"
            placement="top"
            type="primary"
          >
            <div class="timeline-content">
              <p class="timeline-title">订单已创建</p>
              <p class="timeline-time">{{ orderData.createTime }}</p>
            </div>
          </el-timeline-item>

          <el-timeline-item
            v-if="orderData.payTime"
            timestamp="订单支付"
            placement="top"
            type="success"
          >
            <div class="timeline-content">
              <p class="timeline-title">订单已支付</p>
              <p class="timeline-time">{{ orderData.payTime }}</p>
            </div>
          </el-timeline-item>

          <el-timeline-item
            v-if="orderData.shipTime"
            timestamp="订单发货"
            placement="top"
            type="warning"
          >
            <div class="timeline-content">
              <p class="timeline-title">订单已发货</p>
              <p class="timeline-time">{{ orderData.shipTime }}</p>
            </div>
          </el-timeline-item>

          <el-timeline-item
            v-if="orderData.completeTime"
            timestamp="订单完成"
            placement="top"
            type="success"
          >
            <div class="timeline-content">
              <p class="timeline-title">订单已完成</p>
              <p class="timeline-time">{{ orderData.completeTime }}</p>
            </div>
          </el-timeline-item>

          <el-timeline-item
            v-if="orderData.closeTime"
            timestamp="订单关闭"
            placement="top"
            type="danger"
          >
            <div class="timeline-content">
              <p class="timeline-title">订单已关闭</p>
              <p class="timeline-time">{{ orderData.closeTime }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 商品清单 -->
      <el-card class="items-card" shadow="never">
        <template #header>
          <span class="title">商品清单</span>
        </template>

        <el-table
          :data="orderData.orderItemList"
          style="width: 100%"
          :show-header="true"
        >
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template #default="scope">
              <div class="product-info">
                <div class="product-name">{{ scope.row.productName }}</div>
                <div class="product-desc" v-if="scope.row.productDesc">
                  {{ scope.row.productDesc }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="scope">
              <span class="price">¥{{ scope.row.currentUnitPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center">
            <template #default="scope">
              <el-tag type="info" size="small">{{ scope.row.quantity }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template #default="scope">
              <span class="subtotal">¥{{ scope.row.totalPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 总计 -->
        <div class="total-section">
          <el-divider />
          <div class="total-row">
            <span class="total-label">订单总额：</span>
            <span class="total-amount">¥{{ (orderData.totalPrice || orderData.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 提货码信息 -->
      <el-card v-if="orderData.status === 40" class="pickup-card" shadow="never">
        <template #header>
          <span class="title">提货信息</span>
        </template>

        <div class="pickup-code">
          <el-icon class="pickup-icon"><Key /></el-icon>
          <div class="pickup-info">
            <div class="pickup-label">提货码</div>
            <div class="pickup-value">{{ orderData.pickupCode }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="showActions && orderData.status === 20" type="success" @click="handleComplete">
          完成提货
        </el-button>
        <el-button v-if="showActions && orderData.status !== 50 && orderData.status !== 40" type="danger" @click="handleCloseOrder">
          关闭订单
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.order-detail-dialog {
  .order-detail {
    .info-card, .timeline-card, .items-card, .pickup-card {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .label {
        font-weight: 500;
        color: #606266;
        min-width: 80px;
      }

      .value {
        color: #303133;

        &.amount {
          font-size: 18px;
          font-weight: 600;
          color: #f56c6c;
        }
      }
    }

    .timeline-content {
      .timeline-title {
        margin: 0 0 4px 0;
        font-weight: 500;
        color: #303133;
      }

      .timeline-time {
        margin: 0;
        font-size: 12px;
        color: #909399;
      }
    }

    .product-info {
      .product-name {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .product-desc {
        font-size: 12px;
        color: #909399;
      }
    }

    .price, .subtotal {
      font-weight: 500;
      color: #f56c6c;
    }

    .total-section {
      margin-top: 16px;

      .total-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .total-label {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-right: 16px;
        }

        .total-amount {
          font-size: 20px;
          font-weight: 600;
          color: #f56c6c;
        }
      }
    }

    .pickup-card {
      .pickup-code {
        display: flex;
        align-items: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: white;

        .pickup-icon {
          font-size: 32px;
          margin-right: 16px;
          opacity: 0.8;
        }

        .pickup-info {
          .pickup-label {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 4px;
          }

          .pickup-value {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 2px;
          }
        }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
}
</style>
