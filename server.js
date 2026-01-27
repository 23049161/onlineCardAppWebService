// =====================
// IMPORTS & CONFIG
// =====================
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// =====================
// DB CONNECTION POOL
// =====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // string is fine; driver casts
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =====================
// APP SETUP
// =====================
const app = express();
app.use(express.json({ limit: '1mb' }));

// Health check (useful for Render)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// =====================
// ROUTES
// =====================

// READ — GET ALL TOOLS
app.get('/alltools', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, tool_name, tool_pic FROM tools');
    res.json(rows);
  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ message: 'Server error for alltools' });
  }
});

// CREATE — ADD TOOL
app.post('/addtool', async (req, res) => {
  const { tool_name, tool_pic } = req.body || {};

  if (!tool_name || !tool_pic) {
    return res.status(400).json({
      message: 'tool_name and tool_pic are required',
    });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO tools (tool_name, tool_pic) VALUES (?, ?)',
      [tool_name, tool_pic]
    );

    res.status(201).json({
      message: 'Tool added successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: 'Could not add tool' });
  }
});

// UPDATE — UPDATE TOOL
app.put('/updatetool/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { tool_name, tool_pic } = req.body || {};

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid tool id' });
  }
  if (!tool_name || !tool_pic) {
    return res
      .status(400)
      .json({ message: 'tool_name and tool_pic are required' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tools SET tool_name = ?, tool_pic = ? WHERE id = ?',
      [tool_name, tool_pic, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json({ message: `Tool ${id} updated successfully` });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Could not update tool' });
  }
});

// DELETE — DELETE TOOL
app.delete('/deletetool/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid tool id' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM tools WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    res.json({ message: `Tool ${id} deleted successfully` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Could not delete tool' });
  }
});

// =====================
// NOT FOUND HANDLER
// =====================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});