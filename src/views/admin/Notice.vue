<script>
export default {
  name: 'NoticePublishPage',
}
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
            <el-option label="普通通知" value="normal"></el-option>
            <el-option label="重要通知" value="important"></el-option>
            <el-option label="紧急通知" value="urgent"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">发布通知</el-button>
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
        <el-table-column prop="createTime" label="发布时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
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
            <el-option label="普通通知" value="normal"></el-option>
            <el-option label="重要通知" value="important"></el-option>
            <el-option label="紧急通知" value="urgent"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateNotice">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表单相关
const noticeFormRef = ref(null)
const noticeForm = reactive({
  title: '',
  content: '',
  type: 'normal',
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

// 通知列表数据 (模拟数据)
const noticeList = ref([
  {
    id: 1,
    title: '场馆维修通知',
    content: '2号场地将于2023年11月15日进行维修，当天不可预约，敬请谅解。',
    type: 'normal',
    createTime: '2023-11-10 10:30:45',
  },
  {
    id: 2,
    title: '春节期间场地预约通知',
    content:
      '春节期间（2024年2月10日至2月17日）场馆开放时间调整为上午9:00至下午5:00，请各位用户知悉。',
    type: 'important',
    createTime: '2023-11-12 14:20:30',
  },
  {
    id: 3,
    title: '系统升级维护通知',
    content:
      '系统将于2023年11月20日凌晨2:00-4:00进行升级维护，期间预约功能暂停使用，给您带来不便敬请谅解。',
    type: 'urgent',
    createTime: '2023-11-13 09:15:20',
  },
])

// 编辑对话框相关
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: '',
  title: '',
  content: '',
  type: '',
})

// 获取通知类型标签
const getTypeTag = (type) => {
  const typeMap = {
    normal: '',
    important: 'warning',
    urgent: 'danger',
  }
  return typeMap[type] || ''
}

// 获取通知类型文本
const getTypeText = (type) => {
  const typeMap = {
    normal: '普通通知',
    important: '重要通知',
    urgent: '紧急通知',
  }
  return typeMap[type] || '未知'
}

// 提交表单
const submitForm = () => {
  noticeFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API发布通知
      // 模拟发布成功
      const newNotice = {
        id: noticeList.value.length + 1,
        title: noticeForm.title,
        content: noticeForm.content,
        type: noticeForm.type,
        createTime: new Date().toLocaleString(),
      }
      noticeList.value.unshift(newNotice)
      ElMessage({
        type: 'success',
        message: '通知发布成功',
        duration: 2000,
      })
      resetForm()

      // 更新总数
      total.value = noticeList.value.length
    } else {
      return false
    }
  })
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

// 更新通知
const updateNotice = () => {
  editFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API更新通知
      // 模拟更新成功
      const index = noticeList.value.findIndex((item) => item.id === editForm.id)
      if (index !== -1) {
        noticeList.value[index] = {
          ...noticeList.value[index],
          title: editForm.title,
          content: editForm.content,
          type: editForm.type,
        }
      }
      ElMessage({
        type: 'success',
        message: '通知更新成功',
        duration: 2000,
      })
      editDialogVisible.value = false
    } else {
      return false
    }
  })
}

// 删除通知
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // TODO: 调用API删除通知
      // 模拟删除成功
      const index = noticeList.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        noticeList.value.splice(index, 1)
        // 更新总数
        total.value = noticeList.value.length
        ElMessage({
          type: 'success',
          message: '通知已删除',
          duration: 2000,
        })
      }
    })
    .catch(() => {
      // 取消操作
      ElMessage({
        type: 'info',
        message: '已取消删除操作',
        duration: 2000,
      })
    })
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 初始化
onMounted(() => {
  // TODO: 调用API获取通知列表
  // 初始化通知总数
  total.value = noticeList.value.length
})
</script>

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
