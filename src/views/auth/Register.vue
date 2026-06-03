<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { register as registerApi } from '@/api/frontend'
import RobotIcon from '@/components/RobotIcon.vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: undefined,
  userType: 1,
})

const validateConfirm = (_rule, value, callback) => {
  if (value !== form.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const validatePhone = (_rule, value, callback) => {
  if (!value) return callback()
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) callback(new Error('请输入正确的手机号'))
  else callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '3-20 位字母或数字', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '用户名只能包含字母和数字', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  nickname: [
    { max: 20, message: '昵称最多 20 个字符', trigger: 'blur' },
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' },
  ],
  userType: [
    { required: true, message: '用户类型不能为空', trigger: 'blur' },
  ],
}

async function onSubmit() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      gender: form.gender,
      userType: form.userType,
    }
    if (form.nickname) payload.nickname = form.nickname
    if (form.phone) payload.phone = form.phone

    const res = await registerApi(payload)
    userStore.registerSuccess(res, form.username)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '注册失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page register-page">
    <RouterLink to="/" class="back-home">
      <el-icon><ArrowLeft /></el-icon>
      返回首页
    </RouterLink>

    <el-card class="auth-card" shadow="always">
      <div class="auth-header">
        <RobotIcon :size="48" />
        <h1>注册</h1>
        <p>创建一个温和、安全的账号，开始记录与倾诉</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="form.username" placeholder="3-20 位字母或数字" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="form.email" placeholder="用于找回与通知" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="选填，最多 20 个字符" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="选填，输入 11 位手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" required>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="再次输入密码"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender" required>
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户类型" prop="userType" class="hidden-field">
          <el-input-number v-model="form.userType" :min="1" :max="99" />
        </el-form-item>
        <el-button type="primary" class="submit-btn" :loading="loading" @click="onSubmit">
          注册
        </el-button>
      </el-form>

      <p class="auth-footer">
        已有账号？
        <RouterLink to="/login" class="link-primary">去登录</RouterLink>
      </p>
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

.register-page {
  background: var(--mh-register-bg);
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
}

.auth-header {
  text-align: center;
  margin-bottom: 20px;
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
}

.auth-footer {
  text-align: center;
  margin: 20px 0 0;
  font-size: 14px;
  color: #606266;
}

.hidden-field {
  display: none;
}
</style>
