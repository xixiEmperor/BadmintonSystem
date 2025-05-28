# 场地预约组件使用说明

本文档介绍了重构后的场地预约系统中的两个核心组件：`CreateOrderForm` 和 `PaymentForm`。

## 组件概述

### 1. CreateOrderForm 组件
位置：`src/views/booking/components/CreateOrderForm.vue`

**功能：**
- 显示预约信息摘要（场地、日期、时间、价格）
- 展示场地详细信息
- 收集用户预约信息（姓名、手机号、备注）
- 表单验证和提交

**Props：**
```javascript
{
  selectedVenue: Object,      // 必需 - 选中的场地信息
  reservationDate: String,    // 必需 - 预约日期 (YYYY-MM-DD)
  startTime: String,          // 必需 - 开始时间 (HH:mm)
  endTime: String            // 必需 - 结束时间 (HH:mm)
}
```

**Events：**
```javascript
{
  submit: (orderData) => {},  // 提交订单数据
  cancel: () => {}           // 取消操作
}
```

**使用示例：**
```vue
<CreateOrderForm
  :selected-venue="selectedCourt"
  :reservation-date="formatDateToString(currentDate)"
  :start-time="startTime"
  :end-time="endTime"
  @submit="handleCreateOrder"
  @cancel="cancelBooking"
/>
```

### 2. PaymentForm 组件
位置：`src/views/booking/components/PaymentForm.vue`

**功能：**
- 显示订单信息摘要
- 支付方式选择（支付宝、微信）
- 生成支付二维码
- 支付状态监控和倒计时
- 支付结果处理

**Props：**
```javascript
{
  orderInfo: Object,          // 必需 - 订单信息
  autoStartPayment: Boolean   // 可选 - 是否自动开始支付，默认true
}
```

**Events：**
```javascript
{
  'payment-success': (paymentData) => {},  // 支付成功
  'payment-failed': (paymentData) => {},   // 支付失败
  'payment-timeout': (paymentData) => {},  // 支付超时
  'cancel': () => {}                       // 取消支付
}
```

**使用示例：**
```vue
<PaymentForm
  :order-info="currentOrder"
  :auto-start-payment="true"
  @payment-success="handlePaymentSuccess"
  @payment-failed="handlePaymentFailed"
  @payment-timeout="handlePaymentTimeout"
  @cancel="cancelBooking"
/>
```

## API 集成

### 订单相关 API
使用 `src/api/venueOrder.js` 中的接口：

```javascript
import { createReservation, paymentCallback } from '@/api/venueOrder'

// 创建预约订单
const response = await createReservation({
  venueId: 1,
  reservationDate: '2024-01-15',
  startTime: '18:00',
  endTime: '19:00',
  contactName: '张三',
  contactPhone: '13800138000',
  remark: '备注信息'
})

// 支付回调
const response = await paymentCallback({
  orderNo: 'ORDER123456',
  payInfoId: 'PAY123456'
})
```

### 支付相关 API
使用 `src/api/payment.js` 中的接口：

```javascript
import { createPayment, getPaymentStatus } from '@/api/payment'

// 创建支付订单
const response = await createPayment({
  orderNo: 'ORDER123456',
  paymentMethod: 'alipay',
  amount: 20
})

// 查询支付状态
const response = await getPaymentStatus('ORDER123456')
```

## 数据流程

### 1. 创建订单流程
```
用户选择场地和时间 → 填写预约信息 → 提交表单 → 调用createReservation API → 创建订单成功 → 进入支付流程
```

### 2. 支付流程
```
显示订单信息 → 选择支付方式 → 生成支付二维码 → 用户扫码支付 → 轮询支付状态 → 支付成功/失败处理
```

## 组件特性

### CreateOrderForm 特性
- ✅ 响应式设计，支持移动端
- ✅ 实时价格计算
- ✅ 表单验证（姓名、手机号格式验证）
- ✅ 场地信息展示
- ✅ 预约须知提示

### PaymentForm 特性
- ✅ 支持支付宝和微信支付
- ✅ 实时支付状态监控
- ✅ 5分钟支付倒计时
- ✅ 支付二维码自动生成
- ✅ 支付失败重试机制
- ✅ 响应式设计

## 样式定制

两个组件都使用了统一的设计语言：
- 主色调：`#2b6fc2`
- 圆角：`12px`
- 渐变背景
- 卡片式布局
- 响应式断点：`768px`

## 错误处理

组件内置了完善的错误处理机制：
- API 调用失败提示
- 表单验证错误提示
- 支付超时处理
- 网络异常处理

## 扩展性

组件设计考虑了扩展性：
- 支持自定义验证规则
- 支持新增支付方式
- 支持自定义样式主题
- 支持国际化

## 注意事项

1. **时区处理**：确保日期格式化使用 `formatDateToString` 函数避免时区问题
2. **支付安全**：生产环境需要配置真实的支付接口和安全验证
3. **状态管理**：组件间通过 props 和 events 通信，保持数据流清晰
4. **性能优化**：支付状态轮询间隔为3秒，可根据需要调整

## 测试建议

1. **单元测试**：测试表单验证、价格计算等纯函数
2. **集成测试**：测试组件间的数据传递和事件触发
3. **端到端测试**：测试完整的预约和支付流程
4. **移动端测试**：确保在不同设备上的显示效果 