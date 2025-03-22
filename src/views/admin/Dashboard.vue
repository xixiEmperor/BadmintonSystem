<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()

// 管理员信息(模拟数据)
const adminName = ref('管理员')
const loginCount = ref(42)
const lastLoginTime = ref('2023-11-08 15:30:45')

// 待审核预定数量(模拟数据)
const pendingBookings = ref(5)

// 图表相关
let chart = null
let courtChart = null
const chartContainer = ref(null)

// 跳转到审核页面
const goToReview = () => {
  router.push('/admin/booking-review')
}

// 初始化图表
const initChart = () => {
  if (chart) {
    chart.dispose()
  }

  chart = echarts.init(document.getElementById('statsChart'))

  const option = {
    title: {
      text: '系统数据统计',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['管理员登录次数', '场地预定数量'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '管理员登录次数',
        type: 'line',
        data: [5, 7, 3, 9, 8, 2, 6],
        itemStyle: {
          color: '#f56c6c',
        },
      },
      {
        name: '场地预定数量',
        type: 'line',
        data: [10, 12, 15, 8, 20, 25, 18],
        itemStyle: {
          color: '#409eff',
        },
      },
    ],
  }

  chart.setOption(option)
}

// 初始化场地预定次数统计图表
const initCourtStatsChart = () => {
  if (courtChart) {
    courtChart.dispose()
  }

  courtChart = echarts.init(document.getElementById('courtStatsChart'))

  const option = {
    title: {
      text: '各场地预定次数',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: ['1号场地', '2号场地', '3号场地', '4号场地', '5号场地'],
    },
    series: [
      {
        name: '预定次数',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 45, name: '1号场地' },
          { value: 38, name: '2号场地' },
          { value: 32, name: '3号场地' },
          { value: 28, name: '4号场地' },
          { value: 22, name: '5号场地' },
        ],
      },
    ],
  }

  courtChart.setOption(option)
}

// 图表自适应
const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
  if (courtChart) {
    courtChart.resize()
  }
}

onMounted(() => {
  // 初始化图表
  initChart()
  initCourtStatsChart()

  // 窗口大小变化时，重新调整图表大小
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', resizeChart)

  // 销毁图表实例
  if (chart) {
    chart.dispose()
    chart = null
  }
  if (courtChart) {
    courtChart.dispose()
    courtChart = null
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎信息 -->
    <div class="welcome">
      <h2 class="welcome-text">
        您好，{{ adminName }}，这是您第 {{ loginCount }} 次登录，上次登录时间：{{ lastLoginTime }}
      </h2>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <!-- 待办事项区域 -->
      <div class="todo-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h3>待办事项</h3>
            </div>
          </template>
          <div class="todo-content">
            <el-alert title="场地预定审核" type="info" :closable="false" show-icon>
              <template #default>
                您有 <span class="todo-count">{{ pendingBookings }}</span> 条未审核的场地预定信息
              </template>
            </el-alert>
            <div class="action-btn">
              <el-button type="primary" @click="goToReview">去审核</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 统计图表区域 -->
      <div class="stats-section">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <h3>后台统计</h3>
            </div>
          </template>
          <div class="chart-container" ref="chartContainer">
            <div id="statsChart" class="chart"></div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 场地预定次数统计 -->
    <div class="court-stats">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <h3>场地预定次数统计</h3>
          </div>
        </template>
        <div class="court-chart-container">
          <div id="courtStatsChart" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="less" scoped>
.dashboard {
  .welcome {
    margin-bottom: 20px;

    .welcome-text {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .content {
    display: flex;
    margin: 0 -10px;
    margin-bottom: 20px;

    .todo-section {
      width: 25%;
      padding: 0 10px;
    }

    .stats-section {
      width: 75%;
      padding: 0 10px;
    }

    .box-card {
      height: 460px;
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }
    }

    .todo-content {
      .todo-count {
        color: #f56c6c;
        font-weight: bold;
        font-size: 16px;
      }

      .action-btn {
        margin-top: 20px;
        text-align: right;
      }
    }

    .chart-container {
      width: 100%;

      .chart {
        height: 400px;
        width: 100%;
      }
    }
  }

  .court-stats {
    .box-card {
      margin-bottom: 20px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }
    }

    .court-chart-container {
      width: 100%;

      .chart {
        height: 400px;
        width: 100%;
      }
    }
  }
}
</style>
