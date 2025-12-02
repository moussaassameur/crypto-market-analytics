const amqp = require("amqplib");
const { fetchMarketData } = require("./marketService");

const QUEUE_NAME = "collect-tasks";
const AMQP_URL = "amqp://guest:guest@localhost:5672";

async function startWorker() {
  try {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`Worker démarré, en attente de tâches sur la file "${QUEUE_NAME}"...`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        console.log(" Tâche reçue :", msg.content.toString());

        try {
          await fetchMarketData();
          channel.ack(msg);
          console.log("Tâche traitée avec succès.");
        } catch (err) {
          console.error(" Erreur lors du traitement de la tâche :", err.message);
          // On demande à RabbitMQ de réessayer plus tard
          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error(" Erreur dans le worker RabbitMQ :", err.message);
    process.exit(1);
  }
}

startWorker();
