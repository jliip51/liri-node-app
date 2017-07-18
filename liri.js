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

      var logData = {
        "command": command,
        "requested": moment().format('LLLL'),
        "user":  result.user.screen_name,
        "posted": result.created_at,
        "tweet": result.text
      };

      var logDataJSON = JSON.stringify(logData, null, 2);

      fs.appendFile("log.txt", logDataJSON, function(error) {
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
    var dataLink = "";
    if (itemArr.preview_url != null) {
      linkURL = "Preview Link: " + itemArr.preview_url;
      dataLink = itemArr.preview_url;
    } else {
      linkURL = "Spotify Link: " + itemArr.external_urls.spotify;
      dataLink = itemArr.external_urls.spotify;
    }

    console.log("\nArtist Name: " + itemArr.artists[0].name);
    console.log("Track Name: " + itemArr.name);
    console.log(linkURL);
    console.log("Album: " + itemArr.album.name);

    var logData = {
      "command": command,
      "requested": moment().format('LLLL'),
      "artist_name": itemArr.artists[0].name,
      "track_name": itemArr.name,
      "url": dataLink,
      "album": itemArr.album.name
    };

    var logDataJSON = JSON.stringify(logData, null, 2);

    fs.appendFile("log.txt", logDataJSON, function(error) {
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

    if (result.Ratings.length > 1){
      for (var i = 0; i < 2; i++) {
        console.log(result.Ratings[i].Source + " Rating: " + result.Ratings[i].Value);
        var dataLogRating = [{
          "source": result.Ratings[0].Source, "value": result.Ratings[0].Value
        }, {
          "source": result.Ratings[1].Source, "value": result.Ratings[1].Value
        }];
      }
    } else {
        console.log(result.Ratings.Source + " Rating: " + result.Ratings.Value);
        dataLogRating = [{"source": result.Ratings.Source, "value": result.Ratings.Value}];
    };

    console.log("Produced In: " + result.Country);
    console.log("Available Languages: " + result.Language);
    console.log("Plot: " + result.Plot);
    console.log("Actors: " + result.Actors);

    var logData = {
      "command": command,
      "requested": moment().format('LLLL'),
      "movie_title": result.Title,
      "release_year": result.Year,
      "ratings": dataLogRating,
      "country": result.Country,
      "language": result.Language,
      "plot": result.Plot,
      "actors": result.Actors
    };

    var logDataJSON = JSON.stringify(logData, null, 2);

    fs.appendFile("log.txt", logDataJSON, function(error) {
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

function readLog() {
  fs.readFile("log.txt", "utf8", function(error, result){
    if(error) {
      return console.log('Error occured: ' + error);
    }
    console.log(result);
  })
}

inquirer.prompt([
  {
    type: "list",
    message: "Hello! What would you like for me to look up?",
    choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", "read-log"],
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

     case "read-log":
       command = "read-log";
       readLog();
     break;

    }
  });
