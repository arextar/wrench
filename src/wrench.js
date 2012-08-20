;(function (NativeWorker) {
  var wrench = window.wrench = {
    init: function (url) {
      if (NativeWorker) {
        return new Worker(new NativeWorker(url))
      }
      else
      {
        return new Worker(new FakeWorker(url))
      }
    }
  }
  
  var this_script = document.getElementsByTagName('script')
  this_script = this_script[this_script.length - 1]
  
  function FakeWorker (src) {
    var iframe = document.createElement('iframe'), messages = this.__queue = [], that = this
    iframe.style.display = 'none'
    iframe.src = this_script.src.replace(/\/[^\/]+$/, '') + '/wrench.html'
    iframe.onload = function () {
      var script = document.createElement('script')
      script.src = location.href.replace(/\/[^\/]+$/, '') + src
      iframe.contentDocument.body.appendChild(script)
      
      script.onreadystatechange = script.onload = function () {
        if (!script.readyState || script.readyState === 'complete' || script.readyState === 'done') {
          var self = that.__self = iframe.contentWindow.self
          for (var i = 0; i < messages.length; i++) self.onmessage({data: messages[i]})
          var queue = self.__queue
          for (i = 0; i < queue.length; i++) that.onmessage({data: queue[i]})
          
          self.postMessage = iframe.contentWindow.postMessage = function (msg) {
            that.onmessage({data: msg})
          }
        }
      }
    }
    document.body.appendChild(iframe)
  }
  
  FakeWorker.prototype.postMessage = function (msg) {
    if (this.__self) this.__self.onmessage({data: msg})
    else this.__queue.push(msg)
  }
  
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
    this.worker.postMessage({type: type, args: this._encodeArgs(len < 2 ? [] : len < 3 ? [a] : len < 4 ? [a, b] : __slice.call(arguments, 1))})
  }
  
  Worker.prototype.on = function (type, fn) {
    var events = this.events, cur = typeof events[type]
    if (cur === 'undefined') events[type] = fn
    else if (cur === 'function') events[type] = [events[type], fn]
    else events[type].push(fn)
  }
  
}(typeof Worker === 'function' ? Worker : false))