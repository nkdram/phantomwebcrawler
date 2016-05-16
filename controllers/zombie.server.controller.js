

exports.crawlUsingZombie = function(req,res){

    var Browser = require('../lib/zombie');
    var async = require('async');

    var browser = new Browser({
        site: 'https://nehc.ikatest.com',
        debug: true,
        runScripts: false,
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
    });

// Current this library does not support promises, but you can use async.series
// to get something similar...

    async.series([
        function(done) { browser.visit('/MedicareGW/Medicare/OnlineEnrollment/EnrollList.aspx', done); },
        function(done) { browser.fill('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_UserName', 'vjanarthanan', done); },
        function(done) { browser.fill('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_Password', 'Mar#2016', done); },
        function(done) { browser.pressButton('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_LoginButton', done); }
    ], function() {
        console.log('Content Created!');

        async.series([
            function(done) { browser.visit('/MedicareGW/Medicare/OnlineEnrollment/EnrollList.aspx', done); }
        ], function() {
            console.log('Sec Series!');
            browser.page.open('/MedicareGW/Medicare/OnlineEnrollment/EnrollList.aspx', function(status) {
                console.log('Status: ' + status);
                browser.html('body', function (strHtml) {
                    console.log(strHtml);
                    browser.close();
                    return res.status(200).send({
                        message: 'Crawl Done'
                    });
                });
            });

        });

    });
};

exports.crawlUsingSocket = function(data, socket, callBack){
    var Browser = require('../lib/zombie');
    var async = require('async');

    var browser = new Browser({
        site: data.site,
        debug: true,
        runScripts: false,
        userAgent: data.userAgent? data.userAgent : 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
    });

// Current this library does not support promises, but you can use async.series
// to get something similar...

    socket.emit('log',{message: 'Opening Browser'});
    async.series([
        function(done) { browser.visit( data.url, done); },
        function(done) { browser.fill('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_UserName', 'vjanarthanan', done); },
        function(done) { browser.fill('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_Password', 'Mar#2016', done); },
        function(done) { browser.pressButton('#ContentPlaceHolder1_ContentPlaceHolder_Admin_siteLogin_LoginButton', done); }
    ], function() {
        console.log('Drilling down the Url');
        socket.emit('log',{message: 'Logging in'});
        async.series([
            function(done) { browser.visit(data.url, done); }
        ], function() {
            console.log('Sec Series!');
            socket.emit('log',{message: 'Logging in Success'});
            browser.page.open(data.url, function(status) {
                console.log('Status: ' + status);
                socket.emit('log',{message: 'Navigating to Page'});
                browser.html( data.selector , function (strHtml) {
                    browser.close();
                    socket.emit('log',{message: ' Querying Selecor and Rerieving HTML '});
                    callBack({
                        message: 'Crawl Done',
                        html: strHtml
                    });
                });
            });

        });

    });
};