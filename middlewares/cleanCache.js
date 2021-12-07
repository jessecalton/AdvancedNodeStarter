const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    // makes sure it calls the `next function, which is the route handler.
    // After the route handler is complete, come back to this here middleware.
    await next();

    // after route handler is done, we clear our cache.
    clearHash(req.user.id);
};