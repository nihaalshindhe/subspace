const states = require("../constants/states");

const brevoService = require("../services/brevo.service");

const retry = require("../utils/retry");

const logger = require("../utils/logger");

async function brevoWorker(item) {
    try {
        const emailData = item.payload.email;

        if (
            !emailData ||
            emailData.status !== "VERIFIED" ||
            !emailData.revealed ||
            !emailData.email
        ) {
            logger.warn(
                `Skipping item ${item.id} - email not verified or not revealed`
            );

            item.updateStatus(states.COMPLETED);

            return [];
        }

        logger.info(
            `Sending email to ${emailData.email}`
        );

        await retry(
            () =>
                brevoService.sendEmail({
                    to: emailData.email,
                    subject: "Quick Outreach"
                }),
            2
        );

        logger.info(
            `Email sent to ${emailData.email}`
        );

        item.updateStatus(states.COMPLETED);

        return [];
    } catch (error) {
        logger.error(
            `Failed sending email: ${error.message}`
        );

        item.lastError = error.message;

        throw error;
    }
}

module.exports = brevoWorker;