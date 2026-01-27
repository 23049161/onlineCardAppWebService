const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// DB POOL
// =====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =====================
// SERVER
// =====================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// =====================
// READ
// =====================
app.get('/alltools', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tools');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tools' });
  }
});

// =====================
// CREATE
// =====================
app.post('/addtool', async (req, res) => {
  const { tool_name, tool_pic } = req.body;

  if (!tool_name || !tool_pic) {
    return res.status(400).json({ message: 'tool_name and tool_pic required' });
  }

  try {
    await pool.execute(
      'INSERT INTO tools (tool_name, tool_pic) VALUES (?, ?)',
      [tool_name, tool_pic]
    );

    res.status(201).json({ message: 'Tool added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add tool' });
  }
});

// =====================
// UPDATE
// =====================
app.put('/updatetool/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { tool_name, tool_pic } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid tool ID' });
  }

  if (!tool_name || !tool_pic) {
    return res.status(400).json({
      message: 'tool_name and tool_pic are required',
    });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tools SET tool_name = ?, tool_pic = ? WHERE id = ?',
      [tool_name, tool_pic, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json({ message: 'Tool updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update tool' });
  }
});

// =====================
// DELETE
// =====================
app.delete('/deletetool/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid tool ID' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM tools WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json({ message: 'Tool deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete tool' });
  }
});
