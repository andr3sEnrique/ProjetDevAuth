const jwt = require('jsonwebtoken');
const SECRET_KEY = 'uQb3$rXzL#91hN4M*7KdY!@zX&pfQ2!d';
const blacklist = new Set();

function verifyJWToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    if (blacklist.has(token)) {
        return res.status(401).json({ success: false, message: 'Token is blacklisted' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
}

function addToBlacklist(token) {
    blacklist.add(token);
}

function isTokenBlacklisted(token) {
    return blacklist.has(token);
}

function clearBlacklist() {
    blacklist.clear();
}

module.exports = {
    verifyJWToken,
    addToBlacklist,
    isTokenBlacklisted,
    clearBlacklist,
};
