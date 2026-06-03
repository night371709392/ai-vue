<script setup>
defineProps({
  size: { type: [Number, String], default: 32 },
  color: { type: String, default: '#409eff' },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="14" y="18" width="36" height="30" rx="10" :stroke="color" stroke-width="3" />
    <circle cx="26" cy="32" r="3" :fill="color" />
    <circle cx="38" cy="32" r="3" :fill="color" />
    <path
      d="M26 40c2 3 10 3 12 0"
      :stroke="color"
      stroke-width="3"
      stroke-linecap="round"
    />
    <line x1="32" y1="10" x2="32" y2="18" :stroke="color" stroke-width="3" />
    <circle cx="32" cy="8" r="3" :fill="color" />
    <line x1="10" y1="28" x2="14" y2="28" :stroke="color" stroke-width="3" stroke-linecap="round" />
    <line x1="50" y1="28" x2="54" y2="28" :stroke="color" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>
