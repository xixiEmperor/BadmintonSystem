import request from '@/utils/request'

// 场地预定订单API

/**
 * 创建预约订单
 * @param {Object} data - 预约信息
 * @param {number} data.venueId - 场地ID
 * @param {string} data.reservationDate - 预约日期，格式：yyyy-MM-dd
 * @param {string} data.startTime - 开始时间，格式：HH:mm
 * @param {string} data.endTime - 结束时间，格式：HH:mm
 * @returns {Promise}
 */
export function createReservation(data) {
  return request({
    url: '/api/reservations/create',
    method: 'post',
    data
  })
}

/**
 * 查询我的订单列表
 * @param {Object} params - 查询参数
 * @param {number} [params.status] - 订单状态筛选
 * @returns {Promise}
 */
export function getMyOrders(status = null) {
  return request({
    url: '/api/reservations/my-orders',
    method: 'get',
    params: { status }
  })
}

/**
 * 根据订单ID查询订单详情
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function getReservationById(id) {
  return request({
    url: `/api/reservations/${id}`,
    method: 'get'
  })
}

/**
 * 根据订单号查询订单详情
 * @param {string} orderNo - 订单号
 * @returns {Promise}
 */
export function getReservationByOrderNo(orderNo) {
  return request({
    url: `/api/reservations/order-no/${orderNo}`,
    method: 'get'
  })
}

/**
 * 取消订单
 * @param {number} id - 订单ID
 * @param {Object} data - 取消信息
 * @param {string} [data.reason] - 取消原因
 * @returns {Promise}
 */
export function cancelReservation(id, data = {}) {
  return request({
    url: `/api/reservations/${id}/cancel`,
    method: 'post',
    data
  })
}

/**
 * 申请退款
 * @param {number} id - 订单ID
 * @param {Object} data - 退款信息
 * @param {string} [data.reason] - 退款原因
 * @returns {Promise}
 */
export function applyRefund(id, data = {}) {
  return request({
    url: `/api/reservations/${id}/refund`,
    method: 'post',
    data
  })
}

/**
 * 查询场地可用性
 * @param {Object} params - 查询参数
 * @param {number} params.venueId - 场地ID
 * @param {string} params.date - 查询日期，格式：yyyy-MM-dd
 * @param {string} [params.startTime] - 开始时间，格式：HH:mm
 * @param {string} [params.endTime] - 结束时间，格式：HH:mm
 * @returns {Promise}
 */
export function checkVenueAvailability(params) {
  return request({
    url: '/api/reservations/availability',
    method: 'get',
    params
  })
}

/**
 * 查询场地预约记录
 * @param {number} venueId - 场地ID
 * @param {Object} params - 查询参数
 * @param {string} params.date - 查询日期，格式：yyyy-MM-dd
 * @returns {Promise}
 */
export function getVenueReservations(venueId, params) {
  return request({
    url: `/api/reservations/venue/${venueId}`,
    method: 'get',
    params
  })
}

/**
 * 支付回调接口
 * @param {Object} data - 支付回调数据
 * @param {string} data.orderNo - 订单号
 * @param {number} data.payInfoId - 支付信息ID
 * @returns {Promise}
 */
export function paymentCallback(data) {
  return request({
    url: '/api/reservations/payment/callback',
    method: 'post',
    data
  })
}

// ==================== 管理员接口 ====================

/**
 * 管理员查询所有订单
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码，默认1
 * @param {number} [params.size] - 每页大小，默认10
 * @param {number} [params.status] - 订单状态
 * @param {number} [params.userId] - 用户ID
 * @param {number} [params.venueId] - 场地ID
 * @param {string} [params.startDate] - 开始日期，格式：yyyy-MM-dd
 * @param {string} [params.endDate] - 结束日期，格式：yyyy-MM-dd
 * @returns {Promise}
 */
export function getAdminOrders(params = {}) {
  return request({
    url: '/api/reservations/admin/orders',
    method: 'get',
    params
  })
}

/**
 * 管理员完成订单
 * @param {number} id - 订单ID
 * @returns {Promise}
 */
export function completeOrder(id) {
  return request({
    url: `/api/reservations/admin/${id}/complete`,
    method: 'post'
  })
}

/**
 * 管理员审批退款
 * @param {number} id - 订单ID
 * @param {Object} data - 审批信息
 * @param {boolean} data.approved - 是否批准退款
 * @param {string} [data.adminRemark] - 管理员备注
 * @returns {Promise}
 */
export function approveRefund(id, data) {
  return request({
    url: `/api/reservations/admin/${id}/approve-refund`,
    method: 'post',
    data
  })
}

// ==================== 常量定义 ====================

/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  PENDING_PAYMENT: 1,    // 待支付
  PAID: 2,               // 已支付
  COMPLETED: 3,          // 已完成
  CANCELLED: 4,          // 已取消
  REFUNDED: 5,            // 已退款
  REFUNDING: 6          // 退款中
}

/**
 * 订单状态文本映射
 */
export const ORDER_STATUS_TEXT = {
  1: '待支付',
  2: '已支付',
  3: '已完成',
  4: '已取消',
  5: '已退款',
  6: '退款中'
}

/**
 * 订单状态颜色映射（用于UI显示）
 */
export const ORDER_STATUS_COLOR = {
  1: 'warning',    // 待支付 - 橙色
  2: 'success',    // 已支付 - 绿色
  3: 'info',       // 已完成 - 蓝色
  4: 'danger',     // 已取消 - 红色
  5: 'info',    // 退款中 - 蓝色
  6: 'warning'        // 已退款 - 橙色
}
