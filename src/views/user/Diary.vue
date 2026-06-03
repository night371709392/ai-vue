<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import UserNavbar from '@/components/UserNavbar.vue'
import { moodKeywords } from '@/mock/data'
import { addEmotionDiary } from '@/api/frontend'

const STORAGE_KEY = 'emotion_diary_records'

const sleepQualityLabels = ['很差', '较差', '一般', '较好', '很好']
const stressLevelLabels = ['很低', '较低', '中等', '较高', '很高']

const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  date: today,
  score: 6,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: 3,
  stressLevel: 3,
})

const saving = ref(false)
const records = ref([])

function cleanExpiredRecords(list) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  return list.filter((r) => r.date >= cutoffStr)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return
    const valid = cleanExpiredRecords(list)
    records.value = valid
    if (valid.length !== list.length) {
      saveToStorage()
    }
  } catch {
    records.value = []
  }
}

function saveToStorage() {
  try {
    const clean = cleanExpiredRecords(records.value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  } catch {
    /* 存储空间不足时静默失败 */
  }
}

const moodEmoji = computed(() => {
  const s = form.score
  if (s <= 3) return '😔'
  if (s <= 5) return '😐'
  if (s <= 7) return '😊'
  if (s <= 9) return '😄'
  return '🥰'
})

const moodLabel = computed(() => {
  const s = form.score
  if (s <= 3) return '心情低落'
  if (s <= 5) return '有些疲惫'
  if (s <= 7) return '感觉不错'
  if (s <= 9) return '心情愉快'
  return '非常开心'
})

const chartOption = computed(() => {
  if (!records.value.length) return null
  const sorted = [...records.value].sort((a, b) => a.date.localeCompare(b.date))
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 44, right: 20, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: sorted.map((d) => {
        const [, m, day] = d.date.split('-')
        return `${Number(m)}/${Number(day)}`
      }),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      min: 1,
      max: 10,
      splitLine: { lineStyle: { color: '#f0f2f5', type: 'dashed' } },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: sorted.map((d) => d.score),
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(61, 155, 143, 0.2)' },
              { offset: 1, color: 'rgba(61, 155, 143, 0.02)' },
            ],
          },
        },
        lineStyle: { color: '#3d9b8f', width: 3 },
        itemStyle: { color: '#3d9b8f' },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  }
})

const chartRecords = computed(() =>
  [...records.value].slice(0, 8).map((r) => ({
    date: r.date,
    score: r.score,
    emotion: r.dominantEmotion || '',
    summary: r.diaryContent && r.diaryContent.length > 16
      ? `${r.diaryContent.slice(0, 16)}...`
      : (r.diaryContent || ''),
  })),
)

async function saveDiary() {
  if (!form.dominantEmotion) {
    ElMessage.warning('请选择当前的主要情绪')
    return
  }
  if (!form.emotionTriggers.trim()) {
    ElMessage.warning('请填写情绪触发因素')
    return
  }
  if (!form.diaryContent.trim()) {
    ElMessage.warning('请写下今日感想')
    return
  }

  saving.value = true

  const entry = {
    date: form.date,
    score: form.score,
    dominantEmotion: form.dominantEmotion,
    diaryContent: form.diaryContent.trim(),
  }

  const idx = records.value.findIndex((r) => r.date === form.date)
  if (idx >= 0) records.value[idx] = entry
  else records.value.unshift(entry)

  saveToStorage()

  try {
    await addEmotionDiary({
      diaryDate: form.date,
      moodScore: form.score,
      dominantEmotion: form.dominantEmotion,
      emotionTriggers: form.emotionTriggers.trim(),
      diaryContent: form.diaryContent.trim(),
      sleepQuality: form.sleepQuality,
      stressLevel: form.stressLevel,
    })
  } catch {
    /* API 不可用时仍保留本地记录 */
  } finally {
    saving.value = false
    ElMessage.success('心情日记已保存')
  }
}

onMounted(() => {
  loadFromStorage()
})
</script>

<template>
  <div class="diary-page">
    <UserNavbar />
    <main class="diary-main">
      <div class="diary-hero">
        <h1 class="diary-hero-title">
          <span class="diary-hero-emoji">{{ moodEmoji }}</span>
          情绪日记
        </h1>
        <p class="diary-hero-sub">记录每一天的真实感受，温柔地看见自己。</p>
      </div>

      <el-row :gutter="24" class="diary-row">
        <el-col :xs="24" :lg="14">
          <div class="form-panel">
            <div class="form-panel-header">
              <h2>记录今天的心情</h2>
              <el-tag effect="plain" round size="small" type="info">{{ today }}</el-tag>
            </div>

            <div class="form-section">
              <div class="form-section-label">心情评分</div>
              <div class="mood-score-area">
                <span class="mood-score-emoji">{{ moodEmoji }}</span>
                <div class="mood-score-slider">
                  <div class="mood-score-value">{{ form.score }} / 10</div>
                  <el-slider
                    v-model="form.score"
                    :min="1"
                    :max="10"
                    :show-tooltip="false"
                    class="mood-slider"
                  />
                  <div class="mood-score-label">{{ moodLabel }}</div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <div class="form-section-label">主要情绪</div>
              <el-select
                v-model="form.dominantEmotion"
                placeholder="选择当前最主要的心情"
                style="width: 100%"
                size="large"
                class="emotion-select"
              >
                <el-option
                  v-for="k in moodKeywords"
                  :key="k"
                  :label="k"
                  :value="k"
                />
              </el-select>
            </div>

            <div class="form-section">
              <div class="form-section-label">情绪触发因素</div>
              <el-input
                v-model="form.emotionTriggers"
                placeholder="是什么事情触发了这种情绪？"
                maxlength="200"
                show-word-limit
                size="large"
                class="emotion-input"
              />
            </div>

            <div class="form-section">
              <div class="form-section-label">今日感想</div>
              <el-input
                v-model="form.diaryContent"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="不用写得很完整，真实就好。"
                class="diary-textarea"
              />
            </div>

            <el-row :gutter="16">
              <el-col :span="12">
                <div class="form-section">
                  <div class="form-section-label">
                    睡眠质量
                    <span class="form-section-hint">（{{ sleepQualityLabels[form.sleepQuality - 1] }}）</span>
                  </div>
                  <el-slider
                    v-model="form.sleepQuality"
                    :min="1"
                    :max="5"
                    :marks="{ 1: '差', 3: '中', 5: '好' }"
                    :show-tooltip="false"
                    class="metric-slider"
                  />
                </div>
              </el-col>
              <el-col :span="12">
                <div class="form-section">
                  <div class="form-section-label">
                    压力水平
                    <span class="form-section-hint">（{{ stressLevelLabels[form.stressLevel - 1] }}）</span>
                  </div>
                  <el-slider
                    v-model="form.stressLevel"
                    :min="1"
                    :max="5"
                    :marks="{ 1: '低', 3: '中', 5: '高' }"
                    :show-tooltip="false"
                    class="metric-slider"
                  />
                </div>
              </el-col>
            </el-row>

            <el-button
              class="save-btn"
              :loading="saving"
              @click="saveDiary"
            >
              <span class="save-btn-icon">💾</span>
              保存心情日记
            </el-button>
          </div>
        </el-col>

        <el-col :xs="24" :lg="10">
          <div class="chart-panel">
            <h2 class="chart-panel-title">心情曲线</h2>
            <VChart v-if="chartOption" class="mood-chart" :option="chartOption" autoresize />
            <div v-else class="chart-empty">
              <span class="chart-empty-icon">📊</span>
              <span>保存第一条记录后，这里会出现你的心情趋势</span>
            </div>
          </div>

          <div class="list-panel">
            <h2 class="list-panel-title">最近记录</h2>
            <div v-if="chartRecords.length" class="record-list">
              <div v-for="(r, i) in chartRecords" :key="i" class="record-item">
                <div class="record-item-left">
                  <span class="record-date">{{ r.date }}</span>
                  <span class="record-emotion" v-if="r.emotion">{{ r.emotion }}</span>
                </div>
                <div class="record-item-right">
                  <span class="record-score">{{ r.score }}/10</span>
                  <span class="record-summary" v-if="r.summary">{{ r.summary }}</span>
                </div>
              </div>
            </div>
            <div v-else class="list-empty">
              <span class="list-empty-icon">📝</span>
              <span>还没有记录，开始写第一篇吧</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<style scoped>
.diary-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f8 0%, #f5f7fa 40%, #fafbfc 100%);
}

.diary-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 28px 48px;
}

.diary-hero {
  margin-bottom: 28px;
}

.diary-hero-title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #1f2d3d;
  display: flex;
  align-items: center;
  gap: 12px;
}

.diary-hero-emoji {
  font-size: 32px;
  line-height: 1;
}

.diary-hero-sub {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.diary-row {
  align-items: flex-start;
}

/* ===== 表单面板 ===== */
.form-panel {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
}

.form-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.form-panel-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.form-section {
  margin-bottom: 20px;
}

.form-section-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-section-hint {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

/* 心情评分 */
.mood-score-area {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #f8f9fb;
  border-radius: 14px;
  padding: 16px 20px;
}

.mood-score-emoji {
  font-size: 40px;
  line-height: 1;
  flex-shrink: 0;
}

.mood-score-slider {
  flex: 1;
  min-width: 0;
}

.mood-score-value {
  font-size: 16px;
  font-weight: 700;
  color: #3d9b8f;
  margin-bottom: 4px;
}

.mood-score-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.mood-slider :deep(.el-slider__bar) {
  background: linear-gradient(90deg, #f56c6c 0%, #e6a23c 30%, #67c23a 60%, #3d9b8f 80%, #409eff 100%);
}

.mood-slider :deep(.el-slider__button) {
  width: 20px;
  height: 20px;
  border-color: #3d9b8f;
}

/* 情绪选择 */
.emotion-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
}

.emotion-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.emotion-select :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3d9b8f inset;
}

/* 文本输入 */
.emotion-input :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.diary-textarea :deep(.el-textarea__inner) {
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.7;
  padding: 12px 14px;
}

.diary-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3d9b8f;
  box-shadow: 0 0 0 2px rgba(61, 155, 143, 0.08);
}

/* 睡眠/压力滑块 */
.metric-slider :deep(.el-slider__bar) {
  background: linear-gradient(90deg, #3d9b8f 0%, #5cadff 100%);
}

.metric-slider :deep(.el-slider__button) {
  width: 18px;
  height: 18px;
  border-color: #3d9b8f;
}

.metric-slider :deep(.el-slider__marks-text) {
  font-size: 11px;
  color: #c0c4cc;
}

/* 保存按钮 */
.save-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 14px;
  margin-top: 8px;
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%);
  border: none;
  color: #fff;
  transition: all 0.25s;
  box-shadow: 0 4px 14px rgba(61, 155, 143, 0.3);
}

.save-btn:hover {
  box-shadow: 0 6px 20px rgba(61, 155, 143, 0.45);
  transform: translateY(-1px);
}

.save-btn:active {
  transform: translateY(0);
}

.save-btn-icon {
  margin-right: 6px;
}

/* ===== 图表面板 ===== */
.chart-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
}

.chart-panel-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.mood-chart {
  height: 260px;
  width: 100%;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 220px;
  color: #c0c4cc;
  font-size: 13px;
  gap: 10px;
}

.chart-empty-icon {
  font-size: 36px;
}

/* ===== 记录列表 ===== */
.list-panel {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
}

.list-panel-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 10px;
  background: #fafbfc;
  transition: background 0.2s;
}

.record-item:hover {
  background: #f0f4f8;
}

.record-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.record-date {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
}

.record-emotion {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  background: #e8f5f2;
  color: #3d9b8f;
  flex-shrink: 0;
}

.record-item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.record-score {
  font-size: 14px;
  font-weight: 700;
  color: #3d9b8f;
}

.record-summary {
  font-size: 12px;
  color: #c0c4cc;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #c0c4cc;
  font-size: 13px;
  gap: 8px;
}

.list-empty-icon {
  font-size: 28px;
}

/* ===== 响应式 ===== */
@media (max-width: 991px) {
  .diary-main {
    padding: 16px 16px 32px;
  }

  .diary-hero-title {
    font-size: 22px;
  }

  .form-panel {
    padding: 20px 20px;
  }

  .mood-score-area {
    padding: 12px 16px;
  }
}

@media (max-width: 640px) {
  .diary-hero-title {
    font-size: 20px;
  }

  .diary-hero-emoji {
    font-size: 26px;
  }

  .form-panel {
    padding: 16px 14px;
    border-radius: 12px;
  }

  .mood-score-emoji {
    font-size: 32px;
  }
}
</style>
