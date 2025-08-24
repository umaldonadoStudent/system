const { CosmosClient } = require("@azure/cosmos");

// Get the connection string from the secure application settings
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error("COSMOS_DB_CONNECTION_STRING is not set in application settings.");
}
const client = new CosmosClient(connectionString);

// CORRECTED: Database and container names
const databaseId = "system-hcp-data";
const containerId = "Users";

module.exports = async function (context, req) {
    context.log('Login function processed a real request.');

    const { username, password } = req.body;

    if (!username || !password) {
        context.res = {
            status: 400,
            body: { success: false, message: "Username and password are required." }
        };
        return;
    }

    try {
        // Get a reference to our database and container
        const database = client.database(databaseId);
        const container = database.container(containerId);

        // Query the database for the user by their ID (which is their email)
        const { resource: user } = await container.item(username, username).read();

        // Check if the user exists and the password matches
        if (user && user.password === password) {
            // Password matches, send back the user's data but OMIT the password for security
            const { password, ...userData } = user;
            context.res = {
                status: 200,
                body: {
                    success: true,
                    ...userData // This will include name, tier, content, etc.
                }
            };
        } else {
            // User not found or password incorrect
            context.res = {
                status: 401,
                body: { success: false, message: "Invalid credentials" }
            };
        }
    } catch (error) {
        // A 404 error from Cosmos DB means the item (user) was not found.
        if (error.code === 404) {
             context.res = {
                status: 401,
                body: { success: false, message: "Invalid credentials" }
            };
        } else {
            // For all other errors, log them and return a generic server error.
            context.log.error(error);
            context.res = {
                status: 500,
                body: { success: false, message: "An internal server error occurred." }
            };
        }
    }
};
