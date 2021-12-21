// Creating and saving a new user!

const mongoose = require('mongoose');
const User = mongoose.model('User');
// Gonna get errors unless we require Mongoose in our test env (the `mongoose.connect` statement in `index.js`)

module.exports = () => {
    return new User({}).save(); 
    // we don't need the googleId or displayName for saving a user
}