const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'shopping-list.json');

app.use(bodyParser.json());
app.use(express.static('public'));

async function readList() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeList(list) {
    await fs.writeFile(dataFile, JSON.stringify(list, null, 2));
}

app.get('/api/shopping-list', async (req, res) => {
    const list = await readList();
    res.json(list);
});

app.post('/api/shopping-list', async (req, res) => {
    const list = await readList();
    const newItem = {
        id: Date.now().toString(),
        text: req.body.text,
        emoji: req.body.emoji
    };
    list.push(newItem);
    await writeList(list);
    res.status(201).json(newItem);
});

app.delete('/api/shopping-list/:id', async (req, res) => {
    let list = await readList();
    list = list.filter(item => item.id !== req.params.id);
    await writeList(list);
    res.sendStatus(204);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
