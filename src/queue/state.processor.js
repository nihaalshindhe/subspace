const States = require("../constants/states");
const oceanWorker = require("../workers/ocean.worker");
const prospeoWorker = require("../workers/prospeo.worker");
const brevoWorker = require("../workers/brevo.worker");

async function processState(item) {
    switch (item.status) {
        case States.OCEAN_PENDING:
            return oceanWorker(item);

        case States.PROSPEO_PENDING:
            return prospeoWorker(item);

        case States.BREVO_PENDING:
            return brevoWorker(item);

        default:
            throw new Error(`Unknown item status: ${item.status}`);
    }
}

module.exports = processState;