const States = require('../constants/states');
const oceanWorker = require("../workers/ocean.worker");
const prospeoWorker = require("../workers/prospeo.worker");
const eazyreachWorker = require("../workers/eazyreach.worker");
const reviewWorker = require("../workers/review.worker");
const brevoWorker = require("../workers/brevo.worker");

async function processState(job) {
    switch (job.state){
        case States.OCEAN_PENDING:
            return oceanWorker(job);
        case States.PROSPEO_PENDING:
            return prospeoWorker(job);
        case States.EAZYREACH_PENDING:
            return eazyreachWorker(job);
        case States.REVIEW_PENDING:
            return reviewWorker(job);
        case States.BREVO_PENDING:
            return brevoWorker(job);
        default:
            throw new Error(`Unknown job state: ${job.state}`);
    }
}

module.exports = processState;