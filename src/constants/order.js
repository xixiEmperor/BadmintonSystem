// 订单状态
export const ORDER_STATUS = {
  UNPAID: 'UNPAID',     // 待支付
  PAID: 'PAID',         // 已支付
  CANCELLED: 'CANCELLED' // 已取消
}

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { label: '全部', value: 'ALL' },
  { label: '待支付', value: ORDER_STATUS.UNPAID },
  { label: '已支付', value: ORDER_STATUS.PAID },
  { label: '已取消', value: ORDER_STATUS.CANCELLED }
]
