



var app = require('./config/app')();

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
//app.listen(app.get('port'));

var http = require('http');

var httpServer = http.Server(app);
httpServer.listen(app.get('port'), function(){
    console.log("server listening on port", app.get('port'));
});


var io = require('socket.io').listen(httpServer);

io.on('connection', function(socket) {
    console.log('socket.io connected');
    socket.on('crawl', function(data) {
        var crawler = require('./controllers/zombie.server.controller');
        crawler.crawlUsingSocket(data, socket, function(result){
            socket.emit('crawlDone',{ result: result });
        });
    });

    socket.on('convertToJson', function(data) {
        var crawler = require('./controllers/zombie.server.controller');
        crawler.convertXmltoJson(data, socket, function(err, result){
            socket.emit('conversionDone',{ result: result });
        });
    });
});


// Expose app
exports = module.exports = app;

// Logging initialization
console.log('Web Crawler APP started on port 8079');