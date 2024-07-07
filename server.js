const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('public'));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to Database');
    db = client.db('shopping_list_db');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

app.get('/api/shopping-list', async (req, res) => {
  try {
    const items = await db.collection('items').find().toArray();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/shopping-list', async (req, res) => {
  try {
    const newItem = {
      id: Date.now().toString(),
      text: req.body.text,
      emoji: req.body.emoji || '🛒'
    };
    await db.collection('items').insertOne(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/shopping-list/:id', async (req, res) => {
  try {
    await db.collection('items').deleteOne({ id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

connectToDatabase().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
});
