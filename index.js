const express = require('express');
const app = express(); // ← THIS is what was missing

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

    let code = body.code || body.title || null;
    let value = body.value || body.amount || null;

    if (!code) {
      console.log('❌ No code found');
      return res.sendStatus(200);
    }

    coupons.push({ code, value });

    console.log('✅ Saved coupon:', code, value);

  } catch (err) {
    console.error('ERROR:', err.message);
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

// server start
app.listen(3000, () => console.log('Server running'));
