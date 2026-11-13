<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import SummaryCards from '@/components/SummaryCards.vue'
import TransactionList from '@/components/TransactionList.vue'
import TransactionForm from '@/components/TransactionForm.vue'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const auth = useAuthStore()
const router = useRouter()

const today = new Date()
const month = ref(today.getMonth() + 1)
const year = ref(today.getFullYear())

const summary = ref(null)
const loading = ref(false)
const error = ref('')

const formOpen = ref(false)
const editing = ref(null)
const refreshKey = ref(0)

async function loadSummary() {
  if (!year.value || year.value < 2000 || year.value > 2100) return

  loading.value = true
  error.value = ''
  try {
    summary.value = await api.get('/summary', { month: month.value, year: year.value })
  } catch {
    error.value = 'No se pudo cargar el resumen.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(transaction) {
  editing.value = transaction
  formOpen.value = true
}

function onSaved(date) {
  formOpen.value = false
  const [y, m] = date.split('-').map(Number)

  if (y === year.value && m === month.value) {
    loadSummary()
    refreshKey.value++
  } else {
    // Salta al mes de la transacción: los watchers recargan todo
    year.value = y
    month.value = m
  }
}

onMounted(() => {
  if (!auth.user) auth.fetchUser()
  loadSummary()
})

watch([month, year], loadSummary)

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="page">
    <header class="topbar">
      <h1>Control de Gastos</h1>
      <div>
        <span v-if="auth.user">{{ auth.user.name }}</span>
        <button class="secondary" @click="logout">Cerrar sesión</button>
      </div>
    </header>

    <section class="filters">
      <select v-model="month">
        <option v-for="(name, i) in MONTHS" :key="i" :value="i + 1">{{ name }}</option>
      </select>
      <input v-model.number="year" type="number" min="2000" max="2100" />
      <button class="push-right" @click="openCreate">Nueva transacción</button>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading && !summary" class="muted">Cargando...</p>
    <SummaryCards v-else-if="summary" :summary="summary" />

    <TransactionList
      :month="month"
      :year="year"
      :refresh-key="refreshKey"
      @edit="openEdit"
      @changed="loadSummary"
    />

    <TransactionForm
      v-if="formOpen"
      :transaction="editing"
      @saved="onSaved"
      @close="formOpen = false"
    />
  </main>
</template>
