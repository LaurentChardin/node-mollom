var req = require('request')
  , _   = require('underscore')
  ;

function Mollom(options) {
  if (!(this instanceof Mollom)) return new Mollom(server, options);

  this.version          = 'v1';
  this.platformName     = 'nodejs';
  this.platformVersion  = '0.10.*';
  this.clientName       = 'node-mollom';
  this.clientVersion    = '0.0.1';

  var defaults = {
      server: 'dev.mollom.com'
    , secure: false
    , consumer_key: null
    , consumer_secret: null
    , json: true
    , requestMaxAttempts: 3
  };

  this._options = _.extend(defaults, options);
  this._req = req;

  this.server = (this._options.secure) ? 'https://' : 'http://';
  this.server += this._options.server;
}

Mollom.prototype = {

  _query: function(method, path, data, options, callback) {
    if ( typeof callback !== 'function' ) {
      throw "FAIL: INVALID CALLBACK.";
    }

    //@todo: implement max_attempts
    max_attempts = this._options.requestMaxAttempts;

    var url = this.server + '/' + this.version + '/' + path
      , oauth = {
          consumer_key: this._options.consumer_key
        , consumer_secret: this._options.consumer_secret
      }
      ;

    if (method == 'POST') {
      // is oAuth configured ?
      if (options !== null && options.noOAuth) {
        this._req.post({url: url, json: this._options.json}, callback);
      }
      else {
        this._req.post({url: url, oauth: oauth, json: this._options.json}, callback);
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
  _check: function(callback) {
    if ( typeof callback !== 'function' ) {
      throw "FAIL: INVALID CALLBACK.";
    }
    console.log(this);
  },

  /**
   * Request a text analysis.
   *
   * data = {
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
  contentCheck : function(data, callback) {
    //@todo check data format
    if ( typeof callback !== 'function' ) {
      throw "FAIL: INVALID CALLBACK.";
    }

    var path = 'content'
      ;

    this._query('POST', path, data, null, function(err, result, body) {
      //self._server.debug('Content Check : ' + result);
      if (callback) callback(err, result, body);
    });
  },

  createCaptcha : function() {},
  checkCaptcha : function() {},

  getSites: function() {},
  getSite : function() {},

  /**
   * Create a site and update the current consumer_key
   *
   * @param data
   * @param callback
   */
  createSite : function(data, callback) {
    //@todo check data format
    if ( typeof callback !== 'function' ) {
      throw "FAIL: INVALID CALLBACK.";
    }

    // Special case here since this API calls does not requires oAuth
    var path = 'site'
      , options = { noOAuth: 1}
      , site = _.extend(this.platform, data)
      , message = {}
      ;

    this._query('POST', path, site, options, function(err, result, body) {
      //self._server.debug('Content Check : ' + result);

      if (result.statusCode == '200') {
        site = body.site;
        this._options.consumer_key = site.publicKey;
        this._options.consumer_secret = site.privateKey;

        message.code = "OK";
        message.text = "Site created and settings updated";
      }
      else {
        message.code = "NOK";
        message.text = "Site creation failed";
        message.error = result;
      }

      if (callback) callback(message);
    });
  },
  updateSite : function() {},
  verifyKeys : function() {},

  /**
   * Delete a site using the current consumer_key
   */
  deleteSite : function() {
    //@todo check data format
    if ( typeof callback !== 'function' ) {
      throw "FAIL: INVALID CALLBACK.";
    }

    // Special case here since this API calls does not requires oAuth
    var path = 'site' + '/' + this.oauth.consumer_key + '/delete'
      ;

    this._query('POST', path, null, null, function(err, result, body) {
      //self._server.debug('Content Check : ' + result);

      if (result.statusCode == '200') {
        site = body.site;
      }
      if (callback) callback(err, result, body);
    });
  },

  getBlacklist : function() {},
  getBlacklistEntry : function() {},
  saveBlacklistEntry : function() {},
  deleteBlacklistEntry : function() {},

  getWhitelist : function() {},
  getWhitelistEntry : function() {},
  saveWhitelistEntry : function() {},
  deleteWhitelistEntry : function() {},

  sendFeedback: function() {}

}

exports = module.exports = Mollom;