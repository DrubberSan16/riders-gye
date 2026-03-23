import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../services/http'

const BATCH_LIMIT = 100
const MAX_BATCH_PAGES = 100

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false)
  const ridersLoading = ref(false)
  const evaluationLoading = ref(false)
  const deliveriesLoading = ref(false)
  const riderSubmitLoading = ref(false)

  const zones = ref([])
  const categories = ref([])
  const states = ref([])
  const riders = ref([])
  const allRiders = ref([])
  const ridersMeta = ref({ total: 0, page: 1, limit: 10, fechaReferencia: null })
  const deliveries = ref([])
  const deliveriesMeta = ref({ total: 0, page: 1, limit: 8 })
  const selectedEvaluation = ref(null)
  const selectedRider = ref(null)
  const toasts = ref([])
  const pendingDeliveriesCount = ref(0)
  const inProgressDeliveriesCount = ref(0)

  const riderModalOpen = ref(false)
  const riderModalMode = ref('create')
  const editingRiderId = ref(null)
  const riderForm = ref(getEmptyRiderForm())

  const filters = ref({
    zona: '',
    categoriaId: '',
    search: '',
    fechaReferencia: new Date().toISOString().slice(0, 10),
  })

  const deliveryForm = ref({
    riderId: '',
    descripcion: '',
    valor: '',
  })

  const statusForm = ref({
    entregaId: null,
    estadoId: '',
    calificacion: '',
  })

  const zonesOptions = computed(() => {
    const unique = new Set([
      ...allRiders.value.map((item) => item.zona).filter(Boolean),
      ...zones.value.map((item) => item.zona).filter(Boolean),
    ])
    return [...unique].sort((a, b) => a.localeCompare(b))
  })

  const categoriesOptions = computed(() => categories.value)
  const statesOptions = computed(() => states.value)
  const ridersOptions = computed(() => allRiders.value)
  const rookieCategory = computed(
    () => categories.value.find((item) => String(item.nombre || '').toLowerCase() === 'rookie') ?? null,
  )

  const dashboard = computed(() => {
    const zoneCount = zones.value.length
    const totalCompleted = zones.value.reduce(
      (sum, item) => sum + Number(item.entregas_completadas_30_dias ?? item.entregas_completadas ?? 0),
      0,
    )
    const averageRating =
      zoneCount > 0
        ? zones.value.reduce((sum, item) => sum + Number(item.calificacion_promedio_30_dias ?? 0), 0) / zoneCount
        : 0
    const totalCommissions = zones.value.reduce(
      (sum, item) => sum + Number(item.comisiones_totales_30_dias ?? 0),
      0,
    )

    return {
      total_riders: allRiders.value.length,
      entregas_pendientes: pendingDeliveriesCount.value,
      entregas_en_curso: inProgressDeliveriesCount.value,
      entregas_completadas_30_dias: totalCompleted,
      calificacion_promedio_30_dias: roundNumber(averageRating),
      comisiones_generadas_30_dias: roundNumber(totalCommissions),
    }
  })

  function getEmptyRiderForm() {
    return {
      nombre: '',
      email: '',
      telefono: '',
      zona: '',
      fechaIngreso: nowForInput(),
      categoriaId: '',
    }
  }

  function nowForInput() {
    const now = new Date()
    const pad = (value) => String(value).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
  }

  function roundNumber(value) {
    return Number(Number(value || 0).toFixed(2))
  }

  function normalizeDateReference() {
    return filters.value.fechaReferencia ? `${filters.value.fechaReferencia}T23:59:59` : undefined
  }

  function normalizeDateTimeForApi(value) {
    if (!value) return undefined
    return value.length === 16 ? `${value}:00` : value
  }

  function normalizeMonthStart() {
    const raw = filters.value.fechaReferencia || new Date().toISOString().slice(0, 10)
    const [year, month] = raw.split('-')
    return `${year}-${month}-01T00:00:00`
  }

  function getOperationalDateRange() {
    return {
      fechaDesde: normalizeMonthStart(),
      fechaHasta: normalizeDateReference(),
    }
  }

  function resolveCategoryIdFromRider(rider) {
    const rawId = rider?.categoriaId ?? rider?.categoria_id ?? rider?.categoria_actual_id
    if (rawId != null && rawId !== '') return String(rawId)

    const rawName = rider?.categoria_actual ?? rider?.categoria ?? rider?.categoriaNombre
    const match = categories.value.find(
      (item) => String(item.nombre || '').toLowerCase() === String(rawName || '').toLowerCase(),
    )
    return match ? String(match.id) : ''
  }

  function pushToast(type, text) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, text })
    setTimeout(() => {
      toasts.value = toasts.value.filter((item) => item.id !== id)
    }, 4500)
  }

  async function fetchPagedCollection(path, params = {}) {
    let page = 1
    let total = 0
    let items = []

    while (page <= MAX_BATCH_PAGES) {
      const response = await api.get(path, {
        params: {
          ...params,
          page,
          limit: BATCH_LIMIT,
        },
      })

      const data = response.data.data ?? {}
      const pageItems = data.items ?? []
      total = Number(data.total ?? pageItems.length)
      items = items.concat(pageItems)

      if (!pageItems.length || items.length >= total) {
        break
      }

      page += 1
    }

    return { items, total: total || items.length }
  }

  async function bootstrap() {
    loading.value = true
    try {
      await Promise.all([fetchCategories(), fetchStates(), fetchZonesSummary(), fetchAllRidersOptions()])
      await Promise.all([fetchKpiMetrics(), fetchRiders(), fetchDeliveries()])
    } catch (error) {
      pushToast('error', error.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchKpiMetrics() {
    const range = getOperationalDateRange()
    const [pending, inProgress] = await Promise.all([
      fetchPagedCollection('/entregas', {
        estadoId: 1,
        fechaDesde: range.fechaDesde,
        fechaHasta: range.fechaHasta,
      }),
      fetchPagedCollection('/entregas', {
        estadoId: 2,
        fechaDesde: range.fechaDesde,
        fechaHasta: range.fechaHasta,
      }),
    ])

    pendingDeliveriesCount.value = pending.items.length
    inProgressDeliveriesCount.value = inProgress.items.length
  }

  async function fetchZonesSummary() {
    const response = await api.get('/reportes/zonas', {
      params: { fechaReferencia: normalizeDateReference() },
    })
    zones.value = response.data.data.items ?? []
  }

  async function updateCategoriaRiders(){
    const range = getOperationalDateRange();
    const payload = {
      fechaReferencia: range.fechaHasta
      
    }
    await api.post('/tareas/sincronizacion-categorias/ejecutar', payload)
    
  }

  async function fetchCategories() {
    const response = await api.get('/categorias')
    categories.value = response.data.data ?? []
  }

  async function fetchStates() {
    const response = await api.get('/estados')
    states.value = response.data.data ?? []
  }

  async function fetchAllRidersOptions() {
    const response = await fetchPagedCollection('/riders', {
      fechaReferencia: normalizeDateReference(),
    })

    allRiders.value = response.items ?? []
  }

  async function fetchRiders(page = 1) {
    ridersLoading.value = true
    try {
      const response = await api.get('/riders', {
        params: {
          page,
          limit: ridersMeta.value.limit,
          zona: filters.value.zona || undefined,
          categoriaId: filters.value.categoriaId || undefined,
          search: filters.value.search || undefined,
          fechaReferencia: normalizeDateReference(),
        },
      })

      riders.value = response.data.data.items ?? []
      ridersMeta.value = {
        total: response.data.data.total ?? 0,
        page: response.data.data.page ?? page,
        limit: response.data.data.limit ?? ridersMeta.value.limit,
        fechaReferencia: response.data.data.fechaReferencia ?? null,
      }
    } finally {
      ridersLoading.value = false
    }
  }

  async function fetchDeliveries(page = 1) {
    deliveriesLoading.value = true
    try {
      const range = getOperationalDateRange()
      const response = await api.get('/entregas', {
        params: {
          page,
          limit: deliveriesMeta.value.limit,
          fechaDesde: range.fechaDesde,
          fechaHasta: range.fechaHasta,
        },
      })

      deliveries.value = response.data.data.items ?? []
      deliveriesMeta.value = {
        total: response.data.data.total ?? 0,
        page: response.data.data.page ?? page,
        limit: response.data.data.limit ?? deliveriesMeta.value.limit,
      }
    } finally {
      deliveriesLoading.value = false
    }
  }

  async function openEvaluation(rider) {
    evaluationLoading.value = true
    selectedRider.value = rider
    try {
      const response = await api.get(`/evaluaciones/riders/${rider.id}`, {
        params: { fechaReferencia: normalizeDateReference() },
      })
      selectedEvaluation.value = response.data.data
    } catch (error) {
      pushToast('error', error.message)
    } finally {
      evaluationLoading.value = false
    }
  }

  function closeEvaluation() {
    selectedEvaluation.value = null
    selectedRider.value = null
  }

  function openCreateRiderModal() {
    riderModalMode.value = 'create'
    editingRiderId.value = null
    riderForm.value = {
      ...getEmptyRiderForm(),
      categoriaId: rookieCategory.value ? String(rookieCategory.value.id) : '',
    }
    riderModalOpen.value = true
  }

  async function openEditRiderModal(rider) {
    riderModalMode.value = 'edit'
    editingRiderId.value = rider.id

    try {
      const response = await api.get(`/riders/${rider.id}`)
      const detail = response.data.data ?? rider

      riderForm.value = {
        nombre: detail.nombre ?? rider.nombre ?? '',
        email: detail.email ?? rider.email ?? '',
        telefono: detail.telefono ?? rider.telefono ?? '',
        zona: detail.zona ?? rider.zona ?? '',
        fechaIngreso:
          (detail.fecha_ingreso ?? detail.fechaIngreso ?? rider.fecha_ingreso ?? rider.fechaIngreso ?? '').slice(0, 16) ||
          nowForInput(),
        categoriaId: resolveCategoryIdFromRider(detail),
      }
      riderModalOpen.value = true
    } catch (error) {
      pushToast('error', error.message)
    }
  }

  function closeRiderModal() {
    riderModalOpen.value = false
    editingRiderId.value = null
    riderForm.value = getEmptyRiderForm()
  }

  async function submitRiderForm() {
    riderSubmitLoading.value = true
    try {
      const payload = {
        nombre: riderForm.value.nombre.trim(),
        email: riderForm.value.email.trim(),
        telefono: riderForm.value.telefono.trim(),
        zona: riderForm.value.zona.trim(),
        fechaIngreso: normalizeDateTimeForApi(riderForm.value.fechaIngreso),
      }

      if (riderModalMode.value === 'create') {
        if (rookieCategory.value) {
          payload.categoriaId = Number(rookieCategory.value.id)
        }
        await api.post('/riders', payload)
        pushToast('success', 'Rider creado correctamente con categoría Rookie.')
      } else {
        payload.categoriaId = Number(riderForm.value.categoriaId)
        await api.patch(`/riders/${editingRiderId.value}`, payload)
        pushToast('success', 'Rider actualizado correctamente.')
      }

      closeRiderModal()
      await refreshOperationalData()
    } finally {
      riderSubmitLoading.value = false
    }
  }

  async function applyFilters() {
    try {
      await Promise.all([fetchZonesSummary(), fetchKpiMetrics(), fetchRiders(1), fetchDeliveries(1), updateCategoriaRiders()])
    } catch (error) {
      pushToast('error', error.message)
    }
  }

  async function clearFilters() {
    filters.value = {
      zona: '',
      categoriaId: '',
      search: '',
      fechaReferencia: new Date().toISOString().slice(0, 10),
    }
    await Promise.all([fetchAllRidersOptions(), applyFilters()])
  }

  async function refreshOperationalData() {
    await Promise.all([
      fetchDeliveries(deliveriesMeta.value.page),
      fetchZonesSummary(),
      fetchKpiMetrics(),
      fetchRiders(ridersMeta.value.page),
      fetchAllRidersOptions(),
    ])
  }

  async function createDelivery() {
    const payload = {
      riderId: Number(deliveryForm.value.riderId),
      descripcion: deliveryForm.value.descripcion.trim(),
      valor: Number(deliveryForm.value.valor),
    }

    await api.post('/entregas', payload)
    pushToast('success', 'Entrega creada correctamente en estado pendiente.')
    deliveryForm.value = { riderId: '', descripcion: '', valor: '' }
    await refreshOperationalData()
  }

  async function changeDeliveryStatus() {
    const payload = {
      estadoId: Number(statusForm.value.estadoId),
      calificacion:
        statusForm.value.calificacion === '' || statusForm.value.calificacion == null
          ? undefined
          : Number(statusForm.value.calificacion),
    }

    await api.patch(`/entregas/${statusForm.value.entregaId}/estado`, payload)
    pushToast('success', 'Estado de entrega actualizado correctamente.')
    statusForm.value = { entregaId: null, estadoId: '', calificacion: '' }
    await refreshOperationalData()
  }

  function prepareStatusChange(delivery) {
    statusForm.value = {
      entregaId: delivery.id,
      estadoId: '',
      calificacion: '',
    }
  }

  return {
    loading,
    ridersLoading,
    evaluationLoading,
    deliveriesLoading,
    riderSubmitLoading,
    dashboard,
    zones,
    categories,
    states,
    riders,
    allRiders,
    ridersMeta,
    deliveries,
    deliveriesMeta,
    selectedEvaluation,
    selectedRider,
    toasts,
    filters,
    deliveryForm,
    statusForm,
    riderModalOpen,
    riderModalMode,
    riderForm,
    rookieCategory,
    zonesOptions,
    categoriesOptions,
    statesOptions,
    ridersOptions,
    bootstrap,
    fetchRiders,
    fetchDeliveries,
    fetchAllRidersOptions,
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
    prepareStatusChange,
    pushToast,
  }
})
