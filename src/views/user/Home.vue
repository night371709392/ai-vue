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
      <!-- 装饰性背景元素 -->
      <div class="hero-bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

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
  background: linear-gradient(160deg, #8FD8C8 0%, #A8D4E8 55%, #D8C8E8 100%);
}

.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 64px;
  min-height: calc(100vh - 64px);
  position: relative;
  overflow: hidden;
}

/* 装饰形状 */
.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 320px;
  height: 320px;
  background: #fff;
  top: -60px;
  right: -80px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #fff;
  bottom: 10%;
  left: -40px;
}

.shape-3 {
  width: 140px;
  height: 140px;
  background: #fff;
  top: 40%;
  right: 15%;
}

.hero-center {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-logo {
  margin-bottom: 28px;
}

.hero-circle {
  width: min(280px, 70vw);
  aspect-ratio: 1;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 40px rgba(143, 216, 200, 0.25);
}

.hero-title {
  margin: 0 0 20px;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.3;
  color: #1a3a2a;
  font-weight: 700;
}

.hero-desc {
  margin: 0 auto 32px;
  font-size: 15px;
  line-height: 1.85;
  color: #3d5a4e;
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
  color: #4a7c6f !important;
  font-weight: 600;
  padding: 12px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.btn-white:hover {
  background: #f5faf8 !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.btn-outline {
  background: transparent !important;
  border: 2px solid rgba(74, 124, 111, 0.45) !important;
  color: #4a7c6f !important;
  padding: 12px 24px;
}

.btn-outline:hover {
  background: rgba(143, 216, 200, 0.2) !important;
  border-color: #4a7c6f !important;
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
