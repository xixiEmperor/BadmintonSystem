<script setup>
import { ref, onMounted, onUnmounted, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { User, Calendar, Money, ShoppingBag } from '@element-plus/icons-vue'
import { getDashboardOverview, getUserRegistrationTrend, getUserRoleDistribution, getReservationTrend, getVenueUsageRanking, getRevenueTrend, getMallOrderTrend, getPopularProducts, getPostTrend } from '@/api/analytics'

const router = useRouter()

// 仪表板概览数据
const dashboardData = reactive({
  totalUsers: 0,
  newUsersToday: 0,
  newUsersThisMonth: 0,
  activeUsersToday: 0,
  totalReservations: 0,
  reservationsToday: 0,
  reservationsThisMonth: 0,
  reservationRevenue: 0,
  revenueToday: 0,
  revenueThisMonth: 0,
  totalOrders: 0,
  ordersToday: 0,
  ordersThisMonth: 0,
  mallRevenue: 0,
  mallRevenueToday: 0,
  mallRevenueThisMonth: 0,
  totalPosts: 0,
  postsToday: 0,
  totalReplies: 0,
  repliesToday: 0,
  totalVenues: 0,
  availableVenues: 0,
  venueUtilizationRate: 0
})

// 加载状态
const loading = ref(true)

// 图表实例
let userTrendChart = null
let userRoleChart = null
let reservationTrendChart = null
let venueUsageChart = null
let revenueTrendChart = null
let mallOrderChart = null
let popularProductsChart = null
let postTrendChart = null

// 跳转到审核页面
const goToReview = () => {
  router.push('/admin/booking-review')
}

// 获取仪表板概览数据
const fetchDashboardData = async () => {
  try {
    const response = await getDashboardOverview()
    if (response.data.code === 0) {
      Object.assign(dashboardData, response.data.data)
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    ElMessage.error('获取仪表板数据失败')
  }
}

// 初始化用户注册趋势图表
const initUserTrendChart = async () => {
  try {
    const response = await getUserRegistrationTrend({ period: '30d' })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('userTrendChart')
      if (chartDom) {
        userTrendChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '用户注册趋势',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#409eff' }
          }]
        }
        userTrendChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取用户注册趋势失败:', error)
  }
}

// 初始化用户角色分布图表
const initUserRoleChart = async () => {
  try {
    const response = await getUserRoleDistribution()
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('userRoleChart')
      if (chartDom) {
        userRoleChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '用户角色分布',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          series: [{
            name: '用户角色',
            type: 'pie',
            radius: '60%',
            data: response.data.data.data || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        }
        userRoleChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取用户角色分布失败:', error)
  }
}

// 初始化预约趋势图表
const initReservationTrendChart = async () => {
  try {
    const response = await getReservationTrend({ period: '30d' })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('reservationTrendChart')
      if (chartDom) {
        reservationTrendChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '预约趋势',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#67c23a' }
          }]
        }
        reservationTrendChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取预约趋势失败:', error)
  }
}

// 初始化场地使用率图表
const initVenueUsageChart = async () => {
  try {
    const response = await getVenueUsageRanking()
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('venueUsageChart')
      if (chartDom) {
        venueUsageChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '场地使用率排行',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || [],
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'bar',
            itemStyle: { color: '#e6a23c' }
          }]
        }
        venueUsageChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取场地使用率失败:', error)
  }
}

// 初始化收入趋势图表
const initRevenueTrendChart = async () => {
  try {
    const response = await getRevenueTrend({ period: '30d', type: 'all' })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('revenueTrendChart')
      if (chartDom) {
        revenueTrendChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '收入趋势',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis',
            formatter: function(params) {
              return params[0].name + '<br/>' +
                     params[0].seriesName + ': ¥' + params[0].value.toFixed(2)
            }
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#f56c6c' }
          }]
        }
        revenueTrendChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取收入趋势失败:', error)
  }
}

// 初始化商城订单趋势图表
const initMallOrderChart = async () => {
  try {
    const response = await getMallOrderTrend({ period: '30d' })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('mallOrderChart')
      if (chartDom) {
        mallOrderChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '商城订单趋势',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#909399' }
          }]
        }
        mallOrderChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取商城订单趋势失败:', error)
  }
}

// 初始化热门商品图表
const initPopularProductsChart = async () => {
  try {
    const response = await getPopularProducts({ limit: 10 })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('popularProductsChart')
      if (chartDom) {
        popularProductsChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '热门商品排行',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || [],
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'bar',
            itemStyle: { color: '#606266' }
          }]
        }
        popularProductsChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取热门商品失败:', error)
  }
}

// 初始化发帖趋势图表
const initPostTrendChart = async () => {
  try {
    const response = await getPostTrend({ period: '30d' })
    if (response.data.code === 0 && response.data.data) {
      const chartDom = document.getElementById('postTrendChart')
      if (chartDom) {
        postTrendChart = echarts.init(chartDom)
        const option = {
          title: {
            text: response.data.data.title || '发帖趋势',
            left: 'center',
            textStyle: { fontSize: 14 }
          },
          tooltip: {
            trigger: 'axis'
          },
          xAxis: {
            type: 'category',
            data: response.data.data.labels || []
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: response.data.data.data || [],
            type: 'line',
            smooth: true,
            itemStyle: { color: '#303133' }
          }]
        }
        postTrendChart.setOption(option)
      }
    }
  } catch (error) {
    console.error('获取发帖趋势失败:', error)
  }
}

// 图表自适应
const resizeCharts = () => {
  const charts = [
    userTrendChart,
    userRoleChart,
    reservationTrendChart,
    venueUsageChart,
    revenueTrendChart,
    mallOrderChart,
    popularProductsChart,
    postTrendChart
  ]

  charts.forEach(chart => {
    if (chart) {
      chart.resize()
    }
  })
}

// 初始化所有数据和图表
const initDashboard = async () => {
  loading.value = true
  try {
    // 获取概览数据
    await fetchDashboardData()

    // 等待DOM更新后初始化图表
    await nextTick()

    // 初始化所有图表
    await Promise.all([
      initUserTrendChart(),
      initUserRoleChart(),
      initReservationTrendChart(),
      initVenueUsageChart(),
      initRevenueTrendChart(),
      initMallOrderChart(),
      initPopularProductsChart(),
      initPostTrendChart()
    ])
  } catch (error) {
    console.error('初始化仪表板失败:', error)
    ElMessage.error('初始化仪表板失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initDashboard()
  window.addEventListener('resize', resizeCharts)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)

  // 销毁所有图表实例
  const charts = [
    userTrendChart,
    userRoleChart,
    reservationTrendChart,
    venueUsageChart,
    revenueTrendChart,
    mallOrderChart,
    popularProductsChart,
    postTrendChart
  ]

  charts.forEach(chart => {
    if (chart) {
      chart.dispose()
    }
  })
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 概览数据卡片 -->
    <div class="overview-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon user-icon">
                <el-icon><User /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">用户总数</div>
                <div class="card-value">{{ dashboardData.totalUsers.toLocaleString() }}</div>
                <div class="card-desc">今日新增: {{ dashboardData.newUsersToday }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon reservation-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">预约总数</div>
                <div class="card-value">{{ dashboardData.totalReservations.toLocaleString() }}</div>
                <div class="card-desc">今日预约: {{ dashboardData.reservationsToday }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon revenue-icon">
                <el-icon><Money /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">总收入</div>
                <div class="card-value">¥{{ (dashboardData.reservationRevenue + dashboardData.mallRevenue).toLocaleString() }}</div>
                <div class="card-desc">今日收入: ¥{{ (dashboardData.revenueToday + dashboardData.mallRevenueToday).toFixed(2) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="overview-card">
            <div class="card-content">
              <div class="card-icon order-icon">
                <el-icon><ShoppingBag /></el-icon>
              </div>
              <div class="card-info">
                <div class="card-title">商城订单</div>
                <div class="card-value">{{ dashboardData.totalOrders.toLocaleString() }}</div>
                <div class="card-desc">今日订单: {{ dashboardData.ordersToday }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 待办事项 -->
    <div class="todo-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>待办事项</h3>
          </div>
        </template>
        <el-alert
          title="场地预约审核"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            您有 <span class="todo-count">{{ dashboardData.reservationsToday }}</span> 条今日预约需要关注
          </template>
        </el-alert>
        <div class="action-btn">
          <el-button type="primary" @click="goToReview">去审核</el-button>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 用户相关图表 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="userTrendChart" class="chart"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <div id="userRoleChart" class="chart"></div>
          </el-card>
        </el-col>

        <!-- 预约相关图表 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="reservationTrendChart" class="chart"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <div id="venueUsageChart" class="chart"></div>
          </el-card>
        </el-col>

        <!-- 收入相关图表 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="revenueTrendChart" class="chart"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <div id="mallOrderChart" class="chart"></div>
          </el-card>
        </el-col>

        <!-- 商城和论坛图表 -->
        <el-col :span="12">
          <el-card class="chart-card">
            <div id="popularProductsChart" class="chart"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <div id="postTrendChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dashboard {
  padding: 20px;

  .overview-cards {
    margin-bottom: 20px;

    .overview-card {
      .card-content {
        display: flex;
        align-items: center;
        padding: 10px 0;

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;
          color: white;

          &.user-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.reservation-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.revenue-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.order-icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .card-info {
          flex: 1;

          .card-title {
            font-size: 14px;
            color: #909399;
            margin-bottom: 5px;
          }

          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .card-desc {
            font-size: 12px;
            color: #67c23a;
          }
        }
      }
    }
  }

  .todo-section {
    margin-bottom: 20px;

    .card-header {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .todo-count {
      color: #f56c6c;
      font-weight: bold;
      font-size: 16px;
    }

    .action-btn {
      margin-top: 15px;
      text-align: right;
    }
  }

  .charts-section {
    .chart-card {
      margin-bottom: 20px;
      height: 400px;

      .chart {
        height: 350px;
        width: 100%;
      }
    }
  }
}
</style>
