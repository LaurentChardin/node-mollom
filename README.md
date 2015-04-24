node-mollom
===============

Mollom REST API Client for node.js

Dependencies
---------

* request
* lodash

Features
---------

* Issues

(Only Issues API is available now.)


Install
---------

Install from npm:

    $ npm install node-mollom

How to use
------------

Create a client

    var mollomclient = new mollom({
        consumer_key: null,
        consumer_secret: null
    });

Use the client

    mollomclient.createSite({url: 'xxx', email: 'xxx'}, callback(result){});
    mollomclient.deleteSite(callback(result){});
    mollomclient.contentCheck(data, callback(err, res, body){});

Link
------

* https://docs.acquia.com/mollom/api/rest

