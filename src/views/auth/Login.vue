<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import RobotIcon from '@/components/RobotIcon.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const formRef = ref()

async function onSubmit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const { admin } = await userStore.login(form.username, form.password)
    ElMessage.success('登录成功')

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    if (admin) {
      router.push(redirect.startsWith('/admin') ? redirect : '/admin/dashboard')
    } else {
      router.push(redirect && !redirect.startsWith('/admin') ? redirect : '/')
    }
  } catch {
    /* 失败时 request 拦截器会弹出错误提示 */
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page login-page">
    <RouterLink to="/" class="back-home">
      <el-icon><ArrowLeft /></el-icon>
      返回首页
    </RouterLink>

    <el-card class="auth-card" shadow="always">
      <div class="auth-header">
        <RobotIcon :size="48" />
        <h1>登录</h1>
        <p>欢迎回来，请使用账号登录</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="用户名" prop="username" required>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名（管理员：admin）"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">
          登录
        </el-button>
      </el-form>

      <p class="auth-footer">
        还没有账号？
        <RouterLink to="/register" class="link-primary">去注册</RouterLink>
      </p>

      <div class="demo-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>管理员：admin / 123456。登录成功可在浏览器开发者工具 → 网络 中查看 POST /api/user/login。</span>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
}

.login-page {
  background: var(--mh-mint);
}

.back-home {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  border-radius: 16px;
  padding: 8px 4px 4px;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  margin: 16px 0 8px;
  font-size: 28px;
}

.auth-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  border-radius: 8px;
}

.auth-footer {
  text-align: center;
  margin: 20px 0 0;
  font-size: 14px;
  color: #606266;
}

.demo-tip {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 20px;
  padding: 12px 14px;
  background: #f4f4f5;
  border-radius: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.demo-tip .el-icon {
  margin-top: 2px;
  color: #909399;
}
</style>
