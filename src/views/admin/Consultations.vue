<script setup>
import { onMounted, ref } from 'vue'
import { getConsultationPage, getSessionDetail } from '@/api/admin'
import { moodKeywords } from '@/mock/data'

const list = ref([])
const tableLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const emotionTag = ref('')

const dialogVisible = ref(false)
const currentSession = ref(null)
const messages = ref([])
const detailLoading = ref(false)

function normalizeConsultationPage(data) {
  const records = data?.records ?? data?.list ?? data?.rows ?? (Array.isArray(data) ? data : [])
  const rows = records.map(mapConsultationRow)
  const count = data?.total ?? data?.totalCount ?? rows.length
  return { rows, total: Number(count) || 0 }
}

function mapConsultationRow(item) {
  return {
    id: item.id ?? '',
    user: item.userNickname ?? item.user ?? item.username ?? '',
    startTime: item.startedAt ?? item.startTime ?? '',
    duration: item.durationMinutes != null ? `${item.durationMinutes}分钟` : (item.duration ?? ''),
    summary: item.sessionTitle ?? item.summary ?? item.title ?? '',
    messageCount: item.messageCount ?? 0,
    lastMessageContent: item.lastMessageContent ?? '',
    lastMessageTime: item.lastMessageTime ?? '',
  }
}

async function loadList() {
  if (!emotionTag.value) {
    list.value = []
    total.value = 0
    return
  }

  tableLoading.value = true
  try {
    const params = {
      currentPage: String(currentPage.value),
      size: String(pageSize.value),
      emotionTag: emotionTag.value,
    }
    const data = await getConsultationPage(params)
    const { rows, total: totalCount } = normalizeConsultationPage(data)
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

async function showMessages(row) {
  currentSession.value = row
  dialogVisible.value = true
  messages.value = []
  detailLoading.value = true
  try {
    const data = await getSessionDetail(row.id)
    messages.value = Array.isArray(data) ? data : (data?.records ?? data?.list ?? [])
  } catch {
    messages.value = []
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  if (emotionTag.value) {
    loadList()
  }
})
</script>

<template>
  <div class="admin-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form" @submit.prevent="handleQuery">
        <el-form-item label="情绪标签" required>
          <el-select v-model="emotionTag" placeholder="请选择情绪标签" clearable style="width: 200px" @change="handleQuery">
            <el-option v-for="kw in moodKeywords" :key="kw" :label="kw" :value="kw" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="tableLoading" @click="handleQuery" :disabled="!emotionTag">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="tableLoading" :data="list" stripe>
        <el-table-column prop="id" label="会话ID" width="100" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="duration" label="时长" width="100" />
        <el-table-column prop="summary" label="摘要" min-width="200" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showMessages(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!emotionTag" class="empty-hint">
        请先选择情绪标签后查询
      </div>

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

    <el-dialog v-model="dialogVisible" title="会话详情" width="580px">
      <template v-if="currentSession">
        <div class="dialog-info">
          <div class="dialog-info-row">
            <span class="dialog-label">会话ID</span>
            <span>{{ currentSession.id }}</span>
          </div>
          <div class="dialog-info-row">
            <span class="dialog-label">用户</span>
            <span>{{ currentSession.user }}</span>
          </div>
          <div class="dialog-info-row">
            <span class="dialog-label">开始时间</span>
            <span>{{ currentSession.startTime }}</span>
          </div>
          <div class="dialog-info-row">
            <span class="dialog-label">时长</span>
            <span>{{ currentSession.duration }}</span>
          </div>
          <div class="dialog-info-row">
            <span class="dialog-label">消息数</span>
            <span>{{ currentSession.messageCount }}</span>
          </div>
        </div>
        <div class="dialog-chat">
          <div class="dialog-section-title">对话记录</div>
          <div v-loading="detailLoading" class="chat-list">
            <div v-if="!detailLoading && messages.length === 0" class="chat-empty">暂无消息记录</div>
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="chat-bubble"
              :class="msg.senderType === 1 ? 'chat-user' : 'chat-assistant'"
            >
              <div class="chat-role">{{ msg.senderTypeDesc || (msg.senderType === 1 ? '用户' : '助手') }}</div>
              <div class="chat-content">{{ msg.content }}</div>
              <div class="chat-time">{{ msg.createdAt }}</div>
            </div>
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  padding: 80px 0;
  font-size: 14px;
}

.dialog-info {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.dialog-info-row {
  display: flex;
  padding: 6px 0;
  font-size: 14px;
  line-height: 1.6;
}

.dialog-info-row + .dialog-info-row {
  border-top: 1px solid #e8eaed;
}

.dialog-label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.dialog-chat {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.dialog-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.chat-list {
  max-height: 360px;
  overflow-y: auto;
}

.chat-empty {
  text-align: center;
  color: #909399;
  padding: 32px 0;
  font-size: 14px;
}

.chat-bubble {
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  max-width: 85%;
}

.chat-user {
  background: #ecf5ff;
  margin-left: auto;
}

.chat-assistant {
  background: #f5f7fa;
}

.chat-role {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.chat-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
}

.chat-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 6px;
  text-align: right;
}
</style>
