<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserNavbar from '@/components/UserNavbar.vue'
import RobotIcon from '@/components/RobotIcon.vue'

const router = useRouter()
const userStore = useUserStore()
const pageReady = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    pageReady.value = true
  })
})

function goUserFeature(path) {
  if (!userStore.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: path } })
    return
  }
  router.push(path)
}

function goConsult() {
  goUserFeature('/consult')
}

function goDiary() {
  goUserFeature('/diary')
}
</script>

<template>
  <div class="home-page">
    <UserNavbar />

    <section class="hero">
      <div class="hero-center" :class="{ 'is-visible': pageReady }">
        <div class="hero-logo rise-item" style="--i: 0">
          <div class="hero-circle">
            <RobotIcon :size="120" color="#ffffff" />
          </div>
        </div>

        <h1 class="hero-title rise-item" style="--i: 1">
          一次温暖的对话
          <br />
          化孤独为慰藉
        </h1>

        <p class="hero-desc rise-item" style="--i: 2">
          每个深夜，每个焦虑的时刻，我们都在这里，不必独自承受，让心与心的连接温暖您的每一天
        </p>

        <div class="hero-actions rise-item" style="--i: 3">
          <el-button class="btn-white" round size="large" @click="goConsult">
            开始倾诉，获得陪伴
          </el-button>
          <el-button class="btn-outline" round size="large" @click="goDiary">
            记录心情，释放情感
          </el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--mh-green);
}

.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 64px;
  min-height: calc(100vh - 64px);
}

.hero-center {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-logo {
  margin-bottom: 28px;
}

.hero-circle {
  width: min(280px, 70vw);
  aspect-ratio: 1;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  margin: 0 0 20px;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.3;
  color: #fff;
  font-weight: 700;
}

.hero-desc {
  margin: 0 auto 32px;
  font-size: 15px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.92);
  max-width: 560px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.btn-white {
  background: #fff !important;
  border-color: #fff !important;
  color: #2c3e50 !important;
  font-weight: 600;
  padding: 12px 24px;
}

.btn-white:hover {
  background: #f5f7fa !important;
}

.btn-outline {
  background: transparent !important;
  border: 2px solid rgba(255, 255, 255, 0.9) !important;
  color: #fff !important;
  padding: 12px 24px;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

/* 自下而上入场动画 */
.rise-item {
  opacity: 0;
  transform: translateY(48px);
}

.hero-center.is-visible .rise-item {
  animation: rise-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.12s * var(--i, 0));
}

@keyframes rise-up {
  from {
    opacity: 0;
    transform: translateY(48px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rise-item {
    opacity: 1;
    transform: none;
  }

  .hero-center.is-visible .rise-item {
    animation: none;
  }
}
</style>
