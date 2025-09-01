<script setup>
import { onMounted, reactive, ref, computed, watch } from "vue";
import { loadJSON, encodeState, decodeState } from "../utils/data.js";

// stato UI
const tiers = ref([]);
const form = reactive({
  tier: null,
  includeTokens: true,
  includeDailyFree: true,
  hasPremium: false,
  crates: 0,
});

// dati
const data = reactive({
  tokenActivities: { rushPointsTotal: 0 },
  missions: {
    dailyPointsTotal: 0,
    freePointsTotal: 0,
    premium: { pointsTotal: 0, directSeals: 0 },
  },
  eventProgress: [],
  rushRewards: [],
  tournament: { crateSeals: 10, maxCrates: 12 },
});

// helpers
function thresholdsReached(list, total, pointsKey, sealsKey) {
  const rows = [];
  let seals = 0;
  for (const t of list) {
    const need = t[pointsKey];
    if (need <= total) {
      const s = t[sealsKey] || 0;
      if (s > 0) {
        seals += s;
        rows.push([need, s]);
      }
    }
  }
  return { seals, rows };
}

// computeds
const rushPoints = computed(() => {
  const tier = tiers.value.find((t) => t.id === form.tier);
  const base = tier?.rushPoints14d ?? 0;
  const tokens = form.includeTokens
    ? data.tokenActivities.rushPointsTotal || 0
    : 0;
  return base + tokens;
});

const eventPoints = computed(() => {
  let pts = 0;
  if (form.includeDailyFree) {
    pts += data.missions.dailyPointsTotal || 0;
    pts += data.missions.freePointsTotal || 0;
  }
  if (form.hasPremium) pts += data.missions.premium.pointsTotal || 0;
  return pts;
});

const rushSoglie = computed(() =>
  thresholdsReached(data.rushRewards, rushPoints.value, "rushPoints", "seals")
);

const eventSoglie = computed(() =>
  thresholdsReached(
    data.eventProgress,
    eventPoints.value,
    "eventPoints",
    "seals"
  )
);

const sealsPremium = computed(() =>
  form.hasPremium ? data.missions.premium.directSeals || 0 : 0
);
const sealsCrates = computed(() => {
  const n = Math.max(
    0,
    Math.min(+form.crates || 0, data.tournament.maxCrates || 0)
  );
  return n * (data.tournament.crateSeals || 0);
});

const totalSeals = computed(
  () =>
    rushSoglie.value.seals +
    eventSoglie.value.seals +
    sealsPremium.value +
    sealsCrates.value
);

// share link
const shareUrl = computed(() => {
  const s = encodeState(form);
  return `${location.origin}${location.pathname}?s=${s}`;
});

// init
onMounted(async () => {
  // carica dati dal public/
  const [tiersArr, tokens, missions, progress, rush, tour] = await Promise.all([
    loadJSON("/data/energy_tiers.json"),
    loadJSON("/data/token_activities.json"),
    loadJSON("/data/event_missions.json"),
    loadJSON("/data/event_progress_rewards.json"),
    loadJSON("/data/training_rush_rewards.json"),
    loadJSON("/data/tournament.json"),
  ]);
  tiers.value = tiersArr;
  data.tokenActivities = tokens;
  data.missions = missions;
  data.eventProgress = progress;
  data.rushRewards = rush;
  data.tournament = tour;

  // stato da URL o default
  const sp = new URLSearchParams(location.search);
  const decoded = sp.get("s") ? decodeState(sp.get("s"), null) : null;
  if (decoded) Object.assign(form, decoded);

  // default tier
  if (!form.tier && tiers.value.length) form.tier = tiers.value[0].id;
});
</script>

<template>
  <section class="row g-3">
    <!-- Colonna controlli -->
    <div class="col-12 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2 class="h5 mb-3">Calcolatore Sigilli Mitici</h2>

          <div class="mb-3">
            <label class="form-label">Energia giornaliera (tier)</label>
            <select v-model="form.tier" class="form-select">
              <option v-for="t in tiers" :key="t.id" :value="t.id">
                {{ t.label }}
              </option>
            </select>
            <div class="form-text">
              Stima dei <strong>Punti Addestramento</strong> in 14 giorni.
            </div>
          </div>

          <div class="form-check form-switch mb-2">
            <input
              id="tokenActivities"
              class="form-check-input"
              type="checkbox"
              v-model="form.includeTokens"
            />
            <label class="form-check-label" for="tokenActivities">
              Attività a token (Arena / Impetus / Materiali / Torneo / GdG)
            </label>
          </div>

          <hr />

          <div class="form-check form-switch mb-2">
            <input
              id="dailies"
              class="form-check-input"
              type="checkbox"
              v-model="form.includeDailyFree"
            />
            <label class="form-check-label" for="dailies"
              >Completo Daily + Missioni evento (free)</label
            >
          </div>

          <div class="form-check form-switch mb-2">
            <input
              id="premium"
              class="form-check-input"
              type="checkbox"
              v-model="form.hasPremium"
            />
            <label class="form-check-label" for="premium">Ho il Premium</label>
            <div class="form-text">
              Premium: +1100 Punti Evento e +300 Sigilli diretti.
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Tournament crates aperte</label>
            <input
              class="form-control"
              type="number"
              min="0"
              :max="data.tournament.maxCrates"
              v-model.number="form.crates"
            />
            <div class="form-text">
              Al momento non attiva: lascia 0 (aggiorneremo).
            </div>
          </div>

          <div class="d-grid gap-2">
            <a class="btn btn-primary" :href="shareUrl"
              >Condividi configurazione</a
            >
            <button
              class="btn btn-outline-secondary btn-sm"
              @click="
                Object.assign(form, {
                  tier: tiers[0]?.id,
                  includeTokens: true,
                  includeDailyFree: true,
                  hasPremium: false,
                  crates: 0,
                })
              "
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Colonna risultati -->
    <div class="col-12 col-lg-8">
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h3 class="h6 mb-2">Totale stimato</h3>
          <div class="row text-center">
            <div class="col">
              <div class="fw-bold fs-4">
                {{ totalSeals.toLocaleString("it-IT") }}
              </div>
              <div class="text-muted small">Sigilli Mitici totali</div>
            </div>
            <div class="col">
              <div class="fw-bold fs-4">
                {{ rushPoints.toLocaleString("it-IT") }}
              </div>
              <div class="text-muted small">Punti Addestramento</div>
            </div>
            <div class="col">
              <div class="fw-bold fs-4">
                {{ eventPoints.toLocaleString("it-IT") }}
              </div>
              <div class="text-muted small">Punti Evento</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h4 class="h6">Breakdown</h4>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between">
              <span>Da Addestramento Frenetico</span>
              <strong>{{ rushSoglie.seals.toLocaleString("it-IT") }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Dalla progress bar Evento</span>
              <strong>{{ eventSoglie.seals.toLocaleString("it-IT") }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Diretti (Premium)</span>
              <strong>{{ sealsPremium.toLocaleString("it-IT") }}</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
              <span>Diretti (Crates Torneo)</span>
              <strong>{{ sealsCrates.toLocaleString("it-IT") }}</strong>
            </li>
          </ul>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="h6">Soglie raggiunte – Addestramento</h5>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Punti</th>
                      <th>Sigilli</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!rushSoglie.rows.length">
                      <td colspan="2" class="text-muted">Nessuna soglia.</td>
                    </tr>
                    <tr v-for="([need, seals], i) in rushSoglie.rows" :key="i">
                      <td>{{ need.toLocaleString("it-IT") }}</td>
                      <td>{{ seals.toLocaleString("it-IT") }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-muted small mb-0 mt-2">
                <em>Nota:</em> soglie Addestramento da confermare (placeholder).
              </p>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="h6">Soglie raggiunte – Evento</h5>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Punti Evento</th>
                      <th>Sigilli</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!eventSoglie.rows.length">
                      <td colspan="2" class="text-muted">Nessuna soglia.</td>
                    </tr>
                    <tr v-for="([need, seals], i) in eventSoglie.rows" :key="i">
                      <td>{{ need.toLocaleString("it-IT") }}</td>
                      <td>{{ seals.toLocaleString("it-IT") }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="text-muted small mb-0 mt-2">
                Soglie derivate dalla progress bar evento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
