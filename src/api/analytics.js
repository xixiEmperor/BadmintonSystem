import request from '@/utils/request'

/**
 * 获取仪表板概览数据
 * @returns {Promise<Object>} 系统整体统计数据
 */
export function getDashboardOverview() {
  return request({
    url: '/api/analytics/dashboard',
    method: 'get'
  })
}

/**
 * 获取用户注册趋势图表数据
 * @param {Object} params - 查询参数
 * @param {string} [params.period='30d'] - 时间周期 (7d/30d/90d)
 * @returns {Promise<Object>} 用户注册趋势数据
 */
export function getUserRegistrationTrend(params = {}) {
  return request({
    url: '/api/analytics/charts/user-registration-trend',
    method: 'get',
    params
  })
}

/**
 * 获取用户角色分布图表数据
 * @returns {Promise<Object>} 用户角色分布数据
 */
export function getUserRoleDistribution() {
  return request({
    url: '/api/analytics/charts/user-role-distribution',
    method: 'get'
  })
}

/**
 * 获取预约趋势图表数据
 * @param {Object} params - 查询参数
 * @param {string} [params.period='30d'] - 时间周期 (7d/30d/90d)
 * @returns {Promise<Object>} 预约趋势数据
 */
export function getReservationTrend(params = {}) {
  return request({
    url: '/api/analytics/charts/reservation-trend',
    method: 'get',
    params
  })
}

/**
 * 获取场地使用率排行图表数据
 * @returns {Promise<Object>} 场地使用率排行数据
 */
export function getVenueUsageRanking() {
  return request({
    url: '/api/analytics/charts/venue-usage-ranking',
    method: 'get'
  })
}

/**
 * 获取预约状态分布图表数据
 * @returns {Promise<Object>} 预约状态分布数据
 */
export function getReservationStatusDistribution() {
  return request({
    url: '/api/analytics/charts/reservation-status-distribution',
    method: 'get'
  })
}

/**
 * 获取每小时预约分布图表数据
 * @returns {Promise<Object>} 每小时预约分布数据
 */
export function getHourlyReservationDistribution() {
  return request({
    url: '/api/analytics/charts/hourly-reservation-distribution',
    method: 'get'
  })
}

/**
 * 获取收入趋势图表数据
 * @param {Object} params - 查询参数
 * @param {string} [params.period='30d'] - 时间周期 (7d/30d/90d)
 * @param {string} [params.type='all'] - 收入类型 (all/reservation/mall)
 * @returns {Promise<Object>} 收入趋势数据
 */
export function getRevenueTrend(params = {}) {
  return request({
    url: '/api/analytics/charts/revenue-trend',
    method: 'get',
    params
  })
}

/**
 * 获取商城订单趋势图表数据
 * @param {Object} params - 查询参数
 * @param {string} [params.period='30d'] - 时间周期 (7d/30d/90d)
 * @returns {Promise<Object>} 商城订单趋势数据
 */
export function getMallOrderTrend(params = {}) {
  return request({
    url: '/api/analytics/charts/mall-order-trend',
    method: 'get',
    params
  })
}

/**
 * 获取热门商品排行图表数据
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise<Object>} 热门商品排行数据
 */
export function getPopularProducts(params = {}) {
  return request({
    url: '/api/analytics/charts/popular-products',
    method: 'get',
    params
  })
}

/**
 * 获取商城订单状态分布图表数据
 * @returns {Promise<Object>} 商城订单状态分布数据
 */
export function getMallOrderStatusDistribution() {
  return request({
    url: '/api/analytics/charts/mall-order-status-distribution',
    method: 'get'
  })
}

/**
 * 获取发帖趋势图表数据
 * @param {Object} params - 查询参数
 * @param {string} [params.period='30d'] - 时间周期 (7d/30d/90d)
 * @returns {Promise<Object>} 发帖趋势数据
 */
export function getPostTrend(params = {}) {
  return request({
    url: '/api/analytics/charts/post-trend',
    method: 'get',
    params
  })
}

/**
 * 获取帖子分类分布图表数据
 * @returns {Promise<Object>} 帖子分类分布数据
 */
export function getPostCategoryDistribution() {
  return request({
    url: '/api/analytics/charts/post-category-distribution',
    method: 'get'
  })
}

/**
 * 获取最活跃用户排行图表数据
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=10] - 返回数量限制
 * @returns {Promise<Object>} 最活跃用户排行数据
 */
export function getMostActiveUsers(params = {}) {
  return request({
    url: '/api/analytics/charts/most-active-users',
    method: 'get',
    params
  })
}

export default {
  getDashboardOverview,
  getUserRegistrationTrend,
  getUserRoleDistribution,
  getReservationTrend,
  getVenueUsageRanking,
  getReservationStatusDistribution,
  getHourlyReservationDistribution,
  getRevenueTrend,
  getMallOrderTrend,
  getPopularProducts,
  getMallOrderStatusDistribution,
  getPostTrend,
  getPostCategoryDistribution,
  getMostActiveUsers
}
