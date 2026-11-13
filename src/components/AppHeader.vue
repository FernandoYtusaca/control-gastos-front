<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!auth.user) auth.fetchUser()
})

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <div>
      <h1>Control de Gastos</h1>
      <nav class="nav">
        <RouterLink to="/">Resumen</RouterLink>
        <RouterLink to="/categories">Categorías</RouterLink>
      </nav>
    </div>
    <div>
      <span v-if="auth.user">{{ auth.user.name }}</span>
      <button class="secondary" @click="logout">Cerrar sesión</button>
    </div>
  </header>
</template>
