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

const app = express();
app.use(express.json());

app.listen(port, () => {
  console.log('Server running on port', port);
});

// =====================
// READ
// =====================
app.get('/allcards', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM cards');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for allcards' });
  } finally {
    if (connection) await connection.end();
  }
});

// =====================
// DELETE
// =====================
app.delete('/deletecard/:id', async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM cards WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: `Card ${id} deleted successfully` });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ message: 'Could not delete card: ' + err.message });
  } finally {
    if (connection) await connection.end();
  }
});

// =====================
// UPDATE
// =====================
app.put('/updatecard/:id', async (req, res) => {
  const { id } = req.params;
  const { card_name, card_pic } = req.body;
  let connection;

  if (!card_name || !card_pic) {
    return res.status(400).json({ message: 'card_name and card_pic required' });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?',
      [card_name, card_pic, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: `Card ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update card' });
  } finally {
    if (connection) await connection.end();
  }
});

// =====================
// CREATE
// =====================
app.post('/addcard', async (req, res) => {
  const { card_name, card_pic } = req.body;
  let connection;

  if (!card_name || !card_pic) {
    return res.status(400).json({ message: 'card_name and card_pic required' });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
      [card_name, card_pic]
    );

    res.status(201).json({ message: 'Card added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not add card' });
  } finally {
    if (connection) await connection.end();
  }
});
