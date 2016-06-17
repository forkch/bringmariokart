var express = require('express');
var bodyParser = require('body-parser')
var app = express();

var redis = require("redis")


app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); // to support URL-encoded bodies


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

var redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});


// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});

app.post('/rest/bringmariokart', function (request, response) {

    var commandText = request.body.text;


    console.log(request.body.text);
    redisClient.get("stats", function (err, reply) {
        // reply is null when the key is missing
        if(reply == null) {
            reply = "{ \"games\" : []}";
        }
        console.log(reply);

        var stats = JSON.parse(reply);
        var d = new Date();
        var dateAsIsoString = d.toISOString();

        stats.games.push({"player" : commandText, "date" : dateAsIsoString})

        redisClient.set("stats", JSON.stringify(stats));

        response.end('Thanks! Player ' + commandText + ' won the round at ' + dateAsIsoString);
    });


});

app.get('/rest/bringmariokart', function (request, response) {
    redisClient.get("stats", function (err, reply) {
        response.end(reply);
    });

});


app.delete('/rest/bringmariokart', function (request, response) {
    redisClient.set("stats", "{ \"games\" : []}");
    response.end("stats deleted");

});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


