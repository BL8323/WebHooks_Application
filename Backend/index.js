const express = require("express");
const app = express();
app.use(express.json());

const axios = require("axios");

const webHooks = {
  COMMIT: [],
  PUSH: [],
  MERGE: [],
};

app.post("/api/webhooks", (req, res) => {
  const { payloadUrl, secret, eventTypes } = req.body;
  eventTypes.forEach((eventType) => {
    webHooks[eventType].push({ payloadUrl, secret });
  });
  return res.sendStatus(201);
});

app.post("/api/event-emulate", (req, res) => {
  const { type, data } = req.body;
  // Business Logic goes here...

  // Event trigger || call webhooks

  setTimeout(async () => {
    const webHooksList = webHooks[type];
    for (let i = 0; i < webHooksList.length; i++) {
      const webHook = webHooksList[i];
      const { payloadUrl, secret } = webHook;
      try {
        await axios.post(payloadUrl, data, {
          headers: {
            "x-secret": secret,
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, 0);

  res.sendStatus(200);
});

app.get("/api/db", (req, res) => {
  res.json(webHooks);
});

const PORT = process.env.PORT || 5600;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
