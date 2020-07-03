const Apify = require('apify');
const { SCROLL_TIMEOUT } = require('../constants');
const { splitUrl } = require('../tools');

exports.communitiesAndUsersParser = async ({ requestQueue, page, request, maxCommunitiesAndUsers }) => {
    let loading = true;
    let previousCommunitiesLength = -1;
    let communities = [];

    setTimeout(() => {
        loading = false;
    }, SCROLL_TIMEOUT);

    while (loading) {
        await Apify.utils.puppeteer.infiniteScroll(page, { timeoutSecs: 1 });
        communities = await page.$$eval('a[href^="/r/"]', (elements) => elements.map((el) => el.href));

        if (communities.length >= maxCommunitiesAndUsers || previousCommunitiesLength === communities.length) {
            loading = false;
        }

        previousCommunitiesLength = communities.length;
    }

    communities.splice(maxCommunitiesAndUsers);

    for (const url of communities) {
        await requestQueue.addRequest({ url: splitUrl(url), userData: request.userData });
    }
};
