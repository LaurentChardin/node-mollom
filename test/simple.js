#!/usr/bin/env node

var mollom = require('../index');
var should  = require('should'),
    url     = require('url');

var newsite = {
    url: 'localhost',
    email: 'laurent@chardin.org'
};
var mollomclient = new mollom({
    consumer_key: null,
    consumer_secret: null,
    use_test: true //use testing environment
    //debug: true
});

describe('Default suite', function(){
    var mollom_resp;

    before(function(done) {
        //console.log('>>> Before');
        mollomclient.createSite(newsite, function (res) {
            //console.log(res);
            mollom_resp = res;
            done();
        });
    });

    it('should create a site', function(){
        should(mollom_resp.code).be.eql("200");
    });

    it('should rank a spam content', function(done){
        var data = {
            postTitle: 'this is spam', // for testing: spam, ham and unsure
            postBody: 'this is spam',
            checks: 'spam', //{"spam"|"quality"|"profanity"|"language"}
            //unsure: '1', // {1|0}
            //strictness: 'normal', //{"strict"|"normal"|"relaxed"}
            //authorName: 'authorName',
            //authorEmail: 'laurent@chardin.org',
            //authorIp: '127.0.0.1',
            //authorId: 'authorId',
            //authorOpenid:
            //rateLimit:15
            //honeypot //value of a client side honeypot form
            //stored
            //url
            //contextUrl: '',
            contextTitle: 'node-mollomn testing suite'
        };

        mollomclient.contentCheck(data, function (err, res, body) {
            should(body.code).be.eql("200");
            body.should.have.property('content');
            body.content.spamClassification.should.be.eql('spam');

            done();
        });
    });

    it('should rank a ham content', function(done){
        var data = {
            postTitle: 'this is ham',
            postBody: 'this is ham',
            checks: 'spam',
            contextTitle: 'node-mollomn testing suite'
        };

        mollomclient.contentCheck(data, function (err, res, body) {
            should(body.code).be.eql("200");
            body.should.have.property('content');
            body.content.spamClassification.should.be.eql('ham');

            done();
        });
    });

    it('should rank a unsure content', function(done){
        var data = {
            postTitle: 'this is unsure',
            postBody: 'this is unsure',
            checks: 'spam',
            contextTitle: 'node-mollomn testing suite'
        };

        mollomclient.contentCheck(data, function (err, res, body) {
            should(body.code).be.eql("200");
            body.should.have.property('content');
            body.content.spamClassification.should.be.eql('unsure');

            done();
        });
    });


    var captcha_id;
    it('should create a captcha', function(done){
        mollomclient.createCaptcha({type: 'image'}, function (err, res, body) {
            //console.log(body);

            should(body.code).be.eql("200");

            var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
            matcher.test(body.captcha.url).should.be.true;

            captcha_id = body.captcha.id;
            done();
        });
    });
    it('should not validate the captcha', function(done){
        mollomclient.checkCaptcha({id: captcha_id, solution: 'incorrect'}, function (err, res, body) {
            //console.log(body);

            body.code.should.be.eql("200");
            body.captcha.solved.should.be.eql("0");

            done();
        });
    });
    it('should validate the captcha', function(done){
        mollomclient.checkCaptcha({id: captcha_id, solution: 'correct'}, function (err, res, body) {
            //console.log(body);

            body.code.should.be.eql("200");
            body.captcha.solved.should.be.eql("1");

            done();
        });
    });

    after(function(done) {
        //console.log('>>> After');
        if (mollomclient._options.consumer_key) {
            //console.log('Mollom has a consumer key, deleting testing site');
            mollomclient.deleteSite(function (res) {
                //console.log(res);
                done();
            });
        }
    });
});
