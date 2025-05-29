# 用户管理模块 API 文档

## 概述
用户管理模块提供后台管理员对用户进行管理的功能，包括查看用户信息、搜索用户、重置用户密码等。

## 权限要求
所有用户管理API都需要管理员权限（ROLE_ADMIN）。

## 最后登录时间
系统会在用户登录成功时自动更新最后登录时间，保存在user_detail表的last_login_at字段中。

## API 接口

### 1. 分页查询用户列表

**接口地址：** `GET /api/user/admin/users`

**请求参数：**
```json
{
  "keyword": "用户名搜索关键词（可选）",
  "role": "角色过滤（可选，如：ROLE_USER, ROLE_ADMIN）",
  "page": 1,
  "size": 10
}
```

**响应示例：**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "pageNum": 1,
    "pageSize": 10,
    "size": 1,
    "total": 100,
    "list": [
      {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "role": "ROLE_USER",
        "avatar": "头像URL",
        "nickname": "测试用户",
        "phone": "13800138000",
        "gender": "男",
        "location": "北京",
        "createTime": "2024-01-01 10:00:00",
        "lastLoginAt": "2024-01-15 15:30:00"
      }
    ]
  }
}
```

### 2. 重置用户密码

**接口地址：** `PUT /api/user/admin/users/{userId}/reset-password`

**路径参数：**
- `userId`: 用户ID

**响应示例：**
```json
{
  "code": 0,
  "msg": "密码重置成功，新密码为：123456",
  "data": null
}
```

**错误响应：**
```json
{
  "code": 30001,
  "msg": "用户不存在",
  "data": null
}
```

### 3. 获取用户详细信息

**接口地址：** `GET /api/user/admin/users/{userId}`

**路径参数：**
- `userId`: 用户ID

**响应示例：**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "phone": "13800138000",
    "bio": "个人简介",
    "role": "ROLE_USER",
    "gender": "男",
    "birthday": "1990-01-01",
    "location": "北京",
    "avatar": "头像URL",
    "createdAt": "2024-01-01 10:00:00",
    "lastLoginAt": "2024-01-15 15:30:00"
  }
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 999 | 服务器异常 |
| 30001 | 用户不存在 |
| 30002 | 密码重置失败 |
| 30003 | 权限不足，仅管理员可操作 |

## 使用示例

### 搜索用户
```bash
# 搜索用户名包含"test"的用户
GET /api/user/admin/users?keyword=test&page=1&size=10

# 查询所有管理员用户
GET /api/user/admin/users?role=ROLE_ADMIN&page=1&size=10
```

### 重置密码
```bash
# 重置ID为1的用户密码
PUT /api/user/admin/users/1/reset-password
```

### 查看用户详情
```bash
# 查看ID为1的用户详细信息
GET /api/user/admin/users/1
```

## 注意事项

1. 所有接口都需要在请求头中携带有效的JWT Token
2. Token必须对应管理员角色的用户
3. 重置密码后，新密码统一为"123456"
4. 分页查询支持按用户名模糊搜索和角色精确过滤
5. 所有接口都遵循统一的ResponseVo响应格式
6. 系统会在用户登录成功时自动更新最后登录时间
7. 使用现有的PageResult分页对象，字段包括：pageNum, pageSize, size, total, list 