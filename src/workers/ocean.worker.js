const states = require("../constants/states");
const WorkItem = require("../models/work-item.model");

const oceanService = require("../services/ocean.service");

const retry = require("../utils/retry");
const logger = require("../utils/logger");
const dedupe = require("../utils/dedupe");

async function oceanWorker(item) {
    logger.info(`Ocean worker started for ${item.payload.domain}`);

    const companies = await retry(() =>
        oceanService.findLookalikes(
            item.payload.domain
        )
    );

    logger.info(`companies found: ${JSON.stringify(companies, null, 2)}`);

    const nextItems = [];

    for (const company of companies) {
        if (!dedupe.addCompanyDomain(company.domain)) {
            continue;
        }

        nextItems.push(
            new WorkItem({
                type: "COMPANY",
                status: states.PROSPEO_PENDING,
                payload: {
                    domain: company.domain
                }
            })
        );
    }

    return nextItems;
}

module.exports = oceanWorker;