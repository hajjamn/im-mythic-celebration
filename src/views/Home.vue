<template>
  <section class="card shadow-sm">
    <div class="card-body text-center">
      <h2 class="h5 mb-2">Benvenuto, fratello della gilda!</h2>
      <p class="mb-3">
        Qui troverai strumenti e riassunti per i
        <strong>Festeggiamenti Mitici</strong>.
      </p>

      <!-- Bootstrap JS sanity test -->
      <button
        class="btn btn-secondary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#demoCollapse"
      >
        Apri/Chiudi pannello
      </button>
      <div id="demoCollapse" class="collapse mt-3">
        <div class="alert alert-success mb-0">Bootstrap JS è attivo ✔</div>
      </div>
    </div>
  </section>
</template>
