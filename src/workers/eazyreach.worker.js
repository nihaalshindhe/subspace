const states = require("../constants/states");

const eazyreachService = require("../services/eazyreach.service");

const retry = require("../utils/retry");

const logger = require("../utils/logger");

const dedupe = require("../utils/dedupe");

async function eazyreachWorker(job) {
    try {

        logger.info(`Eazyreach worker started for job ${job.id}`);

        const enrichedContacts = [];

        for (const contact of job.contacts) {

            try {

                const emails = await retry(
                    () =>
                        eazyreachService.findEmailsFromLinkedIn(
                            contact.linkedin
                        ),
                    2
                );

                if (!emails || emails.length === 0) {
                    logger.warn(`No email found for ${contact.linkedin}`);
                    continue;
                }
                const bestEmail =
                    emails.find(e => e.verification === "verified") ||
                    emails[0];

                if (!bestEmail?.email) {
                    continue;
                }

                if (!dedupe.addEmail(bestEmail.email)) {
                    continue;
                }

                enrichedContacts.push({
                    ...contact,
                    email: bestEmail.email,
                    emailVerification: bestEmail.verification,
                    emailSource: bestEmail.source
                });

            } catch (error) {
                logger.warn(`Eazyreach failed for ${contact.linkedin}: ${error.message}`);
                continue;
            }
        }

        if (enrichedContacts.length === 0) {
            throw new Error("No emails resolved");
        }

        job.contacts = enrichedContacts;
        job.stats.emailsResolved = enrichedContacts.length;
        logger.info(`Resolved ${enrichedContacts.length} emails`);
        job.updateState(states.REVIEW_PENDING);
        return job;

    } catch (error) {
        logger.error(`Eazyreach worker failed: ${error.message}`);
        job.lastError = error.message;
        throw error;
    }
}

module.exports = eazyreachWorker;