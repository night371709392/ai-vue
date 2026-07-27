<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import RobotIcon from '@/components/RobotIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/** 未登录：首页、知识库 */
const guestLinks = [
  { path: '/', label: '首页' },
  { path: '/knowledge', label: '知识库' },
]

/** 已登录普通用户：首页、AI咨询、情绪日记、知识库 */
const userLinks = [
  { path: '/', label: '首页' },
  { path: '/consult', label: 'AI咨询' },
  { path: '/diary', label: '情绪日记' },
  { path: '/knowledge', label: '知识库' },
]

const navLinks = computed(() => {
  if (userStore.isLoggedIn && !userStore.isAdmin) return userLinks
  return guestLinks
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="user-navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">
          <RobotIcon :size="22" color="#ffffff" />
        </span>
        <span class="brand-text">心理健康AI助手</span>
      </RouterLink>

      <nav class="nav-right">
        <RouterLink
          v-for="item in navLinks"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </RouterLink>

        <template v-if="!userStore.isLoggedIn">
          <RouterLink to="/login" class="nav-item" :class="{ active: route.path === '/login' }">
            登录
          </RouterLink>
          <RouterLink to="/register" class="nav-register">
            <el-button type="primary" round>注册</el-button>
          </RouterLink>
        </template>

        <template v-else-if="!userStore.isAdmin">
          <el-button round plain class="logout-btn" @click="logout">退出登录</el-button>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.user-navbar {
  width: 100%;
  background: #fff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  box-sizing: border-box;
  width: 100%;
  min-height: 64px;
  padding: 0 clamp(16px, 3vw, 48px);
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(145deg, #8FD8C8 0%, #6FB8AB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
  white-space: nowrap;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: clamp(12px, 2vw, 28px);
  margin-left: auto;
  min-width: 0;
}

.nav-item {
  font-size: 15px;
  color: #606266;
  white-space: nowrap;
  transition: color 0.2s;
}

.nav-item:hover,
.nav-item.active {
  color: var(--mh-teal); /* #6FB8AB */
  font-weight: 500;
}

.nav-register {
  display: inline-flex;
  line-height: 0;
}

.logout-btn {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .brand-text {
    font-size: 16px;
  }

  .nav-item {
    font-size: 14px;
  }
}
</style>
