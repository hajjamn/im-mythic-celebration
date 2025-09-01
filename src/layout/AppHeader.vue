<!-- src/layout/AppHeader.vue -->
<template>
  <header class="container py-3 text-center">
    <h1 class="h3 mb-1">ITALIAN MARAUDERS</h1>
    <p class="text-muted mb-0">{{ pageLabel }}</p>
  </header>

  <nav class="container mb-3">
    <div class="d-flex flex-wrap justify-content-center gap-2">
      <RouterLink :to="{ name: 'seals' }" class="btn" :class="btnClass('seals')"
        >Calcolatore Sigilli Mitici</RouterLink
      >

      <RouterLink :to="{ name: 'shop' }" class="btn" :class="btnClass('shop')"
        >Calcolatore Spese Negozio</RouterLink
      >

      <RouterLink
        :to="{ name: 'missions' }"
        class="btn"
        :class="btnClass('missions')"
        >Lista Missioni</RouterLink
      >

      <RouterLink
        :to="{ name: 'rotation' }"
        class="btn"
        :class="btnClass('rotation')"
        >Rotazione Negozio</RouterLink
      >
    </div>
  </nav>
</template>

<script setup>
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const pageLabel = computed(() => route.meta?.title ?? "Festeggiamenti Mitici");

function btnClass(name) {
  return route.name === name ? "btn-primary" : "btn-outline-primary";
}
</script>

<script>
import { computed } from "vue";
export default {};
</script>

<style scoped></style>
