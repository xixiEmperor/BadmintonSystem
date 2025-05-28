import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrderList, cancelOrder as cancelOrderApi } from '@/api/pay'
import { ORDER_STATUS } from '@/api/pay'

export const useOrderStore = defineStore('order', () => {
  // 订单列表
  const orderList = ref([])
  // 加载状态
  const loading = ref(false)
  // 总订单数
  const total = ref(0)
  // 订单状态
  const status = ref(null)

  // 获取订单列表（从后端）
  async function fetchOrderList(pageNum = 1, pageSize = 5, status = null) {
    if (loading.value) return

    loading.value = true
    try {
      const response = await getOrderList({
        pageNum,
        pageSize,
        status
      })

      if (response.data.code === 0) {
        // 显示所有订单，包括已取消的订单
        orderList.value = response.data.data.list || []
        total.value = response.data.data.total || 0
      } else {
        throw new Error(response.data.message || '获取订单列表失败')
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      ElMessage.error('获取订单列表失败')
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
    fetchOrderList,
    cancelOrder,
    getOrderByNo,
    total,
    status
  }
}, {
  persist: true
})
