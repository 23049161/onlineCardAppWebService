// Include the require packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

// database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
};

// Initialize the Express app
const app = express();

// Helps the app read JSON
app.use(express.json());

// Start the Server
app.listen(port, () => {
    console.log('Server is running on ', port);
});

// ---------------------------------------------------------
// ROUTE 1: Get all tool
// ---------------------------------------------------------
app.get('/alltool', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM tools');
        await connection.end(); // Close connection
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for alltool' });
    }
});

// ---------------------------------------------------------
// ROUTE 2: Create a new tool (FIXED)
// ---------------------------------------------------------
app.post('/addtool', async (req, res) => {
    // FIX 1: We now extract 'id' from the body as well
    const { id, tool_name, tool_pic } = req.body; 

    try {
        let connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'INSERT INTO tools (id, tool_name, tool_pic) VALUES (?, ?, ?)', 
            [id, tool_name, tool_pic]
        );
        
        await connection.end();
        res.status(201).json({ message: 'tool ' + tool_name + ' added successfully' });
    } catch (err) {
        console.error(err); // This prints the REAL error to your terminal
        res.status(500).json({ message: 'Server error - could not add card ' + tool_name });
    }
});

// ---------------------------------------------------------
// ROUTE 3: Edit/Update a tool
// ---------------------------------------------------------
app.put('/updatetool/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { tool_name, tool_pic } = req.body; // Get new data from body

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE tools SET tool_name = ?, tool_pic = ? WHERE id = ?',
            [tool_name, tool_pic, id]
        );
        await connection.end();

        // Check if any row was actually affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'tool not found with ID: ' + id });
        }

        res.json({ message: 'tool updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating tool' });
    }
});

// ---------------------------------------------------------
// ROUTE 4: Delete a tool 
// ---------------------------------------------------------
app.delete('/deletetool/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM tools WHERE id = ?',
            [id]
        );
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'tool not found with ID: ' + id });
        }

        res.json({ message: 'tool deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting tool' });
    }
});