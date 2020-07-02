const Apify = require('apify');
const Parsers = require('./parsers');
const { EnumURLTypes } = require('./constants');
const {
    log,
    getUrlType,
    getSearchUrl,
    gotoFunction,
    getSearchType,
    hasReachedScrapeLimit,
} = require('./tools');

Apify.main(async () => {
    const input = await Apify.getInput();

    const {
        proxy,
        startUrls,
        searches,
        extendOutputFunction,
        maxPostCount,
        maxComments,
        maxCommunitiesAndUsers,
        useBuiltInSearch,
        type,
    } = input;

    if (!startUrls && !useBuiltInSearch) {
        throw new Error('startUrls or built-in search must be used!');
    }

    const requestList = await Apify.openRequestList(
        'start-urls',
        useBuiltInSearch ? [] : startUrls.map((url) => ({
            url,
            userData: { searchType: getSearchType(url) },
        })),
    );
    const requestQueue = await Apify.openRequestQueue();

    if (useBuiltInSearch) {
        for (const search of searches) {
            await requestQueue.addRequest({ url: getSearchUrl({ search, type }), userData: { searchType: type } });
        }
    }

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        useSessionPool: true,
        persistCookiesPerSession: true,
        launchPuppeteerOptions: {
            ...proxy,
            stealth: true,
        },

        gotoFunction,

        handlePageFunction: async (context) => {
            const dataset = await Apify.openDataset();
            const { itemCount } = await dataset.getInfo();
            const { page, request } = context;
            const { searchType } = request.userData;
            const urlType = getUrlType(request.url);

            if (hasReachedScrapeLimit({ searchType, maxPostCount, maxCommunitiesAndUsers, itemCount })) {
                log.info('Actor reached the max items limit. Crawler is going to halt...');
                log.info('Crawler Finished.');
                process.exit();
            }

            log.info(`Processing ${request.url}...`);
            log.debug(`Type: ${urlType}`);

            await Apify.utils.puppeteer.injectJQuery(page);

            switch (urlType) {
                case EnumURLTypes.POSTS:
                    return Parsers.postsParser({ requestQueue, ...context, maxPostCount });
                case EnumURLTypes.COMUMUNITIES_AND_USERS:
                    return Parsers.communitiesAndUsersParser({ requestQueue, ...context, maxCommunitiesAndUsers });
                case EnumURLTypes.COMMENTS:
                    return Parsers.commentsParser({ requestQueue, ...context, maxComments, extendOutputFunction });
                case EnumURLTypes.COMMUNITY:
                    return Parsers.communityParser({ requestQueue, ...context });
                case EnumURLTypes.COMMUNITY_CATEGORY:
                    return Parsers.communityCategoryParser({ requestQueue, ...context, maxPostCount, extendOutputFunction });
                default:
                    log.warning('Url does not match any parser');
            }
        },

        handleFailedRequestFunction: async ({ request }) => {
            log.exception(`Request ${request.url} failed too many times`);
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
