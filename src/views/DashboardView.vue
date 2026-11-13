<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/services/api'
import SummaryCards from '@/components/SummaryCards.vue'
import TransactionList from '@/components/TransactionList.vue'

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
    </section>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading && !summary" class="muted">Cargando...</p>
    <SummaryCards v-else-if="summary" :summary="summary" />
    <TransactionList :month="month" :year="year" />
  </main>
</template>
