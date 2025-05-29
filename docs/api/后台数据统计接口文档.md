# 羽毛球系统数据分析模块 API 文档

## 概述

羽毛球系统数据分析模块为管理员提供全面的数据统计和可视化图表功能，支持多维度数据展示，适配前端ECharts图表库。

## 系统架构分析

基于对数据库表的分析，系统包含以下主要模块：

### 1. 用户管理模块
- **表结构**：`user`, `user_detail`
- **功能**：用户注册、登录、个人信息管理
- **统计维度**：注册趋势、活跃用户、角色分布

### 2. 场地预约模块
- **表结构**：`venue`, `reservation_order`, `special_date_config`
- **功能**：场地管理、预约订单、特殊日期配置
- **统计维度**：预约趋势、场地使用率、预约状态分布、时段分布

### 3. 商城模块
- **表结构**：`mall_order`, `mall_order_item`, `mall_product`, `mall_category`
- **功能**：商品管理、订单管理、规格管理
- **统计维度**：销售趋势、热门商品、订单状态分布

### 4. 论坛模块
- **表结构**：`post`, `post_reply`, `post_category`
- **功能**：帖子发布、回复、点赞
- **统计维度**：发帖趋势、分类分布、活跃用户

### 5. 支付模块
- **表结构**：`pay_info`
- **功能**：支付信息记录
- **统计维度**：收入趋势、支付方式分布

## 权限要求

所有数据分析API都需要管理员权限（ROLE_ADMIN）。

## API 接口

### 1. 仪表板概览

**接口地址：** `GET /api/analytics/dashboard`

**描述：** 获取系统整体统计数据，适用于管理后台首页展示

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "totalUsers": 1250,
    "newUsersToday": 15,
    "newUsersThisMonth": 245,
    "activeUsersToday": 68,
    "totalReservations": 3580,
    "reservationsToday": 12,
    "reservationsThisMonth": 156,
    "reservationRevenue": 89500.00,
    "revenueToday": 450.00,
    "revenueThisMonth": 7890.00,
    "totalOrders": 892,
    "ordersToday": 3,
    "ordersThisMonth": 67,
    "mallRevenue": 45600.00,
    "mallRevenueToday": 129.00,
    "mallRevenueThisMonth": 3450.00,
    "totalPosts": 456,
    "postsToday": 8,
    "totalReplies": 1234,
    "repliesToday": 23,
    "totalVenues": 9,
    "availableVenues": 8,
    "venueUtilizationRate": 75.5
  }
}
```

### 2. 用户相关图表

#### 2.1 用户注册趋势

**接口地址：** `GET /api/analytics/charts/user-registration-trend`

**图表类型：** 折线图 (line)

**ECharts配置建议：**
```javascript
option = {
  title: { text: '用户注册趋势' },
  xAxis: { 
    type: 'category',
    data: response.data.labels // ['2024-01-01', '2024-01-02', ...]
  },
  yAxis: { type: 'value' },
  series: [{
    data: response.data.data, // [5, 8, 12, ...]
    type: 'line'
  }]
}
```

#### 2.2 用户角色分布

**接口地址：** `GET /api/analytics/charts/user-role-distribution`

**图表类型：** 饼图 (pie)

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "title": "用户角色分布",
    "type": "pie",
    "data": [
      {"name": "普通用户", "value": 1200},
      {"name": "管理员", "value": 50}
    ]
  }
}
```

### 3. 预约相关图表

#### 3.1 预约趋势

**接口地址：** `GET /api/analytics/charts/reservation-trend`

**图表类型：** 折线图 (line)

#### 3.2 场地使用率排行

**接口地址：** `GET /api/analytics/charts/venue-usage-ranking`

**图表类型：** 柱状图 (bar)

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "title": "场地使用率排行",
    "type": "bar",
    "labels": ["羽毛球场1号", "羽毛球场2号", "羽毛球场3号"],
    "data": [156, 142, 128]
  }
}
```

#### 3.3 预约状态分布

**接口地址：** `GET /api/analytics/charts/reservation-status-distribution`

**图表类型：** 饼图 (pie)

#### 3.4 每小时预约分布

**接口地址：** `GET /api/analytics/charts/hourly-reservation-distribution`

**图表类型：** 柱状图 (bar)

**用途：** 分析用户预约时段偏好，优化场地安排

### 4. 收入分析

#### 4.1 收入趋势

**接口地址：** `GET /api/analytics/charts/revenue-trend`

**图表类型：** 折线图 (line)

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "title": "收入趋势",
    "type": "line",
    "labels": ["2024-01-01", "2024-01-02", "2024-01-03"],
    "data": [1500.00, 1800.00, 2100.00]
  }
}
```

### 5. 商城相关图表

#### 5.1 商城订单趋势

**接口地址：** `GET /api/analytics/charts/mall-order-trend`

**图表类型：** 折线图 (line)

#### 5.2 热门商品排行

**接口地址：** `GET /api/analytics/charts/popular-products`

**图表类型：** 柱状图 (bar)

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "title": "热门商品排行",
    "type": "bar",
    "labels": ["YONEX羽毛球拍", "李宁羽毛球", "VICTOR运动鞋"],
    "data": [245, 198, 156]
  }
}
```

#### 5.3 商城订单状态分布

**接口地址：** `GET /api/analytics/charts/mall-order-status-distribution`

**图表类型：** 饼图 (pie)

### 6. 论坛相关图表

#### 6.1 发帖趋势

**接口地址：** `GET /api/analytics/charts/post-trend`

**图表类型：** 折线图 (line)

#### 6.2 帖子分类分布

**接口地址：** `GET /api/analytics/charts/post-category-distribution`

**图表类型：** 饼图 (pie)

**响应示例：**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "title": "帖子分类分布",
    "type": "pie",
    "data": [
      {"name": "打球组队", "value": 125},
      {"name": "经验交流", "value": 98},
      {"name": "求助问答", "value": 76},
      {"name": "公告通知", "value": 45}
    ]
  }
}
```

#### 6.3 最活跃用户排行

**接口地址：** `GET /api/analytics/charts/most-active-users`

**图表类型：** 柱状图 (bar)

## 前端集成指南

### ECharts配置示例

#### 1. 折线图配置

```javascript
// 适用于：注册趋势、预约趋势、收入趋势等
const lineChartOption = {
  title: {
    text: response.data.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: response.data.labels
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: response.data.data,
    type: 'line',
    smooth: true
  }]
};
```

#### 2. 柱状图配置

```javascript
// 适用于：场地排行、商品排行、用户排行等
const barChartOption = {
  title: {
    text: response.data.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: response.data.labels,
    axisLabel: {
      rotate: 45 // 标签旋转，防止重叠
    }
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: response.data.data,
    type: 'bar',
    itemStyle: {
      color: '#5470c6'
    }
  }]
};
```

#### 3. 饼图配置

```javascript
// 适用于：角色分布、状态分布、分类分布等
const pieChartOption = {
  title: {
    text: response.data.title,
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [{
    name: response.data.title,
    type: 'pie',
    radius: '50%',
    data: response.data.data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
};
```

## 数据更新说明

### 实时性说明

- **仪表板数据**：每次请求实时计算
- **趋势图表**：基于数据库实时查询，最近30天数据
- **排行榜**：实时统计，TOP 10展示
- **分布图**：实时统计当前状态分布

### 性能优化建议

1. **前端缓存**：仪表板数据可缓存5-10分钟
2. **定时刷新**：图表数据建议每10-30分钟自动刷新
3. **按需加载**：根据用户访问的页面按需请求图表数据
4. **数据压缩**：大数据量图表考虑前端分页或数据抽样

## 错误处理

### 通用错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 500 | 服务器内部错误 |
| 403 | 权限不足，需要管理员权限 |
| 999 | 未知错误 |

### 错误响应示例

```json
{
  "code": 403,
  "msg": "权限不足，需要管理员权限",
  "data": null
}
```

## 使用场景

### 1. 管理员仪表板
- 系统概览数据展示
- 关键指标监控
- 实时业务状态

### 2. 运营分析
- 用户增长分析
- 业务趋势预测
- 收入分析报告

### 3. 场地管理
- 场地使用效率分析
- 时段热度分析
- 预约模式分析

### 4. 商城运营
- 销售数据分析
- 商品热度排行
- 用户购买行为分析

### 5. 社区运营
- 用户活跃度分析
- 内容质量监控
- 社区健康度评估

## 注意事项

1. 所有接口都需要在请求头中携带有效的JWT Token
2. Token必须对应管理员角色的用户
3. 大数据量查询建议在低峰期进行
4. 图表数据格式已针对ECharts优化，可直接使用
5. 建议前端实现数据加载状态和错误提示
6. 所有金额数据保留两位小数
7. 时间数据格式为 YYYY-MM-DD
8. 图表标题和类型已在响应中提供，便于前端统一处理 