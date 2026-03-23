<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Rider</th>
          <th>Zona</th>
          <th>Categoría</th>
          <th>Entregas 30 días</th>
          <th>Calificación promedio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody v-if="!loading && items.length">
        <tr v-for="item in items" :key="item.id">
          <td>
            <div class="user-cell">
              <strong>{{ item.nombre }}</strong>
              <span>{{ item.email }}</span>
            </div>
          </td>
          <td>{{ item.zona }}</td>
          <td>
            <span :class="['category-badge', categoryClass(item.categoria_actual)]">
              {{ item.categoria_actual }}
            </span>
          </td>
          <td>{{ item.entregas_completadas_30_dias }}</td>
          <td>{{ Number(item.calificacion_promedio_30_dias || 0).toFixed(2) }}</td>
          <td>
            <div class="table-actions">
              <button class="ghost-button small" @click="$emit('select', item)">Ver evaluación</button>
              <button class="ghost-button small" @click="$emit('edit', item)">Editar</button>
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="loading">
        <tr>
          <td colspan="6" class="empty-state">Cargando riders...</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="6" class="empty-state">No hay riders que coincidan con el filtro actual.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['select', 'edit'])

function categoryClass(name) {
  return `category-${String(name || '').toLowerCase().replace(/[^a-z]/g, '')}`
}
</script>
