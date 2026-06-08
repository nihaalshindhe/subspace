const states = require("../constants/states");
const WorkItem = require("../models/work-item.model");

const eazyreachService = require("../services/eazyreach.service");

const retry = require("../utils/retry");
const logger = require("../utils/logger");
const dedupe = require("../utils/dedupe");

async function eazyreachWorker(item) {
    const {
        linkedinUrl,
        firstName,
        lastName,
        title,
        companyDomain
    } = item.payload;

    logger.info(`Resolving email for ${linkedinUrl}`);

    const emails = await retry(
        () =>
            eazyreachService.findEmailsFromLinkedIn(
                linkedinUrl
            ),
        2
    );

    if (!emails?.length) {
        return [];
    }

    const bestEmail =
        emails.find(
            e => e.verification === "verified"
        ) || emails[0];

    if (!bestEmail?.email) {
        return [];
    }

    if (!dedupe.addEmail(bestEmail.email)) {
        return [];
    }

    return [
        new WorkItem({
            type: "EMAIL",
            status: states.REVIEW_PENDING,
            payload: {
                firstName,
                lastName,
                title,
                companyDomain,
                linkedinUrl,
                email: bestEmail.email
            }
        })
    ];
}

module.exports = eazyreachWorker;