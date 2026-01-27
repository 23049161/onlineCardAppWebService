// =====================
// IMPORTS & CONFIG
// =====================
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const port = 3000;

// =====================
// DB CONNECTION POOL
// =====================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
});

// =====================
// APP SETUP
// =====================
const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// =====================
// READ — GET ALL TOOLS
// =====================
app.get('/alltools', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tools');
        res.json(rows);
    } catch (err) {
        console.error('Read error:', err);
        res.status(500).json({ message: 'Server error for alltools' });
    }
});

// =====================
// CREATE — ADD TOOL
// =====================
app.post('/addtool', async (req, res) => {
    const { tool_name, tool_pic } = req.body;

    if (!tool_name || !tool_pic) {
        return res.status(400).json({
            message: 'tool_name and tool_pic are required',
        });
    }

    try {
        await pool.execute(
            'INSERT INTO tools (tool_name, tool_pic) VALUES (?, ?)',
            [tool_name, tool_pic]
        );

        res.status(201).json({ message: 'Tool added successfully' });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ message: 'Could not add tool' });
    }
});

// =====================
// UPDATE — UPDATE TOOL
// =====================
app.put('/updatetool/:idtoolstools', async (req, res) => {
    const idtools = Number(req.params.idtools);
    const { tool_name, tool_pic } = req.body;

    if (!Number.isInteger(idtools)) {
        return res.status(400).json({ message: 'Invalidtools tool idtools' });
    }

    if (!tool_name || !tool_pic) {
        return res.status(400).json({
            message: 'tool_name and tool_pic are required',
        });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE tools SET tool_name = ?, tool_pic = ? WHERE idtools = ?',
            [tool_name, tool_pic, idtools]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        res.json({ message: `Tool ${idtools} updated successfully` });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Could not update tool' });
    }
});

// =====================
// DELETE — DELETE TOOL
// =====================
app.delete('/deletetool/:idtools', async (req, res) => {
    const idtools = Number(req.params.idtools);

    if (!Number.isInteger(idtools)) {
        return res.status(400).json({ message: 'Invalidtools tool idtools' });
    }

    try {
        const [result] = await pool.execute(
            'DELETE FROM tools WHERE idtools = ?',
            [idtools]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        res.json({ message: `Tool ${idtools} deleted successfully` });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ message: 'Could not delete tool' });
    }
});
