const pLimit = require("p-limit");

module.exports = {
    ocean: pLimit(2),

    prospeo: pLimit(3),

    eazyreach: pLimit(2),

    brevo: pLimit(2)
};