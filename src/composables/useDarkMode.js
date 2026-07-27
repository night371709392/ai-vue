import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 黑夜模式 + Canvas 粒子特效 composable
 *
 * @param {import('vue').Ref<HTMLCanvasElement|null>} canvasRef  画布模板引用
 * @param {object} options
 * @param {string}  [options.storageKey='knowledge_dark_mode']
 * @param {string[]} [options.clickExcludeSelectors]  点击爆炸需排除的 CSS 选择器
 */
export function useDarkMode(canvasRef, options = {}) {
  const {
    storageKey = 'knowledge_dark_mode',
    clickExcludeSelectors = [
      '.article-card',
      '.dark-toggle-btn',
      '.el-pagination',
      '.el-button',
      '.user-navbar',
      'a',
      'button',
    ],
  } = options

  /* ===== 状态 ===== */
  const isDarkMode = ref(false)

  /* ===== 粒子数据 ===== */
  let animationFrameId = null
  let stars = []
  let meteors = []
  let fireworks = []
  let floatingDust = []
  let clickBursts = []
  let meteorSpawnCounter = 0
  let fireworkSpawnCounter = 0

  /* ===== 创建函数 ===== */
  function createStar(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.006,
      baseAlpha: Math.random() * 0.45 + 0.35,
      twinkleAmp: Math.random() * 0.4 + 0.15,
    }
  }

  function initStars(w, h) {
    stars = []
    const count = Math.floor((w * h) / 2200)
    for (let i = 0; i < count; i++) stars.push(createStar(w, h))
  }

  function createFloatingDust(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.15),
      life: 1,
      decay: Math.random() * 0.0006 + 0.0003,
      hue: Math.random() * 60 + 180,
      alpha: Math.random() * 0.5 + 0.2,
    }
  }

  function initFloatingDust(w, h) {
    floatingDust = []
    const count = Math.floor((w * h) / 12000)
    for (let i = 0; i < count; i++) floatingDust.push(createFloatingDust(w, h))
  }

  function createMeteor(w, h) {
    const fromLeft = Math.random() > 0.5
    const x = fromLeft ? Math.random() * w * 0.3 : w * 0.7 + Math.random() * w * 0.3
    const y = Math.random() * h * 0.35
    const angle = fromLeft
      ? Math.random() * 0.4 + 0.3
      : Math.random() * 0.4 - 0.7
    const speed = Math.random() * 1.2 + 0.8
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 0.35,
      life: 1,
      decay: Math.random() * 0.005 + 0.003,
      trail: [],
      maxTrail: Math.floor(Math.random() * 25 + 20),
      headRadius: Math.random() * 1.5 + 1,
    }
  }

  function createFireworkBurst(w, h) {
    const x = Math.random() * w * 0.8 + w * 0.1
    const y = Math.random() * h * 0.45 + h * 0.05
    const count = Math.floor(Math.random() * 50 + 35)
    const hue = Math.random() * 360
    const particles = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
      const speed = Math.random() * 2 + 0.6
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.012 + 0.005,
        hue: hue + (Math.random() - 0.5) * 40,
        size: Math.random() * 1.8 + 0.8,
      })
    }
    return particles
  }

  function createClickBurst(cx, cy) {
    const count = Math.floor(Math.random() * 60 + 80)
    const particles = []
    const layers = [
      { pct: 0.35, sMin: 5, sMax: 9, zMin: 1.2, zMax: 2.5, hRange: 0 },
      { pct: 0.35, sMin: 2.5, sMax: 5.5, zMin: 0.8, zMax: 1.8, hRange: 40 },
      { pct: 0.30, sMin: 0.8, sMax: 3, zMin: 0.4, zMax: 1.2, hRange: 80 },
    ]
    const baseHue = Math.random() * 360
    for (const L of layers) {
      const n = Math.floor(count * L.pct)
      for (let i = 0; i < n; i++) {
        const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.6
        const speed = Math.random() * (L.sMax - L.sMin) + L.sMin
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: Math.random() * 0.025 + 0.012,
          hue: baseHue + (Math.random() - 0.5) * L.hRange * 2,
          size: Math.random() * (L.zMax - L.zMin) + L.zMin,
          hasGlow: Math.random() > 0.5,
        })
      }
    }
    const sparkCount = Math.floor(Math.random() * 20 + 15)
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 10 + 6
      particles.push({
        x: cx + (Math.random() - 0.5) * 10,
        y: cy + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: Math.random() * 0.06 + 0.04,
        hue: baseHue + (Math.random() - 0.5) * 60,
        size: Math.random() * 1 + 0.5,
        hasGlow: true,
      })
    }
    clickBursts.push(particles)
  }

  /* ===== 绘制函数 ===== */
  function drawStar(ctx, s) {
    s.phase += s.speed
    const flicker = s.baseAlpha + s.twinkleAmp * Math.abs(Math.sin(s.phase))
    const alpha = Math.min(1, flicker)
    ctx.fillStyle = `rgba(220,230,255,${alpha})`
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
    if (s.r > 1.2 && alpha > 0.7) {
      ctx.fillStyle = `rgba(180,200,255,${alpha * 0.25})`
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2); ctx.fill()
    }
  }

  function drawFloatingDust(ctx, p) {
    ctx.fillStyle = `hsla(${p.hue}, 40%, 70%, ${p.alpha * p.life})`
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
  }

  function drawMeteor(ctx, m) {
    if (m.trail.length < 2) {
      ctx.fillStyle = `rgba(255,255,255,${m.life})`
      ctx.beginPath(); ctx.arc(m.x, m.y, m.headRadius, 0, Math.PI * 2); ctx.fill()
      return
    }
    ctx.lineCap = 'round'
    for (let j = 1; j < m.trail.length; j++) {
      const ratio = j / m.trail.length
      ctx.strokeStyle = `rgba(200,220,255,${ratio * m.life * 0.8})`
      ctx.lineWidth = ratio * 2.5
      ctx.beginPath()
      ctx.moveTo(m.trail[j - 1].x, m.trail[j - 1].y)
      ctx.lineTo(m.trail[j].x, m.trail[j].y)
      ctx.stroke()
    }
    ctx.fillStyle = `rgba(255,255,255,${m.life})`
    ctx.beginPath(); ctx.arc(m.x, m.y, m.headRadius, 0, Math.PI * 2); ctx.fill()
  }

  function drawFireworkParticle(ctx, p) {
    ctx.fillStyle = `hsla(${p.hue}, 75%, 62%, ${Math.max(0, p.life)})`
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
  }

  /* ===== 动画循环 ===== */
  function animate() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)
    ctx.clearRect(0, 0, w, h)

    // 星空
    for (const s of stars) drawStar(ctx, s)

    // 浮动光点
    for (let i = floatingDust.length - 1; i >= 0; i--) {
      const p = floatingDust[i]
      p.x += p.vx; p.y += p.vy; p.life -= p.decay
      if (p.life <= 0 || p.y < -20 || p.x < -20 || p.x > w + 20) {
        floatingDust[i] = createFloatingDust(w, h)
        continue
      }
      drawFloatingDust(ctx, p)
    }

    // 流星
    meteorSpawnCounter++
    if (meteorSpawnCounter > Math.floor(Math.random() * 120 + 90)) {
      meteorSpawnCounter = 0
      meteors.push(createMeteor(w, h))
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i]
      m.x += m.vx; m.y += m.vy; m.life -= m.decay
      m.trail.push({ x: m.x, y: m.y })
      if (m.trail.length > m.maxTrail) m.trail.shift()
      drawMeteor(ctx, m)
      if (m.life <= 0 || m.x < -50 || m.x > w + 50 || m.y > h + 50) meteors.splice(i, 1)
    }

    // 烟花
    fireworkSpawnCounter++
    if (fireworkSpawnCounter > Math.floor(Math.random() * 320 + 280)) {
      fireworkSpawnCounter = 0
      fireworks.push(...createFireworkBurst(w, h))
    }
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const p = fireworks[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.015; p.vx *= 0.998; p.life -= p.decay
      if (p.life <= 0) { fireworks.splice(i, 1); continue }
      drawFireworkParticle(ctx, p)
    }

    // 点击爆炸
    for (let g = clickBursts.length - 1; g >= 0; g--) {
      const group = clickBursts[g]
      let allDead = true
      for (let i = group.length - 1; i >= 0; i--) {
        const p = group[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.vx *= 0.995; p.life -= p.decay
        if (p.life <= 0) { group.splice(i, 1); continue }
        allDead = false
        const alpha = Math.max(0, p.life)
        if (p.hasGlow) {
          ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${alpha * 0.3})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); ctx.fill()
        }
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      }
      if (allDead) clickBursts.splice(g, 1)
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  /* ===== 启停 ===== */
  function startParticles() {
    const canvas = canvasRef.value
    if (!canvas) return
    initStars(canvas.width, canvas.height)
    initFloatingDust(canvas.width, canvas.height)
    meteorSpawnCounter = 0
    fireworkSpawnCounter = 0
    if (!animationFrameId) animate()
  }

  function stopParticles() {
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
    stars = []; meteors = []; fireworks = []; floatingDust = []; clickBursts = []
  }

  function onResize() {
    if (!isDarkMode.value || !canvasRef.value) return
    const w = window.innerWidth; const h = window.innerHeight
    canvasRef.value.width = w; canvasRef.value.height = h
    stars = []; floatingDust = []
    initStars(w, h); initFloatingDust(w, h)
  }

  /* ===== localStorage ===== */
  function loadDarkMode() {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null) isDarkMode.value = saved === 'true'
    } catch { /* ignore */ }
  }

  function persistDarkMode() {
    try { localStorage.setItem(storageKey, String(isDarkMode.value)) } catch { /* ignore */ }
  }

  /* ===== 切换 ===== */
  async function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    persistDarkMode()
    await nextTick()
    if (isDarkMode.value) startParticles()
    else stopParticles()
  }

  /* ===== 点击爆炸 ===== */
  function handlePageClick(event) {
    if (!isDarkMode.value) return
    const el = event.target
    for (const sel of clickExcludeSelectors) {
      if (el.closest(sel)) return
    }
    createClickBurst(event.clientX, event.clientY)
  }

  /* ===== 生命周期 ===== */
  onMounted(async () => {
    loadDarkMode()
    if (isDarkMode.value) {
      await nextTick()
      startParticles()
    }
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    stopParticles()
    window.removeEventListener('resize', onResize)
  })

  return { isDarkMode, toggleDarkMode, handlePageClick }
}
