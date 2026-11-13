<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { api } from '@/services/api'
import { formatAmount, formatDate } from '@/utils/format'

const props = defineProps({
  month: { type: Number, required: true },
  year: { type: [Number, String], required: true },
})

const categories = ref([])
const type = ref('')
const categoryId = ref('')
const page = ref(1)

const result = ref(null)
const loading = ref(false)
const error = ref('')

const visibleCategories = computed(() =>
  categories.value.filter((c) => !type.value || c.type === type.value),
)

async function loadTransactions() {
  if (!props.year || props.year < 2000 || props.year > 2100) return

  loading.value = true
  error.value = ''
  try {
    result.value = await api.get('/transactions', {
      month: props.month,
      year: props.year,
      type: type.value,
      category_id: categoryId.value,
      page: page.value,
    })
  } catch {
    error.value = 'No se pudieron cargar las transacciones.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = await api.get('/categories')
  } catch {
    // si falla, el filtro por categoría queda vacío
  }
  loadTransactions()
})

// Al cambiar un filtro se vuelve a la página 1
watch([() => props.month, () => props.year, type, categoryId], () => {
  if (page.value !== 1) page.value = 1
  else loadTransactions()
})

watch(page, loadTransactions)
</script>

<template>
  <section class="panel">
    <h2>Transacciones</h2>

    <div class="filters">
      <select v-model="type" @change="categoryId = ''">
        <option value="">Todos los tipos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </select>

      <select v-model="categoryId">
        <option value="">Todas las categorías</option>
        <option v-for="c in visibleCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading && !result" class="muted">Cargando...</p>
    <p v-else-if="result && !result.data.length" class="muted">
      No hay transacciones con estos filtros.
    </p>

    <div v-else-if="result" class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th class="amount">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in result.data" :key="t.id">
            <td>{{ formatDate(t.date) }}</td>
            <td>{{ t.category.name }}</td>
            <td>{{ t.description || '—' }}</td>
            <td class="amount" :class="t.category.type === 'income' ? 'income-text' : 'expense-text'">
              {{ t.category.type === 'income' ? '+' : '-' }}{{ formatAmount(t.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav v-if="result && result.last_page > 1" class="pagination">
      <button class="secondary" :disabled="page <= 1" @click="page--">Anterior</button>
      <span>Página {{ result.current_page }} de {{ result.last_page }}</span>
      <button class="secondary" :disabled="page >= result.last_page" @click="page++">
        Siguiente
      </button>
    </nav>
  </section>
</template>
