### Reddit Scraper

Reddit Scraper is an [Apify actor](https://apify.com/actors) for extracting data from [Reddit](https://www.reddit.com/). It allows you to extract posts and comments together with some user info without login. It is build on top of [Apify SDK](https://sdk.apify.com/) and you can run it both on [Apify platform](https://my.apify.com) and locally.

- [Input](#input)
- [Output](#output)
- [Compute units consumption](#compute-units-consumption)
- [Extend output function](#extend-output-function)

### Input

| Field | Type | Description | Default value
| ----- | ---- | ----------- | -------------|
| startUrls | array | List of [Request](https://sdk.apify.com/docs/api/request#docsNav) objects that will be deeply crawled.  |  |
| useBuiltInSearch | boolean | When set to true (checked), the startUrls will be ignored and the actor will perform a search based on the fields bellow. | false |
| searhes | array | An array containing keywords that will be used in the Reddit's search engine. Each item on the array will perform a diferent search. |  |
| type | enum | Select the type of search tha will be performed. "Posts" or "Communities and users". | "Posts" |
| maxItems | number | The maximum number of items that will be saved in the dataset. If you are scrapping for Communities&Users, remeber to consider that each category inside a community is saved as a separeted item. | 50 |
| maxPostCount | number | The maximum number of posts that will be scraped for each Posts Page or Communities&Users URL | 50 |
| maxComments | number | The maximum number of comments that will be scraped for each Comments Page. | 50 |
| maxCommunitiesAndUsers | number | The maximum number of "Communities & Users"'s pages that will be scraped if your seach or startUrl is a Communites&Users type. | 50 |
| extendOutputFunction | string | A Javascript function passed as plain text that can return custom information. More on [Extend output function](#extend-output-function). | |
| proxyConfiguration | object | Proxy settings of the run. | `{"useApifyProxy": true }`|

### Output

Output is stored in a dataset. 

Post Example:

```json
{
  "postUrl": "https://www.reddit.com/r/TrueOffMyChest/comments/hdipdr/my_wife_doesnt_know_but_once_or_twice_a_month/",
  "communityName": "r/TrueOffMyChest",
  "numberOfVotes": 30,
  "postedBy": "u/Rpark888",
  "postedDate": "4 days ago",
  "title": "My wife doesn't know. But once or twice a month after she falls asleep, I order a medium pizza and 8 wings, and I eat them outside in the backyard, by myself, and throw away the evidence before I go back to bed.",
  "text": "It's honestly the most exciting thrill that I often daydream about and look forward to. I wake up pretty thirsty and bloated though, lol.UPDATE: I'm going to pull this off again sometime in the next couple days. I'll try to document it with some pictures of all the glory!!!!",
  "comments": [
    {
      "commentUrl": "https://www.reddit.com/r/TrueOffMyChest/comments/hdipdr/my_wife_doesnt_know_but_once_or_twice_a_month/t1_fvlehno",
      "userName": "annoyedNYC",
      "commentDate": "4 days ago",
      "description": "I tried sneaking a pizza past my wife once. I forgot to turn off the smart security camera though!",
      "points": "4"
    },
    {
      "commentUrl": "https://www.reddit.com/r/TrueOffMyChest/comments/hdipdr/my_wife_doesnt_know_but_once_or_twice_a_month/t1_fvlenth",
      "userName": "marijuana-",
      "commentDate": "4 days ago",
      "description": "21st century problems amirite",
      "points": "1"
    },
    {
      "commentUrl": "https://www.reddit.com/r/TrueOffMyChest/comments/hdipdr/my_wife_doesnt_know_but_once_or_twice_a_month/t1_fvlrd44",
      "userName": "bemental_",
      "commentDate": "3 days ago",
      "description": "I just found out our grocery store loyalty card number tracks and stores all our orders in the same interface my wife uses to schedule our online grocery order pickups.I thought I was being super sneaky going into the store for a quick treaty treat before picking up our groceries.She’s known the whole time and not brought it up. I married way better then I deserved to have.",
      "points": "308"
    }
  ]
}
```

Community Example:

This will be replicated for each category inside the comunity to save each category posts in a different object.

```json
{
  "title": "Pizza",
  "title2": "r/Pizza",
  "createdAt": "Created Aug 26, 2008",
  "members": 266000,
  "moderators": [
    "6745408",
    "AutoModerator",
    "BotTerminator"
  ],
  "category": "top",
  "posts": [
    {
      "postUrl": "https://www.reddit.com/r/Pizza/comments/hjtnw4/margherita_life/",
      "numberOfVotes": 10000,
      "communityName": "r/Pizza",
      "postedBy": "u/4000xxl",
      "postedDate": "2020-07-02T09:21:51.445Z",
      "title": "Margherita = life"
    },
    {
      "postUrl": "https://www.reddit.com/user/popdusteats/comments/hfam2q/hellofreshs_newest_offer_is_giving_you_80_off/",
      "numberOfVotes": 3,
      "communityName": "user/popdusteats",
      "postedBy": "u/popdusteats",
      "postedDate": "2020-06-25T00:21:51.448Z",
      "title": "HelloFresh's newest offer is giving you $80 OFF including FREE Shipping! HelloFresh helps you add variety to your daily meals. If you're looking for easy to make meals at an affordable price, click here to learn more."
    }
  ]
}
```

### Compute units consumption
Processing ...

### Extend output function

You can use this function to update the result output of this actor. You can choose what data from the page you want to scrape. The output from this will function will get merged with the result output.

The return value of this function has to be an object!

You can return fields to achive 3 different things:
- Add a new field - Return object with a field that is not in the result output
- Change a field - Return an existing field with a new value
- Remove a field - Return an existing field with a value `undefined`


```js
async () => {
  return {
        title: document.querySelecto('title').innerText,
    }
}

```
This example will add the title of the page to the final object:
```json
{
  "title": "Pizza",
  "title2": "r/Pizza",
  "createdAt": "Created Aug 26, 2008",
  "members": 266000,
  "moderators": [
    "6745408",
    "AutoModerator",
    "BotTerminator"
  ],
  "category": "top",
  "posts": [
    {
      "postUrl": "https://www.reddit.com/r/Pizza/comments/hjtnw4/margherita_life/",
      "numberOfVotes": 10000,
      "communityName": "r/Pizza",
      "postedBy": "u/4000xxl",
      "postedDate": "2020-07-02T09:21:51.445Z",
      "title": "Margherita = life"
    },
    {
      "postUrl": "https://www.reddit.com/user/popdusteats/comments/hfam2q/hellofreshs_newest_offer_is_giving_you_80_off/",
      "numberOfVotes": 3,
      "communityName": "user/popdusteats",
      "postedBy": "u/popdusteats",
      "postedDate": "2020-06-25T00:21:51.448Z",
      "title": "HelloFresh's newest offer is giving you $80 OFF including FREE Shipping! HelloFresh helps you add variety to your daily meals. If you're looking for easy to make meals at an affordable price, click here to learn more."
    }
  ],
  "title": "homemade chicken cheese masala pasta" 
}
```
