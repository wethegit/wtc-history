# wtc-history *0.0.1*

> A simple wrapper for the HTML History API


### src/wtc-history.js


#### new History() 

Class representing an abstraction of the history API.
## Install
```sh
$ npm install wtc-history
```
## Usage
Import it in your project.
```javascript
import History from 'wtc-history';
```

The history class is a static class, so we call its methods directly on the class itself rather than instanciate it.
First, however, we need to intialise the class:
```javascript
History.init();
```

Then we can push history states to it:
```javascript
History.push('/home'); // The URL is now http://domain.com/home
History.push('/about'); // The URL is now http://domain.com/about
History.push('/about/team'); // The URL is now http://domain.com/about/team
```

We can also push histroy states that contain a title
```javascript
History.push('/work', 'Our Work'); // The URL is now http://domain.com/work and the page title is 'Our Work'
```

Finally, we can also push state data into the history stack. This session data is available using the property 
`History.currentState`
```javascript
History.push('/admin', 'Admin section', {sessionID: 1234567}); // The URL is now http://domain.com/work and the page title is 'Our Work'
```

If you want to listen to the pop and push states of the History wrapper, just subscribe to `WTCHistory-pop` and `WTCHistory-push` on the document.
For example:
```javascript
document.addEventListener('WTCHistory-push', (e) => {
 console.log(e.detail);
});
WTCHistory.push('/home', 'This is the Homepage', {testing: false});
// This will log:
// {
//   historyStateURL: '/home',
//   historyStateTitle: 'This is the Homepage',
//   testing: false
// }
```

The History object will work with native browser history interactions as well as with programmatic interactions, these
can be easily triggered using `History.back()` and `History.forward()`






##### Returns


- `Void`



#### History.emitEvent(eventID, data) 

Emits an event from the history object




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| eventID | `string`  | the event ID to emit | &nbsp; |
| data | `object`  | = {} the data to include with the event | &nbsp; |




##### Examples

```javascript
let listener = function(e) {
  console.log(e.detail)
  e.target.removeEventListener(e.type, arguments.callee);
}
document.addEventListener("ajax-get-addedToDom", listener);
```


##### Returns


- `Void`



#### History.init(devmode) 

Initialises the History class. Nothing should be able to
operate here unless this has run with a support = true.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| devmode | `boolean`  | Indicated whether the object is running in dev mode (will log outputs to console) | &nbsp; |




##### Returns


- `boolean`  Returns whether init ran or not



#### History.push(URL, title, stateObj) 

Construct and push a URL state




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| URL | `string`  | The URL to push, can be relative, absolute or full | &nbsp; |
| title | `string`  | The title to push. | &nbsp; |
| stateObj | `object`  | A state to push to the stack. This will be popped when naviagting back | &nbsp; |




##### Examples

```javascript
AJAXObj.push('/dev/foo/bar', 'The title for the history object')
```


##### Returns


- `boolean`  Indicates whether the push succeeded



#### History.back() 

Takes the user back to the previous state. Simply wraps the history object's back method.






##### Returns


- `Void`



#### History.forward() 

Takes the user forward to the next state. Simply wraps the history object's forward method.






##### Returns


- `Void`



#### History._fixURL(URL, includeDocRoot, includeTrails)  *private method*

Takes a provided URL and returns the version that is usable




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| URL | `string`  | The URL to be passed | &nbsp; |
| includeDocRoot | `boolean`  | = true Whether to include the docroot on the passed URL | &nbsp; |
| includeTrails | `boolean`  | = true Whether to include found hashes and params | &nbsp; |




##### Returns


- `string`  The passed and formatted URL



#### URLRegex() 

URL Regex works like this:
```
        ^
        ([^:]+://           # HTTP(S) etc.
            ([^/]+)         # The URL (if available)
        )?
        (#{@documentRoot})? # The document root, which we want to get rid of
        (/)?                # check for the presence of a leading slash
        ([^\#\?]*)          # The URI - this is what we care about. Check for everything except for # and ?
        (\?[^\#]*)?         # any additional URL parameters (optional)
        (\#\!?.+)?          # Any hashbang trailers (optional)
```






##### Returns


- `Void`



#### _popstate(e)  *private method*

Listener for the popstate method




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| e | `object`  | the passed event object | &nbsp; |




##### Returns


-  void



#### docrootRegex() 

docrootRegex works like this:
```
         ^
         ([^:]+://       # HTTP(S) etc.
             ([^/]+)     # The hostname (if available)
         )?
         /?
         (.*(?=/))?      # the URI to use as the docroot less any available trailing slash
```






##### Returns


- `Void`




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
