const express = require('express');
const app = express();

app.use(express.json());

let coupons = [];

// homepage
app.get('/', (req, res) => {
  res.send('API is running');
});

// webhook
app.post('/webhook/discount', (req, res) => {
  console.log('🔥 WEBHOOK HIT');

  try {
    const body = req.body || {};

    console.log('FULL BODY:', JSON.stringify(body, null, 2));

    // Shopify sends code as "title"
    const code = body.title || body.code || null;

    if (!code) {
      console.log('❌ No code found');
      return res.sendStatus(200);
    }

    // 🔥 TEMP VALUE (we fix later if you want)
    const value = 10;

    coupons.push({ code, value });

    console.log('✅ SAVED:', code, value);

  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// validate
app.get('/validate', (req, res) => {
  const code = req.query.code;

  const found = coupons.find(c => c.code === code);

  if (!found) {
    return res.json({ valid: false });
  }

  res.json({
    valid: true,
    value: found.value
  });
});

app.listen(3000, () => console.log('Server running'));
