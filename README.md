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
| type | enum | Select the type of search tha will be performed. "Posts" or "Communities and users". | "Posts" |
| searhes | array | An array containing keywords that will be used in the Reddit's search engine. Each item on the array will perform a diferent search. |  |
| maxPostCount | number | How many posts per page should be scraped at max. The real value can be greater since the data is loaded in batches. | 100 |
| maxComments | number | How many comments per page should be scraped at max. The real value can be greater since the data is loaded in batches. | 100 |
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
```json
{
  "title": "Cooking",
  "title2": "r/Cooking",
  "createdAt": "2008-01-25T00:00:00.000Z",
  "moderators": [
    "DrJulianBashir",
    "zem",
    "siouxsie_siouxv2",
    "erikbomb",
    "CorvusCalvaria",
    "skahunter831"
  ],
  "posts": [
    {
      "postUrl": "https://www.reddit.com/r/Cooking/comments/hg11f3/homemade_chicken_cheese_masala_pasta/",
      "numberOfVotes": "•",
      "communityName": "r/Cooking",
      "postedBy": "u/Siyaz19",
      "postedDate": "26 minutes ago",
      "title": "homemade chicken cheese masala pasta"
    },
    {
      "postUrl": "https://www.reddit.com/r/Cooking/comments/hg0ndb/my_hot_dog/",
      "numberOfVotes": "•",
      "communityName": "r/Cooking",
      "postedBy": "u/iScReAm612",
      "postedDate": "55 minutes ago",
      "title": "My Hot Dog"
    },
  ]
},
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
  "title": "Cooking",
  "title2": "r/Cooking",
  "createdAt": "2008-01-25T00:00:00.000Z",
  "moderators": [
    "DrJulianBashir",
    "zem",
    "siouxsie_siouxv2",
    "erikbomb",
    "CorvusCalvaria",
    "skahunter831"
  ],
  "posts": [
    {
      "postUrl": "https://www.reddit.com/r/Cooking/comments/hg11f3/homemade_chicken_cheese_masala_pasta/",
      "numberOfVotes": "•",
      "communityName": "r/Cooking",
      "postedBy": "u/Siyaz19",
      "postedDate": "26 minutes ago",
      "title": "homemade chicken cheese masala pasta"
    },
    {
      "postUrl": "https://www.reddit.com/r/Cooking/comments/hg0ndb/my_hot_dog/",
      "numberOfVotes": "•",
      "communityName": "r/Cooking",
      "postedBy": "u/iScReAm612",
      "postedDate": "55 minutes ago",
      "title": "My Hot Dog"
    },
  ],
  "title": "homemade chicken cheese masala pasta" 
},
```
