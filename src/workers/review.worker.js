const readline = require("readline");

const states = require("../constants/states");
const logger = require("../utils/logger");

function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function reviewWorker(job) {
    try {

        logger.info(`Review worker started for job ${job.id}`);

        console.log("\n");
        console.log("=================================");
        console.log("         REVIEW STAGE");
        console.log("=================================");
        console.log("\n");

        console.log(`Companies Found : ${job.stats.companiesFound}`);

        console.log(`Contacts Found  : ${job.stats.contactsFound}`);

        console.log(`Emails Resolved : ${job.stats.emailsResolved}`);

        console.log("\nSample Contacts\n");

        console.table(
            job.contacts.slice(0, 10).map(contact => ({
                Name: contact.name,
                Company: contact.company,
                Email: contact.email
            }))
        );

        const answer = await askQuestion("\nProceed with email campaign? (Y/N): ");

        if (
            answer.toLowerCase() !== "y"
        ) {

            logger.warn(`Campaign cancelled by user`);

            job.updateState(states.COMPLETED);
            return job;
        }

        logger.info(`Campaign approved`);

        job.updateState(states.BREVO_PENDING);

        return job;

    } catch (error) {

        logger.error(`Review worker failed: ${error.message}`);

        job.lastError = error.message;

        throw error;
    }
}

module.exports = reviewWorker;