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
// ROUTE 1: Get all pokemon
// ---------------------------------------------------------
app.get('/allpokemon', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM wk8ex.pokemon');
        await connection.end(); // Close connection
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allpokemon' });
    }
});

// ---------------------------------------------------------
// ROUTE 2: Create a new pokemon (FIXED)
// ---------------------------------------------------------
app.post('/addpokemon', async (req, res) => {
    // FIX 1: We now extract 'id' from the body as well
    const { id, pokemon_name, pokemon_pic } = req.body; 

    try {
        let connection = await mysql.createConnection(dbConfig);
        
        await connection.execute(
            'INSERT INTO wk8ex.pokemon (id, pokemon_name, pokemon_pic) VALUES (?, ?, ?)', 
            [id, pokemon_name, pokemon_pic]
        );
        
        await connection.end();
        res.status(201).json({ message: 'Pokemon ' + pokemon_name + ' added successfully' });
    } catch (err) {
        console.error(err); // This prints the REAL error to your terminal
        res.status(500).json({ message: 'Server error - could not add card ' + pokemon_name });
    }
});

// ---------------------------------------------------------
// ROUTE 3: Edit/Update a pokemon
// ---------------------------------------------------------
app.put('/updatepokemon/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL
    const { pokemon_name, pokemon_pic } = req.body; // Get new data from body

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE wk8ex.pokemon SET pokemon_name = ?, pokemon_pic = ? WHERE id = ?',
            [pokemon_name, pokemon_pic, id]
        );
        await connection.end();

        // Check if any row was actually affected
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pokemon not found with ID: ' + id });
        }

        res.json({ message: 'Pokemon updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating pokemon' });
    }
});

// ---------------------------------------------------------
// ROUTE 4: Delete a pokemon 
// ---------------------------------------------------------
app.delete('/deletepokemon/:id', async (req, res) => {
    const { id } = req.params; // Get the ID from the URL

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM wk8ex.pokemon WHERE id = ?',
            [id]
        );
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pokemon not found with ID: ' + id });
        }

        res.json({ message: 'Pokemon deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting pokemon' });
    }
});