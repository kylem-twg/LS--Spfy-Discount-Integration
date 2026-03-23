const express = require('express');
const app = express();

app.use(express.json());

let coupons = {};

// 🔥 PUT YOUR INFO HERE
const SHOP = "tailwaggers-pet-food-supplies";
const ACCESS_TOKEN = "PASTE_YOUR_TOKEN_HERE";

// homepage
app.get('/', (req, res) => {
  res.send('API is running');
});

// webhook
app.post('/webhook/discount', async (req, res) => {
  console.log('🔥 WEBHOOK HIT');

  try {
    const body = req.body;

    const code = body.title;
    const gqlId = body.admin_graphql_api_id;

    if (!code || !gqlId) {
      return res.sendStatus(200);
    }

    // 🔥 GRAPHQL REQUEST
    const response = await fetch(
      `https://${SHOP}.myshopify.com/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: `
          query {
            node(id: "${gqlId}") {
              ... on DiscountCodeNode {
                discount {
                  ... on DiscountCodeBasic {
                    customerGets {
                      value {
                        ... on DiscountAmount {
                          amount
                        }
                        ... on DiscountPercentage {
                          percentage
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          `
        })
      }
    );

    const data = await response.json();

    let value = null;

    const discount =
      data?.data?.node?.discount?.customerGets?.value;

    if (discount?.amount) {
      value = Number(discount.amount);
    }

    if (discount?.percentage) {
      value = Number(discount.percentage);
    }

    if (!value) {
      console.log('❌ Could not extract value');
      return res.sendStatus(200);
    }

    coupons[code] = value;

    console.log('✅ SAVED REAL:', code, value);

  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// validate
app.get('/validate', (req, res) => {
  const code = req.query.code;

  const value = coupons[code];

  if (!value) {
    return res.json({ valid: false });
  }

  res.json({
    valid: true,
    value: value
  });
});

app.listen(3000, () => console.log('Server running'));
