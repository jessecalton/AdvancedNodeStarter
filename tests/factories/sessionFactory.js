const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    const sessionObject = {
        passport: {
            user: user._id.toString() // _id is a JS obj from the Mongoose model, hence the toString()
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObject))
        .toString('base64'); // session will be the exact same session string as what we'd get using keygrip
    const sig = keygrip.sign('session=' + session); // 'session=' is just what the keygrip library does. No other reason. 

    return { session, sig };
}