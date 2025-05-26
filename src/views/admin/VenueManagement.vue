<template>
  <div class="venue-management">
    <el-card class="page-header">
      <h2>场地管理</h2>
      <p>管理羽毛球场地的上架状态和特殊日期设置</p>
    </el-card>

    <!-- 场地状态管理 -->
    <el-card class="venue-status-card">
      <template #header>
        <div class="card-header">
          <span>场地状态管理</span>
          <el-button type="primary" @click="batchOperation">批量操作</el-button>
        </div>
      </template>

      <div class="venue-grid">
        <div
          v-for="venue in venues"
          :key="venue.id"
          class="venue-item"
          :class="{ 'disabled': !venue.isActive }"
        >
          <div class="venue-header">
            <h3>{{ venue.name }}</h3>
            <el-switch
              v-model="venue.isActive"
              @change="toggleVenueStatus(venue)"
              active-text="启用"
              inactive-text="停用"
            />
          </div>
          <div class="venue-info">
            <p><strong>场地编号：</strong>{{ venue.code }}</p>
            <p><strong>状态：</strong>
              <el-tag :type="venue.isActive ? 'success' : 'danger'">
                {{ venue.isActive ? '正常营业' : '暂停营业' }}
              </el-tag>
            </p>
            <p><strong>今日预约：</strong>{{ venue.todayBookings }}/{{ venue.maxBookings }}</p>
          </div>
          <div class="venue-actions">
            <el-button size="small" @click="viewVenueDetail(venue)">查看详情</el-button>
            <el-button size="small" type="primary" @click="manageSchedule(venue)">时段管理</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 特殊日期管理 -->
    <el-card class="special-dates-card">
      <template #header>
        <div class="card-header">
          <span>特殊日期管理</span>
          <el-button type="primary" @click="showAddSpecialDate = true">添加特殊日期</el-button>
        </div>
      </template>

      <el-table :data="specialDates" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'holiday' ? 'warning' : 'info'">
              {{ scope.row.type === 'holiday' ? '节假日' : '特殊日期' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'closed' ? 'danger' : 'success'">
              {{ scope.row.status === 'closed' ? '全部停用' : '正常营业' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="affectedVenues" label="影响场地">
          <template #default="scope">
            <span v-if="scope.row.affectedVenues.length === venues.length">全部场地</span>
            <span v-else>{{ scope.row.affectedVenues.join(', ') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="timeSlots" label="影响时段">
          <template #default="scope">
            <span v-if="scope.row.timeSlots.length === 0">全天</span>
            <span v-else>{{ scope.row.timeSlots.join(', ') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editSpecialDate(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteSpecialDate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑特殊日期对话框 -->
    <el-dialog
      v-model="showAddSpecialDate"
      :title="editingSpecialDate ? '编辑特殊日期' : '添加特殊日期'"
      width="600px"
    >
      <el-form :model="specialDateForm" :rules="specialDateRules" ref="specialDateFormRef" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="specialDateForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="specialDateForm.name" placeholder="请输入特殊日期名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="specialDateForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="节假日" value="holiday" />
            <el-option label="特殊日期" value="special" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="specialDateForm.status">
            <el-radio value="open">正常营业</el-radio>
            <el-radio value="closed">全部停用</el-radio>
            <el-radio value="partial">部分停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="影响场地" prop="affectedVenues" v-if="specialDateForm.status !== 'closed'">
          <el-select
            v-model="specialDateForm.affectedVenues"
            multiple
            placeholder="请选择影响的场地"
            style="width: 100%"
          >
            <el-option
              v-for="venue in venues"
              :key="venue.id"
              :label="venue.name"
              :value="venue.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="影响时段" prop="timeSlots" v-if="specialDateForm.status === 'partial'">
          <el-select
            v-model="specialDateForm.timeSlots"
            multiple
            placeholder="请选择影响的时段"
            style="width: 100%"
          >
            <el-option
              v-for="slot in timeSlots"
              :key="slot"
              :label="slot"
              :value="slot"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="specialDateForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddSpecialDate = false">取消</el-button>
          <el-button type="primary" @click="saveSpecialDate">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchOperation" title="批量操作" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="batchForm.operation">
            <el-radio value="enable">批量启用</el-radio>
            <el-radio value="disable">批量停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择场地">
          <el-checkbox-group v-model="batchForm.selectedVenues">
            <el-checkbox
              v-for="venue in venues"
              :key="venue.id"
              :value="venue.id"
              :label="venue.name"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBatchOperation = false">取消</el-button>
          <el-button type="primary" @click="executeBatchOperation">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const venues = ref([])
const specialDates = ref([])
const showAddSpecialDate = ref(false)
const showBatchOperation = ref(false)
const editingSpecialDate = ref(null)
const specialDateFormRef = ref()

// 时段选项
const timeSlots = [
  '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00'
]

// 特殊日期表单
const specialDateForm = reactive({
  date: '',
  name: '',
  type: 'holiday',
  status: 'open',
  affectedVenues: [],
  timeSlots: [],
  remark: ''
})

// 批量操作表单
const batchForm = reactive({
  operation: 'enable',
  selectedVenues: []
})

// 表单验证规则
const specialDateRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 初始化场地数据
const initVenues = () => {
  venues.value = Array.from({ length: 9 }, (_, index) => ({
    id: index + 1,
    name: `羽毛球场${index + 1}号`,
    code: `BD${String(index + 1).padStart(2, '0')}`,
    isActive: true,
    todayBookings: Math.floor(Math.random() * 8),
    maxBookings: 8
  }))
}

// 初始化特殊日期数据
const initSpecialDates = () => {
  specialDates.value = [
    {
      id: 1,
      date: new Date('2024-01-01'),
      name: '元旦',
      type: 'holiday',
      status: 'closed',
      affectedVenues: [],
      timeSlots: [],
      remark: '元旦假期全天停业'
    },
    {
      id: 2,
      date: new Date('2024-02-10'),
      name: '春节',
      type: 'holiday',
      status: 'closed',
      affectedVenues: [],
      timeSlots: [],
      remark: '春节假期全天停业'
    }
  ]
}

// 切换场地状态
const toggleVenueStatus = (venue) => {
  ElMessage.success(`${venue.name} 已${venue.isActive ? '启用' : '停用'}`)
}

// 查看场地详情
const viewVenueDetail = (venue) => {
  ElMessage.info(`查看 ${venue.name} 详情`)
}

// 管理时段
const manageSchedule = (venue) => {
  router.push(`/admin/venue-schedule/${venue.id}`)
}

// 批量操作
const batchOperation = () => {
  batchForm.selectedVenues = []
  showBatchOperation.value = true
}

// 执行批量操作
const executeBatchOperation = () => {
  if (batchForm.selectedVenues.length === 0) {
    ElMessage.warning('请选择要操作的场地')
    return
  }

  const operation = batchForm.operation === 'enable' ? '启用' : '停用'
  const selectedVenueNames = venues.value
    .filter(v => batchForm.selectedVenues.includes(v.id))
    .map(v => v.name)
    .join('、')

  ElMessageBox.confirm(
    `确定要${operation}以下场地吗？\n${selectedVenueNames}`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 执行批量操作
    venues.value.forEach(venue => {
      if (batchForm.selectedVenues.includes(venue.id)) {
        venue.isActive = batchForm.operation === 'enable'
      }
    })
    ElMessage.success(`批量${operation}成功`)
    showBatchOperation.value = false
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 编辑特殊日期
const editSpecialDate = (row) => {
  editingSpecialDate.value = row
  Object.assign(specialDateForm, {
    date: row.date,
    name: row.name,
    type: row.type,
    status: row.status,
    affectedVenues: [...row.affectedVenues],
    timeSlots: [...row.timeSlots],
    remark: row.remark || ''
  })
  showAddSpecialDate.value = true
}

// 删除特殊日期
const deleteSpecialDate = (row) => {
  ElMessageBox.confirm(
    `确定要删除特殊日期"${row.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = specialDates.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      specialDates.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存特殊日期
const saveSpecialDate = () => {
  specialDateFormRef.value.validate((valid) => {
    if (valid) {
      if (editingSpecialDate.value) {
        // 编辑模式
        const index = specialDates.value.findIndex(item => item.id === editingSpecialDate.value.id)
        if (index > -1) {
          specialDates.value[index] = {
            ...editingSpecialDate.value,
            ...specialDateForm,
            affectedVenues: specialDateForm.status === 'closed' ? venues.value.map(v => v.name) : specialDateForm.affectedVenues,
            timeSlots: specialDateForm.status !== 'partial' ? [] : specialDateForm.timeSlots
          }
        }
        ElMessage.success('编辑成功')
      } else {
        // 新增模式
        const newSpecialDate = {
          id: Date.now(),
          ...specialDateForm,
          affectedVenues: specialDateForm.status === 'closed' ? venues.value.map(v => v.name) : specialDateForm.affectedVenues,
          timeSlots: specialDateForm.status !== 'partial' ? [] : specialDateForm.timeSlots
        }
        specialDates.value.push(newSpecialDate)
        ElMessage.success('添加成功')
      }

      // 重置表单
      Object.assign(specialDateForm, {
        date: '',
        name: '',
        type: 'holiday',
        status: 'open',
        affectedVenues: [],
        timeSlots: [],
        remark: ''
      })
      editingSpecialDate.value = null
      showAddSpecialDate.value = false
    }
  })
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 组件挂载时初始化数据
onMounted(() => {
  initVenues()
  initSpecialDates()
})
</script>

<style lang="less" scoped>
.venue-management {
  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 8px 0;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
    }
  }

  .venue-status-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .venue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .venue-item {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    background: #fff;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    &.disabled {
      background: #f5f7fa;
      border-color: #dcdfe6;

      .venue-header h3 {
        color: #c0c4cc;
      }
    }

    .venue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        color: #303133;
        font-size: 16px;
      }
    }

    .venue-info {
      margin-bottom: 16px;

      p {
        margin: 8px 0;
        color: #606266;
        font-size: 14px;
      }
    }

    .venue-actions {
      display: flex;
      gap: 8px;
    }
  }

  .special-dates-card {
    .el-table {
      margin-top: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
