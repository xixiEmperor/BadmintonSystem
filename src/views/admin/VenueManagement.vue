<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getVenueList, // 获取场地列表
  addVenue, // 新增场地
  updateVenue, // 更新场地
  deleteVenue, // 删除场地
  getVenueById, // 根据ID获取场地详情
  getVenueListByStatus, // 根据状态获取场地列表
  updateVenueStatus, // 更新场地状态
} from '@/api/venue'
// 导入特殊日期API
import {
  getSpecialDateConfigList,
  createSpecialDateConfig,
  updateSpecialDateConfig,
  deleteSpecialDateConfig,
  CONFIG_TYPE,
  CONFIG_TYPE_TEXT,
  VENUE_STATUS,
  VENUE_STATUS_TEXT,
  BOOKABLE_STATUS,
  BOOKABLE_STATUS_TEXT,
  ENABLED_STATUS,
  ENABLED_STATUS_TEXT
} from '@/api/specialDate'

const router = useRouter()

// 响应式数据
const venues = ref([])
const specialDates = ref([])
const showAddSpecialDate = ref(false)
const showBatchOperation = ref(false)
const showAddVenue = ref(false)
const showEditVenue = ref(false)
const showVenueDetail = ref(false)
const editingSpecialDate = ref(null)
const editingVenue = ref(null)
const currentVenueDetail = ref(null)
const specialDateFormRef = ref()
const venueFormRef = ref()
const loading = ref(false)

// 特殊日期分页数据
const specialDatePagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 场地类型选项
const venueTypeOptions = [
  { label: '羽毛球场', value: 1 }
]

// 场地状态选项
const venueStatusOptions = [
  { label: '不可用', value: 0 },
  { label: '可用', value: 1 }
]

// 特殊日期表单
const specialDateForm = reactive({
  configName: '',
  specialDate: '',
  configType: CONFIG_TYPE.HOLIDAY,
  affectedVenueIds: '',
  startTime: '08:00',
  endTime: '21:00',
  venueStatus: VENUE_STATUS.MAINTENANCE,
  bookable: BOOKABLE_STATUS.NOT_BOOKABLE,
  description: '',
  enabled: ENABLED_STATUS.ENABLED
})

// 场地表单
const venueForm = reactive({
  name: '',
  location: '',
  description: '',
  pricePerHour: '',
  type: 1,
  status: 1
})

// 批量操作表单
const batchForm = reactive({
  operation: 'enable',
  selectedVenues: []
})

// 表单验证规则
const specialDateRules = {
  configName: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  specialDate: [{ required: true, message: '请选择特殊日期', trigger: 'change' }],
  configType: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
  venueStatus: [{ required: true, message: '请选择场地状态', trigger: 'change' }],
  bookable: [{ required: true, message: '请选择是否可预约', trigger: 'change' }]
}

const venueRules = {
  name: [{ required: true, message: '请输入场地名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入场地位置', trigger: 'blur' }],
  pricePerHour: [
    { required: true, message: '请输入场地价格', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur', transform: (value) => Number(value) }
  ],
  type: [{ required: true, message: '请选择场地类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择场地状态', trigger: 'change' }]
}

// 获取场地列表
const fetchVenues = async () => {
  try {
    loading.value = true
    const response = await getVenueList()
    venues.value = response.data.data || []
  } catch (error) {
    ElMessage.error('获取场地列表失败：' + error.message)
    venues.value = [] // 如果API失败，设置为空数组
  } finally {
    loading.value = false
  }
}

// 根据状态获取场地列表
const fetchVenuesByStatus = async (status) => {
  try {
    loading.value = true
    const response = await getVenueListByStatus(status)
    venues.value = response.data.data || []
    const statusText = {
      0: '不可用',
      1: '可用'
    }
    ElMessage.success(`已筛选出${statusText[status]}的场地`)
  } catch (error) {
    ElMessage.error('获取场地列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 获取场地详情
const fetchVenueDetail = async (venueId) => {
  try {
    loading.value = true
    const response = await getVenueById(venueId)
    currentVenueDetail.value = response.data.data
    showVenueDetail.value = true
  } catch (error) {
    ElMessage.error('获取场地详情失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 添加场地
const handleAddVenue = () => {
  Object.assign(venueForm, {
    name: '',
    location: '',
    description: '',
    pricePerHour: '',
    type: 1,
    status: 1
  })
  editingVenue.value = null
  showAddVenue.value = true
}

// 编辑场地
const handleEditVenue = (venue) => {
  Object.assign(venueForm, {
    name: venue.name,
    location: venue.location || '',
    description: venue.description || '',
    pricePerHour: venue.pricePerHour || '',
    type: venue.type,
    status: venue.status
  })
  editingVenue.value = venue
  showEditVenue.value = true
}

// 保存场地
const saveVenue = async () => {
  try {
    await venueFormRef.value.validate()
    loading.value = true

    const venueData = {
      name: venueForm.name,
      location: venueForm.location,
      description: venueForm.description,
      pricePerHour: Number(venueForm.pricePerHour),
      type: venueForm.type,
      status: venueForm.status
    }

    if (editingVenue.value) {
      // 编辑模式
      await updateVenue(editingVenue.value.id, venueData)
      ElMessage.success('场地更新成功')
      showEditVenue.value = false
    } else {
      // 新增模式
      await addVenue(venueData)
      ElMessage.success('场地添加成功')
      showAddVenue.value = false
    }

    // 刷新场地列表
    await fetchVenues()
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 删除场地
const handleDeleteVenue = (row) => {
  ElMessageBox.confirm(
    `确定要删除场地"${row.name}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      await deleteVenue(row.id)
      ElMessage.success('删除成功')

      // 删除后检查当前页是否还有数据，如果没有则跳转到上一页
      const isLastItemOnPage = venues.value.length === 1 && pagination.pageNum > 1

      if (isLastItemOnPage) {
        // 如果是当前页的最后一条数据且不是第一页，则跳转到上一页
        pagination.pageNum -= 1
      }

      await fetchVenues()
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 获取特殊日期配置列表
const fetchSpecialDates = async (pageNum = specialDatePagination.pageNum, pageSize = specialDatePagination.pageSize) => {
  try {
    loading.value = true
    const response = await getSpecialDateConfigList({
      pageNum,
      pageSize
    })

    const data = response.data.data
    specialDates.value = data.list || []

    // 更新分页信息
    specialDatePagination.pageNum = data.pageNum || pageNum
    specialDatePagination.pageSize = data.pageSize || pageSize
    specialDatePagination.total = data.total || 0
    specialDatePagination.pages = data.pages || 0
  } catch (error) {
    ElMessage.error('获取特殊日期配置失败：' + error.message)
    specialDates.value = []
    specialDatePagination.total = 0
  } finally {
    loading.value = false
  }
}

// 切换场地状态
const toggleVenueStatus = async (venue) => {
  try {
    const newStatus = venue.status === 1 ? 1 : 0
    await updateVenueStatus(venue.id, newStatus)
    venue.status = newStatus
    ElMessage.success(`${venue.name} 已${newStatus === 1 ? '设为可用' : '设为不可用'}`)
  } catch (error) {
    ElMessage.error('状态更新失败：' + error.message)
    // 恢复原状态
    venue.status = venue.status === 1 ? 0 : 1
  }
}

// 查看场地详情
const viewVenueDetail = (venue) => {
  fetchVenueDetail(venue.id)
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
const executeBatchOperation = async () => {
  if (batchForm.selectedVenues.length === 0) {
    ElMessage.warning('请选择要操作的场地')
    return
  }

  const operation = batchForm.operation === 'enable' ? '设为可用' : '设为不可用'
  const selectedVenueNames = venues.value
    .filter(v => batchForm.selectedVenues.includes(v.id))
    .map(v => v.name)
    .join('、')

  try {
    await ElMessageBox.confirm(
      `确定要${operation}以下场地吗？\n${selectedVenueNames}`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const newStatus = batchForm.operation === 'enable' ? 1 : 0

    // 批量更新状态
    const updatePromises = batchForm.selectedVenues.map(venueId =>
      updateVenueStatus(venueId, newStatus)
    )

    await Promise.all(updatePromises)

    // 更新本地数据
    venues.value.forEach(venue => {
      if (batchForm.selectedVenues.includes(venue.id)) {
        venue.status = newStatus
      }
    })

    ElMessage.success(`批量${operation}成功`)
    showBatchOperation.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败：' + error.message)
    } else {
      ElMessage.info('已取消操作')
    }
  } finally {
    loading.value = false
  }
}

// 编辑特殊日期
const editSpecialDate = (row) => {
  editingSpecialDate.value = row
  Object.assign(specialDateForm, {
    configName: row.configName,
    specialDate: row.specialDate,
    configType: row.configType,
    affectedVenueIds: row.affectedVenueIds || '',
    startTime: row.startTime || '08:00',
    endTime: row.endTime || '21:00',
    venueStatus: row.venueStatus,
    bookable: row.bookable,
    description: row.description || '',
    enabled: row.enabled
  })
  showAddSpecialDate.value = true
}

// 删除特殊日期
const deleteSpecialDate = (row) => {
  ElMessageBox.confirm(
    `确定要删除特殊日期"${row.configName}"吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      await deleteSpecialDateConfig(row.id)
      ElMessage.success('删除成功')

      // 删除后检查当前页是否还有数据，如果没有则跳转到上一页
      const isLastItemOnPage = specialDates.value.length === 1 && specialDatePagination.pageNum > 1

      if (isLastItemOnPage) {
        // 如果是当前页的最后一条数据且不是第一页，则跳转到上一页
        specialDatePagination.pageNum -= 1
      }

      await fetchSpecialDates()
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    } finally {
      loading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 保存特殊日期
const saveSpecialDate = async () => {
  try {
    await specialDateFormRef.value.validate()
    loading.value = true

    // 准备API数据
    const apiData = {
      configName: specialDateForm.configName,
      specialDate: specialDateForm.specialDate,
      configType: specialDateForm.configType,
      affectedVenueIds: specialDateForm.affectedVenueIds || null,
      startTime: specialDateForm.startTime,
      endTime: specialDateForm.endTime,
      venueStatus: specialDateForm.venueStatus,
      bookable: specialDateForm.bookable,
      description: specialDateForm.description,
      enabled: specialDateForm.enabled
    }

    if (editingSpecialDate.value) {
      // 编辑模式
      await updateSpecialDateConfig(editingSpecialDate.value.id, apiData)
      ElMessage.success('编辑成功')
    } else {
      // 新增模式
      await createSpecialDateConfig(apiData)
      ElMessage.success('添加成功')
    }

    // 重置表单
    resetSpecialDateForm()
    showAddSpecialDate.value = false

    // 刷新列表
    await fetchSpecialDates()
  } catch (error) {
    if (error.message) {
      ElMessage.error('保存失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  // 处理API返回的ISO日期格式或普通日期字符串
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('zh-CN')
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '不可用',
    1: '可用'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'danger',
    1: 'success'
  }
  return typeMap[status] || 'info'
}

// 获取场地类型文本
const getVenueTypeText = (type) => {
  const typeMap = {
    1: '羽毛球场'
  }
  return typeMap[type] || '未知类型'
}

// 处理下拉菜单命令
const handleDropdownCommand = (command) => {
  if (command === 'all') {
    fetchVenues()
  } else {
    fetchVenuesByStatus(command)
  }
}

// 重置特殊日期表单
const resetSpecialDateForm = () => {
  Object.assign(specialDateForm, {
    configName: '',
    specialDate: '',
    configType: CONFIG_TYPE.HOLIDAY,
    affectedVenueIds: '',
    startTime: '08:00',
    endTime: '21:00',
    venueStatus: VENUE_STATUS.MAINTENANCE,
    bookable: BOOKABLE_STATUS.NOT_BOOKABLE,
    description: '',
    enabled: ENABLED_STATUS.ENABLED
  })
  editingSpecialDate.value = null
}

// 添加特殊日期
const addSpecialDate = () => {
  resetSpecialDateForm()
  showAddSpecialDate.value = true
}

// 处理特殊日期分页变化
const handleSpecialDatePageChange = (page) => {
  specialDatePagination.pageNum = page
  fetchSpecialDates(page, specialDatePagination.pageSize)
}

// 处理特殊日期每页大小变化
const handleSpecialDateSizeChange = (size) => {
  specialDatePagination.pageSize = size
  specialDatePagination.pageNum = 1 // 重置到第一页
  fetchSpecialDates(1, size)
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchVenues()
  fetchSpecialDates()
})
</script>

<template>
  <div class="venue-management" v-loading="loading">
    <el-card class="page-header">
      <h2>场地管理</h2>
      <p>管理羽毛球场地的上架状态和特殊日期设置</p>
    </el-card>

    <!-- 场地状态管理 -->
    <el-card class="venue-status-card">
      <template #header>
        <div class="card-header">
          <span>场地状态管理</span>
          <div class="header-actions">
            <el-dropdown @command="handleDropdownCommand" style="margin-right: 10px;">
              <el-button>
                按状态筛选<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">可用场地</el-dropdown-item>
                  <el-dropdown-item :command="0">不可用场地</el-dropdown-item>
                  <el-dropdown-item :command="'all'">全部场地</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="success" @click="handleAddVenue">添加场地</el-button>
            <el-button type="primary" @click="batchOperation">批量操作</el-button>
          </div>
        </div>
      </template>

      <div class="venue-grid">
        <div
          v-for="venue in venues"
          :key="venue.id"
          class="venue-item"
          :class="{ 'disabled': venue.status === 0 }"
        >
          <div class="venue-header">
            <h3>{{ venue.name }}</h3>
            <el-switch
              v-model="venue.status"
              :active-value="1"
              :inactive-value="0"
              @change="toggleVenueStatus(venue)"
              active-text="可用"
              inactive-text="不可用"
            />
          </div>
          <div class="venue-info">
            <p><strong>场地编号：</strong>{{ venue.code || `V${venue.id}` }}</p>
            <p><strong>场地位置：</strong>{{ venue.location || '暂无位置' }}</p>
            <p><strong>状态：</strong>
              <el-tag :type="getStatusType(venue.status)">
                {{ getStatusText(venue.status) }}
              </el-tag>
            </p>
            <p><strong>价格：</strong>¥{{ venue.pricePerHour || 0 }}/小时</p>
            <p v-if="venue.todayBookings !== undefined"><strong>今日预约：</strong>{{ venue.todayBookings }}/{{ venue.maxBookings || 8 }}</p>
          </div>
          <div class="venue-actions">
            <el-button size="small" @click="viewVenueDetail(venue)">查看详情</el-button>
            <el-button size="small" type="primary" @click="handleEditVenue(venue)">编辑</el-button>
            <el-button size="small" type="warning" @click="manageSchedule(venue)">时段管理</el-button>
            <el-button size="small" type="danger" @click="handleDeleteVenue(venue)">删除</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 特殊日期管理 -->
    <el-card class="special-dates-card">
      <template #header>
        <div class="card-header">
          <span>特殊日期管理</span>
          <el-button type="primary" @click="addSpecialDate">添加特殊日期</el-button>
        </div>
      </template>

      <el-table :data="specialDates" style="width: 100%">
        <el-table-column prop="specialDate" label="日期" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.specialDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="configName" label="名称" width="150" />
        <el-table-column prop="configType" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.configType === CONFIG_TYPE.HOLIDAY ? 'warning' : scope.row.configType === CONFIG_TYPE.MAINTENANCE ? 'danger' : 'info'">
              {{ CONFIG_TYPE_TEXT[scope.row.configType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="venueStatus" label="场地状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.venueStatus === VENUE_STATUS.MAINTENANCE ? 'danger' : 'success'">
              {{ VENUE_STATUS_TEXT[scope.row.venueStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bookable" label="可预约" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.bookable === BOOKABLE_STATUS.BOOKABLE ? 'success' : 'danger'">
              {{ BOOKABLE_STATUS_TEXT[scope.row.bookable] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="affectedVenueIds" label="影响场地">
          <template #default="scope">
            <span v-if="!scope.row.affectedVenueIds">全部场地</span>
            <span v-else>{{ scope.row.affectedVenueIds }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.enabled === ENABLED_STATUS.ENABLED ? 'success' : 'info'">
              {{ ENABLED_STATUS_TEXT[scope.row.enabled] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="editSpecialDate(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteSpecialDate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="specialDatePagination.pageNum"
          v-model:page-size="specialDatePagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="specialDatePagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSpecialDateSizeChange"
          @current-change="handleSpecialDatePageChange"
        />
      </div>
    </el-card>

    <!-- 添加场地对话框 -->
    <el-dialog v-model="showAddVenue" title="添加场地" width="600px">
      <el-form :model="venueForm" :rules="venueRules" ref="venueFormRef" label-width="100px">
        <el-form-item label="场地名称" prop="name">
          <el-input v-model="venueForm.name" placeholder="请输入场地名称" />
        </el-form-item>
        <el-form-item label="场地位置" prop="location">
          <el-input v-model="venueForm.location" placeholder="请输入场地位置" />
        </el-form-item>
        <el-form-item label="场地描述">
          <el-input
            v-model="venueForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入场地描述"
          />
        </el-form-item>
        <el-form-item label="场地价格" prop="pricePerHour">
          <el-input-number
            v-model="venueForm.pricePerHour"
            :min="0"
            :precision="2"
            placeholder="请输入场地价格"
            style="width: 100%"
          />
          <span style="margin-left: 8px; color: #909399;">元/小时</span>
        </el-form-item>
        <el-form-item label="场地类型" prop="type">
          <el-select v-model="venueForm.type" placeholder="请选择场地类型" style="width: 100%">
            <el-option
              v-for="option in venueTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="场地状态" prop="status">
          <el-select v-model="venueForm.status" placeholder="请选择场地状态" style="width: 100%">
            <el-option
              v-for="option in venueStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddVenue = false">取消</el-button>
          <el-button type="primary" @click="saveVenue" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑场地对话框 -->
    <el-dialog v-model="showEditVenue" title="编辑场地" width="600px">
      <el-form :model="venueForm" :rules="venueRules" ref="venueFormRef" label-width="100px">
        <el-form-item label="场地名称" prop="name">
          <el-input v-model="venueForm.name" placeholder="请输入场地名称" />
        </el-form-item>
        <el-form-item label="场地位置" prop="location">
          <el-input v-model="venueForm.location" placeholder="请输入场地位置" />
        </el-form-item>
        <el-form-item label="场地描述">
          <el-input
            v-model="venueForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入场地描述"
          />
        </el-form-item>
        <el-form-item label="场地价格" prop="pricePerHour">
          <el-input-number
            v-model="venueForm.pricePerHour"
            :min="0"
            :precision="2"
            placeholder="请输入场地价格"
            style="width: 100%"
          />
          <span style="margin-left: 8px; color: #909399;">元/小时</span>
        </el-form-item>
        <el-form-item label="场地类型" prop="type">
          <el-select v-model="venueForm.type" placeholder="请选择场地类型" style="width: 100%">
            <el-option
              v-for="option in venueTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="场地状态" prop="status">
          <el-select v-model="venueForm.status" placeholder="请选择场地状态" style="width: 100%">
            <el-option
              v-for="option in venueStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditVenue = false">取消</el-button>
          <el-button type="primary" @click="saveVenue" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 场地详情对话框 -->
    <el-dialog v-model="showVenueDetail" title="场地详情" width="600px">
      <div v-if="currentVenueDetail" class="venue-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="场地名称">{{ currentVenueDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="场地编号">{{ currentVenueDetail.code || `V${currentVenueDetail.id}` }}</el-descriptions-item>
          <el-descriptions-item label="场地状态">
            <el-tag :type="getStatusType(currentVenueDetail.status)">
              {{ getStatusText(currentVenueDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="场地价格">¥{{ currentVenueDetail.pricePerHour || 0 }}/小时</el-descriptions-item>
          <el-descriptions-item label="场地描述" :span="2">
            {{ currentVenueDetail.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="场地类型">
            {{ getVenueTypeText(currentVenueDetail.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="场地位置">
            {{ currentVenueDetail.location || '暂无位置' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" v-if="currentVenueDetail.createTime">
            {{ formatDate(currentVenueDetail.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" v-if="currentVenueDetail.updateTime">
            {{ formatDate(currentVenueDetail.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showVenueDetail = false">关闭</el-button>
          <el-button type="primary" @click="handleEditVenue(currentVenueDetail); showVenueDetail = false">编辑</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑特殊日期对话框 -->
    <el-dialog
      v-model="showAddSpecialDate"
      :title="editingSpecialDate ? '编辑特殊日期' : '添加特殊日期'"
      width="600px"
    >
      <el-form :model="specialDateForm" :rules="specialDateRules" ref="specialDateFormRef" label-width="120px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="specialDateForm.configName" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="特殊日期" prop="specialDate">
          <el-date-picker
            v-model="specialDateForm.specialDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="配置类型" prop="configType">
          <el-select v-model="specialDateForm.configType" placeholder="请选择配置类型" style="width: 100%">
            <el-option :label="CONFIG_TYPE_TEXT[CONFIG_TYPE.HOLIDAY]" :value="CONFIG_TYPE.HOLIDAY" />
            <el-option :label="CONFIG_TYPE_TEXT[CONFIG_TYPE.MAINTENANCE]" :value="CONFIG_TYPE.MAINTENANCE" />
            <el-option :label="CONFIG_TYPE_TEXT[CONFIG_TYPE.SPECIAL_OPEN]" :value="CONFIG_TYPE.SPECIAL_OPEN" />
          </el-select>
        </el-form-item>
        <el-form-item label="影响场地">
          <el-input
            v-model="specialDateForm.affectedVenueIds"
            placeholder="场地ID，多个用逗号分隔，留空表示全部场地"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="specialDateForm.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="specialDateForm.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="场地状态" prop="venueStatus">
          <el-select v-model="specialDateForm.venueStatus" placeholder="请选择场地状态" style="width: 100%">
            <el-option :label="VENUE_STATUS_TEXT[VENUE_STATUS.IDLE]" :value="VENUE_STATUS.IDLE" />
            <el-option :label="VENUE_STATUS_TEXT[VENUE_STATUS.IN_USE]" :value="VENUE_STATUS.IN_USE" />
            <el-option :label="VENUE_STATUS_TEXT[VENUE_STATUS.MAINTENANCE]" :value="VENUE_STATUS.MAINTENANCE" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否可预约" prop="bookable">
          <el-radio-group v-model="specialDateForm.bookable">
            <el-radio :value="BOOKABLE_STATUS.BOOKABLE">{{ BOOKABLE_STATUS_TEXT[BOOKABLE_STATUS.BOOKABLE] }}</el-radio>
            <el-radio :value="BOOKABLE_STATUS.NOT_BOOKABLE">{{ BOOKABLE_STATUS_TEXT[BOOKABLE_STATUS.NOT_BOOKABLE] }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="specialDateForm.enabled">
            <el-radio :value="ENABLED_STATUS.ENABLED">{{ ENABLED_STATUS_TEXT[ENABLED_STATUS.ENABLED] }}</el-radio>
            <el-radio :value="ENABLED_STATUS.DISABLED">{{ ENABLED_STATUS_TEXT[ENABLED_STATUS.DISABLED] }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="配置描述">
          <el-input
            v-model="specialDateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddSpecialDate = false">取消</el-button>
          <el-button type="primary" @click="saveSpecialDate" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBatchOperation" title="批量操作" width="500px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="batchForm.operation">
            <el-radio value="enable">批量设为可用</el-radio>
            <el-radio value="disable">批量设为不可用</el-radio>
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
          <el-button type="primary" @click="executeBatchOperation" :loading="loading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

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

    .header-actions {
      display: flex;
      gap: 10px;
    }
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
      flex-wrap: wrap;
    }
  }

  .special-dates-card {
    .el-table {
      margin-top: 20px;
    }
  }

  .venue-detail {
    .el-descriptions {
      margin-top: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
