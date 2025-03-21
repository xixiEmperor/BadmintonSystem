import request from '@/utils/request'

/**
 * 获取场地列表
 * @returns {Promise<Array>} 场地列表
 */
export function getCourts() {
  return request.get('/courts')
}

/**
 * 获取场地详情
 * @param {number} id - 场地ID
 * @returns {Promise<Object>} 场地详细信息
 */
export function getCourtDetail(id) {
  return request.get(`/courts/${id}`)
}

/**
 * 获取场地预约状态
 * @param {string} date - 日期，格式为YYYY-MM-DD
 * @returns {Promise<Array>} 场地预约状态
 */
export function getCourtAvailability(date) {
  return request.get('/courts/availability', {
    params: { date },
  })
}

/**
 * 创建预约
 * @param {Object} bookingData - 预约数据
 * @param {number} bookingData.courtId - 场地ID
 * @param {string} bookingData.date - 预约日期，格式为YYYY-MM-DD
 * @param {string} bookingData.startTime - 开始时间，格式为HH:MM
 * @param {string} bookingData.endTime - 结束时间，格式为HH:MM
 * @param {string} bookingData.name - 预约人姓名
 * @param {string} bookingData.phone - 预约人电话
 * @returns {Promise<Object>} 预约结果
 */
export function createBooking(bookingData) {
  return request.post('/bookings', bookingData)
}

/**
 * 获取用户预约列表
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 预约状态(pending/paid/cancelled/all)
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise<Object>} 用户预约列表
 */
export function getUserBookings(params = {}) {
  return request.get('/bookings/user', {
    params: {
      status: params.status || 'all',
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

/**
 * 取消预约
 * @param {number} id - 预约ID
 * @returns {Promise<Object>} 取消结果
 */
export function cancelBooking(id) {
  return request.post(`/bookings/${id}/cancel`)
}

/**
 * 支付预约订单
 * @param {number} id - 预约ID
 * @param {string} paymentMethod - 支付方式(alipay/wechat)
 * @returns {Promise<Object>} 支付结果
 */
export function payBooking(id, paymentMethod) {
  return request.post(`/bookings/${id}/pay`, {
    paymentMethod,
  })
}

/**
 * 获取预约详情
 * @param {number} id - 预约ID
 * @returns {Promise<Object>} 预约详情
 */
export function getBookingDetail(id) {
  return request.get(`/bookings/${id}`)
}
