const createClient = require("../config/axios");

const prospeoClient = createClient({
    baseURL: "https://api.prospeo.io",
    auth: {
        type: "header",
        headerName: "X-KEY",
        value: process.env.PROSPEO_API_KEY
    }
});

async function findDecisionMakers(domain, maxPages = 1) {
    let page = 1;
    let allPeople = [];

    while (page <= maxPages) {
        const payload = {
            page,
            filters: {
                company: {
                    websites: {
                        include: [domain]
                    }
                },
                person_seniority: {
                    include: [
                        "C-Suite",
                        "Vice President",
                        "Director"
                    ]
                }
            }
        };

        const response = await prospeoClient.post(
            "/search-person",
            payload
        );

        const people = response.data?.results || [];

        if (!people.length) break;

        allPeople.push(
            ...people.map(result => ({
                fullName: result.person?.full_name,

                firstName: result.person?.first_name,

                lastName: result.person?.last_name,

                title: result.person?.job_title,

                company: result.company?.name,

                email: result.person?.email || null,

                linkedin: result.person?.linkedin_url || null,

                seniority: result.person?.seniority || null,

                domain
            }))
        );

        /*
        const pagination = response.data?.pagination;

        if (!pagination || page >= pagination.total_page) {
            break;
        }
        */

        page++;
    }

    return allPeople;
}

module.exports = {
    findDecisionMakers
};