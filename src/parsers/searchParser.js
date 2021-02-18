const { getSearchType } = require("../tools");
const { EnumBaseUrl } = require("../constants");

/**
 *
 * @param {Object} params
 * @param {Apify.RequestQueue} params.requestQueue
 * @request {Request} params.request
 */
exports.searchParser = async ({ requestQueue, request }) => {
  const [, urlParams] = request.url.split("?");
  const searchParams = new URLSearchParams(urlParams);
  searchParams.set("type", "link");
  let url = `${EnumBaseUrl.SEARCH_URL}?${searchParams.toString()}`;
  const userData = {
    searchType: getSearchType(url),
  };
  await requestQueue.addRequest({ url, userData });
  searchParams.set("type", "other");
  url = `${EnumBaseUrl.SEARCH_URL}?${searchParams.toString()}`;
  userData.searchType = getSearchType(url);
  await requestQueue.addRequest({ url, userData });
};
