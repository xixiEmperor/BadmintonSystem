import request from '@/utils/request'

// 特殊日期配置API

/**
 * 创建特殊日期配置
 * @param {Object} data - 特殊日期配置信息
 * @param {string} data.configName - 配置名称
 * @param {string} data.specialDate - 特殊日期，格式：yyyy-MM-dd
 * @param {number} data.configType - 配置类型：1-节假日，2-维护日，3-特殊开放日
 * @param {string} [data.affectedVenueIds] - 影响的场地ID，多个用逗号分隔，null表示全部场地
 * @param {string} [data.startTime] - 影响开始时间，格式：HH:mm
 * @param {string} [data.endTime] - 影响结束时间，格式：HH:mm
 * @param {number} data.venueStatus - 特殊日期场地状态：1-空闲中，2-使用中，4-维护中
 * @param {number} data.bookable - 是否可预约：1-可预约，0-不可预约
 * @param {string} [data.description] - 配置描述
 * @param {number} [data.enabled] - 是否启用：1-启用，0-禁用，默认1
 * @returns {Promise}
 */
export function createSpecialDateConfig(data) {
  return request({
    url: '/api/venue/special-config',
    method: 'post',
    data
  })
}

/**
 * 获取特殊日期配置列表
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页大小
 * @returns {Promise}
 */
export function getSpecialDateConfigList(params = {}) {
  return request({
    url: '/api/venue/special-config/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 10,
      ...params
    }
  })
}

/**
 * 获取特殊日期配置详情
 * @param {number} id - 配置ID
 * @returns {Promise}
 */
export function getSpecialDateConfigById(id) {
  return request({
    url: `/api/venue/special-config/${id}`,
    method: 'get'
  })
}

/**
 * 更新特殊日期配置
 * @param {number} id - 配置ID
 * @param {Object} data - 更新的配置信息
 * @param {string} data.configName - 配置名称
 * @param {string} data.specialDate - 特殊日期，格式：yyyy-MM-dd
 * @param {number} data.configType - 配置类型：1-节假日，2-维护日，3-特殊开放日
 * @param {string} [data.affectedVenueIds] - 影响的场地ID，多个用逗号分隔，null表示全部场地
 * @param {string} [data.startTime] - 影响开始时间，格式：HH:mm
 * @param {string} [data.endTime] - 影响结束时间，格式：HH:mm
 * @param {number} data.venueStatus - 特殊日期场地状态：1-空闲中，2-使用中，4-维护中
 * @param {number} data.bookable - 是否可预约：1-可预约，0-不可预约
 * @param {string} [data.description] - 配置描述
 * @param {number} [data.enabled] - 是否启用：1-启用，0-禁用
 * @returns {Promise}
 */
export function updateSpecialDateConfig(id, data) {
  return request({
    url: `/api/venue/special-config/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除特殊日期配置
 * @param {number} id - 配置ID
 * @returns {Promise}
 */
export function deleteSpecialDateConfig(id) {
  return request({
    url: `/api/venue/special-config/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用特殊日期配置
 * @param {number} id - 配置ID
 * @param {number} enabled - 启用状态：1-启用，0-禁用
 * @returns {Promise}
 */
export function toggleSpecialDateConfig(id, enabled) {
  return request({
    url: `/api/venue/special-config/${id}/toggle`,
    method: 'put',
    params: { enabled }
  })
}

// 配置类型常量
export const CONFIG_TYPE = {
  HOLIDAY: 1,      // 节假日
  MAINTENANCE: 2,  // 维护日
  SPECIAL_OPEN: 3  // 特殊开放日
}

// 配置类型文本映射
export const CONFIG_TYPE_TEXT = {
  1: '节假日',
  2: '维护日',
  3: '特殊开放日'
}

// 场地状态常量
export const VENUE_STATUS = {
  IDLE: 1,        // 空闲中
  IN_USE: 2,      // 使用中
  MAINTENANCE: 4  // 维护中
}

// 场地状态文本映射
export const VENUE_STATUS_TEXT = {
  1: '空闲中',
  2: '使用中',
  4: '维护中'
}

// 可预约状态常量
export const BOOKABLE_STATUS = {
  BOOKABLE: 1,     // 可预约
  NOT_BOOKABLE: 0  // 不可预约
}

// 可预约状态文本映射
export const BOOKABLE_STATUS_TEXT = {
  1: '可预约',
  0: '不可预约'
}

// 启用状态常量
export const ENABLED_STATUS = {
  ENABLED: 1,   // 启用
  DISABLED: 0   // 禁用
}

// 启用状态文本映射
export const ENABLED_STATUS_TEXT = {
  1: '启用',
  0: '禁用'
}
