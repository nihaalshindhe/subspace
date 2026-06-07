const createClient = require("../axios");

const prospeoClient = createClient({
    baseURL: "https://api.prospeo.io",
    auth: {
        type: "header",
        headerName: "X-KEY",
        value: process.env.PROSPEO_API_KEY
    }
});

async function findDecisionMakers(domain, maxPages = 3) {
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

        const people =
            response.data?.data ||
            response.data?.results ||
            [];

        if (!people.length) break;

        allPeople.push(
            ...people.map(person => ({
                fullName: person.full_name,
                firstName: person.first_name,
                lastName: person.last_name,
                title: person.job_title,
                company: person.company_name,
                email: person.email || null,
                linkedin: person.linkedin_url || null,
                seniority: person.seniority || null,
                domain
            }))
        );

        page++;
    }

    return allPeople;
}

module.exports = {
    findDecisionMakers
};