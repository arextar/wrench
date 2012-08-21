# Wrench

## Master API

### wrench.init(url)
Create a worker with the url as source. Returns an instance of Worker.

### Worker#on(type, callback)
Listen for an event on a worker.

### Worker#emit(type[, args...])
Trigger an event on a worker.


## Worker API
Note: `importScripts(` path to wrench.worker.js `)` should be added to worker scripts

### wrench.on(type, callback)
Listen for an event on the master.

### wrench.emit(type[, args...])
Trigger an event on the master.

### wrench.each(array, iterator(value, index, array), callback())
Iterate through each item of an array. It executes synchronously if in a real worker, asynchronously if not as to not block the browser UI.

### wrench.filter(array, iterator(value, index, array), callback(ret))
Filters an array, returning it in the final callback. It executes synchronously if in a real worker, asynchronously if not as to not block the browser UI.

### wrench.map(array, iterator(value, index, array), callback(ret))
Maps an array, returning it in the final callback. It executes synchronously if in a real worker, asynchronously if not as to not block the browser UI.