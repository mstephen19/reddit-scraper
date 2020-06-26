/* global $ */

const Apify = require('apify');
const { SCROLL_TIMEOUT } = require('../constants');

exports.communityCategoryParser = async ({ request, page, maxPostCount, extendOutputFunction }) => {
    const { community } = request.userData;
    let loading = true;
    let previousPostLength = -1;
    let posts = [];

    setTimeout(() => {
        loading = false;
    }, SCROLL_TIMEOUT);

    while (loading) {
        await Apify.utils.puppeteer.infiniteScroll(page, { timeoutSecs: 1 });

        posts = await page.$$eval('div.Post', (divs) => divs.map((el) => {
            const numberOfVotes = $(el).find('[id^=vote-arrows] div').html();
            const postedBy = $(el).find('a[href^="/user/"]').html();
            const title = $(el).find('h3').html();
            const postedDate = $(el).find('a[data-click-id=timestamp]').html();
            const postUrl = $(el).find('a[data-click-id=timestamp]').attr('href');
            const communityName = postUrl ? postUrl.match(/reddit\.com\/(.*)\/comments.*/)[1] : null;

            return { postUrl, numberOfVotes, communityName, postedBy, postedDate, title };
        }));

        if (posts.length >= maxPostCount || previousPostLength === posts.length) {
            loading = false;
        }

        previousPostLength = posts.length;
    }

    let userResult = {};
    if (extendOutputFunction) {
        userResult = await page.evaluate((functionStr) => {
            // eslint-disable-next-line no-eval
            const f = eval(functionStr);
            return f();
        }, extendOutputFunction);
    }

    community.posts = posts.filter((post) => !!post.title);
    Object.assign(community, userResult);

    await Apify.pushData(community);
};
