
/**
 * Class representing an abstraction of the history API.
 * ## Install
 * ```sh
 * $ npm install wtc-history
 * ```
 * ## Usage
 * Import it in your project.
 * ```javascript
 * import History from 'wtc-history';
 * ```
 * 
 * The history class is a static class, so we call its methods directly on the class itself rather than instanciate it.
 * First, however, we need to intialise the class:
 * ```javascript
 * History.init();
 * ```
 * 
 * Then we can push history states to it:
 * ```javascript
 * History.push('/home'); // The URL is now http://domain.com/home
 * History.push('/about'); // The URL is now http://domain.com/about
 * History.push('/about/team'); // The URL is now http://domain.com/about/team
 * ```
 * 
 * We can also push histroy states that contain a title
 * ```javascript
 * History.push('/work', 'Our Work'); // The URL is now http://domain.com/work and the page title is 'Our Work'
 * ```
 * 
 * Finally, we can also push state data into the history stack. This session data is available using the property 
 * `History.currentState`
 * ```javascript
 * History.push('/admin', 'Admin section', {sessionID: 1234567}); // The URL is now http://domain.com/work and the page title is 'Our Work'
 * ```
 * 
 * If you want to listen to the pop and push states of the History wrapper, just subscribe to `WTCHistory-pop` and `WTCHistory-push` on the document.
 * For example:
 * ```javascript
 * document.addEventListener('WTCHistory-push', (e) => {
 *  console.log(e.detail);
 * });
 * WTCHistory.push('/home', 'This is the Homepage', {testing: false});
 * // This will log:
 * // {
 * //   historyStateURL: '/home',
 * //   historyStateTitle: 'This is the Homepage',
 * //   testing: false
 * // }
 * ```
 * 
 * The History object will work with native browser history interactions as well as with programmatic interactions, these
 * can be easily triggered using `History.back()` and `History.forward()`
 * 
 * @static
 * @namespace
 * @author Liam Egan <liam@wethecollective.com>
 * @version 0.9
 * @created Nov 19, 2016
 */
class History {

  /**
   * Public methods
   */

  /**
   * Emits an event from the history object
   *
   * @example
   * let listener = function(e) {
   *   console.log(e.detail)
   *   e.target.removeEventListener(e.type, arguments.callee);
   * }
   * document.addEventListener("ajax-get-addedToDom", listener);
   *
   * @param  {string} eventID   the event ID to emit
   * @param  {object} data = {} the data to include with the event
   */
  static emitEvent(eventID, data = {}) {
    if (window.CustomEvent) {
      var event = new CustomEvent(eventID, {detail: data});
    } else {
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent(eventID, true, true, data);
    }

    document.dispatchEvent(event);
  }


  /**
    * Initialises the History class. Nothing should be able to
    * operate here unless this has run with a support = true.
    *
    * @Public
    * @param {boolean}  devmode Indicated whether the object is running in dev mode (will log outputs to console)
    * @return {boolean}         Returns whether init ran or not
    */
  static init( devmode = false ) {
    if(this.support)
    {
      // Try to set everything up, and if we fail then return false
      try {
        window.addEventListener('popstate', (e)=> {
          var hasPoppedState = this._popstate(e);
          return hasPoppedState;
        });

        this.devmode      = devmode;

      } catch (e) {

        // If we're in devmode, send our console output
        if(this.devmode) {
          console.warn('error in history initialisation');
          console.log(e);
        }

        return false;
      }

      this.initialised = true;
      return true;
    }

    return false;
  }

  /**
   * Construct and push a URL state
   *
   * @example
   * AJAXObj.push('/dev/foo/bar', 'The title for the history object')
   *
   * @public
   * @param  {string} URL           The URL to push, can be relative, absolute or full
   * @param  {string} title         The title to push.
   * @param  {object} stateObj      A state to push to the stack. This will be popped when naviagting back
   * @return {boolean}              Indicates whether the push succeeded
   */
  static push(URL, title = '', stateObj = {}) {

    var parsedURL = '';

    this.currentState = stateObj;

    // First try to fix the URL
    try {
      parsedURL = this._fixURL(URL, true, true);
    } catch (e) {
      if(this.devmode) {
        console.warn('push failed while trying to fix the URL');
        console.log(e);
      }
      return false
    }

    // Create the state object with the provided state and the parsed URL and title
    stateObj = Object.assign({}, stateObj, {historyStateURL: parsedURL, historyStateTitle: title});
    this.emitEvent('WTCHistory-push', stateObj);

    // If we have API support, push the state to the history object
    if(this.support)
    {
      try {
        // console.log(stateObj);
        this.history.pushState(stateObj, title, parsedURL);
      } catch (e) {
        if(this.devmode) {
          console.warn('push failed while trying to push the state to the history object');
          console.log(e);
        }
        return false;
      }
    // Otherwiser, add the URL as a hashbang
    } else
    {
      window.location.hash = `#!${URL}`;
    }

    return true;
  }

  /**
   * Takes the user back to the previous state. Simply wraps the history object's back method.
   *
   * @public
   */
  static back() {
    this.history.back();
  }

  /**
   * Takes the user forward to the next state. Simply wraps the history object's forward method.
   *
   * @public
   */
  static forward() {
    this.history.forward();
  }


  /**
   * Private methods
   */

  /**
   * Takes a provided URL and returns the version that is usable
   *
   * @private
   * @param  {string} URL                     The URL to be passed
   * @param  {boolean} includeDocRoot = true  Whether to include the docroot on the passed URL
   * @param  {boolean} includeTrails = true   Whether to include found hashes and params
   * @return {string}                         The passed and formatted URL
   */
  static _fixURL(URL, includeDocRoot = true, includeTrails = true) {

    var rtnURL;

    /**
     * URL Regex works like this:
     * ```
        ^
        ([^:]+://           # HTTP(S) etc.
            ([^/]+)         # The URL (if available)
        )?
        (#{@documentRoot})? # The document root, which we want to get rid of
        (/)?                # check for the presence of a leading slash
        ([^\#\?]*)          # The URI - this is what we care about. Check for everything except for # and ?
        (\?[^\#]*)?         # any additional URL parameters (optional)
        (\#\!?.+)?          # Any hashbang trailers (optional)
     * ```
     */
    const URLRegex = RegExp(`^([^:]+://([^/]+))?(${this.documentRoot})?(/)?([^\\#\\?]*)(\\?[^\\#]*)?(\\#\\!?.+)?`);
    const [input, href, hostname, documentRoot, root, path, params, hashbang] = URLRegex.exec(URL);

    // If we're observing the TLDN restraint and the provided URL doesn't match
    // the domain's TLDN, throw a URIError
    if( typeof hostname === 'string' && hostname !== this.TLDN && this.observeTLDN === true ) {
      throw new URIError('Top Level domain name MUST match the primary domain name');
    }

    // If our matched URL has a leading slash, then we want to drop the docRoot
    // in there unless the function param "includeDocRoot" is false.
    if(
      ( typeof root === 'string' && root === '/' ) ||
      ( typeof documentRoot === 'string' && documentRoot === this.documentRoot )
    ) {
      if( includeDocRoot && this.documentRoot !== '/' ) {
        rtnURL = `${this.documentRoot}/${path}`;
      } else {
        rtnURL = `/${path}`;
      }
    // Else if path has resulted in an empty string, assume the path is the root
    } else if( path === '' ) {
      rtnURL = '/'
    // Otherwise, just pass the path completely.
    } else {
      rtnURL = path;
    }

    // If we want to include trails (hashes and params, as determined by a
    // funciton param), then add them to the URL.
    if( includeTrails ) {
      // Append any params
      if( typeof params == 'string' ) {
        rtnURL += params;
      }
        // Append any hashes
      if( typeof hashbang == 'string' ) {
        rtnURL += hashbang;
      }
    }

    return rtnURL;
  }

  /**
   * Listener for the popstate method
   *
   * @private
   * @param  {object} e the passed event object
   * @return void
   */
  static _popstate(e) {
    var base, state;
    if(this.support)
    {
      try {
        state = (base = this.history).state || (base.state = e.state || (e.state = window.event.state));
        this.currentState = e.state;
        this.emitEvent('WTCHistory-pop', e.state);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
    return false;
  }

  /**
   * Getters and setters
   */

  /**
   * (getter/setter) Sets the document root from a passed URL
   * returns the saved document root or a `/` if not set
   *
   * @default '/'
   * @type {string}
   */
  static set documentRoot(documentRoot = '') {

    if(/^\/?$/.test(documentRoot)) {
      this._documentRoot = '/';
      return;
    }

    /**
     * docrootRegex works like this:
     * ```
         ^
         ([^:]+://       # HTTP(S) etc.
             ([^/]+)     # The hostname (if available)
         )?
         /?
         (.*(?=/))?      # the URI to use as the docroot less any available trailing slash
     * ```
     */
    const docrootRegex = /^([^:]+:\/\/([^\/]+))?\/?(.*(?=\/))?/;
    // pass the docroot and hostname
    const [_1, _2, hostname, docroot] = docrootRegex.exec(documentRoot);

    // Error check
    // check for the presence of the reported TLDN
    if(
      typeof hostname === 'string' &&
      hostname != this.TLDN &&
      this.observeTLDN === true
    ) {
      throw new URIError('Top Level domain name MUST match the primary domain name');
    }

    if(docroot) {
      this._documentRoot = `/${docroot}`;
    }
    
  }
  static get documentRoot() {
    return this._documentRoot || '/';
  }

  /**
   * (getter/setter) Provides an error if the user tries to set the history object
   * returns the window history object
   *
   * @type {object}
   */
  static set history(history) {
    throw new Error('The history object is read only');
  }
  static get history() {
    return window.history;
  }

  /**
   * (getter/setter) Sets the top level domain name.
   * returns the recorded TLDN or, by default, window.location.hostname.
   *
   * @type {string}
   */
  static set TLDN(TLDN) {
    // @note We should include some error checking in here
    this._TLDN = TLDN;
  }
  static get TLDN() {
    return this._TLDN || window.location.hostname;
  }

  /**
   * (getter/setter) whether to observe the TLDN or `true` (default).
   *
   * @default true
   * @type {boolean}
   */
  static set observeTLDN(observe) {
    // Check to make sure that the bassed value is of type boolean.
    if(typeof observe === 'boolean')
    {
      this._observeTLDN = observe;
    } else
    {
      console.warn('observeTLDN must be of type boolean');
    }
  }
  static get observeTLDN() {
    if(typeof this._observeTLDN === 'boolean')
    {
      return this._observeTLDN;
    } else
    {
      return true;
    }
  }

  /**
   * (getter/setter) Whether this history object is in devmode. Defaults to false
   *
   * @default false
   * @type {boolean}
   */
  static set devmode(devmode) {
    // Check to make sure that the bassed value is of type boolean.
    if(typeof devmode === 'boolean')
    {
      this._devmode = devmode;
    } else
    {
      console.warn('devmode must be of type boolean');
    }
  }
  static get devmode() {
    if(typeof this._devmode === 'boolean')
    {
      return this._devmode;
    } else
    {
      return false;
    }
  }

  /**
   * (getter/setter) Whether this history object is initialiased.
   *
   * @default false
   * @type {boolean}
   */
  static set initialiased(initialiased) {
    // Check to make sure that the bassed value is of type boolean.
    if(typeof initialiased === 'boolean')
    {
      this._initialiased = initialiased;
    } else
    {
      console.warn('initialiased must be of type boolean');
    }
  }
  static get initialiased() {
    if(typeof this._initialiased === 'boolean')
    {
      return this._initialiased;
    } else
    {
      return false;
    }
  }

  /**
   * (getter/setter) Whether history is supported by the browser or device.
   * Provides an error if the user tries to set the support value, unless the object is in devmode
   *
   * @type {boolean}
   */
  static set support(support = false) {
    // This overrides
    if( this.devmode && typeof support === 'boolean' ) {
      this._support = support;
    }
    throw new Error('The support is read only');
  }
  static get support() {
    return (window.history && window.history.pushState);
  }

  /**
   * (getter/setter) The current state object allows the saving of an object
   * that records state data for the current history state.
   *
   * @type {boolean}
   */
  static set currentState(value) {
    // This overrides
    this._currentState = value;
  }
  static get currentState() {
    return this._currentState || {};
  }

  /**
   * (getter/setter) The length of the history stack
   *
   * @type {integer}
   */
  static get $length() {
    return this.history.length;
  }
}

/**
 * The history pop event. This fires when a state is popped from the history.
 * This event is fired on the document element.
 * 
 * This will return the history's state object including the URL and title of the state that is current in the stack.
 * 
 * | Property | example | Description |
 * | --- | --- | --- |
 * | historyStateURL | `/home` | The parsed URL for the current state. If the history object is set up to do so, this will include the FQDN |
 * | historyStateTitle | `Home` | The title passed to the history state |
 * 
 * @event History#WTCHistory-pop
 * @type {object}
 */

/**
 * The history push event. This fires when a state is pushed into the history.
 * This event is fired on the document element.
 * 
 * This will return the history's state object including the URL and title of the state that is current in the stack.
 * 
 * | Property | example | Description |
 * | --- | --- | --- |
 * | historyStateURL | `/home` | The parsed URL for the current state. If the history object is set up to do so, this will include the FQDN |
 * | historyStateTitle | `Home` | The title passed to the history state |
 * 
 * @event History#WTCHistory-push
 * @type {object}
 */

export default History;
