import request from '@/utils/request'

/**
 * 订单与支付相关接口
 */

// ==================== 订单接口 ====================

/**
 * 创建订单
 * @returns {Promise} 订单号
 */
export function createOrder() {
  return request({
    url: '/api/mall/orders',
    method: 'post'
  })
}

/**
 * 立即购买 -- 基于特定单个商品创建订单
 * @param {Object} data - 订单数据
 * @param {number} data.productId - 商品ID
 * @param {number} data.quantity - 商品数量
 * @param {Object} data.specs - 商品规格
 * @returns {Promise} 订单号
 */
export function createOrderForProduct(data) {
  return request({
    url: '/api/mall/orders/buy-now',
    method: 'post',
    data
  })
}

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码，默认为1
 * @param {number} params.pageSize - 每页数量，默认为10
 * @returns {Promise} 订单列表
 */
export function getOrderList(params = {}) {
  return request({
    url: '/api/mall/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {number} orderNo - 订单号
 * @returns {Promise} 订单详情
 */
export function getOrderDetail(orderNo) {
  return request({
    url: `/api/mall/orders/${orderNo}`,
    method: 'get'
  })
}

/**
 * 取消订单
 * @param {number} orderNo - 订单号
 * @returns {Promise} 取消结果
 */
export function cancelOrder(orderNo) {
  return request({
    url: `/api/mall/orders/${orderNo}/cancel`,
    method: 'post'
  })
}

/**
 * 获取订单状态
 * @param {number} orderNo - 订单号
 * @returns {Promise} 订单状态
 */
export function getOrderStatus(orderNo) {
  return request({
    url: `/api/mall/orders/${orderNo}/status`,
    method: 'get'
  })
}

/**
 * 更新订单状态
 * @param {number} orderNo - 订单号
 * @param {number} status - 订单状态
 * @returns {Promise} 更新结果
 */
export function updateOrderStatus(orderNo, status) {
  return request({
    url: `/api/mall/orders/${orderNo}/status`,
    method: 'put',
    data: {
      status
    }
  })
}

// ==================== 支付接口 ====================

/**
 * 创建支付
 * @param {Object} data - 支付参数
 * @param {number} data.orderNo - 订单号
 * @param {number} data.amount - 支付金额
 * @param {string} data.businessType - 业务类型：MALL-商城，RESERVATION-预约
 * @returns {Promise} 支付响应信息
 */
export function createPayment(data) {
  return request({
    url: '/pay/create',
    method: 'post',
    data
  })
}

/**
 * 查询支付状态
 * @param {number} orderNo - 订单号
 * @returns {Promise} 支付状态信息
 */
export function queryPaymentStatus(orderNo) {
  return request({
    url: '/pay/query',
    method: 'get',
    params: {
      orderNo
    }
  })
}

/**
 * 获取支付成功跳转URL
 * @param {number} orderNo - 订单号
 * @returns {Promise} 跳转URL
 */
export function getPaymentReturnUrl(orderNo) {
  return request({
    url: '/pay/return_url',
    method: 'get',
    params: {
      orderNo
    }
  })
}

// ==================== 常量定义 ====================

/**
 * 业务类型常量
 */
export const BUSINESS_TYPE = {
  MALL: 'MALL',           // 商城订单
  RESERVATION: 'RESERVATION'  // 预约订单
}

/**
 * 订单状态常量
 */
export const ORDER_STATUS = {
  UNPAID: 10,     // 未支付
  PAID: 20,       // 已支付
  CANCELLED: 30,    // 已取消
  COMPLETED: 40,    // 已完成
  CLOSED: 50       // 已关闭
}

/**
 * 支付类型常量
 */
export const PAYMENT_TYPE = {
  ONLINE: 1       // 在线支付
}

/**
 * 支付状态常量
 */
export const PAYMENT_STATUS = {
  NOTPAY: 0,    // 未支付
  SUCCESS: 1       // 已支付
}

/**
 * 支付平台常量
 */
export const PAY_PLATFORM = {
  ALIPAY: 1,    // 支付宝
  WECHAT: 2     // 微信
}
