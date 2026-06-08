const createClient = require("../config/axios");

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

    return companies
        .map(result => ({
            domain: result.company?.domain,
            industry: result.company?.industries?.[0] || null,
            size: result.company?.companySize || null,
            location: result.company?.primaryCountry || null
        }))
        .filter(company => company.domain);

    /*
    const companies = [];

    let searchAfter;

    while (companies.length < targetCount) {

        const payload = {
            size: Math.min(
                100,
                targetCount - companies.length
            ),
            companiesFilters: {
                lookalikeDomains: [domain],
                excludeDomains: [domain]
            }
        };

        if (searchAfter) {
            payload.searchAfter =
                searchAfter;
        }

        const response =
            await oceanClient.post(
                "/search/companies",
                payload
            );

        const results = response.data?.companies || [];

        companies.push(...results);

        searchAfter =  response.data?.searchAfter;

        if (!searchAfter) {
            break;
        }
    }

    return companies
        .map(result => ({
            domain: result.company?.domain,
            industry: result.company?.industries?.[0] || null,
            size: result.company?.companySize ||  null,
            location: result.company?.primaryCountry || null
       }))
        .filter(company => company.domain);
    */
}

module.exports = {
    findLookalikes
};