import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookingStore = defineStore(
  'booking',
  () => {
    // 场地列表
    const courts = ref([])

    // 用户预约列表
    const userBookings = ref([])

    // 场地可用状态
    const courtAvailability = ref({})

    // 设置场地列表
    const setCourts = (courtList) => {
      courts.value = courtList
    }

    // 设置用户预约列表
    const setUserBookings = (bookingList) => {
      userBookings.value = bookingList
    }

    // 设置场地可用状态
    const setCourtAvailability = (date, availability) => {
      courtAvailability.value[date] = availability
    }

    // 添加新预约
    const addBooking = (booking) => {
      userBookings.value.unshift(booking)
    }

    // 更新预约
    const updateBooking = (updatedBooking) => {
      const index = userBookings.value.findIndex((booking) => booking.id === updatedBooking.id)
      if (index !== -1) {
        userBookings.value[index] = updatedBooking
      }
    }

    // 取消预约
    const cancelBookingInStore = (bookingId) => {
      const booking = userBookings.value.find((booking) => booking.id === bookingId)
      if (booking) {
        booking.status = 'cancelled'
      }
    }

    // 支付预约
    const payBookingInStore = (bookingId) => {
      const booking = userBookings.value.find((booking) => booking.id === bookingId)
      if (booking) {
        booking.status = 'paid'
      }
    }

    // 清空预约数据
    const clearBookingData = () => {
      courts.value = []
      userBookings.value = []
      courtAvailability.value = {}
    }

    return {
      courts,
      userBookings,
      courtAvailability,
      setCourts,
      setUserBookings,
      setCourtAvailability,
      addBooking,
      updateBooking,
      cancelBookingInStore,
      payBookingInStore,
      clearBookingData,
    }
  },
  {
    persist: true, // 持久化存储预约数据
  },
)
