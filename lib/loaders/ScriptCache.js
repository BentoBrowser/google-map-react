'use strict';

exports.__esModule = true;
var counter = 0;

var ScriptCache = (exports.ScriptCache = function ScriptCache(global) {
  global._scriptMap = global._scriptMap || new Map();
  var scriptMap = global._scriptMap;
  return function ScriptCache(scripts) {
    var Cache = {};

    Cache._onLoad = function(key) {
      return function(cb) {
        var registered = true;

        function unregister() {
          registered = false;
        }

        var stored = scriptMap.get(key);

        if (stored) {
          stored.promise.then(function() {
            if (registered) {
              stored.error ? cb(stored.error) : cb(null, stored);
            }

            return stored;
          });
        } else {
          // TODO:
        }

        return unregister;
      };
    };

    Cache._scriptTag = function(key, src) {
      if (!scriptMap.has(key)) {
        // Server side rendering environments don't always have access to the `document` global.
        // In these cases, we're not going to be able to return a script tag, so just return null.
        if (typeof global.document === 'undefined') return null;

        var tag = global.document.createElement('script');
        var promise = new Promise(function(resolve, reject) {
          var resolved = false,
            errored = false,
            body = global.document.getElementsByTagName('body')[0];

          tag.type = 'text/javascript';
          tag.async = false; // Load in order

          var cbName = 'loaderCB' + counter++ + Date.now();
          var cb = void 0;

          var handleResult = function handleResult(state) {
            return function(evt) {
              var stored = scriptMap.get(key);
              if (state === 'loaded') {
                stored.resolved = true;
                resolve(src);
                // stored.handlers.forEach(h => h.call(null, stored))
                // stored.handlers = []
              } else if (state === 'error') {
                stored.errored = true;
                // stored.handlers.forEach(h => h.call(null, stored))
                // stored.handlers = [];
                reject(evt);
              }
              stored.loaded = true;

              cleanup();
            };
          };

          var cleanup = function cleanup() {
            if (global[cbName] && typeof global[cbName] === 'function') {
              global[cbName] = null;
              delete global[cbName];
            }
          };

          tag.onload = handleResult('loaded');
          tag.onerror = handleResult('error');
          tag.onreadystatechange = function() {
            handleResult(tag.readyState);
          };

          // Pick off callback, if there is one
          if (src.match(/callback=CALLBACK_NAME/)) {
            src = src.replace(/(callback=)[^\&]+/, '$1' + cbName);
            cb = (global[cbName] = tag.onload);
          } else {
            tag.addEventListener('load', tag.onload);
          }
          tag.addEventListener('error', tag.onerror);

          tag.src = src;
          body.appendChild(tag);

          return tag;
        });
        var initialState = {
          loaded: false,
          error: false,
          promise: promise,
          tag: tag,
        };
        scriptMap.set(key, initialState);
      }
      return scriptMap.get(key);
    };

    // let scriptTags = document.querySelectorAll('script')
    //
    // NodeList.prototype.filter = Array.prototype.filter;
    // NodeList.prototype.map = Array.prototype.map;
    // const initialScripts = scriptTags
    //   .filter(s => !!s.src)
    //   .map(s => s.src.split('?')[0])
    //   .reduce((memo, script) => {
    //     memo[script] = script;
    //     return memo;
    //   }, {});

    Object.keys(scripts).forEach(function(key) {
      var script = scripts[key];

      var tag = global._scriptMap.has(key)
        ? global._scriptMap.get(key).tag
        : Cache._scriptTag(key, script);

      Cache[key] = {
        tag: tag,
        onLoad: Cache._onLoad(key),
      };
    });

    return Cache;
  };
});

exports.default = ScriptCache;
