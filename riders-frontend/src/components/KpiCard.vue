<template>
  <article class="glass-panel kpi-card">
    <p>{{ label }}</p>
    <strong>{{ value }}</strong>
    <span>{{ help }}</span>
  </article>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  help: { type: String, default: '' },
})
</script>
