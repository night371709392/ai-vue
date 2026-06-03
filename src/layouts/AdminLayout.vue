<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { logout as logoutApi } from '@/api/admin'
import RobotIcon from '@/components/RobotIcon.vue'
import {
  DataAnalysis,
  Reading,
  ChatDotRound,
  Notebook,
  Fold,
  Expand,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const collapsed = ref(false)

const menuItems = [
  { path: '/admin/dashboard', label: '数据分析', icon: DataAnalysis },
  { path: '/admin/articles', label: '知识文章', icon: Reading },
  { path: '/admin/consultations', label: '咨询记录', icon: ChatDotRound },
  { path: '/admin/mood-logs', label: '情绪日志', icon: Notebook },
]

const pageTitle = computed(() => route.meta.title || '管理后台')

async function logout() {
  await logoutApi()
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside :width="collapsed ? '72px' : '220px'" class="admin-aside">
      <div class="aside-brand">
        <RobotIcon :size="26" />
        <div v-show="!collapsed" class="brand-text">
          <div class="brand-title">心理健康AI助手</div>
          <div class="brand-sub">管理后台</div>
        </div>
      </div>

      <el-menu
        :default-active="route.path"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="admin-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.label }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-button text @click="collapsed = !collapsed">
            <el-icon :size="20"><Expand v-if="collapsed" /><Fold v-else /></el-icon>
          </el-button>
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="header-right">
          <el-avatar :size="36">{{ userStore.displayName.charAt(0).toUpperCase() }}</el-avatar>
          <span class="username">{{ userStore.displayName }}</span>
          <el-button round plain size="small" @click="logout">退出登录</el-button>
        </div>
      </el-header>

      <el-main class="admin-main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

.admin-aside {
  background: #fff;
  border-right: 1px solid #ebeef5;
  overflow: hidden;
  transition: none !important;
}

.admin-aside :deep(.el-menu),
.admin-aside :deep(.el-menu-item),
.admin-aside :deep(.el-sub-menu__title) {
  transition: none !important;
}

.aside-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.brand-sub {
  font-size: 12px;
  color: #909399;
}

.admin-menu {
  border-right: none;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  height: 64px;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.admin-main {
  background: var(--mh-bg);
  padding: 20px;
}
</style>
