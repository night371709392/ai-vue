import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/user/Home.vue'),
      meta: { title: '首页', userPortal: true },
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('@/views/user/Knowledge.vue'),
      meta: { title: '知识库', userPortal: true },
    },
    {
      path: '/knowledge/:id',
      name: 'knowledge-detail',
      component: () => import('@/views/user/KnowledgeDetail.vue'),
      meta: { title: '文章详情', requiresAuth: true, userPortal: true },
    },
    {
      path: '/consult',
      name: 'consult',
      component: () => import('@/views/user/Consult.vue'),
      meta: { title: 'AI咨询', requiresAuth: true, requiresUser: true, userPortal: true },
    },
    {
      path: '/diary',
      name: 'diary',
      component: () => import('@/views/user/Diary.vue'),
      meta: { title: '情绪日记', requiresAuth: true, requiresUser: true, userPortal: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { title: '登录', guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: { title: '注册', guestOnly: true },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '数据分析' },
        },
        {
          path: 'articles',
          name: 'admin-articles',
          component: () => import('@/views/admin/Articles.vue'),
          meta: { title: '知识文章' },
        },
        {
          path: 'consultations',
          name: 'admin-consultations',
          component: () => import('@/views/admin/Consultations.vue'),
          meta: { title: '咨询记录' },
        },
        {
          path: 'mood-logs',
          name: 'admin-mood-logs',
          component: () => import('@/views/admin/MoodLogs.vue'),
          meta: { title: '情绪日志' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

function isUserPortalRoute(to) {
  return to.matched.some((r) => r.meta.userPortal)
}

router.beforeEach((to) => {
  const userStore = useUserStore()
  userStore.restore()

  // 管理员不进入用户端页面，统一进管理端
  if (userStore.isLoggedIn && userStore.isAdmin && isUserPortalRoute(to)) {
    return '/admin/dashboard'
  }

  if (to.meta.guestOnly && userStore.isLoggedIn) {
    return userStore.isAdmin ? '/admin/dashboard' : '/'
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return '/'
  }

  if (to.meta.requiresUser && userStore.isAdmin) {
    return '/admin/dashboard'
  }

  if (to.meta.title) {
    document.title = `${to.meta.title} - 心理健康AI助手`
  }

  return true
})

export default router
