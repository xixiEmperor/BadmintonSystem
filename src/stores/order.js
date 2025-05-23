import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ORDER_STATUS } from '@/constants/order'

export const useOrderStore = defineStore('order', () => {
  // 订单列表
  const orders = ref([])

  // 当前订单详情
  const currentOrder = ref(null)

  // 根据状态获取订单列表
  const getOrdersByStatus = (status) => {
    if (status === 'ALL') {
      return orders.value
    }
    return orders.value.filter(order => order.status === status)
  }

  // 获取订单详情
  const getOrderDetail = (orderNo) => {
    return orders.value.find(order => order.orderNo === orderNo)
  }

  // 创建订单
  const createOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      orderNo: `ORD${Date.now()}`,
      status: ORDER_STATUS.UNPAID,
      createTime: new Date().toISOString(),
      ...orderData
    }
    orders.value.unshift(newOrder)
    return newOrder
  }

  // 更新订单状态
  const updateOrderStatus = (orderNo, status) => {
    const order = orders.value.find(o => o.orderNo === orderNo)
    if (order) {
      order.status = status
      if (status === ORDER_STATUS.PAID) {
        order.payTime = new Date().toISOString()
      }
    }
  }

  // 取消订单
  const cancelOrder = (orderNo) => {
    updateOrderStatus(orderNo, ORDER_STATUS.CANCELLED)
  }

  // 删除订单
  const deleteOrder = (orderNo) => {
    const index = orders.value.findIndex(order => order.orderNo === orderNo)
    if (index > -1) {
      orders.value.splice(index, 1)
    }
  }

  // 清空订单列表
  const clearOrders = () => {
    orders.value = []
  }

  return {
    orders,
    currentOrder,
    getOrdersByStatus,
    getOrderDetail,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    clearOrders
  }
})
