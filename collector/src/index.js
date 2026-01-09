const cron = require("node-cron");
const { fetchMarketData } = require("./marketService");

// Scheduler US5 : collecte automatique 
function startScheduler() {
  console.log(" Démarrage du scheduler de collecte...");

  // "*/5 * * * *" = toutes les 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("\n Nouvelle collecte planifiée :", new Date().toISOString());
    await fetchMarketData();
  });
}

// Point d'entrée : lancer une première collecte immédiate puis démarrer le scheduler
(async () => {
  console.log("🚀 Première collecte au démarrage...");
  await fetchMarketData();
  startScheduler();
})();
