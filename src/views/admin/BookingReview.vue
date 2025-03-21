<script>
export default {
  name: 'BookingReviewPage',
}
</script>

<template>
  <div class="booking-review">
    <h2 class="page-title">预定审核</h2>

    <!-- 筛选条件 -->
    <div class="filter-container">
      <el-form :inline="true" :model="filterForm" class="form-inline">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="审核状态" clearable>
            <el-option label="待审核" value="pending"></el-option>
            <el-option label="已通过" value="approved"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预定日期">
          <el-date-picker
            v-model="filterForm.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table :data="bookingList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="预定ID" width="80"></el-table-column>
        <el-table-column prop="username" label="预定用户" width="120"></el-table-column>
        <el-table-column prop="courtName" label="场地名称" width="120"></el-table-column>
        <el-table-column prop="bookingDate" label="预定日期" width="120"></el-table-column>
        <el-table-column prop="timeSlot" label="时间段" width="180"></el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="success"
              :disabled="scope.row.status !== 'pending'"
              @click="handleApprove(scope.row)"
              >通过</el-button
            >
            <el-button
              size="small"
              type="danger"
              :disabled="scope.row.status !== 'pending'"
              @click="handleReject(scope.row)"
              >拒绝</el-button
            >
            <el-button size="small" type="info" @click="handleDetail(scope.row)">详情</el-button>
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
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 拒绝理由对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="30%">
      <el-form :model="rejectForm">
        <el-form-item label="拒绝原因" :label-width="'100px'">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="预定详情" width="40%">
      <div class="booking-detail" v-if="currentBooking">
        <div class="detail-item">
          <span class="label">预定ID：</span>
          <span class="value">{{ currentBooking.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预定用户：</span>
          <span class="value">{{ currentBooking.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">场地名称：</span>
          <span class="value">{{ currentBooking.courtName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预定日期：</span>
          <span class="value">{{ currentBooking.bookingDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">时间段：</span>
          <span class="value">{{ currentBooking.timeSlot }}</span>
        </div>
        <div class="detail-item">
          <span class="label">提交时间：</span>
          <span class="value">{{ currentBooking.createTime }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">
            <el-tag :type="getStatusTag(currentBooking.status)">
              {{ getStatusText(currentBooking.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item" v-if="currentBooking.rejectReason">
          <span class="label">拒绝原因：</span>
          <span class="value">{{ currentBooking.rejectReason }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  status: '',
  date: [],
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 预定列表数据 (模拟数据)
const bookingList = ref([
  {
    id: 1001,
    username: '张三',
    courtName: '1号场地',
    bookingDate: '2023-11-10',
    timeSlot: '18:00-19:00',
    createTime: '2023-11-08 15:30:45',
    status: 'pending',
  },
  {
    id: 1002,
    username: '李四',
    courtName: '2号场地',
    bookingDate: '2023-11-11',
    timeSlot: '19:00-20:00',
    createTime: '2023-11-08 16:20:15',
    status: 'pending',
  },
  {
    id: 1003,
    username: '王五',
    courtName: '3号场地',
    bookingDate: '2023-11-12',
    timeSlot: '20:00-21:00',
    createTime: '2023-11-09 09:15:30',
    status: 'approved',
  },
  {
    id: 1004,
    username: '赵六',
    courtName: '2号场地',
    bookingDate: '2023-11-13',
    timeSlot: '14:00-15:00',
    createTime: '2023-11-09 11:45:20',
    status: 'rejected',
    rejectReason: '该时段已被预订',
  },
  {
    id: 1005,
    username: '孙七',
    courtName: '4号场地',
    bookingDate: '2023-11-14',
    timeSlot: '16:00-17:00',
    createTime: '2023-11-09 14:30:00',
    status: 'pending',
  },
])

// 拒绝对话框相关
const rejectDialogVisible = ref(false)
const rejectForm = reactive({
  reason: '',
  id: null,
})

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentBooking = ref(null)

// 获取状态标签类型
const getStatusTag = (status) => {
  const statusMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return statusMap[status] || '未知'
}

// 筛选处理
const handleFilter = () => {
  loading.value = true
  // 这里应该调用接口获取筛选后的数据
  // 模拟请求延迟
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.status = ''
  filterForm.date = []
  handleFilter()
}

// 审核通过
const handleApprove = (row) => {
  ElMessageBox.confirm('确定通过该预定申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 这里应该调用接口进行审核操作
      // 模拟审核成功
      const index = bookingList.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        bookingList.value[index].status = 'approved'
      }
      ElMessage.success('审核通过成功')
    })
    .catch(() => {
      // 取消操作
    })
}

// 审核拒绝
const handleReject = (row) => {
  rejectForm.id = row.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  // 这里应该调用接口进行拒绝操作
  // 模拟拒绝成功
  const index = bookingList.value.findIndex((item) => item.id === rejectForm.id)
  if (index !== -1) {
    bookingList.value[index].status = 'rejected'
    bookingList.value[index].rejectReason = rejectForm.reason
  }

  ElMessage.success('已拒绝该预定申请')
  rejectDialogVisible.value = false
}

// 查看详情
const handleDetail = (row) => {
  currentBooking.value = row
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleFilter()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  handleFilter()
}

// 初始化
onMounted(() => {
  handleFilter()
})
</script>

<style lang="less" scoped>
.booking-review {
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  .filter-container {
    margin-bottom: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }

  .table-container {
    background: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .booking-detail {
    .detail-item {
      margin-bottom: 15px;
      display: flex;

      .label {
        width: 100px;
        font-weight: bold;
        color: #606266;
      }

      .value {
        flex: 1;
      }
    }
  }
}
</style>
