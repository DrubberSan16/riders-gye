<template>
  <teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card evaluation-modal-card">
        <div class="modal-header evaluation-header">
          <div>
            <p class="eyebrow">Detalle de evaluación</p>
            <h2>{{ evaluation?.nombre || 'Cargando...' }}</h2>
            <div class="evaluation-subheader">
              <span class="soft-chip">Zona: {{ evaluation?.zona || '—' }}</span>
              <span class="soft-chip">Fecha de corte: {{ formattedReferenceDate }}</span>
            </div>
          </div>
          <button class="icon-button" @click="$emit('close')">×</button>
        </div>

        <div v-if="loading" class="empty-state">Consultando evaluación del rider...</div>

        <template v-else-if="evaluation">
          <section class="evaluation-highlight-grid">
            <article class="evaluation-highlight-box primary">
              <span class="evaluation-highlight-label">Categoría actual:</span>
              <strong>{{ evaluation.categoria_actual }}</strong>
            </article>
            <article class="evaluation-highlight-box secondary">
              <span class="evaluation-highlight-label">Categoría correspondiente:</span>
              <strong>{{ evaluation.categoria_correspondiente }}</strong>
            </article>
          </section>

          <div class="evaluation-grid">
            <article class="metric-box">
              <span>Entregas de 30 días: </span>
              <strong>{{ evaluation.entregas_completadas_30_dias }}</strong>
            </article>
            <article class="metric-box">
              <span>Calificación promedio: </span>
              <strong>{{ Number(evaluation.calificacion_promedio_30_dias || 0).toFixed(2) }}</strong>
            </article>
            <article class="metric-box full-width emphasis">
              <span>Comisiones generadas: </span>
              <strong>{{ formatCurrency(evaluation.comisiones_generadas_30_dias) }}</strong>
            </article>
          </div>

        </template>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  evaluation: { type: Object, default: null },
})

defineEmits(['close'])


const formattedReferenceDate = computed(() => {
  const value = props.evaluation?.fecha_referencia
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
})

function formatCurrency(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}
</script>
