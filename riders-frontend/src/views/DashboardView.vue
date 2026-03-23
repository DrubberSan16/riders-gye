<template>
  <div class="page-shell">
    <header class="page-header glass-panel">
      <div class="hero-copy">
        <p class="eyebrow">RidersApp · Centro de Operaciones</p>
        <h1>Dashboard ejecutivo de riders, entregas y zonas</h1>        
      </div>
      <div class="header-actions">
        <div class="date-chip">Corte: {{ filters.fechaReferencia }}</div>
        <button class="primary-button" @click="applyFilters">Actualizar panel</button>
      </div>
    </header>

    <section class="kpi-grid compact-grid">
      <KpiCard label="Riders activos" :value="dashboard?.total_riders ?? 0" help="Base total registrada" />
      <KpiCard label="Pendientes" :value="dashboard?.entregas_pendientes ?? 0" help="Entregas en cola" />
      <KpiCard label="En curso" :value="dashboard?.entregas_en_curso ?? 0" help="Despachos activos" />
      <KpiCard
        label="Completadas intervalo 30 días"
        :value="dashboard?.entregas_completadas_30_dias ?? 0"
        help="Base para evaluación"
      />
      <KpiCard
        label="Calificación promedio"
        :value="formatNumber(dashboard?.calificacion_promedio_30_dias ?? 0)"
        help="Promedio del período"
      />
      <KpiCard
        label="Comisiones intervalo 30 días"
        :value="formatCurrency(dashboard?.comisiones_generadas_30_dias ?? 0)"
        help="Total generado"
      />
    </section>

    <section class="glass-panel filter-strip-panel">
      <FilterBar
        :filters="filters"
        :zonas="zonesOptions"
        :categorias="categoriesOptions"
        @apply="applyFilters"
        @clear="clearFilters"
      />
    </section>

    <section class="insights-grid">
      <section class="glass-panel table-section primary-board">
        <div class="section-head">
          <div>
            <h2>Riders</h2>            
          </div>
          <div class="section-head-actions">
            <div class="count-chip">{{ ridersMeta.total }} registros</div>
            <button class="primary-button" @click="openCreateRiderModal">Nuevo rider</button>
          </div>
        </div>

        <RidersTable
          :loading="ridersLoading"
          :items="riders"
          @select="openEvaluation"
          @edit="openEditRiderModal"
        />

        <div class="table-footer">
          <button
            class="ghost-button"
            :disabled="ridersMeta.page <= 1 || ridersLoading"
            @click="fetchRiders(ridersMeta.page - 1)"
          >
            Anterior
          </button>
          <span>Página {{ ridersMeta.page }}</span>
          <button
            class="ghost-button"
            :disabled="ridersMeta.page * ridersMeta.limit >= ridersMeta.total || ridersLoading"
            @click="fetchRiders(ridersMeta.page + 1)"
          >
            Siguiente
          </button>
        </div>
      </section>

      <section class="glass-panel zone-section side-board compact-panel">
        <div class="section-head compact">
          <div>
            <h2>Resumen por zona</h2>            
          </div>
        </div>
        <ZoneSummaryPanel :items="zones" />
      </section>
    </section>

    <section class="operations-layout">
      <section class="glass-panel operations-section compact-panel">
        <div class="section-head compact">
          <div>
            <h2>Operación rápida</h2>            
          </div>
        </div>

        <div class="operations-grid slim-grid">
          <form class="operation-card" @submit.prevent="handleCreateDelivery">
            <h3>Nueva entrega</h3>
            <label>
              Rider
              <select v-model="deliveryForm.riderId" required>
                <option value="">Selecciona un rider</option>
                <option v-for="rider in ridersOptions" :key="rider.id" :value="rider.id">
                  {{ rider.nombre }} · {{ rider.zona }}
                </option>
              </select>
            </label>
            <label>
              Descripción
              <input v-model="deliveryForm.descripcion" type="text" required placeholder="Ej. Combo familiar + bebida" />
            </label>
            <label>
              Valor USD
              <input v-model="deliveryForm.valor" type="number" min="0.01" step="0.01" required placeholder="15.50" />
            </label>
            <button class="primary-button" type="submit">Crear entrega</button>
          </form>

          <form class="operation-card" @submit.prevent="handleChangeStatus">
            <h3>Cambio de estado</h3>
            <label>
              Entrega
              <select v-model="statusForm.entregaId" required @change="syncStatusDefaults">
                <option :value="null">Selecciona una entrega</option>
                <option v-for="delivery in deliveries" :key="delivery.id" :value="delivery.id">
                  #{{ delivery.id }} · {{ delivery.estado }} · {{ delivery.rider_nombre }}
                </option>
              </select>
            </label>
            <label>
              Nuevo estado
              <select v-model="statusForm.estadoId" required>
                <option value="">Selecciona un estado</option>
                <option v-for="state in allowedStatusOptions" :key="state.id" :value="state.id">
                  {{ state.nombre }}
                </option>
              </select>
            </label>
            <label>
              Calificación
              <input
                v-model="statusForm.calificacion"
                type="number"
                min="0"
                max="5"
                step="0.1"
                :disabled="selectedTargetStatusName !== 'completada'"
                placeholder="Solo si completa"
              />
            </label>
            <button class="primary-button" type="submit">Actualizar estado</button>
          </form>
        </div>
      </section>

      <section class="glass-panel deliveries-section compact-panel">
        <div class="section-head compact">
          <div>
            <h2>Entregas recientes</h2>
            
          </div>
          <button class="ghost-button" @click="fetchDeliveries(deliveriesMeta.page)">Recargar</button>
        </div>

        <div v-if="deliveriesLoading" class="empty-state">Cargando entregas...</div>
        <div v-else class="deliveries-list scroll-panel compact-deliveries-list">
          <article v-for="delivery in deliveries" :key="delivery.id" class="delivery-item">
            <div class="delivery-head">
              <div>
                <strong>#{{ delivery.id }}</strong>
                <p>{{ delivery.descripcion }}</p>
              </div>
              <span :class="['state-badge', `state-${delivery.estado}`]">{{ delivery.estado }}</span>
            </div>
            <div class="delivery-meta">
              <span>{{ delivery.rider_nombre }}</span>
              <span>{{ formatCurrency(delivery.valor) }}</span>
              <span>{{ formatDateTime(delivery.fecha_creacion) }}</span>
            </div>
          </article>
        </div>
      </section>
    </section>

    <RiderEvaluationModal
      :open="Boolean(selectedEvaluation || evaluationLoading)"
      :loading="evaluationLoading"
      :evaluation="selectedEvaluation"
      @close="closeEvaluation"
    />

    <RiderFormModal
      :open="riderModalOpen"
      :loading="riderSubmitLoading"
      :is-edit="riderModalMode === 'edit'"
      :form="riderForm"
      :categorias="categoriesOptions"
      :rookie-category-name="rookieCategory?.nombre || 'Rookie'"
      @close="closeRiderModal"
      @submit="handleSubmitRider"
    />

    <div class="toast-stack">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
        {{ toast.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../stores/dashboard'
import KpiCard from '../components/KpiCard.vue'
import FilterBar from '../components/FilterBar.vue'
import RidersTable from '../components/RidersTable.vue'
import RiderEvaluationModal from '../components/RiderEvaluationModal.vue'
import RiderFormModal from '../components/RiderFormModal.vue'
import ZoneSummaryPanel from '../components/ZoneSummaryPanel.vue'

const store = useDashboardStore()
const {
  dashboard,
  riders,
  ridersMeta,
  ridersLoading,
  evaluationLoading,
  selectedEvaluation,
  filters,
  zones,
  categoriesOptions,
  zonesOptions,
  ridersOptions,
  deliveryForm,
  statusForm,
  deliveries,
  deliveriesMeta,
  deliveriesLoading,
  statesOptions,
  toasts,
  riderModalOpen,
  riderModalMode,
  riderForm,
  riderSubmitLoading,
  rookieCategory,
} = storeToRefs(store)

const {
  bootstrap,
  fetchRiders,
  fetchDeliveries,
  openEvaluation,
  closeEvaluation,
  openCreateRiderModal,
  openEditRiderModal,
  closeRiderModal,
  submitRiderForm,
  applyFilters,
  clearFilters,
  createDelivery,
  changeDeliveryStatus,
  pushToast,
} = store

const selectedDelivery = computed(() => deliveries.value.find((item) => item.id === Number(statusForm.value.entregaId)) || null)
const selectedTargetStatusName = computed(() => {
  const match = statesOptions.value.find((item) => item.id === Number(statusForm.value.estadoId))
  return match?.nombre || ''
})

const allowedStatusOptions = computed(() => {
  if (!selectedDelivery.value) return statesOptions.value

  if (selectedDelivery.value.estado === 'pendiente') {
    return statesOptions.value.filter((item) => item.nombre === 'en_curso')
  }

  if (selectedDelivery.value.estado === 'en_curso') {
    return statesOptions.value.filter((item) => ['completada', 'cancelada'].includes(item.nombre))
  }

  return []
})

function formatCurrency(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatNumber(value) {
  return Number(value || 0).toFixed(2)
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function syncStatusDefaults() {
  statusForm.value.estadoId = ''
  statusForm.value.calificacion = ''
}

async function handleCreateDelivery() {
  try {
    await createDelivery()
  } catch (error) {
    pushToast('error', error.message)
  }
}

async function handleChangeStatus() {
  try {
    await changeDeliveryStatus()
  } catch (error) {
    pushToast('error', error.message)
  }
}

async function handleSubmitRider() {
  try {
    await submitRiderForm()
  } catch (error) {
    pushToast('error', error.message)
  }
}

onMounted(() => {
  bootstrap()
})
</script>
