const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const port = 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// ✅ CREATE POOL ONCE
const pool = mysql.createPool(dbConfig);

const app = express();
app.use(express.json());
app.use(cors());

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
    res.status(500).json({ message: 'Server error for alltools' });
  }
});

// =====================
// CREATE
// =====================
app.post('/addtool', async (req, res) => {
  const { tool_name, tool_pic } = req.body;

  if (!tool_name || !tool_pic) {
    return res.status(400).json({
      message: 'tool_name and tool_pic required',
    });
  }

  try {
    await pool.execute(
      'INSERT INTO tools (tool_name, tool_pic) VALUES (?, ?)',
      [tool_name, tool_pic]
    );

    res.status(201).json({ message: 'tool added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not add tool' });
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

    res.json({ message: `tool ${id} updated successfully` });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Could not update tool' });
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

    res.json({ message: `tool ${id} deleted successfully` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Could not delete tool' });
  }
});
