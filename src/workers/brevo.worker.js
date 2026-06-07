const states = require("../constants/states");

const brevoService = require("../services/brevo.service");

const retry = require("../utils/retry");

const logger = require("../utils/logger");

async function brevoWorker(job) {
    try {

        logger.info(`Brevo worker started for job ${job.id}`);

        let sentCount = 0;

        for (const contact of job.contacts) {

            try {

                if (!contact.email) {
                    logger.warn(`Skipping contact with missing email`);
                    continue;
                }

                await retry(
                    () =>
                        brevoService.sendEmail({
                            to: contact.email,
                            subject: "Quick Outreach"
                        }),
                    2
                );

                sentCount++;

                logger.info(`Email sent to ${contact.email}`);

            } catch (error) {

                logger.warn(
                    `Failed to send email to ${contact.email}: ${error.message}`
                );

                continue;
            }
        }

        job.stats.emailsSent = sentCount;

        logger.info(`Successfully sent ${sentCount} emails`);

        job.updateState(states.COMPLETED);

        return job;

    } catch (error) {

        logger.error(`Brevo worker failed: ${error.message}`);

        job.lastError = error.message;

        throw error;
    }
}

module.exports = brevoWorker;