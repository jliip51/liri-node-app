//Run program in CL by typing node liri.js
var request = require("request");
var twitter = require("twitter");
var spotify = require("node-spotify-api");
var fs = require("fs");
var inquirer = require("inquirer");
var moment = require("moment");
var keys = require("./keys.js");

var command = "";
var input = "";

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

      fs.appendFile("log.txt",
        "command: " + command +
        "\nrequested: " + moment().format('LLLL') +
        "\nuser: " + result.user.screen_name +
        "\nposted: " + result.created_at +
        "\ntweet: " + result.text + ",\n\n", 'utf8',
        function(error) {
          if (error) {
            return console.log('Error occurred: ' + error)
          }
          console.log("Result has been saved to log");
        });
    });
  });
};

//function to retreive data from spotify API NPM and log results to console//
function getSong() {
  if (input === "") {
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
    var linkURL = "";
    if (itemArr.preview_url != null) {
      linkURL = "Preview Link: " + itemArr.preview_url;
    } else {
      linkURL = "Spotify Link: " + itemArr.external_urls.spotify;
    }

    console.log("\nArtist Name: " + itemArr.artists[0].name);
    console.log("Track Name: " + itemArr.name);
    console.log(linkURL);
    console.log("Album: " + itemArr.album.name);

    fs.appendFile("log.txt",
      "command: " + command +
      "\nrequested: " + moment().format('LLLL') +
      "\nArtist Name: " + itemArr.artists[0].name +
      "\nTrack Name: " + itemArr.name +
      "\n" + linkURL +
      "\nAlbum: " + itemArr.album.name + ",\n\n", 'utf8',
      function(error) {
        if (error) {
          return console.log('Error occurred: ' + error);
        }
        console.log("Result has been saved to log");
      });
  });
};

//function to retreive data from OMDB API via Request NPM and log results to console//
function getMovie() {
  if (input === "") {
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

    fs.appendFile("log.txt",
      "command: " + command +
      "\nrequested: " + moment().format('LLLL') +
      "\nMovie Title: " + result.Title +
      "\nRelease Year: " + result.Year +
      "\n" + result.Ratings[0].Source + ":" + "Value: " + result.Ratings[0].Value +
      "\n" + result.Ratings[0].Source + ":" + "Value: " + result.Ratings[0].Value +
      "\nProduced In: " + result.Country +
      "\nAvailable Languages: " + result.Language +
      "\nPlot: " + result.Plot +
      "\nActors: " + result.Actors + ",\n\n", 'utf8',
      function(error) {
        if (error) {
          return console.log('Error occurred: ' + error);
        }
        console.log("Result has been saved to log");
      });
  });
};

//function to retreive data from random.txt file via fs NPM and call function based on random command to log results to console//
function random() {
  fs.readFile("random.txt", "utf8", function(error, result) {
    if (error) {
      return console.log('Error occured: ' + error);
    }
    var randomArray = result.split(",");
    var randomCmd = randomArray[0];
    var randomInput = randomArray[1];
    input = randomInput.split(" ").join("+");

    switch (randomCmd) {
      case "spotify-this-song":
        getSong();
        break;

      case "movie-this":
        getMovie();
        break;
    }
  });
};

inquirer.prompt([
  {
    type: "list",
    message: "Hello! What would you like for me to look up?",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
    name: "command"
  }
]) .then(function(inquirerResponse) {
    switch (inquirerResponse.command) {
      case "my-tweets":
      command = "my-tweets";
      getTweets();
      break;

      case "spotify-this-song":
      inquirer.prompt([
        {
        type: "input",
        message: "What is the title of the song you want me to look up?",
        name: "songTitle"
        }
      ]) .then(function(inquirerResponse){
        song = inquirerResponse.songTitle.split(" ").join("+");
        command = "spotify-this-song";
        input = song;
        getSong();
      });
      break;

     case "movie-this":
     inquirer.prompt([
       {
       type: "input",
       message: "What is the title of the movie you want me to look up?",
       name: "movieTitle"
       }
     ]) .then(function(inquirerResponse){
       movie = inquirerResponse.movieTitle.split(" ").join("+");
       command = "movie-this";
       input = movie;
       getMovie();
     });
     break;

     case "do-what-it-says":
       command = "do-what-it-says";
       random();
     break;
    }
  });
