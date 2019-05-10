# wtc-history *0.0.1*

> A simple wrapper for the HTML History API


### src/wtc-history.js


#### new History() 

Class representing an abstraction of the history API.






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
