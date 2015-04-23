var req = require('request')
    , _ = require('lodash')
    , querystring = require('querystring')
    ;

function Mollom(options) {
    if (!(this instanceof Mollom)) return new Mollom(server, options);

    this.version = 'v1';

    var defaults = {
        server: 'dev.mollom.com', // rest.mollom.com
        secure: false,
        consumer_key: null,
        consumer_secret: null,
        json: true,
        requestMaxAttempts: 3,
        platform: {
            platformName: 'nodejs',
            platformVersion: '0.10.*',
            clientName: 'node-mollom',
            clientVersion:  '0.0.1'
        }
    };

    this._options = _.extend(defaults, options);
    this._req = req;

    this.server = (this._options.secure) ? 'https://' : 'http://';
    this.server += this._options.server;
}

Mollom.prototype = {

    /**
     * Performs a HTTP request to a Mollom server.
     *
     * @param method
     *   The HTTP method to use; i.e., 'GET', 'POST', or 'PUT'.
     * @param path
     *   The REST path/resource to request; e.g., 'site/1a2b3c'.
     * @param data
     *   (optional) Query parameters
     * @param options
     *   (optional) Query options
     *   {
     *      noOauth: 1, // specifically don't attach oAuth (used when creating a new site)
     *   }
     * @param callback
     * @private
     */
    _query: function (method, path, data, options, callback) {
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        //@todo: implement max_attempts
        max_attempts = this._options.requestMaxAttempts;

        var url = this.server + '/' + this.version + '/' + path
            , oauth = {
                consumer_key: this._options.consumer_key, consumer_secret: this._options.consumer_secret
            }
            ;


        if (method == 'POST') {
            var body = { body: querystring.stringify(data) };

            // is oAuth configured ?
            if (options !== null && options.noOAuth) {
                this._req.post(_.extend(body, {url: url, json: this._options.json}), callback);
            }
            else {
                this._req.post(_.extend(body, {url: url, oauth: oauth, json: this._options.json}), callback);
            }
        }
        else if (method == 'GET') {
            // is oAuth configured ?
            this._req.get({url: url, oauth: oauth, json: this._options.json}, callback);
        }
        else {
            // todo
        }
    },

    /**
     * Small check
     *
     * @param callback
     * @private
     */
    _check: function (callback) {
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }
        console.log(this);
    },

    /**
     * Request a text analysis.
     *
     * data = {
     *   postId: 'id', // optional
     *   postTitle: 'ham', // for testing: spam, ham and unsure
     *   postBody: '',
     *   checks: 'spam', // {"spam"|"quality"|"profanity"|"language"}
     *   unsure: '1',
     *   strictness: 'normal', // {"strict"|"normal"|"relaxed"}
     *   authorName: 'authorName',
     *   authorEmail: 'laurent@chardin.org',
     *   authorIp: '127.0.0.1',
     *   authorId: 'authorId',
     *   authorOpenid:
     *   rateLimit
     *   honeypot
     *   stored
     *   url
     *   contextUrl: '',
     *   contextTitle: 'Testing mode'
     * };
     *
     * @param data
     * @param callback
     */
    contentCheck: function (data, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        var path = 'content'
            ;
        if (data.postId) {
            path += '/' + data.postId;
        }
        this._query('POST', path, data, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);
            if (callback) callback(err, result, body);
        });
    },

    /**
     * Create a new captcha.
     *
     * data = {
     *   type: 'image', // image || audio
     *   contentId: '', // optional: The ID of a content resource to link the CAPTCHA to. Allows Mollom to learn when it was unsure.
     *   ssl: 0, // optional: An integer denoting whether to create a CAPTCHA URL using HTTPS (1) or not (0). Only available for paid subscriptions.
     * };
     *
     * @param callback
     */
    createCaptcha: function (callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        var path = 'captcha'
            ;

        this._query('POST', path, data, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);
            if (callback) callback(err, result, body);
        });
    },

    /**
     * Validate a captcha.
     *
     * data = {
     *   id: 'id', // captcha Id
     *   solution: 'xx', // solution provided by the author
     *   authorName: 'authorName', // optional
     *   authorUrl: 'authorUrl', // optional
     *   authorEmail: 'laurent@chardin.org', // optional
     *   authorIp: '127.0.0.1', // optional
     *   authorId: 'authorId', // optional
     *   authorOpenid: 'xx', // optional
     *   rateLimit: 15, // optional: that must have passed by for the same author to post again. Defaults to 15.
     *   honeypot: '', // optonal: The value of a client-side honeypot form element, if non-empty.
     * };
     *
     * @param data
     * @param callback
     */
    checkCaptcha: function (data, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        if (!data.captchaId) {
            throw "MISSING CAPTCHA ID";
        }
        var path = 'captcha/' + data.captchaId
            ;

        this._query('POST', path, data, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);
            if (callback) callback(err, result, body);
        });
    },

    /**
     * Retrieves a list of sites accessible to this client.
     *
     * Used by Mollom resellers only.
     *
     * @param callback
     */
    getSites: function (callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        // Special case here since this API calls does not requires oAuth
        var path = 'site'
            ;

        this._query('GET', path, null, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    /**
     * Retrieves information about a site.
     *
     * @param callback
     */
    getSite: function (callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        // Special case here since this API calls does not requires oAuth
        var path = 'site/' + this._options.consumer_key
            ;

        this._query('GET', path, null, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    /**
     * Create a site and update the current consumer_key.
     *
     * @param data
     * @param callback
     */
    createSite: function (data, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        // Special case here since this API calls does not requires oAuth
        var self = this
            , path = 'site'
            , options = { noOAuth: 1}
            , site = _.extend(this._options.platform, data)
            , message = {}
            ;

        this._query('POST', path, site, options, function (err, res, body) {
            //self._server.debug('Content Check : ' + result);

            if (res.statusCode == '200') {
                //@todo not sure about doing this
                self._options.consumer_key = body.site.publicKey;
                self._options.consumer_secret = body.site.privateKey;
            }

            if (callback) callback(body);
        });
    },
    updateSite: function () {
    },
    verifyKeys: function () {
    },

    /**
     * Delete a site using the current consumer_key.
     */
    deleteSite: function (callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        // Special case here since this API calls does not requires oAuth
        var path = 'site' + '/' + this._options.consumer_key + '/delete',
            self = this
            ;

        this._query('POST', path, null, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (result.statusCode == '200') {
                self._options.consumer_key = null;
                self._options.consumer_secret = null;
            }
            if (callback) callback(body);
        });
    },

    /**
     * Retrieves the blacklist for a site.
     *
     * @param pubkey
     *  Public key for the website. If null, will use the current one.
     * @param callback
     *  Callback having the body in argument
     */
    getBlacklist: function (pubkey, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        if (!pubkey) {
            pubkey = this._options.consumer_key;
        }

        var path = 'blacklist/' + pubkey
            ;

        this._query('GET', path, null, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    /**
     * Returns a given blacklist entry.
     *
     * @param entryId
     * @param pubkey
     * @param callback
     */
    getBlacklistEntry: function (entryId, pubkey, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        if (!pubkey) {
            pubkey = this._options.consumer_key;
        }

        var path = 'blacklist/' + pubkey + '/' + entryId
            ;

        this._query('GET', path, null, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    /**
     * Save a blacklist entry.
     *
     * @param data
     * @param pubkey
     * @param callback
     */
    saveBlacklistEntry: function (data, pubkey, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        if (!pubkey) {
            pubkey = this._options.consumer_key;
        }

        var path = 'blacklist/' + pubkey
            ;

        this._query('POST', path, data, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    /**
     * Delete a blacklist entry.
     *
     * @param entryId
     * @param pubkey
     * @param callback
     */
    deleteBlacklistEntry: function (entryId, pubkey, callback) {
        //@todo check data format
        if (typeof callback !== 'function') {
            throw "FAIL: INVALID CALLBACK.";
        }

        if (!pubkey) {
            pubkey = this._options.consumer_key;
        }

        var path = 'blacklist/' + pubkey + '/' + entryId + '/delete'
            ;

        var data = null;

        this._query('POST', path, data, null, function (err, result, body) {
            //self._server.debug('Content Check : ' + result);

            if (callback) callback(body);
        });
    },

    getWhitelist: function () {
    },
    getWhitelistEntry: function () {
    },
    saveWhitelistEntry: function () {
    },
    deleteWhitelistEntry: function () {
    },

    sendFeedback: function () {
    }

}

exports = module.exports = Mollom;
