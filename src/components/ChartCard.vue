<template>
  <el-card class="chart-card" v-loading="loading">
    <template #header v-if="title">
      <div class="chart-header">
        <h4>{{ title }}</h4>
        <div class="chart-actions" v-if="$slots.actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>
    <div :id="chartId" class="chart" :style="{ height: height }"></div>
  </el-card>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  chartId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  option: {
    type: Object,
    required: true
  },
  height: {
    type: String,
    default: '350px'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['chart-ready'])

let chart = null

const initChart = () => {
  const chartDom = document.getElementById(props.chartId)
  if (chartDom && props.option) {
    if (chart) {
      chart.dispose()
    }
    chart = echarts.init(chartDom)
    chart.setOption(props.option)
    emit('chart-ready', chart)
  }
}

const resizeChart = () => {
  if (chart) {
    chart.resize()
  }
}

watch(() => props.option, () => {
  if (chart && props.option) {
    chart.setOption(props.option, true)
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style lang="less" scoped>
.chart-card {
  margin-bottom: 20px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .chart {
    width: 100%;
  }
}
</style>
