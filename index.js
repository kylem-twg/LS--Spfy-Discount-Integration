const express = require('express');
const app = express();

app.use(express.json());

// homepage test
app.get('/', (req, res) => {
  res.send('API is running');
});

// ✅ THIS IS THE IMPORTANT PART
app.post('/webhook/discount', (req, res) => {
  console.log('🔥 WEBHOOK HIT');
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running'));
