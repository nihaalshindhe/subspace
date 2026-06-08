const readline = require("readline");
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

async function reviewWorker(emailItems) {
    try {
        logger.info("Review stage started");

        console.log("\n");
        console.log("=================================");
        console.log("         REVIEW STAGE");
        console.log("=================================");
        console.log("\n");

        console.log(
            `Emails Ready To Send : ${emailItems.length}`
        );

        console.log("\nSample Emails\n");

        console.table(
            emailItems.slice(0, 10).map(item => ({
                Name: `${item.payload.firstName || ""} ${item.payload.lastName || ""}`.trim(),
                Company: item.payload.companyDomain,
                Email: item.payload.email.email
            }))
        );

        const answer = await askQuestion(
            "\nProceed with email campaign? (Y/N): "
        );

        if (answer.toLowerCase() !== "y") {
            logger.warn("Campaign cancelled by user");
            return false;
        }

        logger.info("Campaign approved");
        return true;
    } catch (error) {
        logger.error(`Review stage failed: ${error.message}`);
        throw error;
    }
}

module.exports = reviewWorker;