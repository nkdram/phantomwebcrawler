

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
    var async = require('async');
    const Browser = require('phantom');

    socket.emit('log',{message: 'Emulating Browser'});
    socket.emit('log',{message: 'Opening Browser'});
    Browser.create(['--ignore-ssl-errors=no'], {logLevel: 'error'})
        .then(function (instance) {
            var processId = instance.process.pid;
            console.log("===================> instance: ", processId);
            var phantom = instance;
            var pageIns = null;
            phantom.createPage().then(function (page,error) {
                var url = data.url;
                socket.emit('log',{message: 'Opening Page'});
                pageIns = page;
                return page.open(url);
            }).catch(function(e) {
                socket.emit('log',{message: e});
            }).then(function(cp){
               return pageIns.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js");
                //return pageIns.property('content');
            }).catch(function(e) {
                socket.emit('log',{message: e});
            }).then(function(jp){
                /*pageIns.invokeMethod('evaluate', function(sel) {
                    console.log('TES', sel);
                    var strHtml='';
                    var selector = "'"+sel+"'";
                    console.log(selector);
                    $(selector).each(function() {
                        strHtml+= $(this).html();
                    });
                    return {
                        html: strHtml
                    };
                    /!*console.log(sel);
                    *!/
                }, data.selector).then(function(result) {
                    socket.emit('log',{message: 'Crawl Done'});
                    callBack({
                        message: 'Crawl Done',
                        html: result.html
                    });
                    phantom.exit();
                });*/

                function evaluate(page, func) {
                    var args = [].slice.call(arguments, 2);
                    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
                    return page.evaluate(fn);
                };
                evaluate(pageIns, function(sel) {
                    // this code has now has access to foo
                    //var json = $.parseJSON(sel);
                    //var tagVals = [];
                    try {
                        var json = [{
                            "selector" :".team-member",
                            "html" : false,
                            "children" :
                                [
                                    {
                                        "selector" :"a",
                                        "html" : false,
                                        "children" :  [],
                                        "attr" : "href"
                                    },
                                    {
                                        "selector" :"p.text-muted",
                                        "html" : true,
                                        "children" :  [],
                                        "attr" : "href"
                                    }
                                ]
                        }];
                        var tagVals = [];
                        $.each(json, function (index, parent) {

                            if (parent && parent.selector) {
                                var tags = $(parent.selector);
                                for(var i=0;i<tags.length;i++){
                                    tagVals.push({
                                        selector : parent.selector,
                                        html : $(tags[i]).html()
                                    });
                                }


                            }
                        });
                        return {
                            html: JSON.stringify(tagVals)
                        };
                    }
                    catch(ex){
                        return {
                            html: ex
                        };
                    }

                }, data.selector).then(function(result) {
                    socket.emit('log',{message: 'Crawl Done'});
                    callBack({
                        message: 'Crawl Done',
                        html: result.html
                    });
                    phantom.exit();
                });


            });
        });

};