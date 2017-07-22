

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

                function evaluate(page, func) {
                    var args = [].slice.call(arguments, 2);
                    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
                    return page.evaluate(fn);
                }

                evaluate(pageIns, function(sel) {
                    // this code has now has access to foo
                    //var json = $.parseJSON(sel);
                    //var tagVals = [];
                    try {
                        var data = $.parseJSON(sel);
                        var tagArr = [];
                        var tagData = [];
                        function tags(m, parentTag, index){
                            var tags = parentTag!=undefined ? $(parentTag).find(m.selector) : $(m.selector);
                            for(var i=0;i<tags.length;i++){
                                var attributes = m.attr ? m.attr.split(','): [];
                                var attrVals = [];
                                for(var cnt = 0; cnt<attributes.length; cnt++){
                                    attrVals.push($(tags[i]).attr(attributes[cnt]));
                                }
                                if(index == undefined)
                                {
                                    tagArr.push({
                                        selector : m.selector,
                                        html : (m.html && m.html == true ? $(tags[i]).html() : ""),
                                        attributes: attrVals,
                                        children: []
                                    });
                                }
                                else{
                                    tagArr[index].children.push({
                                        selector : m.selector,
                                        html : (m.html && m.html == true ? $(tags[i]).html() : ""),
                                        attributes: attrVals,
                                        children: []
                                    })
                                }
                                if(parentTag == undefined)
                                    tagData.push($(tags[i]));
                            }
                        }

                        $(data).each(function(index){
                            var flevel = this.children;
                            var root = this;
                            tags(root);
                            console.log(this.selector);
                            $(flevel).each(function(i){
                                console.log(this.selector);
                                var parent = this;
                                for(var tI = 0; tI< tagData.length; tI++)
                                {
                                    tags(parent, tagData[tI],tI);
                                    //print the first level records
                                    if(typeof this.children !== 'undefined' && this.children.length > 0){
                                        var slevel = this.children;
                                        $(slevel).each(function(i){
                                            console.log(this.selector);
                                            this.selector = parent.selector + " > " + this.selector;
                                            tags(this, tagData[tI],tI);
                                            recursive(slevel);
                                        });
                                    }
                                }

                            });});

                        function recursive(data){
                            $(data).each(function(i){
                                if(typeof this.children !== 'undefined' && this.children.length > 0){
                                    console.log(this.selector);
                                    recursive(this.children);
                                }
                            });}
                        console.log(tagArr);

                        return {
                            html: JSON.stringify(tagArr)
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