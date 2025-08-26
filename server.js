const express = require('express');
const path = require('path');
const { CosmosClient } = require("@azure/cosmos");

// --- Server Setup ---
const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '/')));

// --- Cosmos DB Configuration ---
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
if (!connectionString) {
    console.error("CRITICAL: COSMOS_DB_CONNECTION_STRING is not set in the Azure environment.");
}
const client = new CosmosClient(connectionString);
const databaseId = "system-hcp-data";
const containerId = "Users";
const database = client.database(databaseId);
const container = database.container(containerId);

// --- Premium Content Definition ---
const marketReportContent = `
# Central Florida Q3 2025 Market Report

**An in-depth analysis of property trends, rental values, and investment potential for the Orlando metropolitan area.**

---

### 1. Executive Summary
The Central Florida real estate market continues to show robust growth in Q3 2025, driven by strong job growth and sustained inbound migration. While price appreciation has moderated compared to previous years, demand remains high, especially in suburban submarkets. Investment potential is strongest in the build-to-rent sector and properties zoned for mixed-use development.

### 2. Key Property Trends & Data
* **Median Home Price:** Increased 2.1% quarter-over-quarter to **$415,000**.
* **Average Days on Market:** Shifted slightly to **28 days**, up from 22 days in Q2.
* **Inventory Levels:** A slight increase in inventory provides buyers with more options but remains below a balanced market threshold.

### 3. Predictive Modeling & Investment Outlook
Our predictive models indicate a stable to slightly positive growth trajectory for Q4 2025.
* **Top Investment Neighborhoods:** Lake Nona, Winter Garden, and Kissimmee's NeoCity corridor show the highest potential for appreciation.
* **Rental Market:** Rental values are projected to increase by 3-4% over the next 12 months, particularly for single-family homes.
`;

// --- API Endpoint ---
app.post('/api/login', async (req, res) => {
    console.log('Login endpoint processed a request.');

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        const { resource: user } = await container.item(username, username).read();

        if (user && user.password === password) {

            if (user.id === 'jane@example.com') {
                console.log(`User 'jane@example.com' logged in. Attaching premium market report.`);
                if (!user.content) user.content = {};
                user.content.reports = marketReportContent;
            }

            const { password, ...userData } = user;
            return res.status(200).json({ success: true, ...userData });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        if (error.code === 404) {
             return res.status(401).json({ success: false, message: "Invalid credentials" });
        } else {
            console.error(error);
            return res.status(500).json({ success: false, message: "An internal server error occurred." });
        }
    }
});

// --- Serve the Frontend ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Start Server ---
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
