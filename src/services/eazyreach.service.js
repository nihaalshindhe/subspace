const axios = require("axios");

const createClient = require("../axios");

let cachedToken = null;
let tokenExpiry = null;

const eazyreachClient = createClient({
    baseURL: "https://api.superflow.run/b2b",
    headers: {
        "Content-Type": "application/json"
    }
});

async function getAuthToken() {
    if (cachedToken && tokenExpiry > Date.now()) {
        return cachedToken;
    }

    const response = await axios.post(
        "https://api.superflow.run/b2b/createAuthToken/",
        {
            clientId: process.env.EAZYREACH_CLIENT_ID,
            clientSecret: process.env.EAZYREACH_CLIENT_SECRET
        },
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.data?.auth_token) {
        throw new Error("Failed to fetch EazyReach auth token");
    }

    cachedToken = response.data.auth_token;
    tokenExpiry = Date.now() + 50 * 60 * 1000;

    return cachedToken;
}

async function findEmailsFromLinkedIn(linkedinUrl) {
    const token = await getAuthToken();

    const response = await eazyreachClient.post(
        "/linkedin-emails",
        {
            linkedinUrl
        },
        {
            meta: {
                authHeader: {
                    name: "Authorization",
                    value: `Bearer ${token}`
                }
            }
        }
    );

    const emails = response.data?.emails || [];

    return emails.map(e => ({
        email: e.email,
        verification: e.verification,
        source: e.source
    }));
}

module.exports = {
    getAuthToken,
    findEmailsFromLinkedIn
};