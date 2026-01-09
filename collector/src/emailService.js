const nodemailer = require("nodemailer");
const logger = require("./logger");
require("dotenv").config();

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true pour 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifier la connexion au serveur SMTP
const verifyConnection = async () => {
  try {
    await transporter.verify();
    logger.info("Connexion au serveur SMTP établie");
    return true;
  } catch (err) {
    logger.error(`Erreur de connexion SMTP : ${err.message}`);
    return false;
  }
};

// Envoyer un email d'alerte de prix
const sendPriceAlert = async (to, alertData) => {
  const { userName, cryptoSymbol, condition, threshold, currentPrice, cryptoName } = alertData;

  const conditionText = condition === ">" ? "a dépassé" : "est passé en dessous de";
  const emoji = condition === ">" ? "📈" : "📉";

  const subject = `${emoji} Alerte ${cryptoSymbol} - Prix ${condition === ">" ? "en hausse" : "en baisse"}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #3b82f6; margin: 0; }
        .alert-box { background-color: #334155; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .price { font-size: 32px; font-weight: bold; color: ${condition === ">" ? "#22c55e" : "#ef4444"}; }
        .threshold { color: #94a3b8; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${emoji} CryptoTracker Alert</h1>
        </div>
        
        <p>Bonjour ${userName || ""},</p>
        
        <p>Votre alerte sur <strong>${cryptoName || cryptoSymbol}</strong> a été déclenchée !</p>
        
        <div class="alert-box">
          <p><strong>${cryptoSymbol}</strong> ${conditionText} votre seuil de <span class="threshold">$${threshold.toLocaleString()}</span></p>
          <p class="price">Prix actuel : $${currentPrice.toLocaleString()}</p>
        </div>
        
        <p>Condition de l'alerte : ${cryptoSymbol} ${condition} $${threshold.toLocaleString()}</p>
        
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/alerts" class="button">
            Gérer mes alertes
          </a>
        </div>
        
        <div class="footer">
          <p>Vous recevez cet email car vous avez configuré une alerte de prix sur CryptoTracker.</p>
          <p>© 2026 CryptoTracker - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Alerte CryptoTracker - ${cryptoSymbol}
    
    Bonjour ${userName || ""},
    
    Votre alerte sur ${cryptoName || cryptoSymbol} a été déclenchée !
    
    ${cryptoSymbol} ${conditionText} votre seuil de $${threshold.toLocaleString()}
    Prix actuel : $${currentPrice.toLocaleString()}
    
    Condition de l'alerte : ${cryptoSymbol} ${condition} $${threshold.toLocaleString()}
    
    Gérer mes alertes : ${process.env.FRONTEND_URL || 'http://localhost:3001'}/alerts
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"CryptoTracker" <alerts@cryptotracker.com>',
    to,
    subject,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email d'alerte envoyé à ${to} - Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Erreur lors de l'envoi de l'email à ${to} : ${err.message}`);
    return { success: false, error: err.message };
  }
};

module.exports = {
  verifyConnection,
  sendPriceAlert,
};
