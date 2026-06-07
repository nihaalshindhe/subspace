const STATES = require("../constants/states");
const crypto = require("crypto");

class Job {
    constructor(seedDomain) {
        this.id = crypto.randomUUID();

        this.seedDomain = seedDomain;

        this.state = STATES.OCEAN_PENDING;

        this.companies = [];

        this.contacts = [];

        this.stats = {
            companiesFound: 0,
            contactsFound: 0,
            emailsResolved: 0,
            emailsSent: 0
        };

        this.stateRetryCount = 0;

        this.lastError = null;

        this.failedReason = null;

        this.createdAt = new Date();

        this.updatedAt = new Date();
    }

    updateState(state) {
        this.state = state;

        this.stateRetryCount = 0;

        this.updatedAt = new Date();
    }

    fail(reason) {
        this.failedReason = reason;

        this.state = STATES.FAILED;

        this.updatedAt = new Date();
    }
}

module.exports = Job;