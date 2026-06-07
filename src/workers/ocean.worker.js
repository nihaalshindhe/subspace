const states = require('../constants/states');
const oceanService = require("../services/ocean.service");

const retry = require("../utils/retry");
const logger = require("../utils/logger");
const dedupe = require("../utils/dedupe");

async function oceanWorker(job) {
    try {
        logger.info(
            `Ocean worker started for job ${job.id}`
        );

        const companies = await retry(() =>
            oceanService.findLookalikes(
                job.seedDomain
            )
        );

        const uniqueCompanies = [];

        for (const company of companies) {
            if (
                !dedupe.addCompanyDomain(
                    company.domain
                )
            ) {
                continue;
            }

            uniqueCompanies.push(company);
        }

        job.companies = uniqueCompanies;

        job.stats.companiesFound =
            uniqueCompanies.length;

        job.updateState(
            states.PROSPEO_PENDING
        );

        return job;

    } catch (error) {

        logger.error(
            `Ocean worker failed: ${error.message}`
        );

        job.retryCount++;

        job.lastError = error.message;

        throw error;
    }
}

module.exports = oceanWorker;