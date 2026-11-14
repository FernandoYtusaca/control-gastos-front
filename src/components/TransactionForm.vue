<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '@/services/api'
import { todayISO } from '@/utils/format'

const props = defineProps({
  transaction: { type: Object, default: null },
})
const emit = defineEmits(['saved', 'close'])

const categories = ref([])
const type = ref(props.transaction?.category.type ?? 'expense')

const form = reactive({
  category_id: props.transaction?.category_id ?? '',
  amount: props.transaction?.amount ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction ? props.transaction.date.slice(0, 10) : todayISO(),
})

const errors = ref({})
const message = ref('')
const loading = ref(false)

const visibleCategories = computed(() => categories.value.filter((c) => c.type === type.value))

onMounted(async () => {
  try {
    categories.value = await api.get('/categories')
  } catch {
    message.value = 'No se pudieron cargar las categorías.'
  }
})

async function submit() {
  errors.value = {}
  message.value = ''
  loading.value = true
  try {
    if (props.transaction) {
      await api.put(`/transactions/${props.transaction.id}`, form)
    } else {
      await api.post('/transactions', form)
    }
    emit('saved', form.date)
  } catch (e) {
    if (e.status === 422) errors.value = e.errors
    else message.value = 'No se pudo guardar la transacción.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <form class="card" @submit.prevent="submit">
      <h1>{{ transaction ? 'Editar transacción' : 'Nueva transacción' }}</h1>

      <label>
        Tipo
        <select v-model="type" @change="form.category_id = ''">
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </label>

      <label>
        Categoría
        <select v-model="form.category_id" required>
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="c in visibleCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <small v-if="!visibleCategories.length" class="muted">
          No tienes categorías de este tipo.
        </small>
        <small v-if="errors.category_id" class="error">{{ errors.category_id[0] }}</small>
      </label>

      <label>
        Monto
        <input v-model="form.amount" type="number" step="0.01" min="0.01" required />
        <small v-if="errors.amount" class="error">{{ errors.amount[0] }}</small>
      </label>

      <label>
        Fecha
        <input v-model="form.date" type="date" required />
        <small v-if="errors.date" class="error">{{ errors.date[0] }}</small>
      </label>

      <label>
        Descripción (opcional)
        <input v-model="form.description" type="text" maxlength="255" />
        <small v-if="errors.description" class="error">{{ errors.description[0] }}</small>
      </label>

      <p v-if="message" class="error">{{ message }}</p>

      <button :disabled="loading">{{ loading ? 'Guardando...' : 'Guardar' }}</button>
      <button type="button" class="secondary" @click="emit('close')">Cancelar</button>
    </form>
  </div>
</template>
