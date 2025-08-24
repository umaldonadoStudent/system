module.exports = async function (context, req) {
    context.log('Login function processed a request.');

    const { username, password } = req.body;

    // In the future, we will check the username/password against Cosmos DB here.
    // For now, we'll just check against our mock data for testing.

    if (username === "john@example.com" && password === "password123") {
        context.res = {
            status: 200, /* Defaults to 200 */
            body: {
                success: true,
                name: "John Investor",
                tier: "Pro",
                content: {
                    documents: `<div class="border-b pb-4 mb-4"><h3 class="font-semibold text-lg">The Ultimate Home Buyer's Kit</h3><p class="text-sm text-gray-600">All the documents you need for a smooth home purchase.</p><a href="#" class="text-blue-600 hover:underline mt-2 inline-block">Download Kit (.zip)</a></div>`,
                    reports: `<div class="border-b pb-4 mb-4"><h3 class="font-semibold text-lg">Lake Mary Q3 Market Report</h3><p class="text-sm text-gray-600">In-depth analysis of market trends for the third quarter.</p><a href="#" class="text-blue-600 hover:underline mt-2 inline-block">Download Report (.pdf)</a></div>`,
                    webinars: `<p>You have access to all webinars as a Pro member.</p>`,
                    subscription: `<p>Your <strong>Pro Plan</strong> is active. Next renewal date: September 24, 2025.</p>`
                }
            }
        };
    } else {
        context.res = {
            status: 401,
            body: { success: false, message: "Invalid credentials" }
        };
    }
};