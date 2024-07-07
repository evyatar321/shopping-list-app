const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

app.use(bodyParser.json());
app.use(express.static('public'));

let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    db = client.db('shopping_list_db');
  })
  .catch(error => console.error(error));

app.get('/api/shopping-list', async (req, res) => {
  const items = await db.collection('items').find().toArray();
  res.json(items);
});

app.post('/api/shopping-list', async (req, res) => {
  const newItem = {
    id: Date.now().toString(),
    text: req.body.text,
    emoji: req.body.emoji || '🛒'
  };
  await db.collection('items').insertOne(newItem);
  res.status(201).json(newItem);
});

app.delete('/api/shopping-list/:id', async (req, res) => {
  await db.collection('items').deleteOne({ id: req.params.id });
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
