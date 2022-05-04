jest.setTimeout(100000);

require('../models/User'); // now Mongoose will know what a User model is

const mongoose = require('mongoose');
const keys = require('../config/keys');

mongoose.Promise = global.Promise; // telling Mongoose what Promise implementation to use. Here, it's the global NodeJS Promise object
mongoose.connect(keys.mongoURI, {useMongoClient: true})
// The object {useMongoClient: true} avoids a deprecation warning