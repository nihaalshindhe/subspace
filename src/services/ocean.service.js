const createClient = require("../axios");

const oceanClient = createClient({
    baseURL: "https://api.ocean.io/v3",
    auth: {
        type: "header",
        headerName: "X-Api-Token",
        value: process.env.OCEAN_API_TOKEN
    }
});

async function findLookalikes(domain) {
    const payload = {
        companiesFilters: {
            lookalikeDomains: [domain]
        },
        size: 1
    };

    const response = await oceanClient.post(
        "/search/companies",
        payload
    );

    const companies = response.data?.companies || [];

    return companies.map(company => ({
        name: company.name,
        domain: company.domain,
        industry: company.industry || null,
        size: company.size || null,
        location: company.location || null
    }));
}

module.exports = {
    findLookalikes
};