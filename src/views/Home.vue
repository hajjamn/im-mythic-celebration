<script setup>
import { RouterLink } from "vue-router";

// BASE URL per servire asset da /public anche su Netlify/sottocartelle
const base = import.meta.env.BASE_URL;
const dataVersion = "1.0.0";
</script>

<template>
  <main class="container my-4">
    <!-- INTRO / WELCOME -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h2 class="h5">Benvenuto, fratello della gilda!</h2>
        <p class="mb-3">
          Questo sito ti aiuta a
          <strong>stimare quanti Sigilli Mitici</strong> puoi ottenere durante
          la <em>Ce<strong>le</strong>brazione Mitica</em> e a
          <strong>pianificare cosa comprare nello shop</strong> con rotazione
          settimanale.
        </p>
        <ul class="mb-0">
          <li>
            <strong>Punti Addestramento</strong> (da energia/attività) →
            sblocchi ricompense del Training Rush (tra cui Sigilli).
          </li>
          <li>
            <strong>Punti Evento</strong> (daily + missioni free/premium) →
            avanzano una barra che assegna Sigilli a soglia.
          </li>
          <li>
            <strong>Fonti extra</strong>: Premium e casse del Torneo danno
            Sigilli diretti.
          </li>
        </ul>
      </div>
    </section>

    <!-- COME FUNZIONA L'EVENTO -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6 mb-3">Come funziona l’evento</h3>

        <div class="mb-4">
          <h4 class="h6 mb-2">
            1) Addestramento Frenetico → Sigilli (indiretti)
          </h4>
          <p class="mb-2">
            I <strong>Punti Addestramento</strong> dipendono da quanta
            <em>energia</em> usi al giorno (tier). Raggiungendo specifiche
            soglie del Rush ottieni pacchetti di
            <strong>Sigilli Mitici</strong> (oltre ad altri premi).
          </p>
          <figure class="mb-0">
            <img
              class="img-fluid rounded shadow-sm"
              :src="base + 'img/index/01-addestramento-frenetico.jpeg'"
              alt="Soglie e ricompense dell'Addestramento Frenetico"
              @error="$event.target.style.display = 'none'"
            />
            <figcaption class="text-muted small mt-2">
              Soglie dell'Addestramento Frenetico e ricompense (esempio).
            </figcaption>
          </figure>
        </div>

        <div class="mb-4">
          <h4 class="h6 mb-2">2) Punti Evento → Sigilli (diretti)</h4>
          <p class="mb-2">
            Completa <strong>Daily</strong> (ogni giorno),
            <strong>Missioni Evento (free)</strong> e, se attivo,
            <strong>Premium</strong>. Ogni traguardo di
            <strong>Punti Evento</strong> nella progress bar assegna
            <strong>Sigilli Mitici</strong>.
          </p>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <figure class="mb-0">
                <img
                  class="img-fluid rounded shadow-sm"
                  :src="base + 'img/index/02-missioni-giornaliere.jpeg'"
                  alt="Missioni evento giornaliere (es. Impetus Brutale)"
                  @error="$event.target.style.display = 'none'"
                />
                <figcaption class="text-muted small mt-2">
                  Missioni evento giornaliere (es. Impetus Brutale).
                </figcaption>
              </figure>
            </div>
            <div class="col-12 col-md-6">
              <figure class="mb-0">
                <img
                  class="img-fluid rounded shadow-sm"
                  :src="base + 'img/index/03-missioni-evento-e-premium.jpeg'"
                  alt="Missioni dell'evento: Sacrificio di Grandezza!"
                  @error="$event.target.style.display = 'none'"
                />
                <figcaption class="text-muted small mt-2">
                  Missioni non giornaliere:
                  <em>Sacrificio di Grandezza!</em> (una sola volta).
                </figcaption>
              </figure>
            </div>
            <div class="col-12 col-md-6">
              <figure class="mb-0">
                <img
                  class="img-fluid rounded shadow-sm"
                  :src="base + 'img/index/03-missioni-evento-e-premium.jpeg'"
                  alt="Missioni Premium: Ascensione del Divino!"
                  @error="$event.target.style.display = 'none'"
                />
                <figcaption class="text-muted small mt-2">
                  Missioni Premium: <em>Ascensione del Divino!</em> — aggiungono
                  Punti Evento e alcuni Sigilli diretti.
                </figcaption>
              </figure>
            </div>
            <div class="col-12 col-md-6">
              <figure class="mb-0">
                <img
                  class="img-fluid rounded shadow-sm"
                  :src="base + 'img/index/05-ricompense-traguardo-a.jpeg'"
                  alt="Ricompense a traguardo della progress bar"
                  @error="$event.target.style.display = 'none'"
                />
                <figcaption class="text-muted small mt-2">
                  Ricompense a traguardo della progress bar (Sigilli a soglia).
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <div class="mb-2">
          <h4 class="h6 mb-2">3) Fonti extra di Sigilli</h4>
          <p class="mb-2">
            Le <strong>casse della Tournament Arena</strong> possono contenere
            <strong>Sigilli Mitici</strong> extra. Nel calcolatore puoi stimare
            quante ne aprirai.
          </p>
          <div class="alert alert-warning small mb-0">
            La Tournament Arena al momento non è attiva in questa edizione.
            Aggiorneremo la guida con schermate e calcolo dei Sigilli extra non
            appena verrà abilitata.
          </div>
        </div>
      </div>
    </section>

    <!-- COSA FARE / CHECKLIST -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6">Cosa fare (checklist rapida)</h3>
        <ol class="mb-0">
          <li>
            Scegli il tuo <strong>tier di energia</strong> nel calcolatore.
          </li>
          <li>
            Completa <strong>Daily</strong> e
            <strong>Missioni Evento</strong> (free; Premium se attivo).
          </li>
          <li>
            Apri le <strong>crates del Torneo</strong> quando disponibili.
          </li>
          <li>
            Pianifica gli acquisti: lo <strong>shop</strong> ruota su 7 giorni e
            si ripete la settimana dopo.
          </li>
        </ol>
      </div>
    </section>

    <!-- CONSIGLI RAPIDI -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6">Consigli rapidi della gilda</h3>
        <ul class="mb-0">
          <li>
            Imposta il calcolatore in pochi tap (tier, Premium, crates) per
            vedere i <strong>Sigilli totali</strong>.
          </li>
          <li>
            Non sprecare: compra solo ciò che ti serve e nota
            <strong>in che giorno</strong> ricompare.
          </li>
          <li>
            Valuta il <strong>Premium</strong> solo se completi le missioni: dà
            Punti Evento e qualche Sigillo diretto.
          </li>
        </ul>
      </div>
    </section>

    <!-- NEGOZIO MITICO (screenshot) -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6 mb-2">Negozio Mitico (screenshot)</h3>
        <figure class="mb-0">
          <img
            class="img-fluid rounded shadow-sm"
            :src="base + 'img/index/07-negozio-mitico.j'"
            alt="Negozio Mitico - esempi di offerte"
            @error="$event.target.style.display = 'none'"
          />
          <figcaption class="text-muted small mt-2">
            Esempio di offerte del Negozio Mitico. La rotazione completa sarà
            mostrata nella pagina dedicata (nav in alto).
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- CTA DISCORD -->
    <section class="card shadow-sm mb-3">
      <div class="card-body">
        <h3 class="h6">Unisciti al nostro Discord</h3>
        <p>
          Per piani d’acquisto, consigli live e condivisione schermate, entra
          sul nostro server.
        </p>
        <div class="d-grid">
          <a
            class="btn btn-success btn-lg"
            href="https://discord.gg/f4GM9VXuSs"
            target="_blank"
            rel="noopener"
            >Invito Discord ITALIAN MARAUDERS</a
          >
        </div>
      </div>
    </section>

    <!-- DISCLAIMER -->
    <section class="card shadow-sm">
      <div class="card-body">
        <p class="text-muted small mb-0">
          Sito non ufficiale, creato dalla community
          <strong>ITALIAN MARAUDERS</strong> per uso informativo. I dati possono
          variare in base a progressi account e aggiornamenti del gioco.
        </p>
      </div>
    </section>
  </main>

  <footer class="py-3 bg-white border-top">
    <div class="container text-center">
      <small class="text-muted d-block"
        >© ITALIAN MARAUDERS · Non ufficiale</small
      >
      <small class="text-muted">Dati v{{ dataVersion }}</small>
    </div>
  </footer>
</template>
