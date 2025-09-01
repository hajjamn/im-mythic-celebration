<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";

const STORAGE_KEY = "im_shop_plan_v1";

/* ----------------------------- Stato UI ------------------------------------ */
const level = ref("high"); // "high" | "mid" | "low"
const budget = ref(0); // Sigilli disponibili
const autoSave = ref(true);
const hydrated = ref(false); // NEW: evita salvataggi prima del load

/* piano acquisti:
   plan.offers[day][offerId] = qty
   plan.chars [day][charName] = { locked: boolean, qty: number }
*/
const plan = reactive({ offers: {}, chars: {} });

/* ---------------------- Dati evento (da /data/shop.json) ------------------- */
const shop = reactive({
  characterShardRules: {},
  setsByDay: {},
  offersCatalog: { high: {}, mid: {}, low: {} },
  freeCatalog: { high: {}, mid: {}, low: {} },
  freeByTierAndDay: { high: {}, mid: {}, low: {} },
  charactersByDay: {},
});

/* ----------------------------- Storage helpers ----------------------------- */
function savePlan() {
  if (!hydrated.value) return; // NEW: non salvare finché non caricato
  const payload = {
    level: level.value,
    budget: budget.value,
    plan: JSON.parse(JSON.stringify(plan)),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.level && ["high", "mid", "low"].includes(parsed.level))
      level.value = parsed.level;
    if (Number.isFinite(+parsed.budget)) budget.value = +parsed.budget;
    if (parsed.plan) Object.assign(plan, parsed.plan);
  } catch {}
}

function resetPlan() {
  plan.offers = {};
  plan.chars = {};
}

function clearSavedPlan() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  resetPlan();
  budget.value = 0;
  savePlan();
}

/* ----------------------------- Helpers ------------------------------------- */
async function loadShop() {
  const data = await fetch("/data/shop.json").then((r) => r.json());
  Object.assign(shop, data);
}

function baseDay(d) {
  return ((d - 1) % 7) + 1;
}

function setForDay(day) {
  const b = baseDay(day);
  return shop.setsByDay?.[b] || "set1";
}

function charactersForDay(day) {
  return shop.charactersByDay?.[baseDay(day)] || [];
}

function offersForDay(day) {
  const setKey = setForDay(day);
  const list = shop.offersCatalog?.[level.value]?.[setKey] || [];
  // omaggio
  const freeKey = shop.freeByTierAndDay?.[level.value]?.[baseDay(day)];
  const freeObj = freeKey ? shop.freeCatalog?.[level.value]?.[freeKey] : null;
  return freeObj
    ? [
        ...list,
        {
          id: freeObj.id,
          label: freeObj.label,
          stock: 1,
          costSeals: 0,
          _free: true,
        },
      ]
    : list;
}

/* clamp e mutatori qty */
function clamp(val, min, max) {
  val = Number.isFinite(+val) ? +val : 0;
  if (min !== undefined) val = Math.max(min, val);
  if (max !== undefined) val = Math.min(max, val);
  return val;
}

function offerQty(day, id) {
  return plan.offers?.[day]?.[id] ?? 0;
}
function setOfferQty(day, id, qty, max) {
  if (!plan.offers[day]) plan.offers[day] = {};
  plan.offers[day][id] = clamp(qty, 0, max);
}
function incOffer(day, id, delta, max) {
  // NEW
  setOfferQty(day, id, offerQty(day, id) + delta, max);
}

function charRow(day, name) {
  if (!plan.chars[day]) plan.chars[day] = {};
  if (!plan.chars[day][name]) plan.chars[day][name] = { locked: true, qty: 0 };
  return plan.chars[day][name];
}
function charMax(row) {
  // NEW
  return row.locked
    ? rules.value.locked.maxBuysPerDay
    : rules.value.unlocked.maxBuysPerDay;
}
function incChar(day, name, delta) {
  // NEW
  const row = charRow(day, name);
  row.qty = clamp((row.qty || 0) + delta, 0, charMax(row));
}

/* regole personaggi */
const rules = computed(
  () =>
    shop.characterShardRules || {
      locked: { fragments: 25, costSeals: 30, maxBuysPerDay: 3 },
      unlocked: { fragments: 50, costSeals: 60, maxBuysPerDay: 5 },
    }
);

/* ----------------------------- Totali -------------------------------------- */
const spentOffers = computed(() => {
  let tot = 0;
  for (let d = 1; d <= 15; d++) {
    const list = offersForDay(d);
    const map = plan.offers[d] || {};
    for (const o of list) {
      const q = map[o.id] || 0;
      if (o.costSeals > 0) tot += q * o.costSeals;
    }
  }
  return tot;
});

const spentChars = computed(() => {
  let tot = 0;
  for (let d = 1; d <= 15; d++) {
    const dayMap = plan.chars[d] || {};
    for (const [, row] of Object.entries(dayMap)) {
      const rule = row.locked ? rules.value.locked : rules.value.unlocked;
      tot += (row.qty || 0) * rule.costSeals;
    }
  }
  return tot;
});

const spentTotal = computed(() => spentOffers.value + spentChars.value);
const remaining = computed(() => budget.value - spentTotal.value);

/* riepilogo */
const summaryLines = computed(() => {
  const lines = [];
  for (let d = 1; d <= 15; d++) {
    // oggetti
    const list = offersForDay(d);
    const map = plan.offers[d] || {};
    for (const o of list) {
      const q = map[o.id] || 0;
      if (q > 0)
        lines.push({
          day: d,
          label: o.label,
          qty: q,
          seals: (o.costSeals || 0) * q,
        });
    }
    // personaggi
    const dayChars = plan.chars[d] || {};
    for (const [name, row] of Object.entries(dayChars)) {
      if ((row.qty || 0) > 0) {
        const rule = row.locked ? rules.value.locked : rules.value.unlocked;
        lines.push({
          day: d,
          label: `${name} – ${row.locked ? "Non sbloccato" : "Sbloccato"}`,
          qty: row.qty,
          extra: `${row.qty * rule.fragments} frammenti`,
          seals: row.qty * rule.costSeals,
        });
      }
    }
  }
  return lines.sort((a, b) => a.day - b.day);
});

/* ------------------------ Import/Autosave budget --------------------------- */
function importFromStorage() {
  const v = localStorage.getItem("im_last_totalSeals");
  if (v) budget.value = +v || 0;
}

onMounted(async () => {
  await loadShop();
  loadPlan();
  hydrated.value = true; // NEW: da qui in poi i watcher possono salvare

  // (FACOLTATIVO) Import da URL solo se non c'è budget salvato
  if (!budget.value) {
    const sp = new URLSearchParams(location.search);
    const fromURL = sp.get("seals");
    if (fromURL) budget.value = +fromURL || 0;
  }

  // ultimo livello scelto (non tocca il piano)
  const savedLvl = localStorage.getItem("im_shop_level");
  if (savedLvl && ["high", "mid", "low"].includes(savedLvl))
    level.value = savedLvl;
});

// NIENTE immediate: salviamo solo dopo il load
watch([level, budget], () => {
  localStorage.setItem("im_shop_level", level.value);
  savePlan();
});
watch(budget, (v) => {
  if (autoSave.value) localStorage.setItem("im_planned_budget", String(v));
});
watch(
  plan,
  () => {
    savePlan();
  },
  { deep: true }
);

// facoltativo: ricaricare un budget “temporaneo” se non c'è piano salvato
onMounted(() => {
  if (!budget.value) {
    const cached = localStorage.getItem("im_planned_budget");
    if (cached) budget.value = +cached || 0;
  }
});
</script>

<template>
  <section class="d-grid gap-3">
    <div id="top"></div>

    <!-- STICKY SUMMARY (NEW) -->
    <div class="sticky-top" style="top: 0.5rem; z-index: 1020">
      <div class="card shadow-sm">
        <div class="card-body py-2 d-flex align-items-center gap-3">
          <div>
            <div class="small text-muted">Spesa pianificata</div>
            <div class="fw-semibold">
              {{ spentTotal.toLocaleString("it-IT") }} 💠
            </div>
          </div>
          <div class="ms-3">
            <div class="small text-muted">Rimanenti</div>
            <div
              :class="[
                'fw-semibold',
                remaining >= 0 ? 'text-success' : 'text-danger',
              ]"
            >
              {{ remaining.toLocaleString("it-IT") }}
            </div>
          </div>
          <div class="ms-auto d-flex gap-2">
            <a href="#top" class="btn btn-light btn-sm">↑ Inizio</a>
            <a href="#summary" class="btn btn-light btn-sm">↓ Riepilogo</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Spiegazione & controlli -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="h5 mb-2">Calcolatore spesa – Negozio Mitico</h2>
        <p class="mb-2">
          Inserisci i <strong>Sigilli Mitici</strong> stimati per l’evento,
          seleziona il tuo <strong>livello shop</strong> (gli <em>oggetti</em> e
          i prezzi cambiano in base al livello), quindi pianifica cosa comprare
          in ciascun giorno (1–15). Il totale viene detratto dai Sigilli
          disponibili; può andare anche in negativo.
        </p>
        <div class="alert alert-secondary small">
          <div class="fw-semibold">Nota importante</div>
          Questo strumento <u>non considera</u> quando otterrai i Sigilli
          durante i 15 giorni: es. il lunedì 1 potresti non avere già 2.000
          Sigilli. Usa il piano come promemoria.
        </div>

        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-4">
            <label class="form-label">Sigilli disponibili (stima)</label>
            <input
              type="number"
              class="form-control"
              min="0"
              v-model.number="budget"
            />
            <div class="form-text d-flex align-items-center gap-2">
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="importFromStorage()"
              >
                Importa dal calcolatore
              </button>
              <div class="form-check form-switch">
                <input
                  class="form-check-input"
                  id="autosave"
                  type="checkbox"
                  v-model="autoSave"
                />
                <label class="form-check-label" for="autosave"
                  >Salva automaticamente</label
                >
              </div>
            </div>

            <hr class="my-3" />
            <div class="d-flex flex-wrap gap-2">
              <button
                class="btn btn-outline-danger btn-sm"
                @click="resetPlan()"
              >
                Reset piano
              </button>
              <button
                class="btn btn-outline-secondary btn-sm"
                @click="clearSavedPlan()"
              >
                Cancella salvataggio
              </button>
            </div>
          </div>

          <div class="col-12 col-md-auto">
            <label class="form-label">Livello shop</label>
            <div class="btn-group d-flex">
              <button
                class="btn"
                :class="
                  level === 'high' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="level = 'high'"
              >
                High
              </button>
              <button
                class="btn"
                :class="level === 'mid' ? 'btn-primary' : 'btn-outline-primary'"
                @click="level = 'mid'"
              >
                Mid
              </button>
              <button
                class="btn"
                :class="level === 'low' ? 'btn-primary' : 'btn-outline-primary'"
                @click="level = 'low'"
              >
                Low
              </button>
            </div>
            <div class="form-text">
              Cambia gli <em>oggetti</em> e i loro prezzi/stock.
            </div>
          </div>

          <div class="col-12 col-md">
            <div
              class="border rounded p-2 h-100 d-flex justify-content-between align-items-center"
            >
              <div>
                <div class="small text-muted">Spesa pianificata</div>
                <div class="fw-bold">
                  {{ spentTotal.toLocaleString("it-IT") }} Sigilli
                </div>
              </div>
              <div class="text-end">
                <div class="small text-muted">Sigilli rimanenti</div>
                <div
                  :class="[
                    'fw-bold',
                    remaining >= 0 ? 'text-success' : 'text-danger',
                  ]"
                >
                  {{ remaining.toLocaleString("it-IT") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr class="my-3" />
        <div class="d-flex flex-wrap gap-2">
          <a
            v-for="d in 15"
            :key="d"
            class="btn btn-outline-secondary btn-sm"
            :href="`#day-${d}`"
            >Giorno {{ d }}</a
          >
        </div>
      </div>
    </div>

    <!-- Giorni 1..15 -->
    <div v-for="day in 15" :key="day" :id="`day-${day}`" class="card shadow-sm">
      <div class="card-body">
        <div
          class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2"
        >
          <h3 class="h6 mb-0">
            Giorno {{ day }} · Set {{ setForDay(day).toUpperCase() }}
            <small class="text-muted" v-if="day > 7"
              >· personaggi come giorno {{ baseDay(day) }}</small
            >
          </h3>
          <span class="badge text-bg-light"
            >Rotazione personaggi: {{ baseDay(day) }} →
            {{ baseDay(day) + 7 <= 14 ? baseDay(day) + 7 : 7 }}</span
          >
        </div>

        <!-- OGGETTI -->
        <h4 class="h6">Oggetti ({{ level.toUpperCase() }})</h4>
        <div class="row g-2">
          <div
            v-for="off in offersForDay(day)"
            :key="off.id"
            class="col-12 col-md-6"
          >
            <div class="border rounded p-2 h-100">
              <div
                class="d-flex justify-content-between align-items-start gap-3"
              >
                <div>
                  <div class="fw-semibold">{{ off.label }}</div>
                  <div class="small text-muted" v-if="off.stock !== undefined">
                    Stock giorno: {{ off.stock }}
                  </div>
                </div>
                <div class="text-end">
                  <span v-if="off.costSeals > 0" class="badge text-bg-primary"
                    >{{ off.costSeals }} Sigilli</span
                  >
                  <span v-else class="badge text-bg-success">OMAGGIO</span>
                </div>
              </div>

              <div
                v-if="!off._free"
                class="mt-2 d-flex align-items-center gap-2 flex-wrap"
              >
                <div class="form-check me-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`ck-${day}-${off.id}`"
                    :checked="offerQty(day, off.id) > 0"
                    @change="
                      setOfferQty(
                        day,
                        off.id,
                        $event.target.checked ? 1 : 0,
                        off.stock
                      )
                    "
                  />
                  <label class="form-check-label" :for="`ck-${day}-${off.id}`"
                    >Pianifica</label
                  >
                </div>

                <!-- pulsanti ± (NEW) -->
                <div
                  class="input-group input-group-sm"
                  style="max-width: 10rem"
                >
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="incOffer(day, off.id, -1, off.stock)"
                    :disabled="offerQty(day, off.id) <= 0"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    class="form-control text-center"
                    :min="0"
                    :max="off.stock"
                    :disabled="offerQty(day, off.id) === 0"
                    :value="offerQty(day, off.id)"
                    @input="
                      setOfferQty(day, off.id, $event.target.value, off.stock)
                    "
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="incOffer(day, off.id, +1, off.stock)"
                    :disabled="offerQty(day, off.id) >= off.stock"
                  >
                    +
                  </button>
                </div>
              </div>

              <div v-else class="mt-2 small text-muted">
                Gli omaggi non incidono sulla spesa.
              </div>
            </div>
          </div>
        </div>

        <!-- PERSONAGGI -->
        <h4 class="h6 mt-3">Personaggi del giorno</h4>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Personaggio</th>
                <th class="text-center">Stato</th>
                <th class="text-end">Volte</th>
                <th class="text-end">Frammenti</th>
                <th class="text-end">Costo unitario</th>
                <!-- NEW -->
                <th class="text-end">Totale</th>
                <!-- rinominato -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="name in charactersForDay(day)" :key="name">
                <td>{{ name }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      type="button"
                      class="btn"
                      :class="
                        charRow(day, name).locked
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      "
                      @click="charRow(day, name).locked = true"
                    >
                      Non sbl.
                    </button>
                    <button
                      type="button"
                      class="btn"
                      :class="
                        !charRow(day, name).locked
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      "
                      @click="charRow(day, name).locked = false"
                    >
                      Sbl.
                    </button>
                  </div>
                </td>
                <td class="text-end">
                  <div
                    class="input-group input-group-sm justify-content-end"
                    style="max-width: 10rem; margin-left: auto"
                  >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="incChar(day, name, -1)"
                      :disabled="charRow(day, name).qty <= 0"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      class="form-control text-center"
                      :min="0"
                      :max="
                        charRow(day, name).locked
                          ? rules.locked.maxBuysPerDay
                          : rules.unlocked.maxBuysPerDay
                      "
                      v-model.number="charRow(day, name).qty"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="incChar(day, name, +1)"
                      :disabled="
                        charRow(day, name).qty >=
                        (charRow(day, name).locked
                          ? rules.locked.maxBuysPerDay
                          : rules.unlocked.maxBuysPerDay)
                      "
                    >
                      +
                    </button>
                  </div>
                </td>
                <td class="text-end small">
                  {{
                    (charRow(day, name).qty || 0) *
                    (charRow(day, name).locked
                      ? rules.locked.fragments
                      : rules.unlocked.fragments)
                  }}
                </td>
                <td class="text-end">
                  <!-- Costo unitario -->
                  <span class="badge text-bg-light">
                    {{
                      charRow(day, name).locked
                        ? rules.locked.costSeals
                        : rules.unlocked.costSeals
                    }}
                    💠
                  </span>
                </td>
                <td class="text-end">
                  <!-- Totale -->
                  <span class="badge text-bg-primary">
                    {{
                      (charRow(day, name).qty || 0) *
                      (charRow(day, name).locked
                        ? rules.locked.costSeals
                        : rules.unlocked.costSeals)
                    }}
                    💠
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- RIEPILOGO -->
    <div id="summary" class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6 mb-2">Riepilogo acquisti pianificati</h3>
        <div v-if="!summaryLines.length" class="text-muted">
          Nessun acquisto pianificato.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th style="width: 5rem">Giorno</th>
                <th>Voce</th>
                <th class="text-end">Volte</th>
                <th class="text-end">Extra</th>
                <th class="text-end">Sigilli</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in summaryLines" :key="i">
                <td>{{ row.day }}</td>
                <td>{{ row.label }}</td>
                <td class="text-end">{{ row.qty }}</td>
                <td class="text-end">{{ row.extra || "" }}</td>
                <td class="text-end">
                  {{ row.seals.toLocaleString("it-IT") }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th colspan="4" class="text-end">Totale spesa</th>
                <th class="text-end">
                  {{ spentTotal.toLocaleString("it-IT") }}
                </th>
              </tr>
              <tr>
                <th colspan="4" class="text-end">Rimanenti</th>
                <th
                  class="text-end"
                  :class="remaining >= 0 ? 'text-success' : 'text-danger'"
                >
                  {{ remaining.toLocaleString("it-IT") }}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
