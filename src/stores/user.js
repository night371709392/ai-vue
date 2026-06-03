import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/admin'

const STORAGE_KEY = 'mh-auth'
const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

function isAdminLoginData(data) {
  const userType = data?.userInfo?.userType
  const roleType = String(data?.roleType ?? '')
  return userType === 2 || roleType === '2'
}

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadUserInfo() {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const role = ref('guest')
  const token = ref('')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')
  const displayName = computed(
    () =>
      userInfo.value?.nickname ||
      userInfo.value?.displayName ||
      username.value ||
      '访客',
  )

  function restore() {
    const saved = loadAuth()
    if (!saved?.token) {
      username.value = ''
      role.value = 'guest'
      token.value = ''
      userInfo.value = null
      return
    }

    username.value = saved.username || ''
    role.value = saved.role || 'guest'
    token.value = saved.token
    userInfo.value = saved.userInfo ?? loadUserInfo()

    localStorage.setItem(TOKEN_KEY, saved.token)
    if (userInfo.value) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo.value))
    }
  }

  function persist() {
    if (!token.value) {
      clearStorage()
      return
    }

    const payload = {
      username: username.value,
      role: role.value,
      token: token.value,
      userInfo: userInfo.value,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    localStorage.setItem(TOKEN_KEY, token.value)

    if (userInfo.value) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo.value))
    } else {
      localStorage.removeItem(USER_INFO_KEY)
    }
  }

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }

  async function login(name, password) {
    const nameTrim = (name || '').trim()
    if (!nameTrim) throw new Error('请输入用户名')

    const data = await loginApi({ username: nameTrim, password })
    const admin = isAdminLoginData(data)

    userInfo.value = data.userInfo ?? null
    username.value = data.userInfo?.username || nameTrim
    token.value = data.token || ''
    role.value = admin ? 'admin' : 'user'
    persist()

    return { admin, data }
  }

  function registerSuccess(res, name) {
    const data = res?.data ?? res
    userInfo.value = data.userInfo ?? null
    username.value = data.userInfo?.username || name || ''
    token.value = data.token || ''
    role.value = 'user'
    persist()
  }

  function logout() {
    username.value = ''
    role.value = 'guest'
    token.value = ''
    userInfo.value = null
    clearStorage()
  }

  return {
    username,
    role,
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    displayName,
    restore,
    login,
    registerSuccess,
    logout,
  }
})
