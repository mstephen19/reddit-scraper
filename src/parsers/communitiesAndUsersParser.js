exports.communitiesAndUsersParser = async ({ requestQueue, page, request }) => {
    const communities = await page.$$eval('a[href^="/r/"]', (elements) => elements.map((el) => el.href));

    await communities.reduce(async (previous, url) => {
        await previous;
        await requestQueue.addRequest({ url });
    });
};
