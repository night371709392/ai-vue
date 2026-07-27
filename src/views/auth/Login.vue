<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useUserStore } from '@/stores/user'
import AuthLayout from './AuthLayout.vue'

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
  <AuthLayout title="登录" subtitle="欢迎回来，请使用账号登录">
    <template #default>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
      >
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
      </el-form>
    </template>

    <template #footer>
      <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">
        登录
      </el-button>

      <p class="auth-footer">
        还没有账号？
        <RouterLink to="/register" class="link-primary">去注册</RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>

<style scoped>
.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
}

.auth-footer {
  text-align: center;
  margin: 20px 0 0;
  font-size: 14px;
  color: #5b5870;
}
</style>
