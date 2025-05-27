import request from '@/utils/request'

// 场地管理API

/**
 * 获取所有场地列表
 * @returns {Promise}
 */
export function getVenueList() {
  return request({
    url: '/api/venue/list',
    method: 'get'
  })
}

/**
 * 获取场地状态矩阵
 * @param {Object} params - 查询参数
 * @param {string} params.date - 查询日期，格式：yyyy-MM-dd
 * @param {number} [params.venueId] - 场地ID，可选
 * @returns {Promise}
 */
export function getVenueStatusMatrix(params) {
  return request({
    url: '/api/venue/status-matrix',
    method: 'get',
    params
  })
}

/**
 * 查询场地可用性
 * @param {Object} params - 查询参数
 * @param {string} params.date - 查询日期，格式：yyyy-MM-dd
 * @param {string} params.startTime - 开始时间，格式：HH:mm
 * @param {string} params.endTime - 结束时间，格式：HH:mm
 * @returns {Promise}
 */
export function getVenueAvailability(params) {
  return request({
    url: '/api/venue/availability',
    method: 'get',
    params
  })
}

/**
 * 根据状态获取场地列表
 * @param {number} status - 场地状态（0-停用，1-启用，2-维护中）
 * @returns {Promise}
 */
export function getVenueListByStatus(status) {
  return request({
    url: `/api/venue/list/status/${status}`,
    method: 'get'
  })
}

/**
 * 根据ID获取场地详情
 * @param {number} id - 场地ID
 * @returns {Promise}
 */
export function getVenueById(id) {
  return request({
    url: `/api/venue/${id}`,
    method: 'get'
  })
}

/**
 * 新增场地（需要管理员权限）
 * @param {Object} data - 场地信息
 * @param {string} data.name - 场地名称
 * @param {string} data.location - 场地位置
 * @param {string} [data.description] - 场地描述
 * @param {number} data.pricePerHour - 场地价格
 * @param {number} data.type - 场地类型
 * @param {number} data.status - 场地状态（0-停用，1-启用，2-维护中）
 * @returns {Promise}
 */
export function addVenue(data) {
  return request({
    url: '/api/venue/add',
    method: 'post',
    data
  })
}

/**
 * 更新场地信息（需要管理员权限）
 * @param {number} id - 场地ID
 * @param {Object} data - 更新的场地信息
 * @param {string} data.name - 场地名称
 * @param {string} data.location - 场地位置
 * @param {string} [data.description] - 场地描述
 * @param {number} data.pricePerHour - 场地价格
 * @param {number} data.type - 场地类型
 * @param {number} data.status - 场地状态
 * @returns {Promise}
 */
export function updateVenue(id, data) {
  return request({
    url: `/api/venue/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新场地状态（需要管理员权限）
 * @param {number} id - 场地ID
 * @param {number} status - 场地状态（0-停用，1-启用，2-维护中）
 * @returns {Promise}
 */
export function updateVenueStatus(id, status) {
  return request({
    url: `/api/venue/status/${id}`,
    method: 'put',
    params: { status }
  })
}

/**
 * 删除场地（需要管理员权限）
 * @param {number} id - 场地ID
 * @returns {Promise}
 */
export function deleteVenue(id) {
  return request({
    url: `/api/venue/delete/${id}`,
    method: 'delete'
  })
}

// 场地状态常量
export const VENUE_STATUS = {
  1: '空闲中',
  2: '使用中',
  3: '已预约',
  4: '不开放'
}

// 场地状态文本映射
export const VENUE_STATUS_TEXT = {
  1: '空闲中',
  2: '使用中',
  3: '已预约',
  4: '不开放'
}
