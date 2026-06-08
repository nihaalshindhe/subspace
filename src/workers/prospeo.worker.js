const states = require("../constants/states");
const WorkItem = require("../models/work-item.model");

const prospeoService = require("../services/prospeo.service");

const retry = require("../utils/retry");
const logger = require("../utils/logger");
const dedupe = require("../utils/dedupe");

async function prospeoWorker(item) {
    const domain = item.payload.domain;

    logger.info(`Prospeo worker started for ${domain}`);

    const results = await retry(
        () =>
            prospeoService.findDecisionMakers(domain),
        2
    );

    console.log(JSON.stringify(results, null, 2));

    const nextItems = [];

    for (const contact of results || []) {
        if (!contact.email) {
            continue;
        }

        if (!dedupe.addEmail(contact.email)) {
            continue;
        }

        nextItems.push(
            new WorkItem({
                type: "EMAIL_CONTACT",
                status: states.REVIEW_PENDING,
                payload: {
                    email: contact.email,
                    linkedinUrl: contact.linkedin,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    title: contact.title,
                    companyDomain: domain
                }
            })
        );
    }

    logger.info(`Found ${nextItems.length} contacts with emails for ${domain}`);

    return nextItems;
}

module.exports = prospeoWorker;