'use strict';

exports.__esModule = true;
exports.wrapper = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _ScriptCache = require('./ScriptCache');

var _GoogleApi = require('./GoogleApi');

var _GoogleApi2 = _interopRequireDefault(_GoogleApi);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

var defaultMapConfig = {};

var serialize = function serialize(obj) {
  return JSON.stringify(obj);
};
var isSame = function isSame(obj1, obj2) {
  return obj1 === obj2 || serialize(obj1) === serialize(obj2);
};

var defaultCreateCache = function defaultCreateCache(global) {
  return function(options) {
    options = options || {};
    var apiKey = options.apiKey;
    var libraries = options.libraries || ['places'];
    var version = options.version || '3';
    var language = options.language || 'en';
    var url = options.url;
    var client = options.client;
    var region = options.region;

    return (0, _ScriptCache.ScriptCache)(global)({
      google: (0, _GoogleApi2.default)({
        apiKey: apiKey,
        language: language,
        libraries: libraries,
        version: version,
        url: url,
        client: client,
        region: region,
      }),
    });
  };
};

var DefaultLoadingContainer = function DefaultLoadingContainer(props) {
  return _react2.default.createElement('div', null, 'Loading...');
};

var wrapper = (exports.wrapper = function wrapper(input) {
  return function(WrappedComponent) {
    var Wrapper = (function(_React$Component) {
      _inherits(Wrapper, _React$Component);

      function Wrapper(props, context) {
        _classCallCheck(this, Wrapper);

        // Build options from input
        var _this = _possibleConstructorReturn(
          this,
          _React$Component.call(this, props, context)
        );

        _this.getWindow = function() {
          var parentWindow = window;
          if (_this.root) {
            parentWindow = _this.root.ownerDocument.defaultView;
          }
          return parentWindow;
        };

        var options = typeof input === 'function' ? input(props) : input;
        // Store information about loading container
        _this.LoadingContainer = options.LoadingContainer ||
          DefaultLoadingContainer;

        _this.state = {
          loaded: false,
          map: null,
          google: null,
          options: options,
        };
        return _this;
      }

      Wrapper.prototype.componentWillReceiveProps = function componentWillReceiveProps(
        props
      ) {
        // Do not update input if it's not dynamic
        if (typeof input !== 'function') {
          return;
        }

        // Get options to compare
        var prevOptions = this.state.options;
        var options = typeof input === 'function' ? input(props) : input;

        // Ignore when options are not changed
        if (isSame(options, prevOptions)) {
          return;
        }
        // Save new options in component state,
        // and remove information about previous API handlers
        this.setState({
          options: options,
          loaded: false,
          google: null,
        });
      };

      Wrapper.prototype.initialize = function initialize(options) {
        if (!this.root) {
          return; //Don't initialize if we don't have a window to reference
        }

        // Avoid race condition: remove previous 'load' listener
        if (this.unregisterLoadHandler) {
          this.unregisterLoadHandler();
          this.unregisterLoadHandler = null;
        }

        // Load cache factory
        var createCache = options.createCache || defaultCreateCache;

        // Build script
        this.scriptCache = createCache(this.getWindow())(options);
        this.unregisterLoadHandler = this.scriptCache.google.onLoad(
          this.onLoad.bind(this)
        );
      };

      Wrapper.prototype.componentDidMount = function componentDidMount() {
        // Initialize required Google scripts and other configured options
        if (this.root) {
          var options = typeof input === 'function' ? input(props) : input;
          this.initialize(options);
        }
      };

      Wrapper.prototype.onLoad = function onLoad(err, tag) {
        this._gapi = this.getWindow().google;

        this.setState({ loaded: true, google: this._gapi });
      };

      Wrapper.prototype.render = function render() {
        var _this2 = this;

        var LoadingContainer = this.LoadingContainer;

        var props = Object.assign({}, this.props, {
          loaded: this.state.loaded,
          maps: this.getWindow().google,
        });
        delete props.style;

        return _react2.default.createElement(
          'div',
          {
            ref: function ref(_ref) {
              return (_this2.root = _ref);
            },
            style: this.props.style,
          },
          this.state.loaded
            ? _react2.default.createElement(WrappedComponent, props)
            : _react2.default.createElement(LoadingContainer, null)
        );
      };

      return Wrapper;
    })(_react2.default.Component);

    return Wrapper;
  };
});

exports.default = wrapper;
