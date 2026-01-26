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
app.get('/alltools', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM tools');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error for alltools' });
  } finally {
    if (connection) await connection.end();
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
      return res.status(404).json({ message: 'tool not found' });
    }

    res.json({ message: `tool ${id} deleted successfully` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Could not delete tool' });
  }
});


app.put('/updatetool/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { tool_name, tool_pic } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: 'Invalid tool ID' });
  }

  if (!tool_name || !tool_pic) {
    return res.status(400).json({
      message: 'tool_name and tool_pic are required'
    });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tools SET tool_name = ?, tool_pic = ? WHERE id = ?',
      [tool_name, tool_pic, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'tool not found' });
    }

    res.json({ message: `tool ${id} updated successfully` });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Could not update tool' });
  }
});


// =====================
// CREATE
// =====================
app.post('/addtool', async (req, res) => {
  const { tool_name, tool_pic } = req.body;
  let connection;

  if (!tool_name || !tool_pic) {
    return res.status(400).json({ message: 'tool_name and tool_pic required' });
  }

  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'INSERT INTO tools (tool_name, tool_pic) VALUES (?, ?)',
      [tool_name, tool_pic]
    );

    res.status(201).json({ message: 'tool added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not add tool' });
  } finally {
    if (connection) await connection.end();
  }
});
