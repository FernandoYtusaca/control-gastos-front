<script setup>
import { formatAmount } from '@/utils/format'

defineProps({
  summary: { type: Object, required: true },
})
</script>

<template>
  <div>
    <section class="summary">
      <div class="stat income">
        <span>Ingresos</span>
        <strong>{{ formatAmount(summary.total_income) }}</strong>
      </div>
      <div class="stat expense">
        <span>Gastos</span>
        <strong>{{ formatAmount(summary.total_expense) }}</strong>
      </div>
      <div class="stat" :class="summary.balance >= 0 ? 'income' : 'expense'">
        <span>Balance</span>
        <strong>{{ formatAmount(summary.balance) }}</strong>
      </div>
    </section>

    <section class="panel">
      <h2>Por categoría</h2>
      <p v-if="!summary.by_category.length" class="muted">Sin movimientos en este mes.</p>
      <ul v-else class="category-list">
        <li v-for="c in summary.by_category" :key="c.category_id">
          <span>{{ c.name }}</span>
          <span :class="c.type === 'income' ? 'income-text' : 'expense-text'">
            {{ c.type === 'income' ? '+' : '-' }}{{ formatAmount(c.total) }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>
