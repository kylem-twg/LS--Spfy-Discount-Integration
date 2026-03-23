const express = require('express');
const app = express();

app.use(express.json());

// 🔥 REPLACE THESE TWO
const CLIENT_ID = "2308ea9ee4a0e2ebb27c5e67435b7805";
const CLIENT_SECRET = "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";

const SHOP = "tailwaggers-pet-food-supplies";

let coupons = {};

// homepage
app.get('/', (req, res) => {
  res.send('API is running');
});

// 🔥 AUTH START
app.get('/auth', (req, res) => {
  const redirect_uri = "https://easygoing-delight-production-638a.up.railway.app/auth/callback";

  const installUrl = `https://${SHOP}.myshopify.com/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=read_discounts,read_price_rules&redirect_uri=${redirect_uri}`;

  res.redirect(installUrl);
});

// 🔥 AUTH CALLBACK
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await fetch(`https://${SHOP}.myshopify.com/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();

    console.log('🔥 TOKEN:', data.access_token);

    res.send('App installed. Check Railway logs.');
  } catch (err) {
    console.error(err);
    res.send('Error getting token');
  }
});

// 🔥 WEBHOOK (keep your existing functionality)
app.post('/webhook/discount', (req, res) => {
  const body = req.body;

  console.log('WEBHOOK:', JSON.stringify(body, null, 2));

  const code = body.title;

  if (code) {
    coupons[code] = true;
    console.log('Saved code:', code);
  }

  res.sendStatus(200);
});

// 🔥 VALIDATE
app.get('/validate', (req, res) => {
  const code = req.query.code;

  if (!coupons[code]) {
    return res.json({ valid: false });
  }

  res.json({
    valid: true
  });
});

app.listen(3000, () => console.log('Server running'));
