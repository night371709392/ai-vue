<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UserNavbar from '@/components/UserNavbar.vue'
import { getKnowledgeDetail } from '@/api/frontend'
import { articleCache } from '@/stores/articleCache'
import { useDarkMode } from '@/composables/useDarkMode'

const route = useRoute()
const router = useRouter()

/* ===== 黑夜模式 + 粒子特效 ===== */
const canvasRef = ref(null)
const { isDarkMode, toggleDarkMode, handlePageClick } = useDarkMode(canvasRef, {
  clickExcludeSelectors: [
    '.dark-toggle-btn',
    '.el-button',
    '.back-btn',
    '.user-navbar',
    'a',
    'button',
  ],
})

const article = ref(null)
const loading = ref(false)
const notFound = ref(false)

function normalizeArticle(raw) {
  return {
    id: raw.id ?? raw.articleId,
    category: raw.category ?? raw.categoryName ?? '',
    title: raw.title ?? '',
    authorName: raw.authorName ?? '',
    publishedAt: raw.publishedAt ?? '',
    summary: raw.summary ?? '',
    content: raw.content ?? '',
    readCount: raw.readCount ?? 0,
    updatedAt: raw.updatedAt ?? '',
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}年${m}月${day}日`
}

async function fetchArticle() {
  const id = route.params.id
  if (!id) {
    notFound.value = true
    return
  }

  const cached = articleCache.get(id)
  if (cached) {
    article.value = normalizeArticle(cached)
  }

  loading.value = true
  try {
    const data = await getKnowledgeDetail(id)
    const normalized = normalizeArticle(data?.data ?? data)
    article.value = normalized
    articleCache.set(id, data?.data ?? data)
    notFound.value = false
  } catch (err) {
    if (!article.value) {
      notFound.value = true
      const msg = err?.response?.data?.message || err?.message || '加载文章失败'
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}

const paragraphs = computed(() =>
  article.value ? article.value.content.split('\n').filter(Boolean) : [],
)

const formattedDate = computed(() => formatDate(article.value?.publishedAt))

onMounted(() => {
  fetchArticle()
})
</script>

<template>
  <div class="detail-page" :class="{ 'dark-mode': isDarkMode }" @click="handlePageClick">
    <!-- 黑夜模式星空画布 -->
    <canvas
      v-if="isDarkMode"
      ref="canvasRef"
      class="star-canvas"
    ></canvas>
    <UserNavbar />
    <main class="detail-main">
      <div class="back-row">
        <el-button class="back-btn" text @click="router.push('/knowledge')">
          <svg class="back-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回知识库
        </el-button>
        <button
          class="dark-toggle-btn"
          :title="isDarkMode ? '切换到白天模式' : '切换到黑夜模式'"
          @click="toggleDarkMode"
        >
          <span class="toggle-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="toggle-label">{{ isDarkMode ? '白天' : '夜间' }}</span>
        </button>
      </div>

      <div v-if="loading && !article" v-loading="true" class="loading-state"></div>

      <template v-if="article">
        <article>
          <div class="article-meta-top">
            <span class="article-tag" v-if="article.category">{{ article.category }}</span>
            <span class="article-reads" v-if="article.readCount">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ article.readCount }} 次阅读
            </span>
          </div>

          <h1 class="detail-title">{{ article.title }}</h1>

          <div class="article-byline">
            <span class="byline-author" v-if="article.authorName">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ article.authorName }}
            </span>
            <span class="byline-divider" v-if="article.authorName && formattedDate">·</span>
            <span class="byline-date" v-if="formattedDate">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {{ formattedDate }}
            </span>
          </div>

          <div class="article-summary-box" v-if="article.summary">
            <div class="summary-label">摘要</div>
            <p class="summary-text">{{ article.summary }}</p>
          </div>

          <div class="article-body">
            <p v-for="(p, i) in paragraphs" :key="i" class="paragraph">{{ p }}</p>
          </div>
        </article>
      </template>

      <div v-else-if="!loading && notFound" class="not-found">
        <span class="not-found-icon">📄</span>
        <span>文章不存在或已下架</span>
        <el-button class="back-link" type="primary" link @click="router.push('/knowledge')">返回知识库</el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbfc 0%, #fff 30%, #fafbfc 100%);
}

.detail-main {
  max-width: 780px;
  margin: 0 auto;
  padding: 28px 28px 60px;
}

.back-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.back-btn {
  font-size: 14px;
  color: #909399;
  padding: 6px 4px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #3d9b8f;
}

.back-icon {
  margin-right: 4px;
  flex-shrink: 0;
}

/* ===== 模式切换按钮 ===== */
.dark-toggle-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 24px;
  border: 1px solid #e4e7ed;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
}

.dark-toggle-btn:hover {
  border-color: #3d9b8f;
  color: #3d9b8f;
  box-shadow: 0 4px 14px rgba(61, 155, 143, 0.15);
  transform: translateY(-1px);
}

.dark-toggle-btn:active {
  transform: translateY(0);
}

.toggle-icon {
  font-size: 17px;
  line-height: 1;
}

.toggle-label {
  font-weight: 500;
}

.loading-state {
  height: 200px;
}

/* ===== 文章元信息 ===== */
.article-meta-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.article-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #3d9b8f;
  background: linear-gradient(135deg, #e8f5f2 0%, #d4ede8 100%);
  padding: 4px 12px;
  border-radius: 8px;
  letter-spacing: 0.3px;
}

.article-reads {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #b0b8c1;
}

/* ===== 标题 ===== */
.detail-title {
  margin: 0 0 18px;
  font-size: 30px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.45;
  letter-spacing: 0.3px;
}

/* ===== 作者行 ===== */
.article-byline {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid #f0f2f5;
  flex-wrap: wrap;
}

.byline-author,
.byline-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #909399;
}

.byline-divider {
  color: #dcdfe6;
  font-size: 14px;
}

/* ===== 摘要卡片 ===== */
.article-summary-box {
  background: linear-gradient(135deg, #f8f9fb 0%, #f0f4f8 100%);
  border-left: 3px solid #3d9b8f;
  border-radius: 0 12px 12px 0;
  padding: 20px 24px;
  margin-bottom: 32px;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  color: #3d9b8f;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.summary-text {
  margin: 0;
  font-size: 15px;
  line-height: 1.85;
  color: #606266;
}

/* ===== 正文 ===== */
.article-body {
  padding-top: 4px;
}

.paragraph {
  font-size: 16px;
  line-height: 2.1;
  color: #3a3a4a;
  margin: 0 0 22px;
  text-align: justify;
  text-indent: 2em;
}

.paragraph:first-child {
  text-indent: 0;
}

/* ===== 空状态 ===== */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #c0c4cc;
  font-size: 14px;
  gap: 12px;
}

.not-found-icon {
  font-size: 48px;
}

.back-link {
  margin-top: 8px;
}

/* ===== 星空画布 ===== */
.star-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
}

/* ===== 黑夜模式 ===== */
.dark-mode {
  background: #0b0f1a;
}

.dark-mode .user-navbar,
.dark-mode .detail-main {
  position: relative;
  z-index: 1;
}

/* 黑夜 - 导航栏 */
.dark-mode :deep(.user-navbar) {
  background: rgba(18, 22, 36, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
}

.dark-mode :deep(.brand-text) {
  color: #e8ecf2;
}

.dark-mode :deep(.nav-item) {
  color: #a0aab4;
}

.dark-mode :deep(.nav-item:hover),
.dark-mode :deep(.nav-item.active) {
  color: #5cadff;
}

.dark-mode :deep(.logout-btn) {
  border-color: rgba(255, 255, 255, 0.15);
  color: #c0c8d0;
}

.dark-mode :deep(.logout-btn:hover) {
  border-color: rgba(255, 255, 255, 0.25);
  color: #e8ecf2;
}

/* 黑夜 - 返回按钮 */
.dark-mode .back-btn {
  color: #8896a6;
}

.dark-mode .back-btn:hover {
  color: #5cadff;
}

/* 黑夜 - 切换按钮 */
.dark-mode .dark-toggle-btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #c0c8d0;
}

.dark-mode .dark-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #5cadff;
  color: #5cadff;
  box-shadow: 0 4px 18px rgba(92, 173, 255, 0.2);
}

/* 黑夜 - 文章元信息 */
.dark-mode .article-tag {
  color: #5cadff;
  background: rgba(92, 173, 255, 0.12);
}

.dark-mode .article-reads {
  color: #6b7a8d;
}

/* 黑夜 - 标题 */
.dark-mode .detail-title {
  color: #e0e6f0;
}

/* 黑夜 - 作者行 */
.dark-mode .article-byline {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.dark-mode .byline-author,
.dark-mode .byline-date {
  color: #8896a6;
}

.dark-mode .byline-divider {
  color: #5a6478;
}

/* 黑夜 - 摘要卡片 */
.dark-mode .article-summary-box {
  background: rgba(24, 30, 48, 0.7);
  border-left-color: #5cadff;
}

.dark-mode .summary-label {
  color: #5cadff;
}

.dark-mode .summary-text {
  color: #b0b8c4;
}

/* 黑夜 - 正文 */
.dark-mode .paragraph {
  color: #c8d0da;
}

/* 黑夜 - 空状态 */
.dark-mode .not-found {
  color: #6b7a8d;
}

/* 黑夜 - loading */
.dark-mode :deep(.el-loading-mask) {
  background-color: rgba(11, 15, 26, 0.6);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .back-row {
    gap: 10px;
  }

  .dark-toggle-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .toggle-icon {
    font-size: 15px;
  }
  .detail-main {
    padding: 16px 18px 40px;
  }

  .detail-title {
    font-size: 22px;
  }

  .article-summary-box {
    padding: 16px 18px;
  }

  .summary-text {
    font-size: 14px;
  }

  .paragraph {
    font-size: 15px;
    line-height: 1.9;
    text-indent: 1.5em;
  }
}
</style>
