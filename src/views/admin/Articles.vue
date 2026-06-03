<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articlePage, categoryTree, uploadFile, createArticle, getArticleDetail, changeArticleStatus, deleteArticle } from '@/api/admin'
import service from '@/utils/request'

const fileBaseUrl = '/api'

const queryTitle = ref('')
const queryCategory = ref('')
const categoryOptions = ref([])
const categoryLoading = ref(false)
const list = ref([])
const tableLoading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editingId = ref(null)

const form = reactive({
  id: '',
  title: '',
  categoryId: '',
  summary: '',
  content: '',
  status: true,
  coverImage: '',
  tags: '',
})

const coverInputRef = ref(null)
const coverUploading = ref(false)
const saveLoading = ref(false)
const coverPreview = ref('')

function handleCoverSelect() {
  coverInputRef.value?.click()
}

function normalizeUrl(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') return raw
  const val = raw.url ?? raw.fileUrl ?? raw.filePath ?? raw.path ?? raw.data ?? raw.fileName ?? raw.name ?? ''
  if (val) return val
  for (const v of Object.values(raw)) {
    if (typeof v === 'string' && (v.startsWith('/') || v.includes('/')) && v.length > 0) return v
  }
  return ''
}

async function onCoverFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    e.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (ev) => {
    coverPreview.value = ev.target?.result ?? ''
  }
  reader.readAsDataURL(file)

  coverUploading.value = true
  try {
    const bizId = editingId.value ?? `temp-${Date.now()}`
    const raw = await uploadFile(file, { businessId: bizId })
    const filePath = normalizeUrl(raw)
    if (filePath) {
      form.coverImage = filePath
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.warning('封面已上传但无法获取路径，请重试')
    }
  } catch {
    ElMessage.warning('封面图片上传失败')
  } finally {
    coverUploading.value = false
    e.target.value = ''
  }
}

function removeCover() {
  coverPreview.value = ''
  form.coverImage = ''
}

function parseTreeNodes(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.children)) return data.children
  if (Array.isArray(data?.list)) return data.list
  return []
}

function flattenCategories(nodes, prefix = '') {
  const result = []
  if (!Array.isArray(nodes)) return result
  for (const node of nodes) {
    const label = node.categoryName ?? node.name ?? node.label ?? ''
    const id = node.id ?? node.categoryId
    const displayLabel = prefix ? `${prefix} / ${label}` : label
    if (id != null && label) {
      result.push({ id: String(id), label: displayLabel, leafLabel: label })
    }
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, displayLabel))
    }
  }
  return result
}

function getCategoryLabelById(id) {
  if (!id) return ''
  return categoryOptions.value.find((item) => item.id === String(id))?.leafLabel ?? ''
}

function findCategoryIdByName(name) {
  if (!name) return ''
  const found = categoryOptions.value.find((item) => item.leafLabel === name)
  return found?.id ?? ''
}

function mapArticleRow(item) {
  const rawStatus = item.status
  const published =
    rawStatus === 1 ||
    rawStatus === '1' ||
    rawStatus === true ||
    rawStatus === 'PUBLISHED'
  return {
    id: item.id,
    title: item.title ?? '',
    category: item.categoryName ?? item.category ?? getCategoryLabelById(item.categoryId),
    categoryId: item.categoryId != null ? String(item.categoryId) : '',
    summary: item.summary ?? '',
    content: item.content ?? '',
    status: published,
    coverImage: item.coverImage ?? item.coverUrl ?? item.cover ?? '',
    tags: item.tags ?? '',
    readCount: Number(item.readCount ?? item.viewCount ?? 0) || 0,
    updatedAt: (item.updateTime ?? item.updatedAt ?? item.createTime ?? '')?.slice?.(0, 10) ?? '',
  }
}

function normalizeArticlePage(data) {
  const records = data?.records ?? data?.list ?? data?.rows ?? (Array.isArray(data) ? data : [])
  const rows = records.map(mapArticleRow)
  const count = data?.total ?? data?.totalCount ?? rows.length
  return { rows, total: Number(count) || 0 }
}

async function loadCategories() {
  categoryLoading.value = true
  try {
    const data = await categoryTree()
    categoryOptions.value = flattenCategories(parseTreeNodes(data))
  } catch {
    categoryOptions.value = []
  } finally {
    categoryLoading.value = false
  }
}

async function loadArticleList() {
  tableLoading.value = true
  try {
    const params = { currentPage: String(currentPage.value), size: String(pageSize.value) }
    const title = queryTitle.value.trim()
    if (title) params.title = title
    if (queryCategory.value) params.categoryId = queryCategory.value
    const data = await articlePage(params)
    const { rows, total: totalCount } = normalizeArticlePage(data)
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
  loadArticleList()
}

function handlePageChange(page) {
  currentPage.value = page
  loadArticleList()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadArticleList()
}

onMounted(async () => {
  await loadCategories()
  await loadArticleList()
})

function openCreate() {
  editingId.value = null
  coverPreview.value = ''
  Object.assign(form, {
    id: '',
    title: '',
    categoryId: categoryOptions.value[0]?.id ?? '',
    summary: '',
    content: '',
    status: true,
    coverImage: '',
    tags: '',
  })
  dialogVisible.value = true
}

async function openEdit(row) {
  editingId.value = row.id
  coverPreview.value = row.coverImage ? fileBaseUrl + row.coverImage : ''

  Object.assign(form, {
    id: row.id ?? '',
    title: row.title,
    categoryId: row.categoryId || findCategoryIdByName(row.category),
    summary: row.summary,
    content: row.content,
    status: row.status,
    coverImage: row.coverImage ?? '',
    tags: row.tags ?? '',
  })
  dialogVisible.value = true
  tableLoading.value = true
  try {
    const detail = await getArticleDetail(row.id)
    if (detail?.content) {
      form.content = detail.content
      row.content = detail.content
    }
  } catch {
  } finally {
    tableLoading.value = false
  }
}

async function saveArticle() {
  if (!form.title.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请填写正文内容')
    return
  }
  if (!form.coverImage) {
    ElMessage.warning('请上传文章封面')
    return
  }
  if (!form.categoryId) {
    ElMessage.warning('请选择分类')
    return
  }
  if (!form.tags.trim()) {
    ElMessage.warning('请填写标签')
    return
  }

  saveLoading.value = true

  const payload = {
    title: form.title,
    content: form.content,
    coverImage: form.coverImage,
    categoryId: Number(form.categoryId),
    summary: form.summary,
    tags: form.tags,
  }

  console.log('saveArticle payload:', JSON.stringify(payload), 'editingId:', editingId.value)

  try {
    if (editingId.value) {
      await service.put(`/knowledge/article/${editingId.value}`, payload)
    } else {
      await createArticle(payload)
    }
    ElMessage.success(editingId.value ? '文章更新成功' : '文章创建成功')
    await loadArticleList()
    dialogVisible.value = false
  } catch (err) {
    console.error('saveArticle error msg:', err?.message)
    console.error('error response status:', err?.response?.status)
    console.error('error response data:', JSON.stringify(err?.response?.data ?? err?.response))
  } finally {
    saveLoading.value = false
  }
}

async function handleStatusChange(row) {
  const newVal = !row.status
  const label = newVal ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定将「${row.title}」${label}吗？`,
      '提示',
      { type: 'warning' },
    )
    await changeArticleStatus(row.id, { status: newVal ? '1' : '2' })
    row.status = newVal
    ElMessage.success(`${label}成功`)
  } catch {
  }
}

async function removeArticle(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.title}」？`, '提示', { type: 'warning' })
    await deleteArticle(row.id)
    ElMessage.success('删除成功')
    await loadArticleList()
  } catch {
  }
}
</script>

<template>
  <div class="admin-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form" @submit.prevent="handleQuery">
        <el-form-item label="标题">
          <el-input v-model="queryTitle" placeholder="请输入标题" clearable style="width: 220px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryCategory" placeholder="请选择分类" clearable style="width: 200px" :loading="categoryLoading">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" :loading="tableLoading" @click="handleQuery">查询</el-button>
          <el-button type="primary" plain @click="openCreate">新增文章</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="tableLoading" :data="list" stripe>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <a class="link-primary" @click="openEdit(row)">{{ row.title }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="readCount" label="阅读量" width="100" align="center" />
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-switch :model-value="row.status" inline-prompt active-text="上架" inactive-text="下架" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="120" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="removeArticle(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑文章' : '新建文章'" width="560px">
      <el-form label-position="top">
        <el-form-item label="文章封面">
          <div class="cover-upload-area" v-loading="coverUploading">
            <input ref="coverInputRef" type="file" accept="image/*" style="display: none" @change="onCoverFileChange" />
            <div v-if="coverPreview" class="cover-preview">
              <img :src="coverPreview" alt="封面预览" class="cover-img" />
              <div class="cover-mask">
                <el-button type="primary" size="small" @click="handleCoverSelect">更换封面</el-button>
                <el-button type="danger" size="small" plain @click="removeCover">移除封面</el-button>
              </div>
            </div>
            <div v-else class="cover-placeholder" @click="handleCoverSelect">
              <el-icon :size="36"><Plus /></el-icon>
              <span>点击上传文章封面</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%" :loading="categoryLoading">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="form.summary" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="多个标签请用逗号分隔" />
        </el-form-item>
        <el-form-item label="上架">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page .filter-card,
.admin-page .table-card {
  border-radius: 12px;
  margin-bottom: 16px;
}
.filter-form { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 0; }
.filter-form :deep(.el-form-item) { margin-bottom: 0; margin-right: 16px; }
.filter-actions :deep(.el-form-item__content) { display: flex; gap: 12px; flex-wrap: wrap; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
@media (max-width: 768px) {
  .filter-form :deep(.el-input),
  .filter-form :deep(.el-select) { width: 100% !important; }
  .filter-form :deep(.el-form-item) { width: 100%; margin-right: 0; }
  .pagination-wrap { justify-content: center; }
}
.cover-upload-area { width: 100%; }
.cover-placeholder {
  width: 100%; height: 160px; border: 2px dashed #dcdfe6; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer; color: #909399; transition: border-color 0.3s, color 0.3s;
}
.cover-placeholder:hover { border-color: #409eff; color: #409eff; }
.cover-preview { position: relative; width: 100%; height: 200px; border-radius: 8px; overflow: hidden; }
.cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cover-mask {
  position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  gap: 12px; opacity: 0; transition: opacity 0.3s;
}
.cover-preview:hover .cover-mask { opacity: 1; }
</style>
