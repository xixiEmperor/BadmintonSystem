import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getCartList,
  updateCartItem,
  removeCartItem,
  selectCartItem,
  selectAllCartItems,
  clearCart as apiClearCart,
  addToCart as apiAddToCart
} from '@/api/cart'

// 定义购物车store
export const useCartStore = defineStore('cart', () => {
  // 购物车列表
  const cartItems = ref([])
  // 全选状态
  const isAllSelected = ref(false)
  // 加载状态
  const loading = ref(false)
  // 是否已初始化（从后端获取过数据）
  const initialized = ref(false)

  // 总数量
  const totalCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 已选商品总价
  const totalPrice = computed(() => {
    return cartItems.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.totalPrice, 0)
  })

  // 已选商品数量
  const selectedCount = computed(() => {
    return cartItems.value.filter(item => item.selected).length
  })

  // 获取购物车列表（从后端）
  async function fetchCartList() {
    if (loading.value) return

    loading.value = true
    try {
      const response = await getCartList()
      if (response.data.code === 0) {
        cartItems.value = response.data.data.cartItems || []
        isAllSelected.value = response.data.data.allSelected || false
        initialized.value = true
        return true
      } else {
        throw new Error(response.data.message || '获取购物车失败')
      }
    } catch (error) {
      console.error('获取购物车失败:', error)
      ElMessage.error('获取购物车失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 初始化购物车数据
  async function initCart() {
    if (!initialized.value) {
      await fetchCartList()
    }
  }

  // 添加商品到购物车
  async function addToCart(item) {
    console.log('添加到购物车:', item)

    // 检查是否有规格
    const isSpecItem = item.specificationId !== undefined

    // 查找购物车中是否已有该商品
    const existingItemIndex = cartItems.value.findIndex(cartItem => {
      if (isSpecItem) {
        return cartItem.productId === item.productId && cartItem.specificationId === item.specificationId
      } else {
        return cartItem.productId === item.productId && !cartItem.specificationId
      }
    })

    // 备份当前状态
    const backupItems = JSON.parse(JSON.stringify(cartItems.value))

    try {
      // 先更新 Pinia 状态
      if (existingItemIndex >= 0) {
        const existingItem = cartItems.value[existingItemIndex]
        if (existingItem.quantity + item.quantity > existingItem.stock) {
          ElMessage.warning('已达到最大库存数量')
          return false
        }
        existingItem.quantity += item.quantity
        existingItem.totalPrice = existingItem.productPrice * existingItem.quantity
      } else {
        cartItems.value.push({
          ...item,
          quantity: item.quantity,
          selected: true,
          totalPrice: item.productPrice * item.quantity
        })
      }

      // 异步调用 API
      const data = {
        productId: item.productId,
        quantity: item.quantity
      }
      if (item.specificationId) {
        data.specs = item.specs
      }

      await apiAddToCart(data)
      return true
    } catch (error) {
      // API 失败，回滚状态
      cartItems.value = backupItems
      console.error('添加到购物车失败:', error)
      ElMessage.error('添加到购物车失败')
      return false
    }
  }

  // 更新商品数量
  async function updateItemQuantity(item, newQuantity) {
    if (newQuantity <= 0) {
      return await removeFromCart(item)
    }

    if (newQuantity > item.stock) {
      ElMessage.warning(`商品"${item.productName}"已达到最大库存数量(${item.stock})`)
      return false
    }

    // 备份当前状态
    const backupQuantity = item.quantity
    const backupTotalPrice = item.totalPrice

    try {
      // 先更新 Pinia 状态
      item.quantity = newQuantity
      item.totalPrice = item.productPrice * newQuantity

      // 异步调用 API
      const data = { quantity: newQuantity }
      if (item.specificationId) {
        data.specs = item.specs
      }

      await updateCartItem(item.productId, data)
      return true
    } catch (error) {
      // API 失败，回滚状态
      item.quantity = backupQuantity
      item.totalPrice = backupTotalPrice
      console.error('更新数量失败:', error)
      ElMessage.error('更新数量失败')
      return false
    }
  }

  // 增加商品数量
  async function increaseQuantity(item) {
    return await updateItemQuantity(item, item.quantity + 1)
  }

  // 减少商品数量
  async function decreaseQuantity(item) {
    return await updateItemQuantity(item, item.quantity - 1)
  }

  // 从购物车中移除商品
  async function removeFromCart(item) {
    // 备份当前状态
    const backupItems = JSON.parse(JSON.stringify(cartItems.value))
    const itemIndex = cartItems.value.findIndex(cartItem => {
      if (item.specificationId) {
        return cartItem.productId === item.productId && cartItem.specificationId === item.specificationId
      } else {
        return cartItem.productId === item.productId && !cartItem.specificationId
      }
    })

    if (itemIndex === -1) return false

    try {
      // 先更新 Pinia 状态
      cartItems.value.splice(itemIndex, 1)

      // 异步调用 API
      const data = {}
      if (item.specificationId) {
        data.specs = item.specs
      }

      await removeCartItem(item.productId, data)
      ElMessage.success('商品已从购物车中移除')
      return true
    } catch (error) {
      // API 失败，回滚状态
      cartItems.value = backupItems
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
      return false
    }
  }

  // 选择/取消选择单个商品
  async function toggleSelectItem(item) {
    // 备份当前状态
    const backupSelected = item.selected

    try {
      // 检查是否需要更新全选状态
      updateAllSelectedState()

      // 异步调用 API
      const data = { selected: item.selected }
      if (item.specificationId) {
        data.specs = item.specs
      }

      await selectCartItem(item.productId, data)
      return true
    } catch (error) {
      // API 失败，回滚状态
      item.selected = backupSelected
      updateAllSelectedState()
      console.error('更新选择状态失败:', error)
      ElMessage.error('更新选择状态失败')
      return false
    }
  }

  // 全选/取消全选
  async function toggleSelectAll() {
    // 备份当前状态
    const backupItems = cartItems.value.map(item => ({ ...item }))
    const backupAllSelected = isAllSelected.value

    try {
      cartItems.value.forEach(item => {
        item.selected = isAllSelected.value
      })

      // 异步调用 API
      await selectAllCartItems(isAllSelected.value)
      return true
    } catch (error) {
      // API 失败，回滚状态
      cartItems.value = backupItems
      isAllSelected.value = backupAllSelected
      console.error('更新全选状态失败:', error)
      ElMessage.error('更新全选状态失败')
      return false
    }
  }

  // 更新全选状态
  function updateAllSelectedState() {
    if (cartItems.value.length === 0) {
      isAllSelected.value = false
    } else {
      isAllSelected.value = cartItems.value.every(item => item.selected)
    }
  }

  // 清空购物车
  async function clearCart() {
    // 备份当前状态
    const backupItems = JSON.parse(JSON.stringify(cartItems.value))
    const backupAllSelected = isAllSelected.value

    try {
      // 先更新 Pinia 状态
      cartItems.value = []
      isAllSelected.value = false

      // 异步调用 API
      await apiClearCart()
      ElMessage.success('购物车已清空')
      return true
    } catch (error) {
      // API 失败，回滚状态
      cartItems.value = backupItems
      isAllSelected.value = backupAllSelected
      console.error('清空购物车失败:', error)
      ElMessage.error('清空购物车失败')
      return false
    }
  }

  // 获取已选商品
  function getSelectedItems() {
    return cartItems.value.filter(item => item.selected)
  }

  return {
    // 状态
    cartItems,
    isAllSelected,
    loading,
    initialized,

    // 计算属性
    totalCount,
    totalPrice,
    selectedCount,

    // 方法
    fetchCartList,
    initCart,
    addToCart,
    updateItemQuantity,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    toggleSelectItem,
    toggleSelectAll,
    clearCart,
    getSelectedItems
  }
}, {
  persist: {
    // 只持久化基本数据，不持久化加载状态
    paths: ['cartItems', 'isAllSelected', 'initialized']
  }
})
