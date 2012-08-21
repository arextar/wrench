;(function (sync) {
  var wrench = this.wrench = new Worker(self)
  
  var uid = 1, __slice = [].slice
  
  function Worker (worker) {
    var that = this
    this.worker = worker
    this.events = {}
    this.fns = {}
    worker.onmessage = function (e) {
      that._handleMessage(e.data)
    }
  }
  
  function makeRemoteFunction (id, worker) {
    return function () {
      worker.emit('__call', id, __slice.call(arguments))
    }
  }
  
  Worker.prototype._decodeArgs = function (args) {
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'string' && /^__wrenchFunction/.test(args[i])) {
        args[i] = makeRemoteFunction(args[i], this)
      }
    }
    return args
  }
  
  Worker.prototype._encodeArgs = function (args) {
    for (var i = 0; i < args.length; i++) {
      if (typeof args[i] === 'function') {
        var id = '__wrenchFunction' + (uid++)
        this.fns[id] = args[i]
        args[i] = id
      }
    }
    return args
  }
  
  Worker.prototype._handleMessage = function (data) {
    if (data.type === '__call') {
      this.fns[data.args[0]].apply(this, data.args[1])
      return;
    }
    
    var handlers = this.events[data.type]
    if (!handlers) return
    var args = this._decodeArgs(data.args)
    
    if (typeof handlers === 'function') return handlers.apply(this, args)
    for (var i = 0; i < handlers.length; i++) handlers[i].apply(this,  args)
  }
  
  Worker.prototype.emit = function (type, a, b) {
    var len = arguments.length
    this.worker.postMessage({type: type, args: len < 2 ? [] : this._encodeArgs(len < 3 ? [a] : len < 4 ? [a, b] : __slice.call(arguments, 1))})
  }
  
  Worker.prototype.on = function (type, fn) {
    var events = this.events, cur = typeof events[type]
    if (cur === 'undefined') events[type] = fn
    else if (cur === 'function') events[type] = [events[type], fn]
    else events[type].push(fn)
  }
  
  // Utility functions
  var __bind = Function.prototype.bind || function () {
    // TODO: polyfill
  }
  
  wrench.each = function (array, each, callback) {
    if (sync) {
      for (var i = 0; i < array.length; i++) each(array[i], i, array)
      if (callback) callback()
    }
    else
    {
      for (var i = 0; i < array.length; i++) setTimeout(__bind.call(each, null, array[i], i, array), 1)
      if (callback) setTimeout(callback, 1)
    }
  }
  
  wrench.filter = function (array, filter, callback) {
    var ret = [], i = 0
    wrench.each(array, function (value, index) {
      if (filter(value, index, array)) ret[i++] = value
    }, function () {
      if (callback) callback(ret)
    })
  }
  
  wrench.get = function (url, type, callback) {
    if (typeof type === 'function') {
      callback = type
      type = 'text'
    }
    var xhr = new XMLHttpRequest('GET', url)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var res = xhr.responseText
        xhr = null
        if (type === 'json') res = JSON.parse(res)
        callback(res)
      }
    }
  }
}(typeof window === 'undefined'))