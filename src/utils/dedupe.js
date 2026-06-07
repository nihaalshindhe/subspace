const companyDomains = new Set();
const linkedinProfiles = new Set();
const emails = new Set();

function addCompanyDomain(domain) {
    if (companyDomains.has(domain)) {
        return false;
    }
    companyDomains.add(domain);
    return true;
}

function addLinkedInProfile(profile) {
    if (linkedinProfiles.has(profile)) {
        return false;
    }
    linkedinProfiles.add(profile);
    return true;
}

function addEmail(email) {
    if (emails.has(email)) {
        return false;
    }
    emails.add(email);
    return true;
}

module.exports = {
    addCompanyDomain,
    addLinkedInProfile,
    addEmail
};