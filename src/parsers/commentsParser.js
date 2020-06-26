/* global $ */

const Apify = require('apify');

exports.commentsParser = async ({ page, request }) => {
    const postId = request.url.match(/comments\/([^/]+)\/.+/)[1];
    await page.waitForSelector(`[id=t3_${postId}`);
    const data = await page.$eval(`[id=t3_${postId}`, (el) => {
        const numberOfVotes = Number($(el).find('[id^=vote-arrows] div').html());
        const postedBy = $('a[href^="/user/"]').text();
        const postedDate = $('a[data-click-id=timestamp]').text();
        const title = $('h1').text();
        const text = $('div[data-click-id=text]').text();

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
    await Apify.utils.puppeteer.infiniteScroll(page, { timeoutSecs: 10 });

    const comments = await page.$$eval('[id^=t1]', (elements) => {
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

    const post = {
        postUrl,
        communityName,
        ...data,
        comments,
    };

    await Apify.pushData(post);
};
