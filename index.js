app.post('/webhook/discount', (req, res) => {
  console.log('🔥 WEBHOOK HIT');

  try {
    const body = req.body;

    console.log('FULL BODY:', JSON.stringify(body, null, 2));

    let code = null;
    let value = null;

    // Try ALL possible locations
    code =
      body.code ||
      body.title ||
      body.discount_code?.code ||
      body.discount_codes?.[0]?.code ||
      body.codes?.[0];

    value =
      body.value ||
      body.amount ||
      body.discount_code?.amount ||
      body.value_type === "percentage" ? body.value : null;

    if (!code) {
      console.log('❌ Still no code found');
      return res.sendStatus(200);
    }

    coupons.push({ code, value });

    console.log('✅ Saved coupon:', code, value);

  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});
