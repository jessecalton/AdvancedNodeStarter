const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec; // storing a copy of the untouched `exec` function

mongoose.Query.prototype.exec = async function () { // don't use arrow function, it'll mess with `this`
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    })); // gotta do this to safely copy properties from one object to another.
    // Can't mess with the result of `this.getQuery()` or it'll modify the underlying function call.
    
    // See if we have a value for 'key' in redis
    const cacheValue = await client.get(key);

    // If we do, return that
    if (cacheValue) {
        console.log(cacheValue);
    }

    // Otherwise, issue the query and store the result in redis
    const result = await exec.apply(this, arguments); // calling the original `exec` function.
    console.log(result);
}