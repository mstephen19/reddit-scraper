const { Apify } = require('apify');

exports.communitiesAndUsersParser = async ({ requestQueue, page, request, maxCommunitiesAndUsers }) => {
    await Apify.utils.puppeteer.infiniteScroll(page);
    const communities = await page.$$eval('a[href^="/r/"]', (elements) => elements.map((el) => el.href));

    communities.splice(maxCommunitiesAndUsers);
    await communities.reduce(async (previous, url) => {
        await previous;
        await requestQueue.addRequest({ url });
    });
};
