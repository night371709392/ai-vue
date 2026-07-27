<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  scrollable: { type: Boolean, default: false },
})

const slides = [
  {
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&h=800&fit=crop',
    quote: '每一朵浪花都是新的开始',
    sub: '大海教会我们接纳与放下',
  },
  {
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=640&h=800&fit=crop',
    quote: '在宁静中找到自己',
    sub: '冥想、呼吸、回归当下',
  },
  {
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&h=800&fit=crop',
    quote: '阳光穿过枝叶洒落',
    sub: '大自然是最好的疗愈师',
  },
  {
    img: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=640&h=800&fit=crop',
    quote: '每个黄昏都值得温柔以待',
    sub: '放下一天的疲惫，好好休息',
  },
]
</script>

<template>
  <div class="auth-layout">
    <!-- 返回首页 -->
    <RouterLink to="/" class="back-home">
      <el-icon><ArrowLeft /></el-icon>
      返回首页
    </RouterLink>

    <!-- 居中卡片 -->
    <div class="auth-card">
      <!-- 左侧：轮播图片 -->
      <div class="auth-left">
        <el-carousel
          :interval="5000"
          arrow="never"
          indicator-position="outside"
          height="100%"
        >
          <el-carousel-item v-for="(slide, idx) in slides" :key="idx">
            <div
              class="carousel-slide"
              :style="{ backgroundImage: `url(${slide.img})` }"
            >
              <div class="slide-overlay">
                <p class="slide-quote">{{ slide.quote }}</p>
                <p class="slide-sub">{{ slide.sub }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 右侧：表单区域（flex 列：头部固定 + 表单滚动 + 底部固定） -->
      <div class="auth-right">
        <div class="auth-right-inner">
          <!-- 顶部固定 -->
          <div class="auth-top">
            <div class="auth-decor">
              <div class="decor-line"></div>
              <span class="decor-icon">🪻</span>
              <div class="decor-line"></div>
            </div>
            <div class="auth-header">
              <h1>{{ title }}</h1>
              <p v-if="subtitle">{{ subtitle }}</p>
            </div>
          </div>

          <!-- 中间滚动 -->
          <div class="auth-form-card" :class="{ 'is-scrollable': scrollable }">
            <slot />
          </div>

          <!-- 底部固定 -->
          <div class="auth-bottom">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 整体背景 ===== */
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  position: relative;
  background: linear-gradient(135deg, #E4DCF0 0%, #C9BFE2 50%, #D5CAE8 100%);
}

.back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #5b5870;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 14px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
  box-shadow: 0 1px 4px rgba(51, 48, 64, 0.06);
  transition: all 0.2s;
}

.back-home:hover {
  color: #9b8fc4;
  background: rgba(255, 255, 255, 0.95);
}

/* ===== 居中卡片容器 ===== */
.auth-card {
  display: flex;
  width: 100%;
  max-width: 960px;
  height: 560px;
  max-height: calc(100vh - 48px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(51, 48, 64, 0.1), 0 0 0 1px rgba(201, 191, 226, 0.2);
}

/* ===== 左侧轮播 ===== */
.auth-left {
  width: 50%;
  position: relative;
  overflow: hidden;
  background: #2a2538;
}

.auth-left :deep(.el-carousel) {
  height: 100%;
}

.auth-left :deep(.el-carousel__container) {
  height: 100%;
}

.auth-left :deep(.el-carousel__indicators) {
  bottom: 24px;
}

.auth-left :deep(.el-carousel__indicator .el-carousel__button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(201, 191, 226, 0.4);
  opacity: 0.6;
}

.auth-left :deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: #C9BFE2;
  opacity: 1;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 0.8s ease;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(42, 37, 56, 0.2) 0%,
    rgba(42, 37, 56, 0.05) 40%,
    rgba(42, 37, 56, 0.6) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px 36px 44px;
}

.slide-quote {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
}

.slide-sub {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}

/* ===== 右侧：flex 列布局 ===== */
.auth-right {
  width: 50%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: linear-gradient(160deg, #F3EFF8 0%, #E8E1F2 50%, #EEE8F5 100%);
  padding: 0;
}

.auth-right-inner {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  padding: 36px 36px 28px;
}

/* ---- 顶部固定 ---- */
.auth-top {
  flex-shrink: 0;
}

.auth-decor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: center;
}

.decor-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #C9BFE2, transparent);
  border-radius: 1px;
}

.decor-icon {
  font-size: 18px;
  opacity: 0.8;
}

.auth-header {
  text-align: center;
  margin-bottom: 16px;
}

.auth-header h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #333040;
  letter-spacing: 0.5px;
}

.auth-header p {
  margin: 0;
  color: #7a7790;
  font-size: 13px;
  line-height: 1.6;
}

/* ---- 中间滚动 ---- */
.auth-form-card {
  flex: 1;
  background: #fff;
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 2px 14px rgba(201, 191, 226, 0.18), 0 0 0 1px rgba(201, 191, 226, 0.22);
}

.auth-form-card.is-scrollable {
  min-height: 0;
  overflow-y: auto;
}

/* 去除 el-form 默认的尾部 margin */
.auth-form-card :deep(.el-form) {
  margin-bottom: 0;
}

.auth-form-card :deep(.el-form--large .el-form-item) {
  margin-bottom: 14px;
}

/* ---- 底部固定 ---- */
.auth-bottom {
  flex-shrink: 0;
  padding-top: 16px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .auth-layout {
    padding: 72px 12px 28px;
    align-items: flex-start;
  }

  .auth-card {
    flex-direction: column;
    height: auto;
    max-height: none;
    max-width: 440px;
  }

  .auth-left {
    width: 100%;
    height: 200px;
  }

  .auth-right {
    width: 100%;
  }

  .auth-right-inner {
    max-width: 100%;
    padding: 28px 20px 28px;
  }

  .auth-form-card {
    flex: none;
    max-height: 360px;
    padding: 18px 16px;
    border-radius: 12px;
  }

  .auth-form-card.is-scrollable {
    overflow-y: auto;
  }

  .slide-overlay {
    padding: 24px 20px 28px;
  }

  .slide-quote {
    font-size: 18px;
  }

  .slide-sub {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .auth-left {
    height: 170px;
  }

  .auth-right-inner {
    padding: 24px 14px 24px;
  }

  .auth-header h1 {
    font-size: 22px;
  }

  .auth-form-card {
    max-height: 320px;
    padding: 14px 12px;
  }

  .auth-form-card.is-scrollable {
    overflow-y: auto;
  }
}
</style>
