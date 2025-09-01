<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const shop = reactive({ rotation: [], offers: {}, characters: {} });
const selection = reactive({
  charId: null,
  unlocked: true, // true = sbloccato, false = non sbloccato
  copies: 1, // quante volte comprare quella offerta (es. 1 o 2 lunedì)
});

// carica JSON
onMounted(async () => {
  const res = await fetch("/data/shop.json");
  const data = await res.json();
  Object.assign(shop, data);
  // default selection al primo personaggio
  const firstCharId = Object.keys(shop.characters)[0] || null;
  selection.charId = firstCharId;
});

// individua l'ID offerta giusta in base a charId + unlocked
const currentOfferId = computed(() => {
  if (!selection.charId) return null;
  const prefix = selection.charId;
  const key = selection.unlocked ? `${prefix}_unlocked` : `${prefix}_locked`;
  return shop.offers[key] ? key : null;
});

const currentOffer = computed(() =>
  currentOfferId.value ? shop.offers[currentOfferId.value] : null
);

// giorni (1..7) in cui compare l'offerta, e ripetizione settimana 2 (8..14)
const daysAvailable = computed(() => {
  if (!currentOfferId.value) return [];
  const d = shop.rotation
    .filter((day) => day.offers.includes(currentOfferId.value))
    .map((day) => day.dayIndex);
  // mappa anche settimana 2 (day+7)
  const bothWeeks = [...d, ...d.map((x) => x + 7)];
  return bothWeeks.sort((a, b) => a - b);
});

const totalCost = computed(() => {
  if (!currentOffer.value) return 0;
  const cost = currentOffer.value.costSeals || 0;
  return Math.max(1, selection.copies) * cost;
});
</script>

<template>
  <section class="row g-3">
    <!-- Colonna selezione -->
    <div class="col-12 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="h6 mb-3">Calcolatore Spese Negozio</h2>

          <div class="mb-3">
            <label class="form-label">Personaggio</label>
            <select v-model="selection.charId" class="form-select">
              <option v-for="(c, id) in shop.characters" :key="id" :value="id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label d-block">Stato sblocco</label>
            <div class="btn-group w-100">
              <button
                type="button"
                class="btn"
                :class="
                  selection.unlocked ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="selection.unlocked = true"
              >
                Sbloccato
              </button>
              <button
                type="button"
                class="btn"
                :class="
                  !selection.unlocked ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="selection.unlocked = false"
              >
                Non sbloccato
              </button>
            </div>
            <div class="form-text">L’offerta cambia a seconda dello stato.</div>
          </div>

          <div class="mb-3">
            <label class="form-label"
              >Quante volte acquisti questa offerta?</label
            >
            <input
              v-model.number="selection.copies"
              type="number"
              min="1"
              class="form-control"
            />
            <div class="form-text">
              Esempio: se è disponibile nei 2 lunedì, metti 2.
            </div>
          </div>

          <div class="alert alert-info" v-if="currentOffer">
            <div class="fw-bold">{{ currentOffer.label }}</div>
            <div>
              Prezzo: <strong>{{ currentOffer.costSeals }}</strong> sigilli
            </div>
            <div>
              Ricompensa: {{ currentOffer.qty }} {{ currentOffer.unit }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Colonna pianificazione -->
    <div class="col-12 col-lg-7">
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h3 class="h6 mb-2">Totale stimato</h3>
          <div class="display-6">{{ totalCost }}</div>
          <div class="text-muted">Sigilli necessari</div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="h6">Giorni consigliati di acquisto</h4>
          <p v-if="!currentOfferId" class="text-muted mb-2">
            Seleziona un personaggio.
          </p>
          <template v-else>
            <p class="mb-2">Questa offerta compare nei giorni:</p>
            <div class="d-flex gap-2 flex-wrap">
              <span
                v-for="d in daysAvailable"
                :key="d"
                class="badge text-bg-secondary"
              >
                Giorno {{ d }}
              </span>
            </div>
            <p class="text-muted small mb-0 mt-2">
              Nota: la rotazione è settimanale (giorni 1-7) e si ripete nei
              giorni 8-14.
            </p>
          </template>
        </div>
      </div>
    </div>

    <!-- Tabella rotazione 7 giorni -->
    <div class="col-12">
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="h6">Rotazione (settimana tipo)</h5>
          <div class="table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Giorno</th>
                  <th>Offerte</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in shop.rotation" :key="day.dayIndex">
                  <td class="fw-semibold">{{ day.label }}</td>
                  <td>
                    <span
                      v-for="oid in day.offers"
                      :key="oid"
                      class="badge text-bg-light border me-1"
                    >
                      {{ shop.offers[oid]?.label || oid }}
                    </span>
                    <span v-if="!day.offers.length" class="text-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-muted small mb-0">
            Nella seconda settimana si ripete la stessa sequenza.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
