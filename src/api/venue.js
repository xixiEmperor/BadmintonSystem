import request from '@/utils/request'

// 获取场地列表
export const getVenueList = () => {
  return request({
    url: '/admin/venues',
    method: 'get'
  })
}

// 更新场地状态
export const updateVenueStatus = (venueId, isActive) => {
  return request({
    url: `/admin/venues/${venueId}/status`,
    method: 'put',
    data: { isActive }
  })
}

// 批量更新场地状态
export const batchUpdateVenueStatus = (venueIds, isActive) => {
  return request({
    url: '/admin/venues/batch-status',
    method: 'put',
    data: { venueIds, isActive }
  })
}

// 获取场地详情
export const getVenueDetail = (venueId) => {
  return request({
    url: `/admin/venues/${venueId}`,
    method: 'get'
  })
}

// 获取场地时段信息
export const getVenueSchedule = (venueId, date) => {
  return request({
    url: `/admin/venues/${venueId}/schedule`,
    method: 'get',
    params: { date }
  })
}

// 更新场地时段状态
export const updateVenueSchedule = (venueId, date, timeSlots) => {
  return request({
    url: `/admin/venues/${venueId}/schedule`,
    method: 'put',
    data: { date, timeSlots }
  })
}

// 获取特殊日期列表
export const getSpecialDates = () => {
  return request({
    url: '/admin/special-dates',
    method: 'get'
  })
}

// 添加特殊日期
export const addSpecialDate = (data) => {
  return request({
    url: '/admin/special-dates',
    method: 'post',
    data
  })
}

// 更新特殊日期
export const updateSpecialDate = (id, data) => {
  return request({
    url: `/admin/special-dates/${id}`,
    method: 'put',
    data
  })
}

// 删除特殊日期
export const deleteSpecialDate = (id) => {
  return request({
    url: `/admin/special-dates/${id}`,
    method: 'delete'
  })
}

// 获取场地预约统计
export const getVenueBookingStats = (venueId, startDate, endDate) => {
  return request({
    url: `/admin/venues/${venueId}/booking-stats`,
    method: 'get',
    params: { startDate, endDate }
  })
}

// 获取所有场地预约统计
export const getAllVenuesBookingStats = (date) => {
  return request({
    url: '/admin/venues/booking-stats',
    method: 'get',
    params: { date }
  })
}
