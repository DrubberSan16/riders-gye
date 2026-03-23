<template>
  <div v-if="!items.length" class="empty-state">No hay resumen por zona disponible.</div>
  <div v-else class="zones-list zone-grid-cards scroll-panel">
    <article v-for="item in items" :key="item.zona" class="zone-card zone-card-compact">
      <div class="zone-head zone-head-stacked">
        <div>
          <h3>{{ item.zona }}</h3>
          <span>Completadas: {{ item.entregas_completadas_30_dias ?? item.entregas_completadas ?? 0 }}</span>
        </div>
      </div>

      <div class="zone-line-list">
        <div class="zone-line-item">
          <span>Comisión:</span>
          <strong>{{ formatCurrency(item.comisiones_totales_30_dias) }}</strong>
        </div>
        <div class="zone-line-item">
          <span>Promedio:</span>
          <strong>{{ Number(item.calificacion_promedio_30_dias || 0).toFixed(2) }}</strong>
        </div>
        <div class="zone-line-item">
          <span>Rookie:</span>
          <strong>{{ item.riders_rookie }}</strong>
        </div>
        <div class="zone-line-item">
          <span>Semi-Pro:</span>
          <strong>{{ item.riders_semi_pro }}</strong>
        </div>
        <div class="zone-line-item">
          <span>Pro:</span>
          <strong>{{ item.riders_pro }}</strong>
        </div>
        <div class="zone-line-item">
          <span>Elite:</span>
          <strong>{{ item.riders_elite }}</strong>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})

function formatCurrency(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}
</script>
