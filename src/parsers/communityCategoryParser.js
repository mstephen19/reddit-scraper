/* global $ */

const Apify = require("apify");
const { SCROLL_TIMEOUT, EnumBaseUrl } = require("../constants");
const { incrementItemsCount } = require("../saved-items");
const {
  convertRelativeDate,
  convertStringToNumber,
  hasReachedMaxItemsLimit,
  log,
} = require("../tools");
const { getCommunityData } = require("./communityParser");

exports.communityCategoryParser = async ({
  request,
  page,
  maxPostCount,
  extendOutputFunction,
  maxItems,
}) => {
  let { community } = request.userData;
  let hasCommunityData = true;

  if (!community) {
    hasCommunityData = false;
    community = {};
  }

  community.dataType = "community-post";

  let loading = true;
  let previousPostLength = -1;
  let posts = [];

  setTimeout(() => {
    loading = false;
  }, SCROLL_TIMEOUT);

  while (loading) {
    await Apify.utils.puppeteer.infiniteScroll(page, { timeoutSecs: 1 });

    posts = await page.$$eval("div.Post", (divs) =>
      divs.map((el) => {
        const numberOfVotes = $(el).find("[id^=vote-arrows] div").html();
        const postedBy = $(el).find('a[href^="/user/"]').html();
        const title = $(el).find("h3").html();
        const postedDate = $(el).find("a[data-click-id=timestamp]").text();
        const postUrl = $(el).find("a[data-click-id=timestamp]").attr("href");
        const communityName = postUrl
          ? postUrl.match(/reddit\.com\/(.*)\/comments.*/)[1]
          : null;

        return {
          postUrl,
          numberOfVotes,
          communityName,
          postedBy,
          postedDate,
          title,
        };
      })
    );

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

  const parsedPosts = posts
    .filter((post) => !!post.title)
    .map((post) => ({
      ...post,
      numberOfVotes: convertStringToNumber(post.numberOfVotes),
      postedDate: convertRelativeDate(post.postedDate),
    }))
    .slice(0, maxPostCount);
  Object.assign(community, userResult);

  if (!hasCommunityData) {
    const communityName = request.url.match(
      /reddit\.com\/r\/([^/]+)\/[^/]+\/?$/
    )[1];
    const communityUrl = `${EnumBaseUrl.MAIN_URL}/r/${communityName}`;
    await page.goto(communityUrl);
    const { community: communityData, error } = await getCommunityData({
      url: communityUrl,
      page,
    });

    if (!error && communityData) {
      community = {
        ...communityData,
        ...community,
      };
    }
  }

  if (hasReachedMaxItemsLimit({ maxItems })) {
    return;
  }
  log.debug("Saving community data");
  const data = parsedPosts.map((post) => ({
    ...post,
    ...community,
  }));
  await Apify.pushData(data);
  incrementItemsCount();
};
