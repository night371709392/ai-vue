<script setup>
import { computed, onMounted, ref } from 'vue'
import { User, DataLine, ChatDotRound, Sunny } from '@element-plus/icons-vue'
import { getAnalyticsOverview } from '@/api/admin'

const overview = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalDiaries: 0,
  todayNewDiaries: 0,
  totalSessions: 0,
  todayNewSessions: 0,
  avgMoodScore: 0,
})

const emotionTrend = ref([])
const consultationTotalSessions = ref(0)
const dailyTrend = ref([])
const userActivity = ref([])

const emotionChart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, data: ['平均情绪评分', '记录数量'] },
  grid: { left: 50, right: 30, top: 30, bottom: 50 },
  xAxis: {
    type: 'category',
    data: emotionTrend.value.map((d) => (d.date ?? d.label ?? d.name ?? '')),
  },
  yAxis: { type: 'value', max: 10 },
  series: [
    {
      name: '平均情绪评分',
      type: 'line',
      smooth: true,
      data: emotionTrend.value.map((d) => d.avgMoodScore ?? d.score ?? 0),
      itemStyle: { color: '#e6a23c' },
      lineStyle: { color: '#e6a23c' },
    },
    {
      name: '记录数量',
      type: 'line',
      smooth: true,
      data: emotionTrend.value.map((d) => d.count ?? d.recordCount ?? 0),
      itemStyle: { color: '#f0c040' },
      lineStyle: { color: '#f0c040' },
    },
  ],
}))

const sessionChart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0, data: ['会话数量', '参与用户数'] },
  grid: { left: 50, right: 20, top: 30, bottom: 50 },
  xAxis: {
    type: 'category',
    data: dailyTrend.value.map((d) => d.date ?? ''),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '会话数量',
      type: 'bar',
      data: dailyTrend.value.map((d) => d.sessionCount ?? 0),
      itemStyle: { color: '#409eff' },
    },
    {
      name: '参与用户数',
      type: 'bar',
      data: dailyTrend.value.map((d) => d.userCount ?? 0),
      itemStyle: { color: '#f0c040' },
    },
  ],
}))

const activityChart = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { bottom: 0 },
  grid: { left: 50, right: 30, top: 30, bottom: 50 },
  xAxis: {
    type: 'category',
    data: userActivity.value.map((d) => (d.date ?? d.label ?? d.name ?? '')),
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '活跃用户',
      type: 'line',
      smooth: true,
      data: userActivity.value.map((d) => d.activeUsers ?? d.active ?? 0),
      itemStyle: { color: '#9b59b6' },
    },
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      data: userActivity.value.map((d) => d.newUsers ?? d.new ?? 0),
      itemStyle: { color: '#409eff' },
    },
    {
      name: '日记用户',
      type: 'line',
      smooth: true,
      data: userActivity.value.map((d) => d.diaryUsers ?? d.diary ?? 0),
      itemStyle: { color: '#67c23a' },
    },
    {
      name: '咨询用户',
      type: 'line',
      smooth: true,
      data: userActivity.value.map((d) => d.consultationUsers ?? 0),
      itemStyle: { color: '#e6a23c' },
    },
  ],
}))

onMounted(async () => {
  const data = await getAnalyticsOverview()
  if (data) {
    if (data.systemOverview) {
      overview.value = {
        totalUsers: data.systemOverview.totalUsers ?? 0,
        activeUsers: data.systemOverview.activeUsers ?? 0,
        totalDiaries: data.systemOverview.totalDiaries ?? 0,
        todayNewDiaries: data.systemOverview.todayNewDiaries ?? 0,
        totalSessions: data.systemOverview.totalSessions ?? 0,
        todayNewSessions: data.systemOverview.todayNewSessions ?? 0,
        avgMoodScore: data.systemOverview.avgMoodScore ?? 0,
      }
    }
    if (data.emotionTrend) {
      emotionTrend.value = data.emotionTrend
    }
    if (data.consultationStats) {
      consultationTotalSessions.value = data.consultationStats.totalSessions ?? 0
      if (data.consultationStats.dailyTrend) {
        dailyTrend.value = data.consultationStats.dailyTrend
      }
    }
    if (data.userActivity) {
      userActivity.value = data.userActivity
    }
  }
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon purple"><el-icon><User /></el-icon></div>
          <div>
            <div class="stat-label">总用户数</div>
            <div class="stat-value">{{ overview.totalUsers }}</div>
            <div class="stat-sub">活跃用户: {{ overview.activeUsers }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon pink"><el-icon><DataLine /></el-icon></div>
          <div>
            <div class="stat-label">情绪日志</div>
            <div class="stat-value">{{ overview.totalDiaries }}</div>
            <div class="stat-sub">今日新增: {{ overview.todayNewDiaries }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon blue"><el-icon><ChatDotRound /></el-icon></div>
          <div>
            <div class="stat-label">咨询会话</div>
            <div class="stat-value">{{ overview.totalSessions }}</div>
            <div class="stat-sub">今日新增: {{ overview.todayNewSessions }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card" shadow="never">
          <div class="stat-icon green"><el-icon><Sunny /></el-icon></div>
          <div>
            <div class="stat-label">平均情绪</div>
            <div class="stat-value">{{ overview.avgMoodScore }}/10</div>
            <div class="stat-sub">情绪健康指数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card" shadow="never">
          <template #header>情绪趋势分析</template>
          <VChart class="chart-md" :option="emotionChart" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div>
              <div>咨询会话统计</div>
              <p class="session-summary">
                总会话数: {{ consultationTotalSessions }} · 活跃用户: {{ overview.activeUsers }}
              </p>
            </div>
          </template>
          <p class="chart-subtitle">咨询活跃统计</p>
          <VChart class="chart-md" :option="sessionChart" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card" shadow="never">
      <template #header>用户活跃度趋势</template>
      <VChart class="chart-lg" :option="activityChart" autoresize />
    </el-card>
  </div>
</template>

<style scoped>
.dashboard .stat-row {
  margin-bottom: 16px;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
}

.stat-icon.purple {
  background: #9b7fd4;
}
.stat-icon.pink {
  background: #f089a8;
}
.stat-icon.blue {
  background: #6eb5ff;
}
.stat-icon.green {
  background: #7bc67e;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin: 4px 0;
}

.stat-sub {
  font-size: 12px;
  color: #909399;
}

.chart-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.chart-md {
  height: 280px;
}

.chart-lg {
  height: 320px;
}

.session-summary {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.chart-subtitle {
  margin: 0 0 8px;
  font-size: 13px;
  color: #606266;
}
</style>
