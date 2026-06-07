require("dotenv").config();

const Job = require("./models/job.model");

const queue = require("./queue/job.queue");
const processState = require("./queue/state.processor");

const states = require("./constants/states");
const logger = require("./utils/logger");

async function run() {
    const seedDomain = process.argv[2];

    if (!seedDomain) {
        logger.error("Missing seed domain");
        process.exit(1);
    }

    const job = new Job(seedDomain);

    queue.enqueue(job);

    logger.info(
        `Job created: ${job.id}`
    );

    while (queue.hasJobs()) {

        const currentJob =
            queue.dequeue();

        try {

            logger.info(
                `Processing ${currentJob.state}`
            );

            const updatedJob =
                await processState(
                    currentJob
                );

            if (
                updatedJob.state !==
                states.COMPLETED
            ) {

                queue.enqueue(
                    updatedJob
                );

            } else {

                logger.info(
                    `Job ${updatedJob.id} completed successfully`
                );

                logger.info(
                    `Companies Found: ${updatedJob.stats.companiesFound}`
                );

                logger.info(
                    `Contacts Found: ${updatedJob.stats.contactsFound}`
                );

                logger.info(
                    `Emails Resolved: ${updatedJob.stats.emailsResolved}`
                );

                logger.info(
                    `Emails Sent: ${updatedJob.stats.emailsSent}`
                );
            }

        } catch (error) {

            currentJob.stateRetryCount++;

            logger.error(
                `State ${currentJob.state} failed. Attempt ${currentJob.stateRetryCount}`
            );

            logger.error(
                error.message
            );

            if (
                currentJob.stateRetryCount < 3
            ) {

                logger.warn(
                    `Requeueing job ${currentJob.id}`
                );

                queue.enqueue(
                    currentJob
                );

            } else {

                currentJob.fail(
                    error.message
                );

                logger.error(
                    `Job ${currentJob.id} permanently failed`
                );

                logger.error(
                    `Failure Reason: ${currentJob.failedReason}`
                );
            }
        }
    }

    logger.info(
        "Queue processing completed"
    );
}

run().catch(error => {
    logger.error(error.message);
    process.exit(1);
});