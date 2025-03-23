import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCartStore = defineStore(
  'cart',
  () => {
    // 购物车商品列表
    const cartItems = ref([])

    // 添加商品到购物车
    const addToCart = (product) => {
      // 检查商品是否已存在于购物车中
      const existingItem = cartItems.value.find((item) => item.id === product.id)

      if (existingItem) {
        // 如果已存在，则增加数量
        existingItem.quantity += 1
      } else {
        // 如果不存在，则添加新商品
        cartItems.value.push({
          ...product,
          quantity: 1,
        })
      }
    }

    // 从购物车移除商品
    const removeFromCart = (productId) => {
      const index = cartItems.value.findIndex((item) => item.id === productId)
      if (index !== -1) {
        cartItems.value.splice(index, 1)
      }
    }

    // 更新购物车中商品的数量
    const updateCartItemQuantity = (productId, quantity) => {
      const item = cartItems.value.find((item) => item.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity) // 确保数量至少为1
      }
    }

    // 清空购物车
    const clearCart = () => {
      cartItems.value = []
    }

    // 计算购物车中商品的总数量
    const totalItems = () => {
      return cartItems.value.reduce((total, item) => total + item.quantity, 0)
    }

    // 计算购物车中商品的总价格
    const totalPrice = () => {
      return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    return {
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }
  },
  {
    persist: true, // 持久化存储购物车数据
  },
)
