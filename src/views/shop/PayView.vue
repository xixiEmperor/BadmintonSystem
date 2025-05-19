<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, CreditCard } from '@element-plus/icons-vue'

const router = useRouter()

// 订单信息
const orderInfo = ref(null)

// 收货信息表单
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
})

// 支付方式
const paymentMethod = ref('alipay')

// 订单备注
const remarks = ref('')

// 是否显示添加新地址表单
const showAddressForm = ref(false)

// 已保存的地址列表
const savedAddresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '湖北省',
    city: '武汉市',
    district: '洪山区',
    detailAddress: '珞瑜路1037号',
    isDefault: true,
  },
])

// 选中的地址ID
const selectedAddressId = ref(1)

// 显示新增地址表单
const showNewAddressForm = () => {
  Object.keys(addressForm).forEach((key) => {
    if (key !== 'isDefault') {
      addressForm[key] = ''
    }
  })
  addressForm.isDefault = false
  showAddressForm.value = true
}

// 保存新地址
const saveAddress = () => {
  // 表单验证
  if (
    !addressForm.name ||
    !addressForm.phone ||
    !addressForm.province ||
    !addressForm.city ||
    !addressForm.district ||
    !addressForm.detailAddress
  ) {
    ElMessage.warning('请填写完整的地址信息')
    return
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(addressForm.phone)) {
    ElMessage.warning('请输入有效的手机号码')
    return
  }

  // 创建新地址
  const newId =
    savedAddresses.value.length > 0
      ? Math.max(...savedAddresses.value.map((addr) => addr.id)) + 1
      : 1

  const newAddress = {
    id: newId,
    ...addressForm,
  }

  // 如果设为默认地址，则更新其他地址
  if (newAddress.isDefault) {
    savedAddresses.value.forEach((addr) => {
      addr.isDefault = false
    })
  }

  // 添加到地址列表
  savedAddresses.value.push(newAddress)
  selectedAddressId.value = newId

  // 关闭表单
  showAddressForm.value = false
  ElMessage.success('地址添加成功')
}

// 获取选中的地址
const getSelectedAddress = () => {
  return savedAddresses.value.find((addr) => addr.id === selectedAddressId.value)
}

// 提交订单
const submitOrder = () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  ElMessageBox.confirm('确认提交订单并前往支付？', '提交订单', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    ElMessage.success('订单提交成功，即将跳转到支付页面')

    // 模拟跳转到支付页面，实际项目中可能需要调用后端API创建订单
    setTimeout(() => {
      ElMessageBox.alert('支付成功！', '提示', {
        confirmButtonText: '确定',
        callback: () => {
          // 支付成功后跳转到首页
          router.push('/')
        },
      })
    }, 1500)
  })
}

// 返回商城
const backToShop = () => {
  router.push('/shop')
}

// 组件挂载时获取订单信息
onMounted(() => {
  // 从localStorage获取订单信息
  const savedOrder = localStorage.getItem('checkout_order')
  if (savedOrder) {
    try {
      orderInfo.value = JSON.parse(savedOrder)
    } catch (e) {
      console.error('解析订单信息失败', e)
      ElMessage.error('获取订单信息失败')
      router.push('/shop')
    }
  } else {
    ElMessage.warning('没有待结算的订单')
    router.push('/shop')
  }
})
</script>

<template>
  <div class="checkout-container" v-if="orderInfo">
    <div class="checkout-header">
      <h2>订单结算</h2>
      <el-button type="text" @click="backToShop">返回商城</el-button>
    </div>

    <!-- 订单商品信息 -->
    <div class="checkout-section">
      <h3>商品信息</h3>

      <!-- 单商品结算 -->
      <div v-if="orderInfo.product" class="product-info">
        <el-image :src="orderInfo.product.image" class="product-image" fit="cover"></el-image>
        <div class="product-details">
          <div class="product-name">{{ orderInfo.product.name }}</div>
          <div class="product-price">¥{{ orderInfo.product.price }}</div>
          <div class="product-quantity">x {{ orderInfo.quantity }}</div>
        </div>
        <div class="product-subtotal">
          <span>小计：</span>
          <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 多商品结算(购物车) -->
      <div v-if="orderInfo.products">
        <div v-for="(product, index) in orderInfo.products" :key="index" class="product-info">
          <el-image :src="product.image" class="product-image" fit="cover"></el-image>
          <div class="product-details">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ product.price }}</div>
            <div class="product-quantity">x {{ product.quantity }}</div>
          </div>
          <div class="product-subtotal">
            <span>小计：</span>
            <span class="price">¥{{ (product.price * product.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 收货地址选择 -->
    <div class="checkout-section">
      <div class="section-header">
        <h3>收货地址</h3>
        <el-button type="primary" link @click="showNewAddressForm">新增地址</el-button>
      </div>

      <div class="address-list" v-if="savedAddresses.length > 0">
        <el-radio-group v-model="selectedAddressId">
          <div v-for="address in savedAddresses" :key="address.id" class="address-item">
            <el-radio :label="address.id">
              <div class="address-content">
                <div class="address-info">
                  <div class="user-info">
                    <span class="name">{{ address.name }}</span>
                    <span class="phone">{{ address.phone }}</span>
                    <el-tag size="small" type="success" v-if="address.isDefault">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.province }} {{ address.city }} {{ address.district }}
                    {{ address.detailAddress }}
                  </div>
                </div>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>

      <!-- 添加新地址表单 -->
      <el-collapse-transition>
        <div v-if="showAddressForm" class="new-address-form">
          <el-form :model="addressForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收货人" required>
                  <el-input
                    v-model="addressForm.name"
                    placeholder="请输入收货人姓名"
                    prefix-icon="User"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号码" required>
                  <el-input
                    v-model="addressForm.phone"
                    placeholder="请输入手机号码"
                    prefix-icon="Phone"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" required>
                  <el-input v-model="addressForm.province" placeholder="省份" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" required>
                  <el-input v-model="addressForm.city" placeholder="城市" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区/县" required>
                  <el-input v-model="addressForm.district" placeholder="区/县" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址" required>
              <el-input
                v-model="addressForm.detailAddress"
                type="textarea"
                :rows="2"
                placeholder="街道、门牌号等详细地址"
                prefix-icon="Location"
              />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveAddress">保存</el-button>
              <el-button @click="showAddressForm = false">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 支付方式 -->
    <div class="checkout-section">
      <h3>支付方式</h3>
      <el-radio-group v-model="paymentMethod" class="payment-methods">
        <el-radio label="alipay">
          <div class="payment-method">
            <img src="https://via.placeholder.com/40?text=Alipay" alt="支付宝" />
            <span>支付宝</span>
          </div>
        </el-radio>
        <el-radio label="wechat">
          <div class="payment-method">
            <img src="https://via.placeholder.com/40?text=WeChat" alt="微信支付" />
            <span>微信支付</span>
          </div>
        </el-radio>
        <el-radio label="creditcard">
          <div class="payment-method">
            <el-icon><CreditCard /></el-icon>
            <span>银行卡</span>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 订单备注 -->
    <div class="checkout-section">
      <h3>订单备注</h3>
      <el-input type="textarea" :rows="2" placeholder="可以告诉我们您的特殊要求" v-model="remarks">
      </el-input>
    </div>

    <!-- 订单金额 -->
    <div class="checkout-section order-amount">
      <div class="amount-item">
        <span>商品总价：</span>
        <span>¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
      <div class="amount-item">
        <span>运费：</span>
        <span>¥0.00</span>
      </div>
      <div class="amount-item total">
        <span>应付总额：</span>
        <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 提交订单 -->
    <div class="checkout-footer">
      <div class="selected-address" v-if="getSelectedAddress()">
        <el-icon><Location /></el-icon>
        <span
          >收货地址：{{ getSelectedAddress().name }} {{ getSelectedAddress().phone }}
          {{ getSelectedAddress().province }} {{ getSelectedAddress().city }}
          {{ getSelectedAddress().district }} {{ getSelectedAddress().detailAddress }}</span
        >
      </div>
      <div class="total-payment">
        <span>应付总额：</span>
        <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
      <el-button type="primary" size="large" @click="submitOrder">提交订单</el-button>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.checkout-header h2 {
  color: #2b6fc2;
  margin: 0;
}

.checkout-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.checkout-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
}

/* 商品信息样式 */
.product-info {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  margin-bottom: 5px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
}

.product-quantity {
  color: #666;
  margin-top: 5px;
}

.product-subtotal {
  font-weight: bold;
  text-align: right;
  min-width: 120px;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

/* 地址列表样式 */
.address-list {
  margin-bottom: 15px;
}

.address-item {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #2b6fc2;
}

.address-content {
  padding-left: 5px;
}

.user-info {
  margin-bottom: 5px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.phone {
  color: #666;
  margin-right: 10px;
}

.address-detail {
  color: #666;
}

/* 支付方式样式 */
.payment-methods {
  display: flex;
  flex-wrap: wrap;
}

.payment-method {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.payment-method img,
.payment-method .el-icon {
  margin-right: 5px;
}

/* 订单金额样式 */
.order-amount {
  text-align: right;
}

.amount-item {
  margin-bottom: 10px;
}

.total {
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

/* 提交订单栏 */
.checkout-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.selected-address {
  flex: 1;
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
  margin-right: 20px;
}

.selected-address .el-icon {
  margin-right: 5px;
  color: #2b6fc2;
}

.total-payment {
  margin-right: 20px;
  font-size: 16px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .selected-address {
    margin-bottom: 15px;
  }

  .total-payment {
    margin-bottom: 15px;
    margin-right: 0;
  }
}
</style>
