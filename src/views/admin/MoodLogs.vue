<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEmotionalPage, deleteEmotional } from '@/api/admin'
import { moodKeywords } from '@/mock/data'

const list = ref([])
const tableLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const queryUserId = ref('')
const queryMinScore = ref('')
const queryMaxScore = ref('')
const queryEmotion = ref('')

const dialogVisible = ref(false)
const currentDetail = ref(null)

function normalizeEmotionalPage(data) {
  const records = data?.records ?? data?.data ?? data?.list ?? data?.rows ?? data?.content ?? (Array.isArray(data) ? data : [])
  if (!Array.isArray(records)) {
    return { rows: [], total: 0 }
  }
  const rows = records.map(mapMoodRow)
  const count = data?.total ?? data?.totalCount ?? data?.totalElements ?? rows.length
  return { rows, total: Number(count) || 0 }
}

function mapMoodRow(item) {
  return {
    id: item.id ?? '',
    userId: item.userId ?? '',
    username: item.username ?? item.userName ?? '',
    nickname: item.nickname ?? item.userNickname ?? '',
    diaryDate: item.diaryDate ?? item.recordDate ?? item.createdAt ?? '',
    moodScore: item.moodScore ?? item.score ?? 0,
    dominantEmotion: item.dominantEmotion ?? item.emotion ?? item.mood ?? '',
    sleepQuality: item.sleepQuality ?? 0,
    stressLevel: item.stressLevel ?? 0,
    emotionTriggers: item.emotionTriggers ?? '',
    diaryContent: item.diaryContent ?? item.content ?? item.note ?? '',
    emotionIntensity: item.emotionIntensity ?? item.intensity ?? '',
    riskLevel: item.riskLevel ?? item.risk ?? '',
    emotionNature: item.emotionNature ?? item.nature ?? '',
    professionalAdvice: item.professionalAdvice ?? item.advice ?? '',
    riskDescription: item.riskDescription ?? item.riskDesc ?? '',
    improvementSuggestions: item.improvementSuggestions ?? item.suggestions ?? item.improvement ?? '',
  }
}

async function loadList() {
  tableLoading.value = true
  try {
    const params = {
      current: String(currentPage.value),
      size: String(pageSize.value),
    }
    if (queryUserId.value.trim()) params.userId = queryUserId.value.trim()
    if (queryMinScore.value.trim()) params.minMoodScore = queryMinScore.value.trim()
    if (queryMaxScore.value.trim()) params.maxMoodScore = queryMaxScore.value.trim()
    if (queryEmotion.value) params.dominantEmotion = queryEmotion.value
    const data = await getEmotionalPage(params)
    const { rows, total: totalCount } = normalizeEmotionalPage(data)
    list.value = rows
    total.value = totalCount
  } catch {
    list.value = []
    total.value = 0
  } finally {
    tableLoading.value = false
  }
}

function handleQuery() {
  currentPage.value = 1
  loadList()
}

function handlePageChange(page) {
  currentPage.value = page
  loadList()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadList()
}

function showDetail(row) {
  currentDetail.value = row
  dialogVisible.value = true
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(`确定删除日志 ${row.id}？`, '提示', { type: 'warning' })
    await deleteEmotional(row.id)
    ElMessage.success('删除成功')
    loadList()
  } catch {
  }
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="admin-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form" @submit.prevent="handleQuery">
        <el-form-item label="用户ID">
          <el-input v-model="queryUserId" placeholder="请输入用户ID" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="情绪分">
          <el-input v-model="queryMinScore" placeholder="下限" clearable style="width: 90px" />
          <span class="score-sep">—</span>
          <el-input v-model="queryMaxScore" placeholder="上限" clearable style="width: 90px" />
        </el-form-item>
        <el-form-item label="主要情绪">
          <el-select v-model="queryEmotion" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="kw in moodKeywords" :key="kw" :label="kw" :value="kw" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="tableLoading" @click="handleQuery">查询</el-button>
          <el-button @click="() => { queryUserId = ''; queryMinScore = ''; queryMaxScore = ''; queryEmotion = ''; handleQuery() }">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="tableLoading" :data="list" stripe>
        <el-table-column prop="userId" label="用户ID" width="75" />
        <el-table-column prop="id" label="会话ID" width="85" />
        <el-table-column prop="diaryDate" label="记录日期" width="145" />
        <el-table-column label="情绪评分" width="220">
          <template #default="{ row }">
            <div class="rate-cell">
              <el-rate
                :model-value="row.moodScore"
                :max="10"
                disabled
                show-score
                :score-template="`${row.moodScore}/10`"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="睡眠" width="170">
          <template #default="{ row }">
            <div class="rate-cell">
              <el-rate
                :model-value="row.sleepQuality"
                :max="5"
                disabled
                show-score
                :score-template="`${row.sleepQuality}/5`"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="压力" width="170">
          <template #default="{ row }">
            <div class="rate-cell">
              <el-rate
                :model-value="row.stressLevel"
                :max="5"
                disabled
                show-score
                :score-template="`${row.stressLevel}/5`"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="emotionTriggers" label="情绪触发因素" width="130" show-overflow-tooltip />
        <el-table-column prop="diaryContent" label="日记内容" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button type="primary" link @click="showDetail(row)">详情</el-button>
            <el-button type="danger" link @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="情绪日志详情" width="620px">
      <template v-if="currentDetail">
        <div class="detail-section">
          <div class="detail-section-title">用户信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">用户名</span>
              <span class="detail-value">{{ currentDetail.username || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">昵称</span>
              <span class="detail-value">{{ currentDetail.nickname || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用户ID</span>
              <span class="detail-value">{{ currentDetail.userId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">记录日期</span>
              <span class="detail-value">{{ currentDetail.diaryDate }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">情绪状态</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">情绪评分</span>
              <div class="rate-cell">
                <el-rate
                  :model-value="currentDetail.moodScore"
                  :max="10"
                  disabled
                  show-score
                  :score-template="`${currentDetail.moodScore}/10`"
                />
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">主要情绪</span>
              <span class="detail-value">{{ currentDetail.dominantEmotion || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">睡眠质量</span>
              <div class="rate-cell">
                <el-rate
                  :model-value="currentDetail.sleepQuality"
                  :max="5"
                  disabled
                  show-score
                  :score-template="`${currentDetail.sleepQuality}/5`"
                />
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-label">压力水平</span>
              <div class="rate-cell">
                <el-rate
                  :model-value="currentDetail.stressLevel"
                  :max="5"
                  disabled
                  show-score
                  :score-template="`${currentDetail.stressLevel}/5`"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">日记内容</div>
          <div class="detail-block" v-if="currentDetail.emotionTriggers">
            <div class="detail-label">情绪触发因素</div>
            <div class="detail-text">{{ currentDetail.emotionTriggers }}</div>
          </div>
          <div class="detail-block" v-if="currentDetail.diaryContent">
            <div class="detail-label">日记内容</div>
            <div class="detail-text">{{ currentDetail.diaryContent }}</div>
          </div>
          <div v-if="!currentDetail.emotionTriggers && !currentDetail.diaryContent" class="detail-empty">暂无日记内容</div>
        </div>

        <div class="detail-section" v-if="currentDetail.dominantEmotion || currentDetail.emotionIntensity || currentDetail.riskLevel || currentDetail.emotionNature">
          <div class="detail-section-title">AI情绪分析结果</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">主要情绪</span>
              <span class="detail-value">{{ currentDetail.dominantEmotion || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">情绪强度</span>
              <span class="detail-value">{{ currentDetail.emotionIntensity || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">风险等级</span>
              <el-tag v-if="currentDetail.riskLevel" :type="currentDetail.riskLevel === '高' ? 'danger' : currentDetail.riskLevel === '中' ? 'warning' : 'success'" size="small">
                {{ currentDetail.riskLevel }}
              </el-tag>
              <span v-else class="detail-value">-</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">情绪性质</span>
              <span class="detail-value">{{ currentDetail.emotionNature || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.professionalAdvice || currentDetail.riskDescription || currentDetail.improvementSuggestions">
          <div class="detail-section-title">专业建议</div>
          <div class="detail-block" v-if="currentDetail.riskDescription">
            <div class="detail-label">风险描述</div>
            <div class="detail-text">{{ currentDetail.riskDescription }}</div>
          </div>
          <div class="detail-block" v-if="currentDetail.improvementSuggestions">
            <div class="detail-label">改善建议</div>
            <div class="detail-text">{{ currentDetail.improvementSuggestions }}</div>
          </div>
          <div class="detail-block" v-if="currentDetail.professionalAdvice">
            <div class="detail-label">专业建议</div>
            <div class="detail-text">{{ currentDetail.professionalAdvice }}</div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.table-card {
  border-radius: 12px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.score-sep {
  margin: 0 8px;
  color: #909399;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.rate-cell {
  display: flex;
  align-items: center;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section + .detail-section {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.detail-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.detail-label {
  color: #909399;
  font-size: 13px;
  width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: #303133;
  font-size: 14px;
}

.detail-block {
  margin-bottom: 14px;
}

.detail-block .detail-label {
  margin-bottom: 6px;
}

.detail-text {
  color: #303133;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 14px;
}

.detail-empty {
  text-align: center;
  color: #909399;
  padding: 16px 0;
  font-size: 13px;
}
</style>
