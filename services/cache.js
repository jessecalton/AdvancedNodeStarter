const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec; // storing a copy of the untouched `exec` function

// set the `useCache` prop (which we just made up) to true,
// so that we use Redis 
mongoose.Query.prototype.cache = function(options = {}) {
    // `options` will be our top-level hash key

    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || ''); // `hashKey` is another made-up name
    
    return this; // to make it chainable
}

mongoose.Query.prototype.exec = async function () { // don't use arrow function, it'll mess with `this`
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    })); // gotta do this to safely copy properties from one object to another.
    // Can't mess with the result of `this.getQuery()` or it'll modify the underlying function call.
    
    // See if we have a value for 'key' in redis
    const cacheValue = await client.hget(this.hashKey, key);

    // If we do, return that
    if (cacheValue) {
        const doc = JSON.parse(cacheValue);
        
        return Array.isArray(doc) 
        ? doc.map(d => new this.model(d))
        : new this.model(doc);
        
        // `model` is the base class for a User or Blog w/in our application (could be anything, really)
        // this allows us to turn our cacheValue into an actual document that our app can use.
        // Basically the same as doing `new Blog({title: 'Hi", content: 'Dude})`
    }

    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments); // calling the original `exec` function. Returns a Mongoose Document instance.
    
    client.hset(this.hasKey, key, JSON.stringify(result), 'EX', 10);
    
    return result
}