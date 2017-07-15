var request = require("request");
var twitter = require("twitter");
var spotify = require("node-spotify-api");
var twitterKeys = require("./keys.js");
var action = process.argv[2];

var clientTW = new twitter(twitterKeys.twitterKeys);
var params = {screen_name: 'volcoder'};

//add functions
clientTW.get('statuses/user_timeline', paramsTW, function(error, tweets, response) {
  if (!error) {
    console.log(tweets);
  }
});

clientTW.post('statuses/update', {status: 'Learn to code...Save the World'}, function(error, tweet, response) {
  if(error) throw error;
  console.log(tweet);  // Tweet body.
  console.log(response);  // Raw response object.
});
//switch statements with actions defined
