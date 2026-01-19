const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

// initialize Express app
const app = express();
// helps app to read JSON
app.use(express.json());

app.listen(port,() => {
    console.log('Server running on port',port);
});

app.get('/allcards', async (req, res) => {
  try {
    let connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM defaultdb.cards'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for allcards' });
  }
});

app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id=' + id);
        res.status(201).json({ message: 'Card ' + id + ' deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete card ' + id });
    }
});

app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE cards SET card_name=?, card_pic=? WHERE id=?',
            [card_name, card_pic, id]
        );
        res.status(201).json({ message: 'Card ' + card_name + ' updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update card ' + card_name });
    }
});


// CREATE: Add a card
app.post('/addcard', async (req, res) => {
  try {
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
      return res.status(400).json({ message: 'card_name and card_pic are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
      [card_name, card_pic]
    );

    return res.status(201).json({ message: 'Card added', card_name, card_pic });
  } catch (err) {
    console.error('Add card error:', err);
    return res.status(500).json({ message: 'Server error - could not add card' });
  }
});
