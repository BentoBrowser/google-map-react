'use strict';

exports.__esModule = true;

exports.default = function(props) {
  return (0, _GoogleApiWrapper.wrapper)(props)(_google_map2.default);
};

var _google_map = require('./google_map');

var _google_map2 = _interopRequireDefault(_google_map);

var _GoogleApiWrapper = require('./loaders/GoogleApiWrapper');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
