const STATES = require("../constants/states");
const crypto = require("crypto");

class WorkItem {
    constructor({type, status = STATES.OCEAN_PENDING, payload = {}}) {
        this.id = crypto.randomUUID();

        this.type = type;

        this.status = status;

        this.payload = payload;

        this.retryCount = 0;

        this.lastError = null;

        this.createdAt = new Date();

        this.updatedAt = new Date();
    }

    updateStatus(status) {
        this.status = status;

        this.retryCount = 0;

        this.updatedAt = new Date();
    }

    incrementRetry(error = null) {
        this.retryCount++;

        this.lastError = error;

        this.updatedAt = new Date();
    }
}

module.exports = WorkItem;