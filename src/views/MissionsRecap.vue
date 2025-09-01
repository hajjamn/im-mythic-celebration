<script setup>
import { RouterLink } from "vue-router";
import { reactive, onMounted, computed } from "vue";

const base = import.meta.env.BASE_URL;

// numeri dinamici dai JSON (fallback se mancano file)
const missions = reactive({
  dailyPointsTotal: 749,
  freePointsTotal: 1760,
  premium: { pointsTotal: 1100, directSeals: 300 },
});
const eventProgress = reactive([]);

onMounted(async () => {
  try {
    const [m, p] = await Promise.all([
      fetch(base + "data/event_missions.json").then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(base + "data/event_progress_rewards.json").then((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    if (m) Object.assign(missions, m);
    eventProgress.splice(0, eventProgress.length, ...(p || []));
  } catch {
    /* fallback ai valori di default */
  }
});

function sealsFromEventAt(points) {
  return eventProgress
    .filter((t) => t.eventPoints <= points && (t.seals || 0) > 0)
    .reduce((acc, t) => acc + (t.seals || 0), 0);
}

const pointsFree = computed(
  () => (missions.dailyPointsTotal || 0) + (missions.freePointsTotal || 0)
);
const pointsWithPremium = computed(
  () => pointsFree.value + (missions.premium.pointsTotal || 0)
);
const sealsFromEventFree = computed(() => sealsFromEventAt(pointsFree.value));
const sealsFromEventPremium = computed(() =>
  sealsFromEventAt(pointsWithPremium.value)
);
const sealsDirectPremium = computed(() => missions.premium?.directSeals || 0);
</script>

<template>
  <main class="container my-3">
    <!-- Spiegazione -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h2 class="h6">Come funzionano le missioni</h2>
        <p class="mb-2">
          I <strong>Punti Evento</strong> si ottengono completando
          <strong>Missioni giornaliere</strong>, le missioni dell’evento
          <strong>Sacrificio di Grandezza!</strong> (una sola volta), e – se
          attivi il pass – le missioni premium
          <strong>Ascensione del Divino!</strong>. Le soglie della
          <em>progress bar</em> evento convertono questi punti in
          <strong>Sigilli Mitici</strong>.
        </p>
        <div class="row g-2 small text-center">
          <div class="col-12 col-md-6">
            <div class="p-2 bg-body-tertiary rounded">
              Senza Premium:
              <strong>{{ pointsFree.toLocaleString("it-IT") }}</strong>
              Punti Evento (<span class="text-muted">{{
                (missions.dailyPointsTotal || 0).toLocaleString("it-IT")
              }}</span>
              +
              <span class="text-muted">{{
                (missions.freePointsTotal || 0).toLocaleString("it-IT")
              }}</span
              >)
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="p-2 bg-body-tertiary rounded">
              Con Premium:
              <strong>{{ pointsWithPremium.toLocaleString("it-IT") }}</strong>
              Punti Evento (+<span class="text-muted">{{
                (missions.premium.pointsTotal || 0).toLocaleString("it-IT")
              }}</span
              >)
            </div>
          </div>
        </div>
        <p class="text-muted small mb-0 mt-2">
          Nota: la Tournament Arena potrebbe essere attivata più avanti;
          aggiorneremo questa pagina in caso di variazioni delle daily
          correlate.
        </p>
      </div>
    </section>

    <!-- Missioni giornaliere -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6 mb-2">
          Missioni giornaliere (14 giorni) –
          <span class="text-muted"
            >totale
            {{ (missions.dailyPointsTotal || 0).toLocaleString("it-IT") }}
            punti</span
          >
        </h3>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th style="width: 3rem">Giorno</th>
                <th>Obiettivo</th>
                <th class="text-end">Punti</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Infliggi 8.000 danni ai nemici in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Attacca 200 volte nelle missioni Campagna</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Gioca 4 battaglie di Tournament Arena</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Sconfiggi 15 nemici da posizione elevata</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Esegui 20 <em>overkill</em> in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Usa 20 abilità con i personaggi</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Evoca 25 unità in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>8</td>
                <td>Ottieni 20 colpi critici in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>9</td>
                <td>
                  Infliggi 5.200 danni in Incursione, Guerra di Gilda o Campagna
                </td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>10</td>
                <td>Blocca 20 colpi in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>11</td>
                <td>Cura 5.000 salute in battaglia</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>12</td>
                <td>Uccidi 40 nemici con tratto <em>Affaticamento</em></td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>13</td>
                <td>Sconfiggi 25 nemici con attacchi corpo a corpo</td>
                <td class="text-end">53</td>
              </tr>
              <tr>
                <td>14</td>
                <td>
                  Infliggi 5.000 danni in Eventi Leggendari &amp; usa 20 abilità
                  con i personaggi
                </td>
                <td class="text-end">60</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted small mb-0">
          Completarle tutte fornisce
          <strong>{{
            (missions.dailyPointsTotal || 0).toLocaleString("it-IT")
          }}</strong>
          Punti Evento.
        </p>
      </div>
    </section>

    <!-- Sacrificio di Grandezza! -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6 mb-2">
          Missioni dell’evento – <em>Sacrificio di Grandezza!</em>
          <span class="text-muted"
            >· totale
            {{ (missions.freePointsTotal || 0).toLocaleString("it-IT") }}
            punti</span
          >
        </h3>
        <p class="mb-2">
          Serie progressiva: “<em>Infliggi X danni usando le abilità</em>” (una
          sola volta per evento).
        </p>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th style="width: 4rem">#</th>
                <th>Obiettivo</th>
                <th class="text-end">Punti</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Infliggi 7.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Infliggi 10.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Infliggi 12.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Infliggi 15.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Infliggi 17.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Infliggi 22.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Infliggi 25.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>8</td>
                <td>Infliggi 27.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>9</td>
                <td>Infliggi 30.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>10</td>
                <td>Infliggi 32.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>11</td>
                <td>Infliggi 35.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>12</td>
                <td>Infliggi 37.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>13</td>
                <td>Infliggi 50.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>14</td>
                <td>Infliggi 62.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>15</td>
                <td>Infliggi 75.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>16</td>
                <td>Infliggi 87.500 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>17</td>
                <td>Infliggi 100.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>18</td>
                <td>Infliggi 125.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>19</td>
                <td>Infliggi 250.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
              <tr>
                <td>20</td>
                <td>Infliggi 300.000 danni usando abilità</td>
                <td class="text-end">88</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-muted small mb-0">
          Completandole tutte ottieni
          <strong>{{
            (missions.freePointsTotal || 0).toLocaleString("it-IT")
          }}</strong>
          Punti Evento.
        </p>
      </div>
    </section>

    <!-- Ascensione del Divino! (Premium) -->
    <section class="card shadow-sm mb-4">
      <div class="card-body">
        <h3 class="h6 mb-2">
          Missioni Premium – <em>Ascensione del Divino!</em>
          <span class="text-muted"
            >·
            {{ (missions.premium.pointsTotal || 0).toLocaleString("it-IT") }}
            punti +
            {{ (missions.premium.directSeals || 0).toLocaleString("it-IT") }}
            Sigilli</span
          >
        </h3>
        <p class="mb-2">
          Serie di uccisioni cumulative. Ogni step assegna
          <strong>110 Punti Evento</strong> e
          <strong>30 Sigilli Mitici</strong>.
        </p>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th style="width: 4rem">#</th>
                <th>Obiettivo</th>
                <th class="text-end">Punti</th>
                <th class="text-end">Sigilli</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Sconfiggi 24 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Sconfiggi 32 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Sconfiggi 40 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Sconfiggi 48 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Sconfiggi 64 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Sconfiggi 80 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Sconfiggi 120 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>8</td>
                <td>Sconfiggi 160 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>9</td>
                <td>Sconfiggi 240 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
              <tr>
                <td>10</td>
                <td>Sconfiggi 320 nemici</td>
                <td class="text-end">110</td>
                <td class="text-end">30</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="small text-muted mb-0">
          <li>
            Totale punti premium:
            <strong>{{
              (missions.premium.pointsTotal || 0).toLocaleString("it-IT")
            }}</strong
            >.
          </li>
          <li>
            Totale Sigilli premium:
            <strong>{{
              (missions.premium.directSeals || 0).toLocaleString("it-IT")
            }}</strong>
            (utili subito, non via progress bar).
          </li>
        </ul>
      </div>
    </section>

    <section class="card shadow-sm mb-5">
      <div class="card-body">
        <p class="text-muted small mb-0">
          Suggerimento: completa prima le giornaliere ogni giorno e avanza sulle
          serie cumulative quando hai tempo. I Punti Evento si sommano e
          sbloccano Sigilli alle soglie della progress bar.
        </p>
      </div>
    </section>
  </main>
</template>
