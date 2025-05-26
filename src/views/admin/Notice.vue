<script>
export default {
  name: 'NoticePublishPage',
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getAdminNoticeList,
  createNotice,
  updateNotice,
  publishNotice,
  deleteNotice,
} from '@/api/booking'
import { formatDateTime } from '@/utils/format'

// 表单相关
const noticeFormRef = ref(null)
const noticeForm = reactive({
  title: '',
  content: '',
  type: 1, // 默认普通通知
})

// 表单验证规则
const rules = reactive({
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
})

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 通知列表数据
const noticeList = ref([])

// 编辑对话框相关
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: '',
  title: '',
  content: '',
  type: 1,
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

// 获取状态标签
const getStatusTag = (status) => {
  const statusMap = {
    0: 'info', // 草稿
    1: 'success', // 已发布
  }
  return statusMap[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '草稿',
    1: '已发布',
  }
  return statusMap[status] || '未知'
}

// 获取通知列表
const fetchNoticeList = async () => {
  try {
    loading.value = true
    const response = await getAdminNoticeList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
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

// 提交表单
const submitForm = async (status) => {
  const valid = await noticeFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const response = await createNotice({
      title: noticeForm.title,
      content: noticeForm.content,
      type: noticeForm.type,
    })

    if (response.data.code === 0) {
      // 如果是发布状态，需要再调用发布接口
      if (status === 1) {
        const noticeId = response.data.data
        await publishNotice(noticeId)
        ElMessage.success('通知发布成功')
      } else {
        ElMessage.success('通知保存成功')
      }

      resetForm()
      fetchNoticeList() // 重新获取列表
    } else {
      ElMessage.error(response.data.msg || '操作失败')
    }
  } catch (error) {
    console.error('提交通知失败:', error)
    ElMessage.error('操作失败')
  }
}

// 重置表单
const resetForm = () => {
  noticeFormRef.value.resetFields()
}

// 编辑通知
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.title = row.title
  editForm.content = row.content
  editForm.type = row.type
  editDialogVisible.value = true
}

// 发布草稿
const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm('确认发布该通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await publishNotice(row.id)

    if (response.data.code === 0) {
      ElMessage.success('通知发布成功')
      fetchNoticeList() // 重新获取列表
    } else {
      ElMessage.error(response.data.msg || '发布失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布通知失败:', error)
      ElMessage.error('发布失败')
    } else {
      ElMessage.info('已取消发布操作')
    }
  }
}

// 更新通知
const updateNoticeHandler = async () => {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const response = await updateNotice(editForm.id, {
      title: editForm.title,
      content: editForm.content,
      type: editForm.type,
    })

    if (response.data.code === 0) {
      ElMessage.success('通知更新成功')
      editDialogVisible.value = false
      fetchNoticeList() // 重新获取列表
    } else {
      ElMessage.error(response.data.msg || '更新失败')
    }
  } catch (error) {
    console.error('更新通知失败:', error)
    ElMessage.error('更新失败')
  }
}

// 删除通知
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await deleteNotice(row.id)

    if (response.data.code === 0) {
      ElMessage.success('通知已删除')
      fetchNoticeList() // 重新获取列表
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除失败')
    } else {
      ElMessage.info('已取消删除操作')
    }
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchNoticeList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchNoticeList()
}

// 初始化
onMounted(() => {
  fetchNoticeList()
})
</script>

<template>
  <div class="notice-publish">
    <h2 class="page-title">发布通知</h2>

    <!-- 通知表单 -->
    <div class="form-container">
      <el-form :model="noticeForm" :rules="rules" ref="noticeFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="noticeForm.type" placeholder="请选择通知类型">
            <el-option label="普通通知" :value="1"></el-option>
            <el-option label="重要通知" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(1)">发布通知</el-button>
          <el-button type="info" @click="submitForm(0)">保存草稿</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 已发布通知列表 -->
    <div class="notice-list">
      <h3 class="section-title">已发布通知</h3>
      <el-table :data="noticeList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.publishTime || scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
              v-if="scope.row.status === 0"
              size="small"
              type="success"
              @click="handlePublish(scope.row)"
            >
              发布
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[5, 8, 10, 15]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑通知对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑通知" width="50%">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editForm.type" placeholder="请选择通知类型">
            <el-option label="普通通知" :value="1"></el-option>
            <el-option label="重要通知" :value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateNoticeHandler">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.notice-publish {
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  .form-container {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    margin-bottom: 20px;
  }

  .notice-list {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .section-title {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
