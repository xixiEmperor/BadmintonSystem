<template>
  <div class="notice-list-page">
    <h2 class="page-title">通知公告</h2>

    <!-- 筛选器 -->
    <div class="filter-container">
      <el-select v-model="filterType" placeholder="选择通知类型" clearable @change="handleFilterChange">
        <el-option label="全部通知" :value="null"></el-option>
        <el-option label="普通通知" :value="1"></el-option>
        <el-option label="重要通知" :value="2"></el-option>
      </el-select>
    </div>

    <!-- 走马灯通知展示 -->
    <div class="notice-carousel-container" v-loading="loading">
      <el-carousel
        v-if="noticeList.length > 0"
        height="300px"
        :autoplay="true"
        :interval="5000"
        indicator-position="outside"
        arrow="hover"
        type="card"
      >
        <el-carousel-item
          v-for="notice in noticeList"
          :key="notice.id"
          @click="handleNoticeClick(notice)"
        >
          <div class="notice-card" :class="{ important: notice.type === 2 }">
            <div class="notice-header">
              <h3 class="notice-title">{{ notice.title }}</h3>
              <div class="notice-meta">
                <el-tag :type="getTypeTag(notice.type)" size="small">
                  {{ getTypeText(notice.type) }}
                </el-tag>
                <span class="notice-time">{{ formatTime(notice.publishTime) }}</span>
              </div>
            </div>
            <div class="notice-content">
              {{ truncateContent(notice.content, 200) }}
            </div>
            <div class="notice-footer">
              <el-button type="primary" size="small" @click.stop="handleNoticeClick(notice)">
                查看详情
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 空状态 -->
      <div v-if="!loading && noticeList.length === 0" class="empty-state">
        <el-empty description="暂无通知"></el-empty>
      </div>
    </div>

    <!-- 通知列表（小卡片形式） -->
    <div class="notice-grid" v-if="noticeList.length > 0">
      <h3 class="grid-title">所有通知</h3>
      <div class="notice-grid-container">
        <div
          v-for="notice in noticeList"
          :key="`grid-${notice.id}`"
          class="notice-grid-item"
          :class="{ important: notice.type === 2 }"
          @click="handleNoticeClick(notice)"
        >
          <div class="grid-item-header">
            <span class="grid-item-title">{{ notice.title }}</span>
            <el-tag :type="getTypeTag(notice.type)" size="small">
              {{ getTypeText(notice.type) }}
            </el-tag>
          </div>
          <div class="grid-item-time">{{ formatTime(notice.publishTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="currentNotice.title" width="60%">
      <div class="notice-detail">
        <div class="detail-meta">
          <el-tag :type="getTypeTag(currentNotice.type)">
            {{ getTypeText(currentNotice.type) }}
          </el-tag>
          <span class="detail-time">发布时间：{{ formatTime(currentNotice.publishTime) }}</span>
        </div>
        <div class="detail-content">
          {{ currentNotice.content }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getNoticeList, getNoticeDetail } from '@/api/booking'
import { formatDateTime } from '@/utils/format'

// 筛选条件
const filterType = ref(null)

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 通知列表数据
const noticeList = ref([])

// 通知详情对话框
const detailDialogVisible = ref(false)
const currentNotice = reactive({
  id: '',
  title: '',
  content: '',
  type: 1,
  publishTime: '',
})

// 获取通知类型标签
const getTypeTag = (type) => {
  const typeMap = {
    1: '', // 普通通知
    2: 'warning', // 重要通知
  }
  return typeMap[type] || ''
}

// 获取通知类型文本
const getTypeText = (type) => {
  const typeMap = {
    1: '普通通知',
    2: '重要通知',
  }
  return typeMap[type] || '未知'
}

// 格式化时间
const formatTime = (timeStr) => {
  return formatDateTime(timeStr, 'YYYY-MM-DD HH:mm')
}

// 截断内容
const truncateContent = (content, maxLength = 100) => {
  if (!content) return ''
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
}

// 获取通知列表
const fetchNoticeList = async () => {
  try {
    loading.value = true
    const response = await getNoticeList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      type: filterType.value,
    })

    if (response.data.code === 0) {
      noticeList.value = response.data.data.list
      total.value = response.data.data.total
    } else {
      ElMessage.error(response.data.msg || '获取通知列表失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchNoticeList()
}

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchNoticeList()
}

// 点击通知项
const handleNoticeClick = async (notice) => {
  try {
    const response = await getNoticeDetail(notice.id)

    if (response.data.code === 0) {
      const detail = response.data.data
      Object.assign(currentNotice, detail)
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.data.msg || '获取通知详情失败')
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 初始化
onMounted(() => {
  fetchNoticeList()
})
</script>

<style lang="less" scoped>
.notice-list-page {
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  .filter-container {
    margin-bottom: 20px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }

  .notice-carousel-container {
    margin-bottom: 30px;
    min-height: 350px;

    .empty-state {
      padding: 60px 0;
    }
  }

  // 走马灯卡片样式
  :deep(.el-carousel__item) {
    cursor: pointer;

    .notice-card {
      height: 100%;
      padding: 24px;
      background: linear-gradient(135deg, #5fabf7 0%, #3c5aef 100%);
      border-radius: 12px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }

      &.important {
        background: linear-gradient(135deg, #f77b33 0%, #eb0524 100%);
      }

      .notice-header {
        .notice-title {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
          color: white;
        }

        .notice-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;

          .notice-time {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
          }

          :deep(.el-tag) {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
          }
        }
      }

      .notice-content {
        flex: 1;
        line-height: 1.6;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 20px;
      }

      .notice-footer {
        .el-button {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }

  // 通知网格样式
  .notice-grid {
    margin-bottom: 30px;

    .grid-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .notice-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;

      .notice-grid-item {
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 21, 41, 0.08);
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 4px solid #e6f7ff;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 21, 41, 0.12);
          transform: translateY(-2px);
        }

        &.important {
          border-left-color: #e6a23c;
        }

        .grid-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;

          .grid-item-title {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            flex: 1;
            margin-right: 12px;
            line-height: 1.4;
          }
        }

        .grid-item-time {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.notice-detail {
  .detail-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .detail-time {
      font-size: 14px;
      color: #999;
    }
  }

  .detail-content {
    line-height: 1.8;
    color: #333;
    white-space: pre-wrap;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .notice-list-page {
    .notice-carousel-container {
      :deep(.el-carousel) {
        height: 250px !important;
      }

      :deep(.el-carousel__item) {
        .notice-card {
          padding: 16px;

          .notice-header .notice-title {
            font-size: 16px;
          }

          .notice-content {
            font-size: 13px;
          }
        }
      }
    }

    .notice-grid .notice-grid-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
