import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getOrderList, cancelOrder as cancelOrderApi } from '@/api/pay'
import { ORDER_STATUS } from '@/api/pay'

export const useOrderStore = defineStore('order', () => {
  // 订单列表
  const orderList = ref([])
  // 加载状态
  const loading = ref(false)

  // 根据状态过滤订单
  const getOrdersByStatus = computed(() => {
    return (status) => {
      if (status === 'all') {
        return orderList.value
      }

      switch (status) {
        case 'unpaid':
          return orderList.value.filter(order => order.status === ORDER_STATUS.UNPAID)
        case 'paid':
          return orderList.value.filter(order => order.status === ORDER_STATUS.PAID)
        case 'cancelled':
          return orderList.value.filter(order => order.status === ORDER_STATUS.CANCELLED)
        default:
          return orderList.value
      }
    }
  })

  // 获取订单列表（从后端）
  async function fetchOrderList() {
    if (loading.value) return

    loading.value = true
    try {
      const response = await getOrderList({
        pageNum: 1,
        pageSize: 5 // 获取所有订单
      })

      if (response.data.code === 0) {
        // 显示所有订单，包括已取消的订单
        orderList.value = response.data.data.list || []
        return true
      } else {
        throw new Error(response.data.message || '获取订单列表失败')
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      ElMessage.error('获取订单列表失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 取消订单
  async function cancelOrder(orderNumber) {
    try {
      const response = await cancelOrderApi(orderNumber)

      if (response.data.code === 0) {
        // 更新订单状态为已取消，而不是从列表中移除
        const orderIndex = orderList.value.findIndex(order => order.orderNo === orderNumber)
        if (orderIndex !== -1) {
          orderList.value[orderIndex].status = ORDER_STATUS.CANCELLED
        }
        ElMessage.success(response.data.msg || '订单取消成功')
        return true
      } else {
        ElMessage.error(response.data.msg || '取消订单失败')
        return false
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
      return false
    }
  }

  // 根据订单号查找订单
  function getOrderByNo(orderNo) {
    return orderList.value.find(order => order.orderNo === orderNo)
  }

  return {
    orderList,
    loading,
    getOrdersByStatus,
    fetchOrderList,
    cancelOrder,
    getOrderByNo
  }
}, {
  persist: true
})
