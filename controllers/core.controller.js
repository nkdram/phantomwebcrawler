'use strict';





exports.index = function(req, res) {

    console.log('Web Crawler INDEX REQUEST');
    res.render('index', {
        user: req.user || null
    });
};