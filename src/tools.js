const Apify = require("apify");
const sub = require("date-fns/sub");
const { EnumBaseUrl, EnumURLTypes } = require("./constants");
const { getItemsCount } = require("./saved-items");

const { log } = Apify.utils;
exports.log = log;

exports.enableDebugMode = () => {
  log.setLevel(log.LEVELS.DEBUG);
};

exports.getSearchUrl = ({ search, type, sort, time }) => {
  const searchType = type === "posts" ? "link" : "sr,user";

  const params = new URLSearchParams([
    ["q", search],
    ["type", searchType],
  ]);

  if (sort) {
    params.set("sort", sort);
  }

  if (time) {
    params.set("t", time);
  }

  return `${EnumBaseUrl.SEARCH_URL}?${params.toString()}`;
};

exports.getSearchType = (url) => {
  const type = this.getUrlType(url);
  log.debug("Search type", { type });
  if (!type) {
    log.error("Url search type not supported!", { url });
    process.exit(0);
  }
  return type;
};

/**
 *
 * @param {string} url
 */
exports.getUrlType = (url) => {
  let type = null;

  const [, params] = url.split("?");

  const searchParameters = new URLSearchParams(params);

  if (url.match(/reddit\.com\/search\/.*$/)) {
    if (searchParameters.get("type") === "link") {
      type = EnumURLTypes.POSTS;
    } else if (searchParameters.get("type") === "sr,user") {
      type = EnumURLTypes.COMMUNITIES_AND_USERS;
    } else {
      type = EnumURLTypes.SEARCH;
    }
  }

  if (url.match(/www\.reddit\.com\/r\/.+\/comments\/.*$/)) {
    type = EnumURLTypes.COMMENTS;
  }

  if (url.match(/reddit\.com\/r\/([^/]+)(\/?)$/)) {
    type = EnumURLTypes.COMMUNITY;
  }

  if (url.match(/reddit\.com\/r\/([^/]+)\/[^/]+\/?$/)) {
    type = EnumURLTypes.COMMUNITY_CATEGORY;
  }

  if (url.match(/reddit\.com\/user\/([^/]+)\/posts\/?.*$/)) {
    type = EnumURLTypes.POSTS;
  }

  return type;
};

exports.splitUrl = (url) => url.split("?")[0];

exports.blockUnusedRequests = async (page) => {
  await Apify.utils.puppeteer.blockRequests(page, {
    urlPatterns: [
      ".jpg",
      ".jpeg",
      ".png",
      ".svg",
      ".gif",
      ".woff",
      ".pdf",
      ".zip",
      "doubleclicks",
    ],
  });
};

exports.convertStringToNumber = (stringNumber) => {
  const number = stringNumber
    .replace("k", "000")
    .replace("m", "000000")
    .replace(/[^\d]+/, "");
  return Number(number);
};

exports.convertRelativeDate = (passedTimeString) => {
  try {
    if (passedTimeString.trim() === "just now") {
      return new Date().toISOString();
    }
    const results = passedTimeString.match(/^(\d+)\s(\w+)\sago.*$/);
    if (results) {
      const num = results[1];
      const key = results[2];
      const duration = {};
      duration[key] = Number(num);
      const convertedDate = sub(new Date(), duration).toISOString();
      return convertedDate;
    }
    throw new Error();
  } catch (err) {
    log.warning(
      `Error converting relative date/time: ${passedTimeString}`,
      err
    );
    return passedTimeString;
  }
};

/**
 *
 * @param {Object} params
 * @param {number} params.maxItems
 */
exports.verifyItemsCount = ({ maxItems }) => {
  const itemCount = getItemsCount();
  const reachedLimit = itemCount >= maxItems;
  if (reachedLimit) {
    log.info("Actor reached the max items limit. Crawler is going to halt...");
    log.info("Crawler Finished.");
    process.exit();
  }
};

exports.defaultInput = {
  proxy: "",
  startUrls: [],
  searches: [],
  extendOutputFunction: "",
  maxItems: 50,
  maxPostCount: 50,
  maxComments: 50,
  maxCommunitiesAndUsers: 50,
  useBuiltInSearch: false,
  type: "Posts",
  proxyConfiguration: { useApifyProxy: true },
};

exports.validateInput = (input) => {
  if (input.useBuiltInSearch === undefined) {
    log.warning("Input: built-in search is not set, set true as default");
  }
  if (input.searches === undefined) {
    log.warning("Input: searches is not set, set [] as default.");
  }
  if (input.startUrls === undefined) {
    log.warning("Input: startUrls is not set, set [] as default.");
  }

  if (input.startUrls && input.startUrls.length) {
    input.startUrls.forEach((url) => {
      const searchType = this.getSearchType(url);
      if (!searchType) {
        log.error(`This url is not supported: ${url}`);
        process.exit(0);
      }
    });
  }

  const newInput = { ...exports.defaultInput, ...input };
  if (newInput.useBuiltInSearch && newInput.searches.length === 0) {
    log.warning("Empty searches with built-in search found.");
  }
  if (newInput.startUrls.length === 0) {
    log.warning("Empty startUrls found.");
  }

  if (!newInput.useBuiltInSearch && newInput.startUrls.length === 0) {
    throw new Error("startUrls or built-in search must be used!");
  }
  return newInput;
};
