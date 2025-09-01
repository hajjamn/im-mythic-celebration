<script setup>
import { reactive, ref, computed, onMounted } from "vue";

const data = reactive({
  characterShardRules: {},
  setsByDay: {},
  offersCatalog: { high: {}, mid: {}, low: {} },
  freeCatalog: { high: {}, mid: {}, low: {} },
  freeByTierAndDay: { high: {}, mid: {}, low: {} },
  charactersByDay: {},
});

const tier = ref("high"); // "high" | "mid" | "low"

onMounted(async () => {
  const json = await fetch("/data/shop.json").then((r) => r.json());
  Object.assign(data, json);
});

// giorni 1..7
const days = computed(() =>
  [1, 2, 3, 4, 5, 6, 7].map((d) => ({
    dayIndex: d,
    setKey: data.setsByDay?.[d] || "set1",
    characters: data.charactersByDay?.[d] || [],
  }))
);

// offerte del giorno per livello selezionato
function offersFor(day) {
  const list = data.offersCatalog?.[tier.value]?.[day.setKey] || [];
  // omaggio del giorno
  const freeKey = data.freeByTierAndDay?.[tier.value]?.[day.dayIndex];
  const freeObj = freeKey ? data.freeCatalog?.[tier.value]?.[freeKey] : null;
  return freeObj
    ? [
        ...list,
        { id: freeObj.id, label: freeObj.label, costSeals: 0, stock: 1 },
      ]
    : list;
}

// util: spezza array in righe per tabella personaggi
function chunk(arr, size = 3) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

const shardRules = computed(() => data.characterShardRules || {});
</script>

<template>
  <section class="d-grid gap-3">
    <!-- Spiegazione + selettore livello -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="h5 mb-2">Rotazione del Negozio Mitico</h2>
        <p class="mb-2">
          Lo shop ruota su <strong>3 set di offerte</strong> e
          <strong>7 set di personaggi</strong>. Ogni giorno vedi
          <em>uno</em> dei 3 set di <strong>OGGETTI</strong> e <em>uno</em> dei
          7 set di <strong>PERSONAGGI</strong>. Dal giorno 8 al 14 i personaggi
          si ripetono (1→8, 2→9, …), il giorno 15 replica il giorno 1.
        </p>

        <div class="alert alert-secondary small">
          <div class="fw-semibold mb-1">
            Frammenti personaggi – regole valide per tutti:
          </div>
          <ul class="mb-0 ps-3">
            <li>
              <strong>Non sbloccato</strong>:
              {{ shardRules.locked?.fragments || 25 }} frammenti ·
              {{ shardRules.locked?.costSeals || 30 }} Sigilli · max
              {{ shardRules.locked?.maxBuysPerDay || 3 }}/giorno
            </li>
            <li>
              <strong>Sbloccato</strong>:
              {{ shardRules.unlocked?.fragments || 50 }} frammenti ·
              {{ shardRules.unlocked?.costSeals || 60 }} Sigilli · max
              {{ shardRules.unlocked?.maxBuysPerDay || 5 }}/giorno
            </li>
          </ul>
          <div class="mt-2">
            I costi non dipendono dal personaggio ma dal fatto che sia sbloccato
            o no.
          </div>
        </div>

        <div class="alert alert-warning small">
          <div class="fw-semibold">
            Gli <u>oggetti</u> cambiano con il <u>livello account</u>
          </div>
          Seleziona il tuo livello per vedere prezzi/stock corretti:
          <div class="mt-2 d-flex flex-wrap gap-2">
            <button
              class="btn btn-sm"
              :class="tier === 'high' ? 'btn-primary' : 'btn-outline-primary'"
              @click="tier = 'high'"
            >
              High Level
            </button>
            <button
              class="btn btn-sm"
              :class="tier === 'mid' ? 'btn-primary' : 'btn-outline-primary'"
              @click="tier = 'mid'"
            >
              Mid Level
            </button>
            <button
              class="btn btn-sm"
              :class="tier === 'low' ? 'btn-primary' : 'btn-outline-primary'"
              @click="tier = 'low'"
            >
              Low Level
            </button>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <a
            v-for="d in days"
            :key="d.dayIndex"
            class="btn btn-outline-secondary btn-sm"
            :href="`#day-${d.dayIndex}`"
          >
            Giorno {{ d.dayIndex }}
          </a>
        </div>
      </div>
    </div>

    <!-- Giorni 1..7 -->
    <div
      v-for="day in days"
      :key="day.dayIndex"
      :id="`day-${day.dayIndex}`"
      class="card shadow-sm"
    >
      <div class="card-body">
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2"
        >
          <h3 class="h6 mb-0">
            Giorno {{ day.dayIndex }} · Set oggetti:
            {{ day.setKey.toUpperCase() }}
          </h3>
          <span class="badge text-bg-light"
            >Ripete: giorno {{ day.dayIndex + 7 }}</span
          >
        </div>

        <!-- Oggetti -->
        <h4 class="h6 mt-2">Oggetti ({{ tier.toUpperCase() }} level)</h4>
        <div class="row g-2">
          <div
            v-for="off in offersFor(day)"
            :key="off.id"
            class="col-12 col-md-6"
          >
            <div
              class="border rounded p-2 h-100 d-flex justify-content-between align-items-start gap-3"
            >
              <div>
                <div class="fw-semibold">{{ off.label }}</div>
                <div v-if="off.stock !== undefined" class="small text-muted">
                  Stock: {{ off.stock }}
                </div>
              </div>
              <div class="text-end">
                <span v-if="off.costSeals > 0" class="badge text-bg-primary"
                  >{{ off.costSeals }} Sigilli</span
                >
                <span v-else class="badge text-bg-success">OMAGGIO</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Personaggi -->
        <h4 class="h6 mt-3">Personaggi del giorno</h4>
        <div v-if="!day.characters.length" class="text-muted">
          Nessun personaggio elencato.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm mb-0">
            <tbody>
              <tr v-for="(row, i) in chunk(day.characters, 3)" :key="i">
                <td v-for="name in row" :key="name">{{ name }}</td>
                <td v-if="row.length < 3" :colspan="3 - row.length"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-muted small mb-0 mt-2">
          I frammenti dei personaggi seguono le regole “Sbloccato / Non
          sbloccato” descritte sopra.
        </p>
      </div>
    </div>
  </section>
</template>
