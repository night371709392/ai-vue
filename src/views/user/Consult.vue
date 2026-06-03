<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import UserNavbar from '@/components/UserNavbar.vue'
import { startSession as startSessionApi, getSessionList, deleteSession as deleteSessionApi, getSessionDetail, streamChat } from '@/api/frontend'

const input = ref('')
const messagesEl = ref(null)
const sessionId = ref(null)
const creating = ref(false)
const sending = ref(false)
const historyLoading = ref(false)
const streamCtrl = ref(null)
const messages = ref([
  {
    role: 'assistant',
    name: '小助手',
    content: '你好，我在这里陪你，今天想从哪里开始聊都可以，不用着急。',
  },
])

const history = ref([])

async function scrollMessagesToBottom() {
  await nextTick()
  const el = messagesEl.value
  if (el) el.scrollTop = el.scrollHeight
}

function insertPhrase() {
  input.value = '今天有点累'
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || sending.value) return

  if (!sessionId.value) {
    const ok = await ensureSession(text)
    if (!ok) return
  }

  messages.value.push({ role: 'user', name: '我', content: text })
  input.value = ''
  await scrollMessagesToBottom()

  sending.value = true
  messages.value.push({ role: 'assistant', name: '小助手', content: '' })
  const aiIdx = messages.value.length - 1

  streamCtrl.value = streamChat(sessionId.value, text, {
    async onChunk(content) {
      messages.value[aiIdx].content += content
      await nextTick()
      scrollMessagesToBottom()
    },
    onDone() {
      sending.value = false
      streamCtrl.value = null
    },
    onError(err) {
      sending.value = false
      streamCtrl.value = null
      const msg = err?.message || '流式响应中断'
      ElMessage.error(msg)
    },
  })
}

function createSession() {
  if (streamCtrl.value) {
    streamCtrl.value.abort()
    streamCtrl.value = null
  }
  sending.value = false
  sessionId.value = null
  messages.value = [
    {
      role: 'assistant',
      name: '小助手',
      content: '你好，我在这里陪你，今天想从哪里开始聊都可以，不用着急。',
    },
  ]
  ElMessage.success('已准备好新会话')
}

async function ensureSession(initialMessage) {
  if (sessionId.value) return true
  creating.value = true
  try {
    const now = new Date()
    const sessionTitle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    const data = await startSessionApi({ initialMessage, sessionTitle })
    sessionId.value = data?.sessionId ?? data?.id ?? null
    await fetchSessionList()
    return true
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '创建会话失败'
    ElMessage.error(msg)
    return false
  } finally {
    creating.value = false
  }
}

async function fetchSessionList() {
  historyLoading.value = true
  try {
    const data = await getSessionList({ pageNum: '1', pageSize: '10' })
    const list = data?.records ?? data?.list ?? data
    const arr = Array.isArray(list) ? list : []
    history.value = arr.map((item) => ({
      id: item.sessionId ?? item.id,
      title: item.sessionTitle ?? item.title ?? '',
      lastMessage: item.lastMessageContent ?? '',
      messageCount: item.messageCount ?? 0,
      duration: item.durationMinutes ?? 0,
    }))
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '获取会话列表失败'
    ElMessage.error(msg)
  } finally {
    historyLoading.value = false
  }
}

async function deleteSession(id) {
  try {
    await ElMessageBox.confirm('确定要删除该会话吗？删除后不可恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteSessionApi(id)
    if (sessionId.value === id) {
      sessionId.value = null
      messages.value = [
        {
          role: 'assistant',
          name: '小助手',
          content: '你好，我在这里陪你，今天想从哪里开始聊都可以，不用着急。',
        },
      ]
    }
    ElMessage.success('删除成功')
    await fetchSessionList()
  } catch (err) {
    if (err === 'cancel' || err === 'close') return
    const msg = err?.response?.data?.message || err?.message || '删除失败'
    ElMessage.error(msg)
  }
}

async function selectSession(id) {
  if (sessionId.value === id) return
  if (streamCtrl.value) {
    streamCtrl.value.abort()
    streamCtrl.value = null
  }
  sending.value = false
  historyLoading.value = true
  try {
    const data = await getSessionDetail(id)
    const raw = data?.records ?? data?.messages ?? data
    const list = Array.isArray(raw) ? raw : []
    messages.value = list.map((msg) => {
      const isUser = msg.senderType === 1 || msg.sender === 'USER' || msg.role === 'user'
      return {
        role: isUser ? 'user' : 'assistant',
        name: isUser ? '我' : '小助手',
        content: msg.content ?? msg.message ?? '',
        time: msg.createdAt ?? '',
      }
    })
    if (messages.value.length === 0) {
      messages.value = [
        {
          role: 'assistant',
          name: '小助手',
          content: '你好，我在这里陪你，今天想从哪里开始聊都可以，不用着急。',
        },
      ]
    }
    sessionId.value = id
    await scrollMessagesToBottom()
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '获取会话详情失败'
    ElMessage.error(msg)
  } finally {
    historyLoading.value = false
  }
}

watch(
  () => messages.value.length,
  () => scrollMessagesToBottom(),
)

onMounted(() => {
  fetchSessionList()
})
</script>

<template>
  <div class="consult-page">
    <UserNavbar />
    <main class="consult-main">
      <el-row :gutter="24" class="consult-row">
        <el-col :xs="24" :lg="17" class="consult-col consult-col--chat">
          <div class="chat-panel">
            <div class="chat-header">
              <div class="chat-header-title">
                <span class="chat-header-dot"></span>
                <h2>AI 咨询</h2>
              </div>
              <el-button class="btn-new-session" :loading="creating" @click="createSession">
                <span class="btn-new-session-icon">+</span>
                新会话
              </el-button>
            </div>

            <div ref="messagesEl" class="chat-messages">
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                class="message-row"
                :class="msg.role"
              >
                <div class="message-avatar" :class="msg.role">
                  {{ msg.role === 'assistant' ? 'AI' : '我' }}
                </div>
                <div class="message-body">
                  <span class="sender">{{ msg.name }}</span>
                  <div class="bubble">{{ msg.content }}</div>
                  <div class="message-time" v-if="msg.time">{{ msg.time }}</div>
                </div>
              </div>
            </div>

            <div class="chat-input-area">
              <div class="input-wrapper">
                <el-input
                  v-model="input"
                  type="textarea"
                  :rows="3"
                  maxlength="800"
                  show-word-limit
                  placeholder="在这里慢慢说，我会认真听..."
                  :disabled="sending"
                  class="chat-textarea"
                />
                <div class="chat-footer">
                  <span class="insert-link" @click="insertPhrase">💭 今天有点累</span>
                  <el-button
                    class="btn-send"
                    type="primary"
                    :loading="sending"
                    :disabled="sending || !input.trim()"
                    @click="sendMessage"
                  >
                    发送
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="7" class="consult-col consult-col--side">
          <div class="sidebar-scroll">
            <div class="side-card tips-card">
              <div class="tips-card-header">
                <span class="tips-icon">🌿</span>
                <h3>温柔建议</h3>
              </div>
              <ul class="tips">
                <li>给自己 10 分钟什么都不做，只感受呼吸。</li>
                <li>喝一杯温水，把注意力带回身体。</li>
                <li>把担心写下来，放进「明天再想」的盒子。</li>
              </ul>
            </div>

            <div class="side-card history-card">
              <div class="history-card-header">
                <h3>会话历史</h3>
                <el-button type="primary" link :loading="historyLoading" @click="fetchSessionList">刷新</el-button>
              </div>
              <div v-if="history.length" class="history-list">
                <div
                  v-for="(item, i) in history"
                  :key="i"
                  class="history-item"
                  :class="{ active: item.id === sessionId }"
                  @click="selectSession(item.id)"
                >
                  <div class="history-item-header">
                    <span class="history-item-title">{{ item.title }}</span>
                    <el-button type="danger" link size="small" @click.stop="deleteSession(item.id)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <p class="history-item-message" v-if="item.lastMessage">{{ item.lastMessage }}</p>
                  <div class="history-item-meta">
                    <span>{{ item.messageCount }} 条消息</span>
                    <span>{{ item.duration }} 分钟</span>
                  </div>
                </div>
              </div>
              <div v-else class="history-empty">
                <span class="history-empty-icon">📭</span>
                <span>暂无历史会话</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<style scoped>
.consult-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #f0f4f8 0%, #f5f7fa 40%, #fafbfc 100%);
}

.consult-main {
  flex: 1;
  min-height: 0;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 28px 24px;
  box-sizing: border-box;
  overflow: hidden;
}

.consult-row {
  height: 100%;
}

.consult-col {
  height: 100%;
}

.consult-col--chat {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.consult-col--side {
  min-height: 0;
}

/* ===== 聊天面板 ===== */
.chat-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f2f5;
  background: #fff;
}

.chat-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%);
  box-shadow: 0 0 8px rgba(61, 155, 143, 0.4);
}

.chat-header-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
  letter-spacing: 0.5px;
}

.btn-new-session {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #3d9b8f;
  background: #e8f5f2;
  border: 1px solid #d4ede8;
  transition: all 0.25s;
}

.btn-new-session:hover {
  color: #fff;
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(61, 155, 143, 0.3);
}

.btn-new-session-icon {
  font-size: 16px;
  font-weight: 300;
}

/* ===== 消息区域 ===== */
.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
  background: linear-gradient(180deg, #fafbfc 0%, #f8f9fb 100%);
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-row.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.message-avatar.assistant {
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%);
  color: #fff;
}

.message-avatar.user {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: #fff;
}

.message-body {
  max-width: 72%;
  min-width: 0;
}

.message-row .sender {
  display: block;
  font-size: 12px;
  color: #b0b8c1;
  margin-bottom: 4px;
  padding: 0 4px;
}

.message-row.user .sender {
  text-align: right;
}

.bubble {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.65;
  font-size: 14px;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-row.assistant .bubble {
  background: #fff;
  color: #303133;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.message-row.user .bubble {
  background: linear-gradient(135deg, #5cadff 0%, #409eff 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
  padding: 0 4px;
}

.message-row.user .message-time {
  text-align: right;
}

/* ===== 输入区域 ===== */
.chat-input-area {
  flex-shrink: 0;
  padding: 12px 24px 16px;
  border-top: 1px solid #f0f2f5;
  background: #fff;
}

.input-wrapper {
  background: #f8f9fb;
  border-radius: 14px;
  padding: 12px 14px 10px;
  border: 1px solid #ebeef5;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.input-wrapper:focus-within {
  border-color: #3d9b8f;
  box-shadow: 0 0 0 3px rgba(61, 155, 143, 0.08);
}

.chat-textarea :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  padding: 0 2px;
  color: #303133;
  min-height: 60px;
}

.chat-textarea :deep(.el-textarea__inner::placeholder) {
  color: #c0c4cc;
}

.chat-textarea :deep(.el-input__count) {
  background: transparent;
  font-size: 11px;
  color: #c0c4cc;
  bottom: 2px;
  right: 2px;
}

.chat-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.insert-link {
  font-size: 13px;
  color: #909399;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 14px;
  background: #ebeef5;
  transition: all 0.2s;
}

.insert-link:hover {
  color: #3d9b8f;
  background: #e8f5f2;
}

.btn-send {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%);
  border: none;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(61, 155, 143, 0.25);
}

.btn-send:hover {
  box-shadow: 0 4px 14px rgba(61, 155, 143, 0.4);
  transform: translateY(-1px);
}

.btn-send.is-disabled {
  background: #e4e7ed !important;
  box-shadow: none;
}

/* ===== 侧边栏 ===== */
.sidebar-scroll {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.side-card h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
}

/* ===== 温柔建议 ===== */
.tips-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.tips-icon {
  font-size: 18px;
}

.tips {
  margin: 0;
  padding-left: 18px;
  color: #606266;
  font-size: 13px;
  line-height: 2;
}

.tips li {
  padding: 2px 0;
}

.tips li::marker {
  color: #3d9b8f;
}

/* ===== 会话历史 ===== */
.history-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.history-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.history-card-header h3 {
  margin: 0;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-item {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fafbfc;
  margin-bottom: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-item:hover {
  background: #f0f4f8;
  border-color: #e4e7ed;
}

.history-item.active {
  background: linear-gradient(135deg, #e8f5f2 0%, #ecf5ff 100%);
  border-color: #3d9b8f;
  box-shadow: 0 2px 8px rgba(61, 155, 143, 0.1);
}

.history-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-item-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-message {
  margin: 6px 0 0;
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item-meta {
  display: flex;
  gap: 16px;
  margin-top: 6px;
  font-size: 11px;
  color: #c0c4cc;
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #c0c4cc;
  font-size: 13px;
  gap: 8px;
}

.history-empty-icon {
  font-size: 28px;
}

/* ===== 响应式 ===== */
@media (max-width: 991px) {
  .consult-page {
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .consult-main {
    overflow: visible;
    height: auto;
    padding: 12px 16px 20px;
  }

  .consult-row,
  .consult-col,
  .consult-col--chat {
    height: auto;
  }

  .chat-panel {
    min-height: 520px;
    flex: none;
  }

  .chat-messages {
    max-height: 400px;
    flex: none;
  }

  .sidebar-scroll {
    height: auto;
    overflow: visible;
    margin-top: 16px;
  }
}

@media (max-width: 640px) {
  .chat-header {
    padding: 12px 16px;
  }

  .chat-messages {
    padding: 14px 16px;
  }

  .chat-input-area {
    padding: 10px 16px 12px;
  }

  .message-body {
    max-width: 80%;
  }
}
</style>
