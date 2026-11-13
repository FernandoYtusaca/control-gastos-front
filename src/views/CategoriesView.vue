<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '@/services/api'
import AppHeader from '@/components/AppHeader.vue'

const categories = ref([])
const loading = ref(true)
const message = ref('')

const form = reactive({ name: '', type: 'expense' })
const errors = ref({})
const saving = ref(false)

const editingId = ref(null)
const editName = ref('')
const editError = ref('')

const groups = computed(() => [
  { title: 'Gastos', items: categories.value.filter((c) => c.type === 'expense') },
  { title: 'Ingresos', items: categories.value.filter((c) => c.type === 'income') },
])

async function load() {
  try {
    categories.value = await api.get('/categories')
  } catch {
    message.value = 'No se pudieron cargar las categorías.'
  } finally {
    loading.value = false
  }
}

async function create() {
  errors.value = {}
  message.value = ''
  saving.value = true
  try {
    await api.post('/categories', form)
    form.name = ''
    await load()
  } catch (e) {
    if (e.status === 422) errors.value = e.errors
    else message.value = 'No se pudo crear la categoría.'
  } finally {
    saving.value = false
  }
}

function startEdit(c) {
  editingId.value = c.id
  editName.value = c.name
  editError.value = ''
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(c) {
  editError.value = ''
  try {
    await api.put(`/categories/${c.id}`, { name: editName.value })
    editingId.value = null
    await load()
  } catch (e) {
    if (e.status === 422) editError.value = e.errors.name?.[0] ?? 'Datos inválidos.'
    else editError.value = 'No se pudo guardar el cambio.'
  }
}

async function remove(c) {
  if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return

  message.value = ''
  try {
    await api.delete(`/categories/${c.id}`)
    await load()
  } catch (e) {
    message.value = e.status === 409 ? e.message : 'No se pudo eliminar la categoría.'
  }
}

onMounted(load)
</script>

<template>
  <main class="page">
    <AppHeader />

    <form class="panel category-form" @submit.prevent="create">
      <label>
        Nombre
        <input v-model="form.name" type="text" required maxlength="255" />
        <small v-if="errors.name" class="error">{{ errors.name[0] }}</small>
      </label>

      <label>
        Tipo
        <select v-model="form.type">
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        <small v-if="errors.type" class="error">{{ errors.type[0] }}</small>
      </label>

      <button :disabled="saving">{{ saving ? 'Añadiendo...' : 'Añadir' }}</button>
    </form>

    <p v-if="message" class="error">{{ message }}</p>
    <p v-if="loading" class="muted">Cargando...</p>

    <section v-for="group in groups" :key="group.title" class="panel">
      <h2>{{ group.title }}</h2>

      <p v-if="!group.items.length" class="muted">Aún no tienes categorías de este tipo.</p>

      <ul v-else class="category-list">
        <li v-for="c in group.items" :key="c.id">
          <template v-if="editingId === c.id">
            <form class="inline-edit" @submit.prevent="saveEdit(c)">
              <input v-model="editName" type="text" required maxlength="255" />
              <button>Guardar</button>
              <button type="button" class="secondary" @click="cancelEdit">Cancelar</button>
            </form>
            <small v-if="editError" class="error">{{ editError }}</small>
          </template>

          <template v-else>
            <span>{{ c.name }}</span>
            <span class="actions">
              <button class="link" @click="startEdit(c)">Editar</button>
              <button class="link danger" @click="remove(c)">Eliminar</button>
            </span>
          </template>
        </li>
      </ul>
    </section>
  </main>
</template>
