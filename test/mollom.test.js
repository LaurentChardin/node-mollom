#!/usr/bin/env node

var mollom = require('../index')
    , async = require('async')
    ;

var mollomclient = new mollom({
    consumer_key: null, consumer_secret: null
});

/*
mollomclient._check(function (a) {
    //console.log(a);
});
*/

/**
 * POST http://rest.mollom.com/v1/site
 */

var newsite = {
    url: 'localhost',
    email: 'laurent@chardin.org'
};

// Step 1 : create a new test site
mollomclient.createSite(newsite, function (res) {
    console.log('Creating site:');
    console.log(res);

    // Step 2 : test a spam content
    var data = {
        postTitle: 'this is spam', // for testing: spam, ham and unsure
        postBody: '',
        checks: 'spam', //{"spam"|"quality"|"profanity"|"language"}
        unsure: '1',
        //strictness: 'normal', //{"strict"|"normal"|"relaxed"}
        //authorName: 'authorName',
        //authorEmail: 'laurent@chardin.org',
        //authorIp: '127.0.0.1',
        //authorId: 'authorId',
        //authorOpenid:
        //rateLimit
        //honeypot
        //stored
        //url
        //contextUrl: '',
        contextTitle: 'Testing mode'
    };
    console.log('Posting spam content:');
    console.log(data);

    mollomclient.contentCheck(data, function (err, res, body) {
        console.log('Posting response:');
        console.log(body);

        if (mollomclient._options.consumer_key) {
            // Step x : delete the test site
            mollomclient.deleteSite(function(res){
                console.log('Deleting site:');
                console.log(res);
            });
        }
    });
});


/*

 var url = 'http://dev.mollom.com/v1/site',
 form = {
 url: 'localhost',
 email: 'laurent@chardin.org',
 platformName: 'nodejs',
 platformVersion: '0.10.16',
 clientName: 'node-mollom',
 clientVersion: '0.0.1'
 };


 req.post({url: url, form: form, json: true}, function (e, r, body) {

 console.log(r.statusCode);
 console.log(body);

 if (r.statusCode == '200') {
 console.log('Site created !!');
 site = body.site;


 //GET http://dev.mollom.com/v1/site
 url = 'http://dev.mollom.com/v1/site/' + site.publicKey;

 req.get({url: url, json: true}, function (e, r, body) {
 console.log(r.statusCode);
 console.log(body);

 if (r.statusCode == '200') {
 console.log('Site requested !!');

 // POST http://dev.mollom.com/v1/site/{publicKey}/delete
 url = 'http://dev.mollom.com/v1/site/' + site.publicKey + '/delete';
 oauth =
 { consumer_key: site.publicKey,
 consumer_secret: site.privateKey
 };
 req.post({url: url, oauth: oauth, json: true}, function (e, r, body) {
 console.log(r.statusCode);
 console.log(body);

 if (r.statusCode == '200') {
 console.log('Site deleted !!');
 }
 });
 }
 });
 }
 });

 */

/**
 * POST http://dev.mollom.com/v1/content
 */
/*

 var url = 'http://dev.mollom.com/v1/content',
 oauth =
 { consumer_key: "ifnbhz6na17h12dyzohglcj6d83wokoq",
 consumer_secret: "1s6wrpgzl6ydvtdxqkn9yrz82eubktjp"
 },
 form = {
 postTitle: 'ham', // for testing: spam, ham and unsure
 postBody: '',
 checks: 'spam', //{"spam"|"quality"|"profanity"|"language"}
 unsure: '1',
 //strictness: 'normal', //{"strict"|"normal"|"relaxed"}
 //authorName: 'authorName',
 //authorEmail: 'laurent@chardin.org',
 //authorIp: '127.0.0.1',
 //authorId: 'authorId',
 //contextUrl: '',
 contextTitle: 'Testing mode'
 };

 req.post({url: url, oauth: oauth, form: form, json: true}, function (e, r, body) {

 if(r.statusCode == 200) {
 console.log('Ok');
 }
 else {
 console.log('Error');
 }

 console.log(body);
 });

 */

