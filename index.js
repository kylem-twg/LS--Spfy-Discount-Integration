const express = require('express');
const app = express();

app.use(express.json());

let coupons = [];

// test
app.get('/', (req, res) => {
  res.send('API is running');
});

// Shopify webhook
app.post('/webhook/discount', (req, res) => {
  console.log('🔥 WEBHOOK HIT');

  try {
    const body = req.body;

    // Shopify sends different formats depending on webhook
    let code = null;
    let value = null;

    // Try common Shopify structures
    if (body.code) {
      code = body.code;
    } else if (body.discount_code?.code) {
      code = body.discount_code.code;
    }

    if (body.value) {
      value = body.value;
    } else if (body.discount_code?.amount) {
      value = body.discount_code.amount;
    }

    if (!code) {
      console.log('No code found in webhook');
      return res.sendStatus(200);
    }

    coupons.push({
      code,
      value
    });

    console.log('✅ Saved coupon:', code, value);

  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// check coupon
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
