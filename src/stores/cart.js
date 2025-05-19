import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 定义购物车store
export const useCartStore = defineStore('cart', () => {
  // 购物车列表
  const cartItems = ref([])

  // 总数量
  const totalCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 总价
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // 添加商品到购物车
  function addToCart(item) {
    // 检查是否有规格
    const isSpecItem = item.specificationId !== undefined

    // 查找购物车中是否已有该商品
    const existingItemIndex = cartItems.value.findIndex(cartItem => {
      if (isSpecItem) {
        // 有规格的商品，需要匹配productId和specificationId
        return cartItem.productId === item.productId && cartItem.specificationId === item.specificationId
      } else {
        // 无规格的商品，只需匹配productId
        return cartItem.productId === item.productId && !cartItem.specificationId
      }
    })

    if (existingItemIndex >= 0) {
      // 已存在该商品，增加数量
      const existingItem = cartItems.value[existingItemIndex]

      // 检查库存
      if (existingItem.quantity + 1 > existingItem.stock) {
        ElMessage.warning('已达到最大库存数量')
        return false
      }

      existingItem.quantity += 1
      // 复制一个新数组以触发响应式更新
      cartItems.value = [...cartItems.value]
    } else {
      // 不存在，添加新商品
      cartItems.value.push({
        ...item,
        quantity: 1
      })
    }

    // 保存到本地存储
    saveToLocalStorage()
    return true
  }

  // 从购物车中移除商品
  function removeFromCart(index) {
    cartItems.value.splice(index, 1)
    saveToLocalStorage()
  }

  // 更新购物车商品数量
  function updateItemQuantity(index, quantity) {
    const item = cartItems.value[index]

    // 检查库存
    if (quantity > item.stock) {
      ElMessage.warning('超出库存数量')
      return false
    }

    if (quantity <= 0) {
      // 数量为0时，移除商品
      removeFromCart(index)
    } else {
      // 更新数量
      item.quantity = quantity
      // 复制一个新数组以触发响应式更新
      cartItems.value = [...cartItems.value]
    }

    saveToLocalStorage()
    return true
  }

  // 清空购物车
  function clearCart() {
    cartItems.value = []
    saveToLocalStorage()
  }

  // 保存到本地存储
  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  }

  // 从本地存储加载
  function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        cartItems.value = JSON.parse(savedCart)
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
        cartItems.value = []
      }
    }
  }

  // 初始化时从本地存储加载
  loadFromLocalStorage()

  return {
    cartItems,
    totalCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart
  }
})
