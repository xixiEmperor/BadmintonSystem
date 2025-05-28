<script setup>
import { ref, reactive, onMounted } from 'vue'

import { Refresh, Calendar, Search, RefreshLeft } from '@element-plus/icons-vue'
import {
  getAdminOrders,
  completeOrder,
  approveRefund,
  cancelReservation,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLOR
} from '@/api/venueOrder'
import { getVenueList } from '@/api/venue'

// 筛选表单
const filterForm = reactive({
  venueId: '',
  startDate: '',
  endDate: '',
  status: '', // 订单状态筛选
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 订单列表数据
const bookingList = ref([])

// 场地列表数据
const venueList = ref([])

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentBooking = ref(null)

// 获取场地列表
const getVenueListData = async () => {
  try {
    const response = await getVenueList()
    if (response.data.code === 0) {
      venueList.value = response.data.data || []
    } else {
      console.error('获取场地列表失败:', response.message)
    }
  } catch (error) {
    console.error('获取场地列表失败:', error)
  }
}

// 获取订单列表
const getBookingList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }

    // 清理空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await getAdminOrders(params)
    if (response.data.code === 0) {
      // 过滤掉待支付的订单
      const allOrders = response.data.data.list || []
      bookingList.value = allOrders.filter(order => order.status !== ORDER_STATUS.PENDING_PAYMENT)
      total.value = bookingList.value.length
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
      bookingList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('网络错误，获取订单列表失败')
    bookingList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1 // 重置到第一页
  getBookingList()
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.venueId = ''
  filterForm.startDate = ''
  filterForm.endDate = ''
  filterForm.status = ''
  handleFilter()
}

// 获取订单状态文本
const getStatusText = (status) => {
  return ORDER_STATUS_TEXT[status] || '未知状态'
}

// 获取订单状态颜色
const getStatusColor = (status) => {
  return ORDER_STATUS_COLOR[status] || 'info'
}

// 完成订单
const handleCompleteOrder = (row) => {
  ElMessageBox.confirm(
    `确定要完成用户 ${row.username} 在 ${row.reservationDate} ${row.startTime}-${row.endTime} 的 ${row.venueName} 预定吗？`,
    '完成订单确认',
    {
      confirmButtonText: '确定完成',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      customClass: 'custom-message-box',
    },
  )
    .then(async () => {
      try {
        const response = await completeOrder(row.id)
        if (response.data.code === 0) {
          ElMessage({
            type: 'success',
            message: '订单已完成',
            duration: 2000,
          })
          // 刷新列表
          getBookingList()
          // 关闭详情对话框
          detailDialogVisible.value = false
        } else {
          ElMessage.error(response.message || '完成订单失败')
        }
      } catch (error) {
        console.error('完成订单失败:', error)
        ElMessage.error('完成订单失败')
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作',
        duration: 2000,
      })
    })
}

// 审批退款
const handleRefundReview = (row, approved) => {
  const action = approved ? '批准' : '拒绝'
  ElMessageBox.prompt(
    `确定要${action}用户 ${row.username} 的退款申请吗？`,
    `${action}退款申请`,
    {
      confirmButtonText: `确定${action}`,
      cancelButtonText: '取消',
      inputPlaceholder: '请输入管理员备注（可选）',
      inputType: 'textarea',
      center: true,
      customClass: 'custom-message-box',
    },
  )
    .then(async ({ value }) => {
      try {
        const response = await approveRefund(row.id, {
          approved,
          adminRemark: value || ''
        })
        if (response.data.code === 0) {
          ElMessage({
            type: 'success',
            message: `已${action}退款申请`,
            duration: 2000,
          })
          // 刷新列表
          getBookingList()
          // 关闭详情对话框
          detailDialogVisible.value = false
        } else {
          ElMessage.error(response.message || `${action}退款申请失败`)
        }
      } catch (error) {
        console.error(`${action}退款申请失败:`, error)
        ElMessage.error(`${action}退款申请失败`)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作',
        duration: 2000,
      })
    })
}

// 管理员取消订单（仅针对已支付订单）
const handleAdminCancel = (row) => {
  ElMessageBox.prompt(
    `确定要取消 ${row.username} 在 ${row.reservationDate} ${row.startTime}-${row.endTime} 的 ${row.venueName} 预定吗？`,
    '管理员取消订单',
    {
      confirmButtonText: '确定取消',
      cancelButtonText: '返回',
      inputPlaceholder: '请输入取消原因',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '请输入取消原因'
        }
        return true
      },
      center: true,
      customClass: 'custom-message-box',
    },
  )
    .then(async ({ value }) => {
      try {
        const response = await cancelReservation(row.id, {
          reason: value
        })
        if (response.data.code === 0) {
          ElMessage({
            type: 'success',
            message: '订单已取消',
            duration: 2000,
          })
          // 刷新列表
          getBookingList()
          // 关闭详情对话框
          detailDialogVisible.value = false
        } else {
          ElMessage.error(response.message || '取消订单失败')
        }
      } catch (error) {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败')
      }
    })
    .catch(() => {
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
  getBookingList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  getBookingList()
}

// 格式化时间显示
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

// 判断是否可以完成订单
const canCompleteOrder = (row) => {
  return row.status === ORDER_STATUS.PAID
}

// 判断是否可以管理员取消订单（仅已支付状态）
const canAdminCancelOrder = (row) => {
  return row.status === ORDER_STATUS.PAID
}

// 判断是否是退款申请
const isRefundRequest = (row) => {
  return row.status === ORDER_STATUS.REFUNDING
}

// 初始化
onMounted(() => {
  getBookingList()
  getVenueListData()
})
</script>

<template>
  <div class="booking-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Calendar /></el-icon>
          预定管理
        </h1>
        <p class="page-description">管理场地预约订单，处理退款申请和订单完成</p>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-card class="filter-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">筛选条件</span>
          </div>
        </template>
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="场地">
            <el-select
              v-model="filterForm.venueId"
              placeholder="请选择场地"
              size="large"
              style="width: 180px"
              clearable
            >
              <el-option
                v-for="venue in venueList"
                :key="venue.id"
                :label="venue.name"
                :value="venue.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              size="large"
              style="width: 150px"
              clearable
            >
              <el-option label="已支付" :value="ORDER_STATUS.PAID"></el-option>
              <el-option label="已完成" :value="ORDER_STATUS.COMPLETED"></el-option>
              <el-option label="已取消" :value="ORDER_STATUS.CANCELLED"></el-option>
              <el-option label="退款中" :value="ORDER_STATUS.REFUNDING"></el-option>
              <el-option label="已退款" :value="ORDER_STATUS.REFUNDED"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期">
            <el-date-picker
              v-model="filterForm.startDate"
              type="date"
              placeholder="开始日期"
              style="width: 140px"
              value-format="YYYY-MM-DD"
              clearable
            />
            <span class="date-separator">至</span>
            <el-date-picker
              v-model="filterForm.endDate"
              type="date"
              placeholder="结束日期"
              style="width: 140px"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" @click="handleFilter">
              <el-icon><Search /></el-icon>
              筛选
            </el-button>
            <el-button size="large" @click="resetFilter">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button type="success" size="large" @click="getBookingList" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-card class="table-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单列表</span>
            <span class="total-count">共 {{ total }} 条记录</span>
          </div>
        </template>
        <el-table
          :data="bookingList"
          style="width: 100%"
          v-loading="loading"
          :empty-text="loading ? '加载中...' : '暂无数据'"
          stripe
          :header-cell-style="{ background: '#f8f9fa', color: '#606266', fontWeight: 'bold' }"
        >
          <el-table-column prop="id" label="订单ID" width="80" fixed></el-table-column>
          <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip></el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusColor(scope.row.status)" size="large">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="预定用户" width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="venueName" label="场地名称" width="140" show-overflow-tooltip></el-table-column>
          <el-table-column prop="reservationDate" label="预约日期" width="120" align="center"></el-table-column>
          <el-table-column label="时间段" width="140" align="center">
            <template #default="scope">
              <span class="time-slot">{{ scope.row.startTime }}-{{ scope.row.endTime }}</span>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="120" align="right">
            <template #default="scope">
              <span class="amount">¥{{ scope.row.totalAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" min-width="160">
            <template #default="scope">
              <span class="create-time">{{ formatDateTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right" align="center">
            <template #default="scope">
              <div class="action-buttons">
                <!-- 已支付状态可以完成订单 -->
                <el-button
                  v-if="canCompleteOrder(scope.row)"
                  size="small"
                  type="success"
                  @click="handleCompleteOrder(scope.row)"
                >
                  完成订单
                </el-button>

                <!-- 退款申请审核 -->
                <template v-if="isRefundRequest(scope.row)">
                  <el-button size="small" type="success" @click="handleRefundReview(scope.row, true)">
                    批准退款
                  </el-button>
                  <el-button size="small" type="danger" @click="handleRefundReview(scope.row, false)">
                    拒绝退款
                  </el-button>
                </template>

                <!-- 管理员可以取消已支付的订单 -->
                <el-button
                  v-if="canAdminCancelOrder(scope.row)"
                  size="small"
                  type="warning"
                  @click="handleAdminCancel(scope.row)"
                >
                  取消订单
                </el-button>

                <el-button size="small" type="info" @click="handleDetail(scope.row)">详情</el-button>
              </div>
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
            :page-sizes="[10, 20, 50, 100]"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="order-detail" v-if="currentBooking">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">订单ID</span>
            <span class="value">{{ currentBooking.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单号</span>
            <span class="value">{{ currentBooking.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单状态</span>
            <span class="value">
              <el-tag :type="getStatusColor(currentBooking.status)" size="large">
                {{ getStatusText(currentBooking.status) }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="label">预定用户</span>
            <span class="value">{{ currentBooking.username }}</span>
          </div>
          <div class="detail-item">
            <span class="label">用户手机</span>
            <span class="value">{{ currentBooking.userPhone || '未提供' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">场地名称</span>
            <span class="value">{{ currentBooking.venueName }}</span>
          </div>
          <div class="detail-item">
            <span class="label">预约日期</span>
            <span class="value">{{ currentBooking.reservationDate }}</span>
          </div>
          <div class="detail-item">
            <span class="label">时间段</span>
            <span class="value">{{ currentBooking.startTime }}-{{ currentBooking.endTime }}</span>
          </div>
          <div class="detail-item">
            <span class="label">订单金额</span>
            <span class="value amount">¥{{ currentBooking.totalAmount }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间</span>
            <span class="value">{{ formatDateTime(currentBooking.createTime) }}</span>
          </div>
          <div v-if="currentBooking.payTime" class="detail-item">
            <span class="label">支付时间</span>
            <span class="value">{{ formatDateTime(currentBooking.payTime) }}</span>
          </div>
          <div v-if="currentBooking.cancelTime" class="detail-item">
            <span class="label">取消时间</span>
            <span class="value">{{ formatDateTime(currentBooking.cancelTime) }}</span>
          </div>
          <div v-if="currentBooking.cancelReason" class="detail-item full-width">
            <span class="label">取消原因</span>
            <span class="value">{{ currentBooking.cancelReason }}</span>
          </div>
          <div v-if="currentBooking.refundReason" class="detail-item full-width">
            <span class="label">退款原因</span>
            <span class="value">{{ currentBooking.refundReason }}</span>
          </div>
          <div v-if="currentBooking.adminRemark" class="detail-item full-width">
            <span class="label">管理员备注</span>
            <span class="value">{{ currentBooking.adminRemark }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <!-- 根据订单状态显示不同操作按钮 -->
          <template v-if="currentBooking">
            <el-button
              v-if="canCompleteOrder(currentBooking)"
              type="success"
              @click="handleCompleteOrder(currentBooking)"
            >
              完成订单
            </el-button>

            <template v-if="isRefundRequest(currentBooking)">
              <el-button type="success" @click="handleRefundReview(currentBooking, true)">
                批准退款
              </el-button>
              <el-button type="danger" @click="handleRefundReview(currentBooking, false)">
                拒绝退款
              </el-button>
            </template>

            <el-button
              v-if="canAdminCancelOrder(currentBooking)"
              type="warning"
              @click="handleAdminCancel(currentBooking)"
            >
              取消订单
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.booking-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .page-header {
    margin-bottom: 20px;
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);

    .header-content {
      .page-title {
        font-size: 28px;
        font-weight: 600;
        color: white;
        margin: 0;
        display: flex;
        align-items: center;

        .title-icon {
          margin-right: 12px;
          font-size: 32px;
        }
      }

      .page-description {
        margin-top: 8px;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 0;
      }
    }
  }

  .filter-section {
    margin-bottom: 20px;

    .filter-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 21, 41, 0.08);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }

      .filter-form {
        .el-form-item {
          margin-bottom: 16px;
          margin-right: 20px;

          :deep(.el-form-item__label) {
            font-weight: 500;
            color: #606266;
          }
        }

        .date-separator {
          margin: 0 12px;
          color: #909399;
          font-weight: 500;
        }

        .el-button {
          margin-right: 12px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }
  }

  .table-section {
    .table-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 21, 41, 0.08);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .total-count {
          font-size: 14px;
          color: #909399;
          background: #f5f7fa;
          padding: 4px 12px;
          border-radius: 12px;
        }
      }

      :deep(.el-table) {
        border-radius: 4px;
        overflow: hidden;

        .el-table__header-wrapper {
          .el-table__header {
            th {
              background: #fafbfc !important;
              border-bottom: 2px solid #e4e7ed;
            }
          }
        }

        .el-table__body-wrapper {
          .el-table__row {
            &:hover {
              background: #f8f9ff !important;
            }
          }
        }

        .time-slot {
          background: #e8f4fd;
          color: #409eff;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .amount {
          color: #f56c6c;
          font-weight: 600;
          font-size: 16px;
        }

        .create-time {
          color: #909399;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;

          .el-button {
            margin: 0;
          }
        }
      }

      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: center;
        padding: 16px 0;
        border-top: 1px solid #e4e7ed;
      }
    }
  }

  .order-detail {
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      .detail-item {
        display: flex;
        flex-direction: column;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #409eff;

        &.full-width {
          grid-column: 1 / -1;
        }

        .label {
          font-size: 12px;
          color: #909399;
          font-weight: 500;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 14px;
          color: #333;
          font-weight: 500;

          &.amount {
            color: #f56c6c;
            font-weight: 600;
            font-size: 16px;
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

// 全局样式
:deep(.custom-message-box) {
  border-radius: 8px;

  .el-message-box__header {
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;
  }
}

:deep(.el-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    background: #f8f9fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 8px 8px 0 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .booking-management {
    padding: 10px;

    .page-header {
      padding: 16px;

      .header-content {
        .page-title {
          font-size: 24px;

          .title-icon {
            font-size: 28px;
          }
        }

        .page-description {
          font-size: 14px;
        }
      }
    }

    .filter-section {
      .filter-card {
        .filter-form {
          .el-form-item {
            margin-right: 0;
            margin-bottom: 12px;
          }

          .date-separator {
            margin: 8px 0;
            display: block;
            text-align: center;
          }
        }
      }
    }

    .table-section {
      .table-card {
        :deep(.el-table) {
          .action-buttons {
            flex-direction: column;
            gap: 4px;

            .el-button {
              width: 100%;
            }
          }
        }
      }
    }

    .order-detail {
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 12px;

        .detail-item {
          &.full-width {
            grid-column: 1;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .booking-management {
    .page-header {
      .header-content {
        .page-title {
          font-size: 20px;
          flex-direction: column;
          text-align: center;

          .title-icon {
            margin-right: 0;
            margin-bottom: 8px;
          }
        }
      }
    }

    .filter-section {
      .filter-card {
        .filter-form {
          .el-form-item {
            .el-select,
            .el-date-picker {
              width: 100% !important;
            }
          }
        }
      }
    }
  }
}
</style>
