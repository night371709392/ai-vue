<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import UserNavbar from '@/components/UserNavbar.vue'
import { getKnowledgeList } from '@/api/frontend'

const router = useRouter()
const userStore = useUserStore()

const list = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 24
const total = ref(0)

const subtitle = computed(() =>
  userStore.isLoggedIn && !userStore.isAdmin
    ? '放慢节奏，选一篇适合自己的小文。'
    : '精选心理科普与自助文章。',
)

async function fetchArticles() {
  loading.value = true
  try {
    const data = await getKnowledgeList({
      sortField: 'readCount',
      sortDirection: 'desc',
      currentPage: String(currentPage.value),
      size: String(pageSize),
    })
    const records = data?.records ?? data?.list ?? data
    const arr = Array.isArray(records) ? records : []
    list.value = arr.map((item) => ({
      id: item.id ?? item.articleId,
      category: item.category ?? item.categoryName ?? '',
      title: item.title ?? '',
      summary: item.summary ?? '',
      content: item.content ?? '',
      readCount: item.readCount ?? 0,
      updatedAt: item.updatedAt ?? '',
    }))
    total.value = data?.total ?? arr.length
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '加载文章列表失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

function onPageChange(page) {
  currentPage.value = page
  fetchArticles()
}

function openArticle(item) {
  if (!userStore.isLoggedIn || userStore.isAdmin) {
    router.push({ path: '/login', query: { redirect: `/knowledge/${item.id}` } })
    return
  }
  router.push(`/knowledge/${item.id}`)
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="knowledge-page">
    <UserNavbar />
    <main class="knowledge-main">
      <div class="knowledge-hero">
        <h1 class="knowledge-hero-title">知识库</h1>
        <p class="knowledge-hero-sub">{{ subtitle }}</p>
      </div>

      <div v-loading="loading" class="knowledge-grid-area">
        <el-row v-if="list.length" :gutter="20">
          <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
            <div class="article-card" @click="openArticle(item)">
              <div class="article-card-top">
                <span class="article-tag">{{ item.category || '心理' }}</span>
                <span class="article-reads" v-if="item.readCount">
                  <svg class="reads-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ item.readCount }}
                </span>
              </div>
              <h3 class="article-title">{{ item.title }}</h3>
              <p class="article-summary">{{ item.summary }}</p>
              <div class="article-card-footer">
                <span class="article-date" v-if="item.updatedAt">{{ item.updatedAt }}</span>
                <span class="article-read-link">
                  {{ userStore.isLoggedIn && !userStore.isAdmin ? '阅读全文 →' : '登录后阅读 →' }}
                </span>
              </div>
            </div>
          </el-col>
        </el-row>

        <div v-else-if="!loading" class="empty-state">
          <span class="empty-icon">📚</span>
          <span>暂无文章</span>
        </div>

        <div v-if="total > pageSize" class="pagination-area">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="onPageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.knowledge-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f8 0%, #f5f7fa 40%, #fafbfc 100%);
}

.knowledge-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 28px 48px;
}

.knowledge-hero {
  margin-bottom: 28px;
}

.knowledge-hero-title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #1f2d3d;
}

.knowledge-hero-sub {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.knowledge-grid-area {
  min-height: 200px;
}

/* ===== 文章卡片 ===== */
.article-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
  height: calc(100% - 20px);
}

.article-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.article-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.article-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  color: #3d9b8f;
  background: #e8f5f2;
  padding: 3px 10px;
  border-radius: 10px;
}

.article-reads {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #c0c4cc;
}

.reads-icon {
  flex-shrink: 0;
}

.article-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-summary {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
  line-height: 1.7;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f5f7fa;
}

.article-date {
  font-size: 12px;
  color: #c0c4cc;
}

.article-read-link {
  font-size: 13px;
  font-weight: 500;
  color: #3d9b8f;
  transition: color 0.2s;
}

.article-card:hover .article-read-link {
  color: #5cadff;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #c0c4cc;
  font-size: 14px;
  gap: 10px;
}

.empty-icon {
  font-size: 40px;
}

/* ===== 分页 ===== */
.pagination-area {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  padding-top: 8px;
}

.pagination-area :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #3d9b8f 0%, #5cadff 100%) !important;
}

.pagination-area :deep(.el-pager li) {
  border-radius: 8px;
}

/* ===== 响应式 ===== */
@media (max-width: 991px) {
  .knowledge-main {
    padding: 16px 16px 32px;
  }

  .knowledge-hero-title {
    font-size: 22px;
  }
}

@media (max-width: 640px) {
  .knowledge-hero-title {
    font-size: 20px;
  }

  .article-card {
    padding: 18px 16px;
  }
}
</style>
