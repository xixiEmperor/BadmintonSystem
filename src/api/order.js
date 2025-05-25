import request from '@/utils/request'

// 订单管理接口

/**
 * 获取订单列表（管理员）
 * @param {Object} params 查询参数
 * @param {Number} params.pageNum 页码，默认为1
 * @param {Number} params.pageSize 每页数量，默认为10
 * @param {String} params.username 用户名搜索，支持模糊匹配
 * @param {Long} params.orderNo 订单号精确搜索
 * @returns {Promise} 返回订单列表数据
 */
export function getOrdersByAdmin(params) {
  return request.get('/api/mall/orders/admin', { params })
}

/**
 * 管理员关闭订单
 * @param {Long} orderNo 订单号
 * @returns {Promise} 返回操作结果
 */
export function closeOrderByAdmin(orderNo) {
  return request.post(`/api/mall/orders/admin/${orderNo}/close`)
}

/**
 * 管理员验证提货码并完成订单
 * @param {Long} orderNo 订单号
 * @param {String} pickupCode 提货码
 * @returns {Promise} 返回操作结果
 */
export function completeOrderByAdmin(orderNo, pickupCode) {
  return request.post(`/api/mall/orders/admin/${orderNo}/complete`, null, {
    params: { pickupCode }
  })
}
