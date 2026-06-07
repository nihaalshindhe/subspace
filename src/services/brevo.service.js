const createClient = require("../axios");

const brevoClient = createClient({
    baseURL: "https://api.brevo.com/v3",
    headers: {
        "api-key": process.env.BREVO_API_KEY,
        "accept": "application/json"
    }
});

const STATIC_HTML = `
<!DOCTYPE html>
<html>
    <body>
        <h2>Quick Outreach</h2>
        <p>Hi there,</p>

        <p>
            I came across your profile and thought it would be great to connect.
            We help teams streamline outreach and automate lead generation workflows.
        </p>

        <p>
            Would love to explore if there's a fit.
        </p>

        <p>Best regards,<br/>Team</p>
    </body>
</html>
`;

async function sendEmail({ to, subject }) {
    try {
        const payload = {
            sender: {
                name: process.env.BREVO_SENDER_NAME,
                email: process.env.BREVO_SENDER_EMAIL
            },

            to: [
                {
                    email: to
                }
            ],

            subject: subject || "Quick Outreach",

            htmlContent: STATIC_HTML,

            textContent:
                "Hi there, we help teams streamline outreach and automate lead generation workflows.",

            headers: {
                "X-Sib-Sandbox": "drop"
            }
        };

        const response = await brevoClient.post(
            "/smtp/email",
            payload
        );

        return {
            messageId: response.data?.messageId,
            status: "sandbox_sent"
        };

    } catch (error) {
        const status = error.status || "UNKNOWN";

        throw new Error(
            `Brevo Sandbox Error [${status}]: ${error.message}`
        );
    }
}

module.exports = {
    sendEmail
};