import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 OpenRouter API
const API_KEY = "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";
const MODEL = "upstage/solar-pro-3:free";
const URL = "https://openrouter.ai/api/v1/chat/completions";

// 🤖 Telegram Bot Token
const TELEGRAM_TOKEN = "8500066973:AAEaQZsFB5yPl2VJiq70sGif1lDUd_WxbuI";
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// ✅ Webhook endpoint
app.post("/webhook", async (req, res) => {
  const message = req.body.message;

  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const chatId = message.chat.id;
  const userText = message.text;

  // Commande /start
  if (userText === "/start") {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "👋 Bienvenue ! Envoie-moi un message et je répondrai avec l'IA 🚀",
      }),
    });

    return res.sendStatus(200);
  }

  // Appel IA OpenRouter
  const aiResponse = await fetch(URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: userText }],
    }),
  });

  const data = await aiResponse.json();
  const reply = data.choices?.[0]?.message?.content || "❌ Erreur IA.";

  // Répondre sur Telegram
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: reply,
    }),
  });

  res.sendStatus(200);
});

// Serveur
app.get("/", (req, res) => {
  res.send("Bot Telegram IA actif 🚀");
});

app.listen(3000, () => console.log("Server running..."));
