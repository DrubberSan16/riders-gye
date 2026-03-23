<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card rider-modal-card">
        <div class="modal-header">
          <div>
            <h2>{{ isEdit ? 'Editar rider' : 'Nuevo rider' }}</h2>
            <p>
              {{ isEdit ? 'Ajusta la información operativa del rider.' : 'Registra un nuevo rider con categoría inicial Rookie.' }}
            </p>
          </div>
          <button class="icon-button" type="button" aria-label="Cerrar" @click="$emit('close')">×</button>
        </div>

        <form class="rider-form-grid" @submit.prevent="$emit('submit')">
          <label>
            Nombre completo
            <input v-model="form.nombre" type="text" required placeholder="Ej. Andrea Morales" />
          </label>

          <label>
            Email
            <input v-model="form.email" type="email" required placeholder="andrea.morales@mail.com" />
          </label>

          <label>
            Teléfono
            <input v-model="form.telefono" type="text" required placeholder="0999999999" />
          </label>

          <label>
            Zona
            <input v-model="form.zona" type="text" required placeholder="Ej. Norte" />
          </label>

          <label>
            Fecha de ingreso
            <input v-model="form.fechaIngreso" type="datetime" required />
          </label>

          <label v-if="isEdit">
            Categoría
            <select v-model="form.categoriaId" required>
              <option value="">Selecciona una categoría</option>
              <option v-for="categoria in categorias" :key="categoria.id" :value="String(categoria.id)">
                {{ categoria.nombre }}
              </option>
            </select>
          </label>

          <div v-else class="locked-category-card">
            <span>Categoría inicial</span>
            <strong>{{ rookieCategoryName || 'Rookie' }}</strong>
            <small>En la creación queda asignada por defecto. Solo en edición se puede cambiar.</small>
          </div>
        </form>

        <div class="modal-actions">
          <button class="ghost-button" type="button" @click="$emit('close')">Cancelar</button>
          <button class="primary-button" type="button" :disabled="loading" @click="$emit('submit')">
            {{ loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear rider' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  form: { type: Object, required: true },
  categorias: { type: Array, default: () => [] },
  rookieCategoryName: { type: String, default: 'Rookie' },
})

defineEmits(['close', 'submit'])
</script>
