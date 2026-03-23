<template>
  <section class="filter-bar horizontal-filter-bar">
    <div class="filter-title-row">
      <div>
        <h2>Filtros</h2>
        
      </div>
      <div class="filter-actions inline-actions">
        <button class="ghost-button" @click="$emit('clear')">Limpiar</button>
        <button class="primary-button" @click="$emit('apply')">Aplicar filtros</button>
      </div>
    </div>

    <div class="filter-grid enterprise-grid filter-grid-horizontal">
      <label>
        Zona
        <select v-model="filters.zona">
          <option value="">Todas</option>
          <option v-for="zona in zonas" :key="zona" :value="zona">{{ zona }}</option>
        </select>
      </label>

      <label>
        Categoría
        <select v-model="filters.categoriaId">
          <option value="">Todas</option>
          <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
            {{ categoria.nombre }}
          </option>
        </select>
      </label>

      <label>
        Buscar
        <input v-model="filters.search" type="text" placeholder="Nombre o email" @keyup.enter="$emit('apply')" />
      </label>

      <label>
        Fecha límite
        <input v-model="filters.fechaReferencia" type="date" />
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps({
  filters: { type: Object, required: true },
  zonas: { type: Array, default: () => [] },
  categorias: { type: Array, default: () => [] },
})

defineEmits(['apply', 'clear'])
</script>
