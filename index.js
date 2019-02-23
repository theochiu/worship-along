var express = require('express');
var app = express();
var pg = require('pg');
var session = require('client-sessions');

const DATABASE_OFFSET = 5000;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(session({
  cookieName: 'session',
  secret: 'icouldsingofyourloveforever',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/home', {page: "home"});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/song-list', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM song_list order by name', function(err, result) {
            done();
            if (err)
            { console.error(err); response.send("Error " + err); }
            else
            { response.render('pages/song-list', {results: result.rows, page: "song-list"} ); }
        });
    });
});

app.get('/manage-songs', function (request, response) {
  response.render('pages/manage-songs', {page: "manage-songs"});
});

app.get('/add-song', function (request, response) {
  response.render('pages/add-song', {page: "add-song"});
});

app.get('/choose-song', function (request, response) {
    var sessionId = request.query.sessionId;
    // escape single quotes
    sessionId = sessionId.split("\'").join("\'\'");
    var songId = request.query.songId;

    console.log("song id is: " + songId);
    console.log("sessionId id is: " + sessionId);

    var query = 'insert into song_choice values (\'' + sessionId + '\', ' + songId + ') on conflict (sessionId) do update set songId = excluded.songId';
    console.log(query);

    if (sessionId && songId) {
        console.log("we made it");
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query(query, function(err, result) {
                done();
                if (err)
                { console.error(err); response.send("LOL FAIL: " + err); }
                else
                { console.log("Successfully chose song" + songId + " for session " + sessionId); response.send("You did it!"); }
            });
        });
    }
});

app.get('/get-song-for-session', function (request, response) {
    var sessionId = request.query.sessionId;
    sessionId = sessionId.split("\'").join("\'\'");

    console.log("sessionId id is: " + sessionId);

    var query = "select * from song_choice where sessionID='" + sessionId + "'";
    console.log(query);

    if (sessionId) {
        console.log("we made it");
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query(query, function(err, result) {
                done();
                if (err)
                { console.error(err); response.send("LOL FAIL: " + err); }
                else
                {
                    if (result && result.rows && result.rows[0]) {
                        console.log("Successfully retrieved song for session" + sessionId);
                        var songId = result.rows[0].songid;
                        var songQuery = "select * from song_list where id='" + songId + "'";
                        console.log("querying for song: " + songId);
                        client.query(songQuery, function(err, result) {
                            done();
                            if(err) {
                                console.error(err); response.send("LOL FAILED: " + err);
                            } else {
                                console.log("Succesfully pulled song: " + songId);
                                response.send(result);
                            }
                        });
                    }

                }
            });
        });
    }
});

app.get('/insert-song-into-db', function (request, response) {
  var songTitle = request.query.songTitle;
  var songLyrics = request.query.songLyrics;

  // get total number of songs for id (wont need to do this for next Database)
  var countQuery = 'select count(*) from song_list';
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(countQuery, function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("LOL FAIL: " + err);}
      else
      {
        console.log("Successfully got song count" + result);
        var songCount = parseInt(result.rows[0].count);
        insertSongIntoDb(songCount + DATABASE_OFFSET, songTitle, songLyrics, response);
      }
    });
  });
});

function insertSongIntoDb(songId, songTitle, songLyrics, response) {
  // escape single quotes
  songTitle = songTitle.split("\'").join("\'\'");
  songLyrics = songLyrics.split("\'").join("\'\'");

  var query = 'insert into song_list (id, name, lyrics) values (' + songId + ', \'' + songTitle + '\', \'' + songLyrics + '\')';
  console.log(query);

  if (songId && songTitle && songLyrics) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(query, function(err, result) {
        done();
        if (err)
        { console.error(err); response.send("LOL FAIL: " + err); }
        else
        { console.log("Successfully inserted song"); response.send(result); }
      });
    });
  }
}

app.get('/check-if-admin', function (request, response) {
  if (request.session && request.session.admin) {
    response.send(true);
  } else {
    response.send(false);
  }
});

app.get('/check-password', function (request, response) {
  var userEnteredPassword = request.query.userEnteredPassword;

  // get total number of songs for id (wont need to do this for next Database)
  var query = 'select value from worship_along_info where name=\'add_password\'';
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(query, function(err, result) {
      done();
      if (err)
      { console.error(err); response.send("LOL FAIL: " + err);}
      else
      {
        console.log("checking password " + result.rows[0].value + " against entered: " + userEnteredPassword);
        var password = result.rows[0].value;
        var passCheck = password === userEnteredPassword;
        request.session.admin = passCheck;
        console.log("setting admin session to: " + passCheck);
        response.send(passCheck);
      }
    });
  });
});