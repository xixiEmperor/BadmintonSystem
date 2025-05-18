# 羽毛球系统商城模块API文档

## 1. 商品分类接口

### 1.1 获取商品分类列表

**接口描述**：获取所有有效的商品分类

**请求URL**：`/api/mall/categories`

**请求方式**：`GET`

**请求参数**：无

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Array | 分类列表 |
| &emsp;id | Integer | 分类ID |
| &emsp;name | String | 分类名称 |
| &emsp;status | Integer | 分类状态：1-正常，2-已废弃 |
| &emsp;sortOrder | Integer | 排序编号 |
| &emsp;createTime | Date | 创建时间 |
| &emsp;updateTime | Date | 更新时间 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": [
    {
      "id": 100001,
      "name": "球拍",
      "status": 1,
      "sortOrder": 1,
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    },
    {
      "id": 100002,
      "name": "羽毛球",
      "status": 1,
      "sortOrder": 2,
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    }
  ]
}
```

## 2. 商品接口

### 2.1 获取商品列表

**接口描述**：获取商品列表，支持分类筛选、关键词搜索、排序和分页

**请求URL**：`/api/mall/products`

**请求方式**：`GET`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| categoryId | 否 | String | 分类ID，默认值为"all"，表示所有分类 |
| keyword | 否 | String | 搜索关键词，匹配商品名称或副标题 |
| pageNum | 否 | Integer | 页码，默认为1 |
| pageSize | 否 | Integer | 每页数量，默认为10 |
| orderBy | 否 | String | 排序方式：price_asc（价格升序）、price_desc（价格降序）、sales_desc（销量降序） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Object | 商品列表数据 |
| &emsp;pageNum | Integer | 当前页码 |
| &emsp;pageSize | Integer | 每页数量 |
| &emsp;size | Integer | 当前页实际数量 |
| &emsp;total | Long | 总数量 |
| &emsp;list | Array | 商品列表 |
| &emsp;&emsp;id | Integer | 商品ID |
| &emsp;&emsp;categoryId | Integer | 分类ID |
| &emsp;&emsp;categoryName | String | 分类名称 |
| &emsp;&emsp;name | String | 商品名称 |
| &emsp;&emsp;subtitle | String | 商品副标题 |
| &emsp;&emsp;mainImage | String | 主图URL |
| &emsp;&emsp;price | Decimal | 价格 |
| &emsp;&emsp;sales | Integer | 销量 |
| &emsp;&emsp;status | Integer | 状态：1-在售，2-下架 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": {
    "pageNum": 1,
    "pageSize": 10,
    "size": 2,
    "total": 2,
    "list": [
      {
        "id": 1,
        "categoryId": 100001,
        "categoryName": "球拍",
        "name": "YONEX弓箭11",
        "subtitle": "专业比赛羽毛球拍",
        "mainImage": "http://example.com/images/1.jpg",
        "price": 850.00,
        "sales": 128,
        "status": 1
      },
      {
        "id": 2,
        "categoryId": 100002,
        "categoryName": "羽毛球",
        "name": "YONEX AS-50",
        "subtitle": "耐打比赛用球",
        "mainImage": "http://example.com/images/2.jpg",
        "price": 120.00,
        "sales": 256,
        "status": 1
      }
    ]
  }
}
```

### 2.2 获取商品详情

**接口描述**：获取商品详细信息

**请求URL**：`/api/mall/products/{productId}`

**请求方式**：`GET`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Object | 商品详情 |
| &emsp;id | Integer | 商品ID |
| &emsp;categoryId | Integer | 分类ID |
| &emsp;categoryName | String | 分类名称 |
| &emsp;name | String | 商品名称 |
| &emsp;subtitle | String | 商品副标题 |
| &emsp;mainImage | String | 主图URL |
| &emsp;subImages | String | 子图URL，逗号分隔 |
| &emsp;detail | String | 商品详情，支持HTML |
| &emsp;price | Decimal | 价格 |
| &emsp;stock | Integer | 库存 |
| &emsp;sales | Integer | 销量 |
| &emsp;status | Integer | 状态：1-在售，2-下架 |
| &emsp;hasSpecification | Integer | 是否有规格：0-无规格，1-有规格 |
| &emsp;specifications | Array | 商品规格列表，hasSpecification=1时返回 |
| &emsp;&emsp;id | Integer | 规格ID |
| &emsp;&emsp;specifications | Object | 规格信息，如{"color":"红色","size":"S"} |
| &emsp;&emsp;priceAdjustment | Decimal | 价格调整 |
| &emsp;&emsp;stock | Integer | 该规格库存 |
| &emsp;specOptions | Object | 规格选项，如{"color":["红色","蓝色"],"size":["S","M","L"]} |
| &emsp;createTime | Date | 创建时间 |
| &emsp;updateTime | Date | 更新时间 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "categoryId": 100001,
    "categoryName": "球拍",
    "name": "YONEX弓箭11",
    "subtitle": "专业比赛羽毛球拍",
    "mainImage": "http://example.com/images/1.jpg",
    "subImages": "http://example.com/images/1_1.jpg,http://example.com/images/1_2.jpg",
    "detail": "<p>商品详情，支持HTML</p>",
    "price": 850.00,
    "stock": 100,
    "sales": 128,
    "status": 1,
    "hasSpecification": 1,
    "specifications": [
      {
        "id": 1,
        "specifications": {"color": "红色", "size": "S"},
        "priceAdjustment": 0.00,
        "stock": 30
      },
      {
        "id": 2,
        "specifications": {"color": "蓝色", "size": "M"},
        "priceAdjustment": 10.00,
        "stock": 20
      }
    ],
    "specOptions": {
      "color": ["红色", "蓝色", "黑色"],
      "size": ["S", "M", "L"]
    },
    "createTime": "2023-05-10 12:00:00",
    "updateTime": "2023-05-10 12:00:00"
  }
}
```

### 2.3 上传商品图片

**接口描述**：上传商品图片（需要管理员权限）

**请求URL**：`/api/mall/products/upload`

**请求方式**：`POST`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| mainImage | 是 | File | 商品主图 |
| subImages | 否 | File[] | 商品子图，可多个 |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | String | 上传成功的图片JSON字符串，包含图片URL |

**响应示例**：

```json
{
  "status": 0,
  "msg": "上传成功",
  "data": "{\"mainImage\":\"http://example.com/images/1.jpg\",\"subImages\":[\"http://example.com/images/1_1.jpg\",\"http://example.com/images/1_2.jpg\"]}"
}
```

### 2.4 添加商品

**接口描述**：添加新商品（需要管理员权限）

**请求URL**：`/api/mall/products`

**请求方式**：`POST`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| categoryId | 是 | Integer | 分类ID |
| name | 是 | String | 商品名称 |
| subtitle | 否 | String | 商品副标题 |
| mainImage | 是 | String | 主图URL，通过上传图片接口获取 |
| subImages | 否 | String | 子图URL，通过上传图片接口获取，多张图片用逗号分隔 |
| detail | 否 | String | 商品详情，支持HTML |
| price | 是 | Decimal | 价格，必须大于0 |
| stock | 是 | Integer | 库存，必须大于等于0 |
| status | 否 | Integer | 状态：1-在售，2-下架，默认为1 |

**请求示例**：

```json
{
  "categoryId": 100001,
  "name": "YONEX弓箭11",
  "subtitle": "专业比赛羽毛球拍",
  "mainImage": "http://example.com/images/1.jpg",
  "subImages": "http://example.com/images/1_1.jpg,http://example.com/images/1_2.jpg",
  "detail": "<p>商品详情，支持HTML</p>",
  "price": 850.00,
  "stock": 100,
  "status": 1
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Object | 返回数据 |
| &emsp;productId | Integer | 新添加的商品ID |

**响应示例**：

```json
{
  "status": 0,
  "msg": "添加商品成功",
  "data": {
    "productId": 1
  }
}
```

### 2.5 更新商品

**接口描述**：更新商品信息（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |
| categoryId | 否 | Integer | 分类ID |
| name | 否 | String | 商品名称 |
| subtitle | 否 | String | 商品副标题 |
| mainImage | 否 | String | 主图URL |
| subImages | 否 | String | 子图URL，多张图片用逗号分隔 |
| detail | 否 | String | 商品详情，支持HTML |
| price | 否 | Decimal | 价格，必须大于0 |
| stock | 否 | Integer | 库存，必须大于等于0 |
| status | 否 | Integer | 状态：1-在售，2-下架 |

**请求示例**：

```json
{
  "name": "YONEX弓箭11 Pro",
  "subtitle": "专业比赛羽毛球拍升级版",
  "price": 899.00
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "更新商品成功",
  "data": null
}
```

### 2.6 商品上架

**接口描述**：将商品状态改为在售（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}/on_sale`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "上架商品成功",
  "data": null
}
```

### 2.7 商品下架

**接口描述**：将商品状态改为下架（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}/off_sale`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "下架商品成功",
  "data": null
}
```

### 2.8 删除商品

**接口描述**：删除商品（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}`

**请求方式**：`DELETE`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "删除商品成功",
  "data": null
}
```

### 2.9 更新商品库存

**接口描述**：更新商品库存（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}/stock`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |
| stock | 是 | Integer | 新的库存数量，必须大于等于0 |

**请求示例**：

```json
{
  "stock": 50
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "更新库存成功",
  "data": null
}
```

## 3. 商品规格接口

### 3.1 获取商品规格列表

**接口描述**：获取商品的所有规格信息

**请求URL**：`/api/mall/products/{productId}/specifications`

**请求方式**：`GET`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Array | 规格列表 |
| &emsp;id | Integer | 规格ID |
| &emsp;productId | Integer | 商品ID |
| &emsp;specifications | Object | 规格信息，如{"color":"红色","size":"S"} |
| &emsp;priceAdjustment | Decimal | 价格调整，可以为负数表示折扣 |
| &emsp;stock | Integer | 该规格库存 |
| &emsp;sales | Integer | 该规格销量 |
| &emsp;status | Integer | 状态：1-正常，0-禁用 |
| &emsp;createTime | Date | 创建时间 |
| &emsp;updateTime | Date | 更新时间 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "specifications": {"color": "红色", "size": "S"},
      "priceAdjustment": 0.00,
      "stock": 30,
      "sales": 10,
      "status": 1,
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    },
    {
      "id": 2,
      "productId": 1,
      "specifications": {"color": "蓝色", "size": "M"},
      "priceAdjustment": 10.00,
      "stock": 20,
      "sales": 5,
      "status": 1,
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    }
  ]
}
```

### 3.2 根据规格条件获取特定商品规格

**接口描述**：根据规格条件（如颜色、尺寸等）获取匹配的商品规格信息

**请求URL**：`/api/mall/products/{productId}/specification`

**请求方式**：`POST`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |
| specifications | 是 | Object | 规格条件，如{"color":"红色","size":"S"} |

**请求示例**：

```json
{
  "color": "红色",
  "size": "S"
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Object | 规格信息 |
| &emsp;id | Integer | 规格ID |
| &emsp;productId | Integer | 商品ID |
| &emsp;specifications | Object | 规格信息，如{"color":"红色","size":"S"} |
| &emsp;priceAdjustment | Decimal | 价格调整 |
| &emsp;stock | Integer | 该规格库存 |
| &emsp;sales | Integer | 该规格销量 |
| &emsp;status | Integer | 状态 |
| &emsp;createTime | Date | 创建时间 |
| &emsp;updateTime | Date | 更新时间 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "productId": 1,
    "specifications": {"color": "红色", "size": "S"},
    "priceAdjustment": 0.00,
    "stock": 30,
    "sales": 10,
    "status": 1,
    "createTime": "2023-05-10 12:00:00",
    "updateTime": "2023-05-10 12:00:00"
  }
}
```

### 3.3 获取商品规格选项

**接口描述**：获取商品的规格选项，用于前端展示可选规格

**请求URL**：`/api/mall/products/{productId}/spec_options`

**请求方式**：`GET`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Array | 规格选项列表 |
| &emsp;id | Integer | 选项ID |
| &emsp;productId | Integer | 商品ID |
| &emsp;specKey | String | 规格类型，如"color"、"size" |
| &emsp;specValues | Array | 可选值列表，如["红色","蓝色","黑色"] |
| &emsp;createTime | Date | 创建时间 |
| &emsp;updateTime | Date | 更新时间 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "specKey": "color",
      "specValues": ["红色", "蓝色", "黑色"],
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    },
    {
      "id": 2,
      "productId": 1,
      "specKey": "size",
      "specValues": ["S", "M", "L"],
      "createTime": "2023-05-10 12:00:00",
      "updateTime": "2023-05-10 12:00:00"
    }
  ]
}
```

### 3.4 添加商品规格

**接口描述**：为商品添加规格（需要管理员权限）

**请求URL**：`/api/mall/products/{productId}/specifications`

**请求方式**：`POST`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| productId | 是 | Integer | 商品ID（路径参数） |
| specifications | 是 | Object | 规格信息，如{"color":"红色","size":"S"} |
| priceAdjustment | 是 | Decimal | 价格调整，可以为负数表示折扣 |
| stock | 是 | Integer | 该规格库存，必须大于等于0 |
| status | 否 | Integer | 状态：1-正常，0-禁用，默认为1 |

**请求示例**：

```json
{
  "specifications": {"color": "黑色", "size": "L"},
  "priceAdjustment": 20.00,
  "stock": 15
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | Object | 返回数据 |
| &emsp;specificationId | Integer | 新添加的规格ID |

**响应示例**：

```json
{
  "status": 0,
  "msg": "添加商品规格成功",
  "data": {
    "specificationId": 3
  }
}
```

### 3.5 更新商品规格

**接口描述**：更新商品规格信息（需要管理员权限）

**请求URL**：`/api/mall/specifications/{specificationId}`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| specificationId | 是 | Integer | 规格ID（路径参数） |
| specifications | 否 | Object | 规格信息，如{"color":"红色","size":"S"} |
| priceAdjustment | 否 | Decimal | 价格调整 |
| stock | 否 | Integer | 库存，必须大于等于0 |
| status | 否 | Integer | 状态：1-正常，0-禁用 |

**请求示例**：

```json
{
  "priceAdjustment": 15.00,
  "stock": 25
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "更新商品规格成功",
  "data": null
}
```

### 3.6 删除商品规格

**接口描述**：删除商品规格（需要管理员权限）

**请求URL**：`/api/mall/specifications/{specificationId}`

**请求方式**：`DELETE`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| specificationId | 是 | Integer | 规格ID（路径参数） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "删除商品规格成功",
  "data": null
}
```

### 3.7 更新商品规格库存

**接口描述**：更新商品规格库存（需要管理员权限）

**请求URL**：`/api/mall/specifications/{specificationId}/stock`

**请求方式**：`PUT`

**请求参数**：

| 参数名 | 必选 | 类型 | 说明 |
| ------ | ------ | ------ | ------ |
| specificationId | 是 | Integer | 规格ID（路径参数） |
| stock | 是 | Integer | 新的库存数量，必须大于等于0 |

**请求示例**：

```json
{
  "stock": 50
}
```

**响应参数**：

| 参数名 | 类型 | 说明 |
| ------ | ------ | ------ |
| status | Integer | 响应状态码，0表示成功 |
| msg | String | 响应消息 |
| data | null | 无返回数据 |

**响应示例**：

```json
{
  "status": 0,
  "msg": "更新规格库存成功",
  "data": null
}
```

## 3. 错误码说明

| 错误码 | 说明 |
| ------ | ------ |
| 0 | 成功 |
| 401 | 未登录 |
| 4001 | 参数错误，分类不存在 |
| 4002 | 参数错误，排序方式无效 |
| 4003 | 没有权限进行此操作/商品不存在或已下架 |
| 4004 | 参数验证错误（如：主图不能为空，商品名称不能为空等） |
| 5000 | 操作失败 |
| 999 | 服务器错误 |


## 前端实现指南

### 1. 商品展示功能

#### 商品分类展示
1. 使用`GET /api/mall/categories`获取所有有效商品分类
2. 将分类列表渲染为导航菜单或筛选选项
3. 实现示例:
```javascript
// 获取分类列表
axios.get('/api/mall/categories')
  .then(response => {
    if(response.data.status === 0) {
      this.categories = response.data.data;
    }
  })
  .catch(error => {
    console.error('获取分类失败:', error);
  });
```

#### 商品列表展示
1. 使用`GET /api/mall/products`获取商品列表，支持分页、搜索和排序
2. 实现筛选面板，包含分类选择、关键词搜索和排序选项
3. 实现分页控件，显示当前页码和跳转功能
4. 实现示例:
```javascript
// 获取商品列表
function getProductList(params = {}) {
  const defaultParams = {
    categoryId: 'all',
    pageNum: 1,
    pageSize: 10
  };
  const queryParams = {...defaultParams, ...params};
  
  axios.get('/api/mall/products', {params: queryParams})
    .then(response => {
      if(response.data.status === 0) {
        this.products = response.data.data.list;
        this.pagination = {
          pageNum: response.data.data.pageNum,
          pageSize: response.data.data.pageSize,
          total: response.data.data.total
        };
      }
    })
    .catch(error => {
      console.error('获取商品列表失败:', error);
    });
}
```

#### 商品详情展示
1. 使用`GET /api/mall/products/{productId}`获取商品详情
2. 展示商品详细信息，包括图片、价格、库存等
3. 显示商品详情HTML内容（注意安全处理）
4. 实现示例:
```javascript
// 获取商品详情
function getProductDetail(productId) {
  axios.get(`/api/mall/products/${productId}`)
    .then(response => {
      if(response.data.status === 0) {
        this.productDetail = response.data.data;
        // 解析子图列表
        if(this.productDetail.subImages) {
          this.subImageList = this.productDetail.subImages.split(',');
        }
      }
    })
    .catch(error => {
      console.error('获取商品详情失败:', error);
    });
}
```

### 2. 商品管理功能（管理员）

#### 上传商品图片
1. 创建表单上传组件，支持选择主图和多个子图
2. 使用`POST /api/mall/products/upload`上传图片
3. 将返回的图片URL保存用于商品添加/编辑
4. 实现示例:
```javascript
// 上传商品图片
function uploadProductImages(formData) {
  axios.post('/api/mall/products/upload', formData, {
    headers: {'Content-Type': 'multipart/form-data'}
  })
    .then(response => {
      if(response.data.status === 0) {
        // 解析JSON字符串获取图片URL
        const imageData = JSON.parse(response.data.data);
        this.mainImageUrl = imageData.mainImage;
        this.subImageUrls = imageData.subImages.join(',');
      }
    })
    .catch(error => {
      console.error('上传图片失败:', error);
    });
}
```

#### 添加商品
1. 创建商品表单，包含分类选择、名称、价格等字段
2. 集成图片上传功能
3. 使用`POST /api/mall/products`添加商品
4. 实现示例:
```javascript
// 添加商品
function addProduct(productData) {
  axios.post('/api/mall/products', productData)
    .then(response => {
      if(response.data.status === 0) {
        this.$message.success('添加商品成功');
        this.productId = response.data.data.productId;
        // 跳转到商品列表或详情页
      }
    })
    .catch(error => {
      console.error('添加商品失败:', error);
    });
}
```

#### 编辑商品
1. 创建与添加商品相似的表单，但预填充现有商品数据
2. 使用`PUT /api/mall/products/{productId}`更新商品
3. 实现示例:
```javascript
// 更新商品
function updateProduct(productId, productData) {
  axios.put(`/api/mall/products/${productId}`, productData)
    .then(response => {
      if(response.data.status === 0) {
        this.$message.success('更新商品成功');
        // 刷新商品数据或返回列表
      }
    })
    .catch(error => {
      console.error('更新商品失败:', error);
    });
}
```

#### 商品状态管理
1. 实现上架/下架按钮
2. 使用`PUT /api/mall/products/{productId}/on_sale`和`PUT /api/mall/products/{productId}/off_sale`切换状态
3. 实现示例:
```javascript
// 上架商品
function onSaleProduct(productId) {
  axios.put(`/api/mall/products/${productId}/on_sale`)
    .then(response => {
      if(response.data.status === 0) {
        this.$message.success('商品上架成功');
        // 刷新商品状态
      }
    })
    .catch(error => {
      console.error('商品上架失败:', error);
    });
}

// 下架商品
function offSaleProduct(productId) {
  axios.put(`/api/mall/products/${productId}/off_sale`)
    .then(response => {
      if(response.data.status === 0) {
        this.$message.success('商品下架成功');
        // 刷新商品状态
      }
    })
    .catch(error => {
      console.error('商品下架失败:', error);
    });
}
```

### 3. 实现建议

1. **使用组件化开发**：
   - 将商品卡片、分页控件、筛选面板等抽象为可复用组件
   - 使用Vue、React等前端框架实现状态管理

2. **响应式布局**：
   - 使用Grid或Flex布局实现商品列表的响应式显示
   - 针对移动设备优化界面

3. **图片处理**：
   - 实现图片预览放大功能
   - 商品详情页实现图片轮播

4. **表单验证**：
   - 对添加/编辑商品表单进行前端验证
   - 价格必须大于0，库存不能为负数等

5. **权限控制**：
   - 根据用户角色显示/隐藏管理功能
   - 对管理操作进行权限验证

6. **错误处理**：
   - 统一处理API错误响应
   - 友好展示错误信息

7. **缓存优化**：
   - 缓存分类列表等不常变化的数据
   - 使用LocalStorage存储用户偏好（如排序方式、每页显示数量）

## 4. 商品规格功能

商品规格功能允许商家为同一商品添加不同的规格组合（如颜色、尺寸等），每种组合可以有不同的价格调整和库存量。以下是实现商品规格功能的详细指南。

### 4.1 规格功能概述

商品规格系统由三个主要部分组成：
1. **规格选项**：可选的规格属性和值（如颜色：红色、蓝色、黑色；尺寸：S、M、L等）
2. **规格组合**：特定规格属性值的组合（如红色S码、蓝色M码等）及其对应的价格调整和库存
3. **规格展示与选择**：前端用户界面，允许用户选择需要的规格组合

### 4.2 后端实现

后端已经实现以下功能：
- 在商品表中添加`has_specification`字段标识商品是否有规格
- 创建规格表存储具体规格组合信息
- 创建规格选项表存储可选规格值信息
- 提供相关API供前端调用

### 4.3 前端规格展示实现

#### 4.3.1 检测商品是否有规格

```javascript
function checkProductSpecifications(product) {
  if (product.hasSpecification === 1) {
    // 商品有规格，加载规格选项
    this.loadSpecificationOptions(product.id);
  } else {
    // 商品无规格，直接显示价格和库存
    this.selectedProduct = product;
    this.canAddToCart = product.stock > 0;
  }
}
```

#### 4.3.2 加载规格选项

```javascript
function loadSpecificationOptions(productId) {
  axios.get(`/api/mall/products/${productId}/spec_options`)
    .then(response => {
      if (response.data.status === 0) {
        this.specOptions = response.data.data;
        // 初始化选中规格
        this.initSelectedSpecs();
      }
    })
    .catch(error => {
      console.error('获取规格选项失败:', error);
    });
}

function initSelectedSpecs() {
  // 初始化一个空的已选规格对象
  this.selectedSpecs = {};
  
  // 可以默认选中第一个选项
  this.specOptions.forEach(option => {
    if (option.specValues && option.specValues.length > 0) {
      this.selectedSpecs[option.specKey] = option.specValues[0];
    }
  });
  
  // 根据初始化的规格选择更新价格和库存
  this.updateSpecificationDetails();
}
```

#### 4.3.3 规格选择变更处理

```javascript
function changeSpecification(specKey, specValue) {
  // 更新选中的规格
  this.selectedSpecs[specKey] = specValue;
  
  // 获取更新后的价格和库存
  this.updateSpecificationDetails();
}

function updateSpecificationDetails() {
  // 发送请求获取选中规格组合的价格和库存
  axios.post(`/api/mall/products/${this.productId}/specification`, this.selectedSpecs)
    .then(response => {
      if (response.data.status === 0) {
        const specData = response.data.data;
        this.selectedSpecification = specData;
        
        // 更新显示的价格（基础价格+调整值）
        this.displayPrice = this.productDetail.price + specData.priceAdjustment;
        
        // 更新库存状态
        this.canAddToCart = specData.stock > 0;
        
        // 存储规格ID，用于后续加入购物车
        this.selectedSpecificationId = specData.id;
      } else {
        // 未找到匹配的规格组合
        this.canAddToCart = false;
        this.$message.warning('所选规格组合不可用');
      }
    })
    .catch(error => {
      console.error('获取规格详情失败:', error);
      this.canAddToCart = false;
    });
}
```

#### 4.3.4 规格选择UI实现

```html
<template>
  <div class="spec-selection" v-if="productDetail.hasSpecification === 1">
    <div v-for="option in specOptions" :key="option.id" class="spec-group">
      <div class="spec-title">{{ formatSpecKey(option.specKey) }}:</div>
      <div class="spec-values">
        <span 
          v-for="value in option.specValues" 
          :key="value"
          :class="['spec-value', selectedSpecs[option.specKey] === value ? 'selected' : '']"
          @click="changeSpecification(option.specKey, value)">
          {{ value }}
        </span>
      </div>
    </div>
    
    <div class="spec-price" v-if="selectedSpecification">
      <span class="label">价格:</span>
      <span class="value">¥{{ displayPrice.toFixed(2) }}</span>
      <span class="original" v-if="selectedSpecification.priceAdjustment !== 0">
        ({{ selectedSpecification.priceAdjustment > 0 ? '+' : '' }}{{ selectedSpecification.priceAdjustment }})
      </span>
    </div>
    
    <div class="spec-stock">
      <span class="label">库存:</span>
      <span class="value" :class="{ 'out-of-stock': !canAddToCart }">
        {{ canAddToCart ? selectedSpecification.stock : '无货' }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    formatSpecKey(key) {
      // 将规格键转换为用户友好的显示文本
      const keyMap = {
        'color': '颜色',
        'size': '尺码',
        'material': '材质',
        'style': '款式'
      };
      return keyMap[key] || key;
    }
  }
}
</script>

<style scoped>
.spec-group {
  margin-bottom: 15px;
}
.spec-title {
  font-weight: bold;
  margin-bottom: 8px;
}
.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.spec-value {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.spec-value:hover {
  border-color: #ff6700;
}
.spec-value.selected {
  border-color: #ff6700;
  background-color: #ff67001a;
  color: #ff6700;
}
.spec-price {
  font-size: 18px;
  margin: 15px 0;
}
.spec-price .value {
  color: #ff6700;
  font-weight: bold;
}
.spec-price .original {
  font-size: 14px;
  color: #666;
}
.out-of-stock {
  color: #ff0000;
}
</style>
```

### 4.4 商品规格管理（管理员）

#### 4.4.1 添加商品规格

```javascript
function addSpecification(productId, specData) {
  axios.post(`/api/mall/products/${productId}/specifications`, specData)
    .then(response => {
      if (response.data.status === 0) {
        this.$message.success('添加规格成功');
        this.loadProductSpecifications(productId);
      }
    })
    .catch(error => {
      console.error('添加规格失败:', error);
    });
}
```

#### 4.4.2 更新商品规格

```javascript
function updateSpecification(specificationId, specData) {
  axios.put(`/api/mall/specifications/${specificationId}`, specData)
    .then(response => {
      if (response.data.status === 0) {
        this.$message.success('更新规格成功');
        this.loadProductSpecifications(this.productId);
      }
    })
    .catch(error => {
      console.error('更新规格失败:', error);
    });
}
```

#### 4.4.3 删除商品规格

```javascript
function deleteSpecification(specificationId) {
  this.$confirm('确定要删除该规格吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.delete(`/api/mall/specifications/${specificationId}`)
      .then(response => {
        if (response.data.status === 0) {
          this.$message.success('删除规格成功');
          this.loadProductSpecifications(this.productId);
        }
      })
      .catch(error => {
        console.error('删除规格失败:', error);
      });
  }).catch(() => {
    this.$message.info('已取消删除');
  });
}
```

#### 4.4.4 规格批量添加UI

```html
<template>
  <div class="specification-manager">
    <h3>规格管理</h3>
    
    <!-- 规格选项管理 -->
    <div class="spec-options-section">
      <h4>步骤1: 添加规格类型和选项</h4>
      <div v-for="(options, index) in specOptionsForm" :key="index" class="spec-option-row">
        <el-select v-model="options.key" placeholder="规格类型">
          <el-option label="颜色" value="color"></el-option>
          <el-option label="尺码" value="size"></el-option>
          <el-option label="材质" value="material"></el-option>
          <el-option label="款式" value="style"></el-option>
          <el-option label="自定义" value="custom"></el-option>
        </el-select>
        
        <el-input 
          v-if="options.key === 'custom'" 
          v-model="options.customKey" 
          placeholder="自定义规格类型"
          style="width: 150px; margin: 0 10px;">
        </el-input>
        
        <el-select 
          v-model="options.values" 
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="规格选项值">
          <el-option 
            v-for="item in getDefaultOptions(options.key)"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
        
        <el-button 
          v-if="index === specOptionsForm.length - 1" 
          type="primary" 
          icon="el-icon-plus" 
          circle
          @click="addSpecOptionRow">
        </el-button>
        
        <el-button 
          v-if="specOptionsForm.length > 1" 
          type="danger" 
          icon="el-icon-delete" 
          circle
          @click="removeSpecOptionRow(index)">
        </el-button>
      </div>
    </div>
    
    <!-- 规格组合生成 -->
    <div class="spec-combinations-section">
      <h4>步骤2: 生成规格组合</h4>
      <el-button type="primary" @click="generateSpecCombinations">生成规格组合</el-button>
      
      <div v-if="specCombinations.length > 0" class="combinations-table">
        <el-table :data="specCombinations" border style="width: 100%; margin-top: 20px;">
          <el-table-column label="规格组合">
            <template slot-scope="scope">
              <div v-for="(value, key) in scope.row.specs" :key="key">
                {{ formatSpecKey(key) }}: {{ value }}
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="价格调整" width="150">
            <template slot-scope="scope">
              <el-input-number 
                v-model="scope.row.priceAdjustment" 
                :precision="2" 
                :step="10"
                :min="-1000"
                :max="1000">
              </el-input-number>
            </template>
          </el-table-column>
          
          <el-table-column label="库存" width="150">
            <template slot-scope="scope">
              <el-input-number 
                v-model="scope.row.stock" 
                :min="0"
                :max="9999">
              </el-input-number>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="actions">
          <el-button type="primary" @click="saveAllSpecifications">保存所有规格</el-button>
        </div>
      </div>
    </div>
    
    <!-- 现有规格管理 -->
    <div class="existing-specs-section" v-if="existingSpecifications.length > 0">
      <h4>现有规格组合</h4>
      <el-table :data="existingSpecifications" border style="width: 100%">
        <el-table-column label="规格组合">
          <template slot-scope="scope">
            <div v-for="(value, key) in scope.row.specifications" :key="key">
              {{ formatSpecKey(key) }}: {{ value }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="价格调整" width="120">
          <template slot-scope="scope">
            {{ scope.row.priceAdjustment }}
          </template>
        </el-table-column>
        
        <el-table-column label="库存" width="100">
          <template slot-scope="scope">
            {{ scope.row.stock }}
          </template>
        </el-table-column>
        
        <el-table-column label="销量" width="100">
          <template slot-scope="scope">
            {{ scope.row.sales }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button 
              type="primary" 
              icon="el-icon-edit" 
              size="mini" 
              @click="editSpecification(scope.row)">
            </el-button>
            <el-button 
              type="danger" 
              icon="el-icon-delete" 
              size="mini" 
              @click="deleteSpecification(scope.row.id)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      productId: null,
      specOptionsForm: [{ key: 'color', customKey: '', values: [] }],
      specCombinations: [],
      existingSpecifications: []
    };
  },
  methods: {
    getDefaultOptions(key) {
      const optionsMap = {
        'color': ['红色', '蓝色', '黑色', '白色', '灰色'],
        'size': ['S', 'M', 'L', 'XL', 'XXL', '均码'],
        'material': ['棉', '涤纶', '锦纶', '尼龙'],
        'style': ['经典款', '修身款', '宽松款']
      };
      return optionsMap[key] || [];
    },
    
    formatSpecKey(key) {
      const keyMap = {
        'color': '颜色',
        'size': '尺码',
        'material': '材质',
        'style': '款式'
      };
      return keyMap[key] || key;
    },
    
    addSpecOptionRow() {
      this.specOptionsForm.push({ key: '', customKey: '', values: [] });
    },
    
    removeSpecOptionRow(index) {
      this.specOptionsForm.splice(index, 1);
    },
    
    generateSpecCombinations() {
      // 过滤有效的规格选项
      const validOptions = this.specOptionsForm.filter(opt => {
        const key = opt.key === 'custom' ? opt.customKey : opt.key;
        return key && opt.values && opt.values.length > 0;
      });
      
      if (validOptions.length === 0) {
        this.$message.warning('请至少添加一个有效的规格选项');
        return;
      }
      
      // 生成规格选项数据结构
      const optionsData = {};
      validOptions.forEach(opt => {
        const key = opt.key === 'custom' ? opt.customKey : opt.key;
        optionsData[key] = opt.values;
      });
      
      // 生成所有可能的组合
      this.specCombinations = this.generateCombinations(optionsData);
    },
    
    generateCombinations(optionsData) {
      const keys = Object.keys(optionsData);
      if (keys.length === 0) return [];
      
      // 递归生成所有组合
      const combine = (index, current) => {
        if (index === keys.length) {
          return [{ 
            specs: { ...current }, 
            priceAdjustment: 0, 
            stock: 100 
          }];
        }
        
        const key = keys[index];
        const values = optionsData[key];
        const result = [];
        
        values.forEach(value => {
          const newCurrent = { ...current };
          newCurrent[key] = value;
          result.push(...combine(index + 1, newCurrent));
        });
        
        return result;
      };
      
      return combine(0, {});
    },
    
    saveAllSpecifications() {
      // 先保存规格选项
      const specOptions = {};
      this.specOptionsForm.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          const key = opt.key === 'custom' ? opt.customKey : opt.key;
          if (key) {
            specOptions[key] = opt.values;
          }
        }
      });
      
      // 更新商品以启用规格
      const productUpdate = {
        hasSpecification: 1,
        specOptions: specOptions
      };
      
      // 保存所有生成的规格组合
      const savePromises = this.specCombinations.map(combo => {
        return axios.post(`/api/mall/products/${this.productId}/specifications`, {
          specifications: combo.specs,
          priceAdjustment: combo.priceAdjustment,
          stock: combo.stock
        });
      });
      
      // 执行所有请求
      Promise.all([
        axios.put(`/api/mall/products/${this.productId}`, productUpdate),
        ...savePromises
      ])
        .then(responses => {
          this.$message.success('所有规格保存成功');
          this.loadProductSpecifications();
        })
        .catch(error => {
          console.error('保存规格失败:', error);
          this.$message.error('保存规格失败');
        });
    },
    
    loadProductSpecifications() {
      axios.get(`/api/mall/products/${this.productId}/specifications`)
        .then(response => {
          if (response.data.status === 0) {
            this.existingSpecifications = response.data.data;
          }
        })
        .catch(error => {
          console.error('获取现有规格失败:', error);
        });
    }
  },
  created() {
    // 初始化时获取商品ID和现有规格
    this.productId = this.$route.params.productId;
    if (this.productId) {
      this.loadProductSpecifications();
    }
  }
}
</script>

<style scoped>
.specification-manager {
  padding: 20px;
}
.spec-options-section, .spec-combinations-section, .existing-specs-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.spec-option-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.actions {
  margin-top: 20px;
  text-align: right;
}
</style>
```

### 4.5 多规格业务逻辑

#### 4.5.1 处理商品规格数据结构

```javascript
// 将规格数据结构化为前端可用格式
function processSpecData(product, specifications, specOptions) {
  // 基本商品信息
  const result = {
    ...product,
    specGroups: []
  };
  
  // 处理规格选项组
  if (specOptions) {
    Object.keys(specOptions).forEach(key => {
      result.specGroups.push({
        key: key,
        title: formatSpecKey(key),
        options: specOptions[key].map(value => ({
          value: value,
          disabled: !isSpecValueAvailable(specifications, key, value)
        }))
      });
    });
  }
  
  // 处理规格组合
  result.specCombinations = specifications.map(spec => ({
    id: spec.id,
    specs: spec.specifications,
    price: product.price + spec.priceAdjustment,
    priceAdjustment: spec.priceAdjustment,
    stock: spec.stock,
    available: spec.stock > 0 && spec.status === 1
  }));
  
  return result;
}

// 检查规格值是否有可用组合
function isSpecValueAvailable(specifications, key, value) {
  return specifications.some(spec => 
    spec.specifications[key] === value && spec.stock > 0 && spec.status === 1
  );
}
```

#### 4.5.2 根据选择规格更新UI

```javascript
// 根据已选规格筛选可选择的其他规格选项
function updateAvailableOptions() {
  // 深拷贝当前选择的规格
  const currentSelected = { ...this.selectedSpecs };
  
  // 遍历每个规格组
  this.specData.specGroups.forEach(group => {
    const specKey = group.key;
    
    // 遍历该组的每个选项
    group.options.forEach(option => {
      // 暂时忽略当前规格组的选择
      const tempSelected = { ...currentSelected };
      delete tempSelected[specKey];
      
      // 创建新的选择状态，包含当前评估的值
      const testSelection = { 
        ...tempSelected, 
        [specKey]: option.value 
      };
      
      // 检查是否有匹配的组合
      option.disabled = !this.hasMatchingCombination(testSelection);
    });
  });
}

// 检查是否有匹配的规格组合
function hasMatchingCombination(selection) {
  // 获取选择的键
  const selectedKeys = Object.keys(selection);
  
  // 查找匹配的组合
  return this.specData.specCombinations.some(combo => {
    // 检查每个已选规格是否匹配
    return selectedKeys.every(key => 
      combo.specs[key] === selection[key]
    ) && combo.available;
  });
}

// 自动选择第一个可用选项（默认选择）
function autoSelectFirstAvailable() {
  this.specData.specGroups.forEach(group => {
    // 如果该规格类型还未选择
    if (!this.selectedSpecs[group.key]) {
      // 查找第一个可用选项
      const firstAvailable = group.options.find(opt => !opt.disabled);
      if (firstAvailable) {
        this.selectedSpecs[group.key] = firstAvailable.value;
      }
    }
  });
}
```

#### 4.5.3 根据选择的规格找到匹配的规格组合

```javascript
// 获取当前选择的规格组合
function getCurrentSpecCombination() {
  // 检查是否已选择所有必要规格
  const requiredKeys = this.specData.specGroups.map(g => g.key);
  const selectedKeys = Object.keys(this.selectedSpecs);
  
  // 如果未选择所有必要规格，返回null
  if (requiredKeys.some(key => !selectedKeys.includes(key))) {
    return null;
  }
  
  // 查找完全匹配的组合
  return this.specData.specCombinations.find(combo => {
    return requiredKeys.every(key => 
      combo.specs[key] === this.selectedSpecs[key]
    );
  });
}
```

### 4.6 最佳实践和注意事项

1. **规格选择用户体验**：
   - 禁用无效的规格组合选项，避免用户选择无库存的规格
   - 提供直观的视觉反馈，如已选中的规格样式突出显示
   - 动态更新价格和库存信息，帮助用户理解选择的影响

2. **规格管理优化**：
   - 提供批量添加和编辑规格的功能，提高管理效率
   - 实现规格价格和库存的批量更新
   - 提供规格库存预警和销售统计功能

3. **性能考虑**：
   - 对规格选项和组合进行缓存，减少不必要的API请求
   - 使用前端计算避免频繁请求后端
   - 大量规格组合时，考虑分页加载或按需加载

4. **移动端适配**：
   - 确保规格选择UI在移动设备上易于操作
   - 优化触摸交互，提供足够大的点击区域
   - 响应式设计确保在不同尺寸屏幕上的良好体验

5. **错误处理**：
   - 规格组合找不到时提供明确的错误提示
   - 库存不足时及时通知用户
   - 规格选择不完整时禁用"加入购物车"按钮

这些指南和示例代码将帮助开发者实现一个功能完善的商品规格系统，提升用户购物体验和商家管理效率。
