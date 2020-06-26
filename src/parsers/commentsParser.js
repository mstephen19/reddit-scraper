/* global $ */

const Apify = require('apify');
const { SCROLL_TIMEOUT } = require('../constants');

exports.commentsParser = async ({ page, request, maxComments }) => {
    const postId = request.url.match(/comments\/([^/]+)\/.+/)[1];
    await page.waitForSelector(`[id=t3_${postId}`);
    const data = await page.$eval(`[id=t3_${postId}`, (el) => {
        const numberOfVotes = $(el).find('[id^=vote-arrows] div').html();
        const postedBy = $(el).find('a[href^="/user/"]').html();
        const title = $(el).find('h1').text();
        const postedDate = $(el).find('a[data-click-id=timestamp]').text();
        const text = $(el).find('div[data-click-id=text]').text();

        return {
            numberOfVotes,
            postedBy,
            postedDate,
            title,
            text,
        };
    });

    const postUrl = request.url;
    const communityName = postUrl.match(/reddit\.com\/(.*)\/comments.*/)[1];

    await page.click('button._2JBsHFobuapzGwpHQjrDlD.j9NixHqtN2j8SKHcdJ0om._2nelDm85zKKmuD94NequP0');

    let loading = true;
    let previousCommentsLength = -1;
    let comments = [];

    setTimeout(() => {
        loading = false;
    }, SCROLL_TIMEOUT);

    while (loading) {
        await Apify.utils.puppeteer.infiniteScroll(page, { timeoutSecs: 1 });

        comments = await page.$$eval('[id^=t1]', (elements) => {
            const temp = [];
            elements.forEach((el) => {
                const span = Array.from($(el).find('span')).find((span) => $(span).text().includes('points'));
                const points = span ? span.innerText.match(/(\d+).+/)[1] : null;
                const id = $(el).attr('id');
                const commentUrl = `${this.location.href}${id}`;
                const userName = $(el).find('a[href^="/user/"]').text();
                const commentDate = $(el).find(`#CommentTopMeta--Created--${id}`).text();
                const description = $(el).find('[data-test-id="comment"]').text();
                const comment = { commentUrl, userName, commentDate, description };

                if (points) {
                    comment.points = points;
                }

                temp.push(comment);
            });
            return temp;
        });

        if (comments.length >= maxComments || previousCommentsLength === comments.length) {
            loading = false;
        }

        previousCommentsLength = comments.length;
    }

    const post = {
        postUrl,
        communityName,
        ...data,
        comments,
    };

    await Apify.pushData(post);
};
