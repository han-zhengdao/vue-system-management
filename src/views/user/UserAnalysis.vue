<template>
  <div class="container">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6" v-for="item in overviewData" :key="item.title">
        <el-card shadow="hover">
          <div class="overview-item">
            <div class="item-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="item-info">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-value">{{ item.value }}</div>
              <div class="item-trend">
                较上周
                <span :class="item.trend >= 0 ? 'up' : 'down'">
                  {{ Math.abs(item.trend) }}%
                  <el-icon><CaretTop v-if="item.trend >= 0" /><CaretBottom v-else /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-container">
      <!-- 用户增长趋势 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="growthTimeRange" size="small">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-content">
            <v-chart class="chart" :option="userGrowthOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- 用户活跃度 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户活跃度分析</span>
              <el-radio-group v-model="activeTimeRange" size="small">
                <el-radio-button label="day">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-content">
            <v-chart class="chart" :option="userActiveOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-container">
      <!-- 用户地域分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户地域分布</span>
            </div>
          </template>
          <div class="chart-content">
            <v-chart class="chart" :option="userRegionOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- 用户画像分析 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>用户画像分析</span>
            </div>
          </template>
          <div class="chart-content">
            <v-chart class="chart" :option="userPortraitOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { CaretTop, CaretBottom, User, Timer, ShoppingCart, Wallet } from '@element-plus/icons-vue';

// 注册必要的组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

// 数据概览
const overviewData = ref([
  {
    title: '总用户数',
    value: '12,345',
    trend: 5.2,
    icon: 'User',
    color: '#409eff'
  },
  {
    title: '日活用户',
    value: '2,341',
    trend: -2.1,
    icon: 'Timer',
    color: '#67c23a'
  },
  {
    title: '下单用户',
    value: '1,234',
    trend: 8.5,
    icon: 'ShoppingCart',
    color: '#e6a23c'
  },
  {
    title: '付费用户',
    value: '987',
    trend: 3.2,
    icon: 'Wallet',
    color: '#f56c6c'
  }
]);

// 时间范围选择
const growthTimeRange = ref('week');
const activeTimeRange = ref('day');

// 用户增长趋势图表配置
const userGrowthOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['新增用户', '活跃用户']
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      data: [220, 182, 191, 234, 290, 330, 310]
    }
  ]
});

// 用户活跃度图表配置
const userActiveOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      type: 'bar',
      data: [120, 80, 150, 280, 370, 220],
      itemStyle: {
        color: '#409eff'
      }
    }
  ]
});

// 用户地域分布图表配置
const userRegionOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '华东' },
        { value: 735, name: '华北' },
        { value: 580, name: '华南' },
        { value: 484, name: '西南' },
        { value: 300, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});

// 用户画像分析图表配置
const userPortraitOption = ref({
  radar: {
    indicator: [
      { name: '消费能力', max: 100 },
      { name: '活跃度', max: 100 },
      { name: '购买频率', max: 100 },
      { name: '忠诚度', max: 100 },
      { name: '社交影响力', max: 100 }
    ]
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [80, 70, 60, 85, 75],
          name: '用户画像'
        }
      ]
    }
  ]
});

// 获取数据方法
const getData = async () => {
  try {
    // TODO: 调用API获取数据
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #fff;
  font-size: 24px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.item-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-trend {
  font-size: 12px;
  color: #999;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-content {
  height: 320px;
}

.chart {
  height: 100%;
}
</style> 