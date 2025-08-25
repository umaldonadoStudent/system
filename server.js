const express = require('express');
const path = require('path');
const { CosmosClient } = require("@azure/cosmos");

// --- Server Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies from your login form
app.use(express.static(path.join(__dirname, '/'))); // This will serve your index.html file

// --- Cosmos DB Configuration (from your api/login/index.js) ---
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
if (!connectionString) {
    console.error("COSMOS_DB_CONNECTION_STRING is not set. Please set it in Azure App Service Configuration.");
}
const client = new CosmosClient(connectionString);
const databaseId = "system-hcp-data";
const containerId = "Users";
const database = client.database(databaseId);
const container = database.container(containerId);

// --- API Endpoint (replaces your Azure Function) ---
// This creates the POST /api/login route that your index.html calls
app.post('/api/login', async (req, res) => {
    console.log('Login endpoint processed a request.');

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        // This is the same database query from your original function
        const { resource: user } = await container.item(username, username).read();

        // This is the same password check from your original function
        if (user && user.password === password) {
            const { password, ...userData } = user; // Omit password for security
            return res.status(200).json({ success: true, ...userData });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        // This is the same error handling from your original function
        if (error.code === 404) {
             return res.status(401).json({ success: false, message: "Invalid credentials" });
        } else {
            console.error(error);
            return res.status(500).json({ success: false, message: "An internal server error occurred." });
        }
    }
});

// --- Serve the Frontend ---
// A fallback to ensure that navigating directly to any page still loads your app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start Server ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
