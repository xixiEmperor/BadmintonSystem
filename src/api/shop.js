import request from '@/utils/request'

// 1. 商品分类接口
/**
 * 获取商品分类列表
 * @returns {Promise} 返回所有有效的商品分类
 */
export function getCategories() {
  return request.get('/api/mall/categories')
}

// 2. 商品接口
/**
 * 获取商品列表
 * @param {Object} params 查询参数
 * @param {String} params.categoryId 分类ID，默认值为"all"，表示所有分类
 * @param {String} params.keyword 搜索关键词，匹配商品名称或副标题
 * @param {Number} params.pageNum 页码，默认为1
 * @param {Number} params.pageSize 每页数量，默认为10
 * @param {String} params.orderBy 排序方式：price_asc（价格升序）、price_desc（价格降序）、sales_desc（销量降序）
 * @returns {Promise} 返回商品列表数据
 */
export function getProducts(params) {
  return request.get('/api/mall/products', { params })
}

/**
 * 获取商品列表
 * @param {Object} params 查询参数
 * @param {String} params.categoryId 分类ID，默认值为"all"，表示所有分类
 * @param {String} params.keyword 搜索关键词，匹配商品名称或副标题
 * @param {Number} params.pageNum 页码，默认为1
 * @param {Number} params.pageSize 每页数量，默认为10
 * @param {String} params.orderBy 排序方式：price_asc（价格升序）、price_desc（价格降序）、sales_desc（销量降序）
 * @returns {Promise} 返回商品列表数据
 */
export function getProductsByAdmin(params) {
  return request.get('/api/mall/admin/products', { params })
}

/**
 * 获取商品详情
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回商品详细信息
 */
export function getProductDetail(productId) {
  return request.get(`/api/mall/products/${productId}`)
}

/**
 * 上传商品图片
 * @param {FormData} formData 包含商品图片的表单数据
 * @returns {Promise} 返回上传成功的图片URL
 */
export function uploadProductImages(formData) {
  return request.post('/api/mall/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 添加商品
 * @param {Object} productData 商品数据
 * @returns {Promise} 返回添加结果
 */
export function addProduct(productData) {
  return request.post('/api/mall/products', productData)
}

/**
 * 更新商品
 * @param {Number} productId 商品ID
 * @param {Object} productData 更新的商品数据
 * @returns {Promise} 返回更新结果
 */
export function updateProduct(productId, productData) {
  return request.put(`/api/mall/products/${productId}`, productData)
}

/**
 * 商品上架
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回上架结果
 */
export function onSaleProduct(productId) {
  return request.put(`/api/mall/products/${productId}/on_sale`)
}

/**
 * 商品下架
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回下架结果
 */
export function offSaleProduct(productId) {
  return request.put(`/api/mall/products/${productId}/off_sale`)
}

/**
 * 删除商品
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回删除结果
 */
export function deleteProduct(productId) {
  return request.delete(`/api/mall/products/${productId}`)
}

/**
 * 更新商品库存
 * @param {Number} productId 商品ID
 * @param {Number} stock 新的库存数量
 * @returns {Promise} 返回更新库存结果
 */
export function updateProductStock(productId, stock) {
  return request.put(`/api/mall/products/${productId}/stock`, { stock })
}

// 3. 商品规格接口
/**
 * 获取商品规格列表
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回规格列表
 */
export function getProductSpecifications(productId) {
  return request.get(`/api/mall/products/${productId}/specifications`)
}

/**
 * 根据规格条件获取特定商品规格
 * @param {Number} productId 商品ID
 * @param {Object} specifications 规格条件，如{"color":"红色","size":"S"}
 * @returns {Promise} 返回匹配的规格信息
 */
export function getProductSpecification(productId, specifications) {
  return request.post(`/api/mall/products/${productId}/specification`, specifications)
}

/**
 * 获取商品规格选项
 * @param {Number} productId 商品ID
 * @returns {Promise} 返回规格选项列表
 */
export function getProductSpecOptions(productId) {
  return request.get(`/api/mall/products/${productId}/spec_options`)
}

/**
 * 添加商品规格
 * @param {Number} productId 商品ID
 * @param {Object} specData 规格数据
 * @param {Object} specData.specifications 规格信息，如{"color":"红色","size":"S"}
 * @param {Number} specData.priceAdjustment 价格调整
 * @param {Number} specData.stock 该规格库存
 * @param {Number} specData.status 状态：1-正常，0-禁用，默认为1
 * @returns {Promise} 返回添加结果
 */
export function addProductSpecification(productId, specData) {
  return request.post(`/api/mall/products/${productId}/specifications`, specData)
}

/**
 * 更新商品规格
 * @param {Number} specificationId 规格ID
 * @param {Object} specData 更新的规格数据
 * @returns {Promise} 返回更新结果
 */
export function updateSpecification(specificationId, specData) {
  return request.put(`/api/mall/specifications/${specificationId}`, specData)
}

/**
 * 删除商品规格
 * @param {Number} specificationId 规格ID
 * @returns {Promise} 返回删除结果
 */
export function deleteSpecification(specificationId) {
  return request.delete(`/api/mall/specifications/${specificationId}`)
}

/**
 * 更新商品规格库存
 * @param {Number} specificationId 规格ID
 * @param {Number} stock 新的库存数量
 * @returns {Promise} 返回更新库存结果
 */
export function updateSpecificationStock(specificationId, stock) {
  return request.put(`/api/mall/specifications/${specificationId}/stock`, { stock })
}
