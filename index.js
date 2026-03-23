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

    let code = null;
    let value = null;
    let type = null;

    // code extraction
    code =
      body.code ||
      body.title ||
      body.discount_code?.code ||
      body.discount_codes?.[0]?.code ||
      null;

    // 🔥 VALUE FIX (this is the important part)
    if (body.value) {
      value = Math.abs(Number(body.value)); // handles "-5.0"
    }

    if (body.discount_code && body.discount_code.amount) {
      value = Math.abs(Number(body.discount_code.amount));
    }

    // detect type
    if (body.value_type) {
      type = body.value_type; // "percentage" or "fixed_amount"
    }

    if (!code) {
      console.log('❌ No code found');
      return res.sendStatus(200);
    }

    if (!value) {
      console.log('⚠️ No value found, skipping save');
      return res.sendStatus(200);
    }

    coupons.push({ code, value, type });

    console.log('✅ SAVED:', code, value, type);

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
    value: found.value,
    type: found.type
  });
});

// POS screen
app.get('/pos', (req, res) => {
  res.send(`
    <html>
      <body style="font-family:Arial;text-align:center;margin-top:50px;">
        <h1>Scan or Enter Coupon</h1>

        <input id="code" autofocus style="font-size:22px;padding:10px;" />
        <br><br>
        <button onclick="check()" style="font-size:20px;padding:10px;">Apply</button>

        <h2 id="result"></h2>

        <script>
          async function check() {
            const code = document.getElementById('code').value;

            const res = await fetch('/validate?code=' + code);
            const data = await res.json();

            if (data.valid) {
              if (data.type === "percentage") {
                document.getElementById('result').innerText =
                  'Apply ' + data.value + '% discount';
              } else {
                document.getElementById('result').innerText =
                  'Apply $' + data.value + ' off';
              }
            } else {
              document.getElementById('result').innerText =
                'Invalid code';
            }

            document.getElementById('code').value = '';
          }
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => console.log('Server running'));
