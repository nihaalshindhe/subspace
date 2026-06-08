require("dotenv").config();

const WorkItem = require("./models/work-item.model");

const queue = require("./queue/job.queue");

const processState = require("./queue/state.processor");

const reviewWorker = require("./workers/review.worker");

const States = require("./constants/states");

const logger = require("./utils/logger");

async function run() {
    const seedDomain = process.argv[2];

    if (!seedDomain) {
        logger.error("Missing seed domain");
        process.exit(1);
    }

    const seedItem = new WorkItem({
        type: "DOMAIN",
        status: States.OCEAN_PENDING,
        payload: {
            domain: seedDomain
        }
    });

    queue.enqueue(seedItem);

    const emailItems = [];

    while (queue.hasJobs()) {
        const item = queue.dequeue();

        try {
            logger.info(`Processing ${item.status}`);

            const results = await processState(item);

            if (Array.isArray(results)) {
                for (const result of results) {
                    if (
                        result.status ===
                        States.REVIEW_PENDING
                    ) {
                        emailItems.push(result);
                    } else {
                        queue.enqueue(result);
                    }
                }
            }
        } catch (error) {
            item.incrementRetry(error.message);

            logger.error(error.message);

            if (item.retryCount < 3) {
                queue.enqueue(item);
            } else {
                logger.error(
                    `Item ${item.id} permanently failed`
                );
            }
        }
    }

    const approved = await reviewWorker(
        emailItems
    );

    if (!approved) {
        logger.warn("Campaign cancelled");
        return;
    }

    for (const item of emailItems) {
        item.updateStatus(
            States.BREVO_PENDING
        );

        queue.enqueue(item);
    }

    while (queue.hasJobs()) {
        const item = queue.dequeue();

        try {
            await processState(item);
        } catch (error) {
            logger.error(error.message);
        }
    }

    logger.info("Pipeline completed");
}

run().catch(error => {
    logger.error(error.message);
    process.exit(1);
});