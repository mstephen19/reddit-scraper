/* global $ */

const Apify = require('apify');

exports.commentsParser = async ({ page, request }) => {
    await page.waitForSelector('[data-click-id=upvote] ~div');
    const data = await page.evaluate(() => {
        const numberOfVotes = Number(document.querySelector('[data-click-id=upvote] ~div').innerText);
        const postedBy = document.querySelector('a[href^="/user/"]').innerText;
        const postedDate = document.querySelector('a[data-click-id=timestamp]').innerText;
        const title = document.querySelector('h1').innerText;
        const text = document.querySelector('div[data-click-id=text]').innerText;

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
