const express = require('express');
const app = express();

app.use(express.json());

let coupons = [];

// homepage
app.get('/', (req, res) => {
  res.send('API is running');
});

// webhook (handles ALL Shopify formats)
app.post('/webhook/discount', (req, res) => {
  console.log('🔥 WEBHOOK HIT');

  try {
    const body = req.body || {};

    console.log('FULL BODY:', JSON.stringify(body, null, 2));

    let code = null;
    let value = null;

    // Try EVERY possible place Shopify might put the code
    if (body.code) code = body.code;
    if (body.title) code = body.title;
    if (body.discount_code && body.discount_code.code) {
      code = body.discount_code.code;
    }
    if (body.discount_codes && body.discount_codes.length > 0) {
      code = body.discount_codes[0].code;
    }

    // Try to get value
    if (body.value) value = body.value;
    if (body.amount) value = body.amount;
    if (body.discount_code && body.discount_code.amount) {
      value = body.discount_code.amount;
    }

    if (!code) {
      console.log('❌ No code found');
      return res.sendStatus(200);
    }

    coupons.push({ code, value });

    console.log('✅ SAVED:', code, value);

  } catch (err) {
    console.error('ERROR:', err.message);
  }

  res.sendStatus(200);
});

// validate route
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

// POS screen
app.get('/pos', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;text-align:center;margin-top:50px;">
        <h1>Enter Coupon</h1>
        <input id="code" style="font-size:20px;padding:10px;" />
        <br><br>
        <button onclick="check()" style="font-size:20px;padding:10px;">Apply</button>
        <h2 id="result"></h2>

        <script>
          async function check() {
            const code = document.getElementById('code').value;
            const res = await fetch('/validate?code=' + code);
            const data = await res.json();

            if (data.valid) {
              document.getElementById('result').innerText =
                'Apply ' + data.value + '% discount';
            } else {
              document.getElementById('result').innerText =
                'Invalid code';
            }
          }
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => console.log('Server running'));
