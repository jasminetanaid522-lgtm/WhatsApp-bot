const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "mysecret123";

// WhatsApp checks this to know it's really you
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// When someone sends a message, this runs
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return;

    const from = message.from;
    const text = message.text?.body || "";
    console.log("Got message:", text);

    let reply = "Hi! Thanks for messaging me. How can I help you?";

    if (text.toLowerCase().includes("price")) {
      reply = "Our prices start from KSh 500. What product are you interested in?";
    }
    if (text.toLowerCase().includes("hi") || text.toLowerCase().includes("hello")) {
      reply = "Hello! Welcome. Type PRICE to see prices, or HOURS to see opening hours.";
    }
    if (text.toLowerCase().includes("hours")) {
      reply = "We are open Mon - Sat, 8am to 6pm.";
    }

    await axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: reply }
      },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );

  } catch (err) {
    console.log(err.response?.data || err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on " + PORT));
