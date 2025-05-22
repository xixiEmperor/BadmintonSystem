import request from '@/utils/request'

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export function getCartList() {
  return request({
    url: '/api/cart',
    method: 'get'
  })
}

/**
 * 添加商品到购物车
 * @param {Object} data - 购物车商品信息
 * @param {number} data.productId - 商品ID
 * @param {number} data.quantity - 商品数量
 * @param {Object} data.specs - 商品规格，无规格商品传空对象
 * @returns {Promise}
 */
export function addToCart(data) {
  return request({
    url: '/api/cart',
    method: 'post',
    data
  })
}

/**
 * 更新购物车商品数量
 * @param {number} productId - 商品ID
 * @param {Object} data - 更新信息
 * @param {number} data.quantity - 更新后的数量
 * @param {Object} data.specs - 商品规格信息(可选)
 * @returns {Promise}
 */
export function updateCartItem(productId, data) {
  return request({
    url: `/api/cart/${productId}`,
    method: 'put',
    data
  })
}

/**
 * 删除购物车商品
 * @param {number} productId - 商品ID
 * @param {Object} data - 商品规格信息
 * @param {Object} data.specs - 商品规格
 * @returns {Promise}
 */
export function removeCartItem(productId, data) {
  return request({
    url: `/api/cart/${productId}`,
    method: 'delete',
    data
  })
}

/**
 * 选择/取消选择单个商品
 * @param {number} productId - 商品ID
 * @param {Object} data - 选择信息
 * @param {boolean} data.selected - 是否选中
 * @param {Object} data.specs - 商品规格信息
 * @returns {Promise}
 */
export function selectCartItem(productId, data) {
  return request({
    url: `/api/cart/select/${productId}`,
    method: 'put',
    data
  })
}

/**
 * 全选/取消全选购物车商品
 * @param {boolean} selected - 是否全选
 * @returns {Promise}
 */
export function selectAllCartItems(selected) {
  return request({
    url: '/api/cart/select-all',
    method: 'put',
    data: { selected }
  })
}

/**
 * 清空购物车
 * @returns {Promise}
 */
export function clearCart() {
  return request({
    url: '/api/cart',
    method: 'delete'
  })
}
