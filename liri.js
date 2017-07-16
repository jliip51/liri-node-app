var request = require("request");
var twitter = require("twitter");
var spotify = require("node-spotify-api");
var fs = require("fs");
var inquirer = require("inquirer");
var keys = require("./keys.js");

var command = process.argv[2];
var userInput = process.argv;
var inputArray = [];

for (i = 3; i < userInput.length; i++) {
  inputArray.push(userInput[i]);
}

var input = inputArray.join("+");

//function to retreive data from Twitter API NPM and log results to console//
function getTweets() {
  var clientTW = new twitter(keys.twitterKeys);
  var paramsTW = {
    screen_name: 'volcoder'
  };
  //add functions
  clientTW.get('statuses/user_timeline', paramsTW, function(error, tweets, response) {
    if (error) {
      return console.log('Error occurred: ' + error)
    }
    tweets.forEach(function(result) {
      console.log("\n---------------------------------");
      console.log("@" + result.user.screen_name + " Tweeted at " + result.created_at);
      console.log(result.text);
      console.log("---------------------------------");
        
    });
  });
};

//function to retreive data from spotify API NPM and log results to console//
function getSong() {
  if (input === ""){
    var q = "the+sign+ace+of+base";
  } else {
    q = input;
  }
  var clientSpotify = new spotify(keys.spotifyKeys);
  var paramsSpotify = {
    type: 'track',
    query: q,
    limit: 1,
    offset: 0
  }

  clientSpotify.search(paramsSpotify, function(error, response) {
    if (error) {
      return console.log('Error occurred: ' + error);
    }
    var itemArr = response.tracks.items[0];

    console.log("\nArtist Name: " + itemArr.artists[0].name);
    console.log("Track Name: " + itemArr.name);

    if (itemArr.preview_url != null) {
      console.log("Preview Link: " + itemArr.preview_url);
    } else {
      console.log("Spotify Link: " + itemArr.external_urls.spotify);
    }

    console.log("Album: " + itemArr.album.name);
  });
};

//function to retreive data from OMDB API via Request NPM and log results to console//
function getMovie() {
  if (input === ""){
    var movieName = "mr+nobody";
  } else {
    movieName = input;
  }

  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=40e9cece";

  request(queryUrl, function(error, response, body) {

    if (error) {
      return console.log('Error occurred: ' + error);
    }
    var result = JSON.parse(body);

    console.log("\nMovie Title: " + result.Title);
    console.log("Release Year: " + result.Year);

    for (var i = 0; i < 2; i++) {
      console.log(result.Ratings[i].Source + " Rating: " + result.Ratings[i].Value);
    }
    console.log("Produced In: " + result.Country);
    console.log("Available Languages: " + result.Language);
    console.log("Plot: " + result.Plot);
    console.log("Actors: " + result.Actors);

  });
};

//function to retreive data from random.txt file via fs NPM and call function based on random command to log results to console//
function random(){
  fs.readFile("random.txt", "utf8", function(error, result){
    if (error) {
      return console.log('Error occured: ' + error);
    }
    var randomArray = result.split(",");
    var randomCmd = randomArray[0];
    var randomInput = randomArray[1];
    input = randomInput.split(" ").join("+");

    switch (randomCmd){
      case "spotify-this-song":
      getSong();
      break;

      case "movie-this":
      getMovie();
      break;
    }
  });
};

//Conditional function to call command function based on user input//
switch (command) {
  case "my-tweets":
    getTweets();
    break;

  case "spotify-this-song":
    getSong();
    break;

  case "movie-this":
    getMovie();
    break;

  case "do-what-it-says":
    random();
    break;
}
