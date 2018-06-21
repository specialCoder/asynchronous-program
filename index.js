/** promiseA 分两部分：Promise Deferred */

/**
 * util
 */
const util = {
    inherits:function(sub,sup){
        const newObj = Object.create(sup.prototype);
        sub.prototype = newObj;
    }
}
/**
 * 发布订阅模式
 * 模拟实现EventEmitter
 * TODO：
 * 1.移除事件监听未设置
 * 2.没有实现then的链式调用
 */
function OwnerEventEmitter(){
    this.events = {};
    this.onceEvents = {};
}
OwnerEventEmitter.prototype.$once = function(eventName,callback){
    const events = this.onceEvents;
    if(typeof callback === 'function'){
        if(!events[eventName]){
            events[eventName] = [];
        }
        events[eventName].push(callback);
    }else{
        throw Error('TypeError : callback must is function type');
    }
}
OwnerEventEmitter.prototype.$on = function(eventName,callback){
    const events = this.events;
    if(typeof callback === 'function'){
        if(!events[eventName]){
            events[eventName] = [];
        }
        events[eventName].push(callback);
    }else{
        throw Error('TypeError : callback must is function type');
    }
}
OwnerEventEmitter.prototype.$emit = function(eventName,data){
    const onevents = this.events[eventName] || [];
    const onceEvents = this.onceEvents[eventName] || [];
    for(let i=0,len1= onevents.length;i<len1;i+=1){
        const func = onevents[i];
        func(data);
    }
    for(let i=0,len2=onceEvents.length;i<len2;i+=1){
            const func = onceEvents[i];
            func(data);
    }
    delete this.onceEvents[eventName];
}

// test
const e = new OwnerEventEmitter();
e.$on('error',()=>{console.log('error')})// error error error
e.$emit('error'); 
e.$once('error',()=>{console.log('error');});// error
e.$emit('error');
e.$emit('error');

/**
 * Promises实现部分
 */
function Promise(){
    OwnerEventEmitter.call(this);
}
util.inherits(Promise,OwnerEventEmitter);
Promise.prototype.then = function(fullfillHandler,errorHandler,progressHandler){
    if( typeof fullfillHandler === 'function'){
        this.$once('success',fullfillHandler);
    }
    if(typeof errorHandler === 'function'){
        this.$once('error',errorHandler);
    }
    if(typeof progressHandler === 'function'){
        this.$on('progress',progressHandler);
    }
}

/** 
 * Deferred 实现部分 
 */

function Deferred(){
    this.state = 'unfullfilled';
    this.promise = new Promise();
}

Deferred.prototype.resolve = function(obj){
    this.state = 'fullfilled';
    this.promise.$emit('success',obj);
}
Deferred.prototype.reject = function(error){
    this.state = 'failed';
    this.promise.$emit('error',error);
}
Deferred.prototype.reject = function(data){
    this.state = 'progress';
    this.promise.$emit('progress',data);
}

/**
 * test
 */
const fullfillHandler = (result)=>{
    console.log('resolved ====>',result);
};
const errorHandler = (result)=>{
    console.log('rejected ====>',result);
};
const deferred = new Deferred();
deferred.promise.then(fullfillHandler,errorHandler);
deferred.resolve('reject');
