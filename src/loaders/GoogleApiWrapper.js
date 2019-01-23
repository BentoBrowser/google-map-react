import React from 'react';
import ReactDOM from 'react-dom';

import { ScriptCache } from './ScriptCache';
import GoogleApi from './GoogleApi';

const defaultMapConfig = {};

const serialize = obj => JSON.stringify(obj);
const isSame = (obj1, obj2) =>
  obj1 === obj2 || serialize(obj1) === serialize(obj2);

const defaultCreateCache = global =>
  options => {
    options = options || {};
    const apiKey = options.apiKey;
    const libraries = options.libraries || ['places'];
    const version = options.version || '3';
    const language = options.language || 'en';
    const url = options.url;
    const client = options.client;
    const region = options.region;

    return ScriptCache(global)({
      google: GoogleApi({
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

const DefaultLoadingContainer = props => <div>Loading...</div>;

export const wrapper = input =>
  WrappedComponent => {
    class Wrapper extends React.Component {
      constructor(props, context) {
        super(props, context);

        // Build options from input
        const options = typeof input === 'function' ? input(props) : input;
        // Store information about loading container
        this.LoadingContainer = options.LoadingContainer ||
          DefaultLoadingContainer;

        this.state = {
          loaded: false,
          map: null,
          google: null,
          options: options,
        };
      }

      componentWillReceiveProps(props) {
        // Do not update input if it's not dynamic
        if (typeof input !== 'function') {
          return;
        }

        // Get options to compare
        const prevOptions = this.state.options;
        const options = typeof input === 'function' ? input(props) : input;

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
      }

      initialize(options) {
        if (!this.root) {
          return; //Don't initialize if we don't have a window to reference
        }

        // Avoid race condition: remove previous 'load' listener
        if (this.unregisterLoadHandler) {
          this.unregisterLoadHandler();
          this.unregisterLoadHandler = null;
        }

        // Load cache factory
        const createCache = options.createCache || defaultCreateCache;

        // Build script
        this.scriptCache = createCache(this.getWindow())(options);
        this.unregisterLoadHandler = this.scriptCache.google.onLoad(
          this.onLoad.bind(this)
        );
      }

      componentDidMount() {
        // Initialize required Google scripts and other configured options
        if (this.root) {
          const options = typeof input === 'function' ? input(props) : input;
          this.initialize(options);
        }
      }

      getWindow = () => {
        let parentWindow = window;
        if (this.root) {
          parentWindow = this.root.ownerDocument.defaultView;
        }
        return parentWindow;
      };

      onLoad(err, tag) {
        this._gapi = this.getWindow().google;

        this.setState({ loaded: true, google: this._gapi });
      }

      render() {
        const { LoadingContainer } = this;
        const props = Object.assign({}, this.props, {
          loaded: this.state.loaded,
          maps: this.getWindow().google,
        });
        delete props.style;

        return (
          <div ref={ref => this.root = ref} style={this.props.style}>
            {this.state.loaded
              ? <WrappedComponent {...props} />
              : <LoadingContainer />}
          </div>
        );
      }
    }

    return Wrapper;
  };

export default wrapper;
