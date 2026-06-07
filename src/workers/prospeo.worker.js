const states = require("../constants/states");
const prospeoService = require("../services/prospeo.service");

const retry = require("../utils/retry");
const logger = require("../utils/logger");
const dedupe = require("../utils/dedupe");

async function prospeoWorker(job) {
    try {
        logger.info(
            `Prospeo worker started for job ${job.id}`
        );

        const contacts = [];

        for (const company of job.companies) {
            try {
                const results = await retry(
                    () =>
                        prospeoService.findDecisionMakers(
                            company.domain
                        ),
                    2
                );

                if (!results?.length) {
                    logger.warn(
                        `No contacts found for ${company.domain}`
                    );
                    continue;
                }

                for (const contact of results) {
                    if (
                        !dedupe.addLinkedin(
                            contact.linkedin
                        )
                    ) {
                        continue;
                    }

                    contacts.push(contact);
                }
            } catch (error) {
                logger.warn(
                    `Prospeo failed for ${company.domain}: ${error.message}`
                );

                continue;
            }
        }

        job.contacts = contacts;

        job.stats.contactsFound =
            contacts.length;

        logger.info(
            `Collected ${contacts.length} unique contacts`
        );

        job.updateState(
            states.EAZYREACH_PENDING
        );

        return job;

    } catch (error) {
        logger.error(
            `Prospeo worker failed: ${error.message}`
        );

        job.lastError = error.message;

        throw error;
    }
}

module.exports = prospeoWorker;