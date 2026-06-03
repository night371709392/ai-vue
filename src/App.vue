<script setup>
import { RouterView } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.restore()
</script>

<template>
  <RouterView />
</template>
