const amqp = require("amqplib");
const cron = require("node-cron");

const QUEUE_NAME = "collect-tasks";
const AMQP_URL = "amqp://guest:guest@localhost:5672";

async function startScheduler() {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(" Scheduler démarré. Les tâches de collecte seront envoyées toutes les 5 minutes.");

    // Toutes les 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      const payload = {
        type: "COLLECT_MARKET_DATA",
        at: new Date().toISOString(),
      };

      const buffer = Buffer.from(JSON.stringify(payload));
      channel.sendToQueue(QUEUE_NAME, buffer, { persistent: true });

      console.log(" Tâche de collecte envoyée à la file :", payload);
    });
  } catch (err) {
    console.error(" Erreur dans le scheduler RabbitMQ :", err.message);
    process.exit(1);
  }
}

startScheduler();
