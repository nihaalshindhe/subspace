class JobQueue{
    constructor() {
        this.queue = [];
    }

    enqueue(job) {
        this.queue.push(job);
    }

    dequeue() {
        return this.queue.shift();
    }

    hasJobs() {
        return this.queue.length > 0;
    }

    size() {
        return this.queue.length;
    }

    peek() {
        return this.queue[0];
    }
}

module.exports = new JobQueue();