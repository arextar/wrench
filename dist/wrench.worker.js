(function(a){function e(a){var b=this;this.worker=a,this.events={},this.fns={},a.onmessage=function(a){b._handleMessage(a.data)}}function f(a,b){return function(){b.emit("__call",a,d.call(arguments))}}var b=this.wrench=new e(self),c=1,d=[].slice;e.prototype._decodeArgs=function(a){for(var b=0;b<a.length;b++)typeof a[b]=="string"&&/^__wrenchFunction/.test(a[b])&&(a[b]=f(a[b],this));return a},e.prototype._encodeArgs=function(a){for(var b=0;b<a.length;b++)if(typeof a[b]=="function"){var d="__wrenchFunction"+c++;this.fns[d]=a[b],a[b]=d}return a},e.prototype._handleMessage=function(a){if(a.type==="__call"){this.fns[a.args[0]].apply(this,a.args[1]);return}var b=this.events[a.type];if(!b)return;var c=this._decodeArgs(a.args);if(typeof b=="function")return b.apply(this,c);for(var d=0;d<b.length;d++)b[d].apply(this,c)},e.prototype.emit=function(a,b,c){var e=arguments.length;this.worker.postMessage({type:a,args:this._encodeArgs(e<2?[]:e<3?[b]:e<4?[b,c]:d.call(arguments,1))})},e.prototype.on=function(a,b){var c=this.events,d=typeof c[a];d==="undefined"?c[a]=b:d==="function"?c[a]=[c[a],b]:c[a].push(b)};var g=Function.prototype.bind||function(){};b.each=function(b,c,d){if(a){for(var e=0;e<b.length;e++)c(b[e],e,b);d&&d()}else{for(var e=0;e<b.length;e++)setTimeout(g.call(c,null,b[e],e,b),1);d&&setTimeout(d,1)}},b.filter=function(a,c,d){var e=[],f=0;b.each(a,function(b,d){c(b,d,a)&&(e[f++]=b)},function(){d&&d(e)})},b.get=function(a,b,c){typeof b=="function"&&(c=b,b="text");var d=new XMLHttpRequest("GET",a);d.onreadystatechange=function(){if(d.readyState===4){var a=d.responseText;d=null,b==="json"&&(a=JSON.parse(a)),c(a)}}}})(typeof window=="undefined");