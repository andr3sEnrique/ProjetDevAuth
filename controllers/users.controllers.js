const bcrypt = require('bcrypt');
const path = require('node:path');
const fs = require('node:fs');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const SECRET_KEY = 'uQb3$rXzL#91hN4M*7KdY!@zX&pfQ2!d';
const jwt = require('jsonwebtoken');
const { addToBlacklist, clearBlacklist } = require('../middlewares/auth');


const getUsernameFromToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Authorization token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded.username;
};

module.exports.getLogin = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
}
module.exports.getRegister = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
}

module.exports.getProfileView = async (req, res) => {
    if(req.session?.userId && req.session?.loggedIn) {
        res.sendFile(path.join(__dirname, '../public', 'profile.html'));
    }else {
        res.jsonError("You don't have permission ",401);
    }
}

module.exports.showQrModal = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'qrcode-modal.html'));
}

module.exports.isValidProfile = async (req, res) => {
    try {
        const username = getUsernameFromToken(req);
        const userFile = `./users/${username}.json`;

        if (!fs.existsSync(userFile)) {
            return res.jsonError(`Invalid credentials`, 400);
        }

        const userData = JSON.parse(fs.readFileSync(userFile));
        if (userData.twoFactorEnabled && userData.name && userData.bio) {
            return res.jsonSuccess('Valid profile', 200);
        }

        return res.jsonError(`Invalid Profile`, 400);
    } catch (error) {
        console.error(error);
        return res.jsonError(error.message, 401);
    }
};

module.exports.createAccount = async (req, res) => {
    const { username, password } = req.body;
    const userFile = `./users/${username}.json`;
    if (fs.existsSync(userFile)) {
        return res.jsonError(
            `User existing: ${username}`, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { username, password: hashedPassword, twoFactorEnabled: false, isPublic: false };
    
    fs.writeFileSync(userFile, JSON.stringify(userData));
    const responseData = { ...userData }; 
    delete responseData.password;
    return res.jsonSuccess(responseData, 201);
}

module.exports.updateUser = async (req, res) => {
    try {
        const { username, name, password, bio, isPublic } = req.body;

        const userFile = `./users/${username}.json`;

        if (!fs.existsSync(userFile)) {
            return res.jsonError('User not found', 404);
        }

        const userData = JSON.parse(fs.readFileSync(userFile, 'utf-8'));

        if (name) userData.name = name.trim();

        if (password) {
            userData.password = await bcrypt.hash(password, 10);
        }

        if (bio) userData.bio = bio.trim();

        if (typeof isPublic !== 'undefined') userData.isPublic = isPublic;

        fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));

        return res.jsonSuccess('User updated successfully', 200);
    } catch (error) {
        console.error('Error updating user:', error);
        return res.jsonError('Internal server error', 500);
    }
};

module.exports.getQrCode = async (req, res) => {
    const username = getUsernameFromToken(req);
    const service = 'BlogApp2FA';
    const authenticatorSecret = authenticator.generateSecret();
    const guessableFileName = Buffer.from(username).toString('base64').substring(0,6);
    const directoryName = path.join(__filename, '..', 'otpkeys');

    if(!fs.existsSync(directoryName)) {
        fs.mkdirSync(directoryName);
    }
    fs.writeFileSync(path.join(directoryName, guessableFileName), authenticatorSecret);
    const keyURI = authenticator.keyuri(username, service, authenticatorSecret);
    qrcode.toDataURL(keyURI, (err, imageSrc) => {
        if(err) {
            res.status(500).send('Oups, une erreur est survenue');
        }
        res.send(`<img src="${imageSrc}" alt='qrcode'>`);
    });
}

module.exports.verifyToken = (req, res) => {
    const { token } = req.body;
    let username = req.body.username;

    if(!username) {
        if (req.body.username) username = req.body.username;
        if (req.session?.passport?.user?.username) {
            username = req.session.passport.user.username;
        }else if (req.session?.userId && req.session?.loggedIn) {
            username = req.session.userId;
        }
    }
    
    if (!username) {
        return res.jsonError('User not logged in', 401);
    }

    const guessableFileName = Buffer.from(username).toString('base64').substring(0, 6);
    const directoryName = path.join(__filename, '..', 'otpkeys');
    const secretPath = path.join(directoryName, guessableFileName);

    if (!fs.existsSync(secretPath)) {
        return res.jsonError('2FA not configured for this user.', 404);
    }
    const secret = fs.readFileSync(secretPath, 'utf-8');

    const isValid = authenticator.check(token, secret);

    if (isValid) {
        const userFile = `./users/${username}.json`;
        const userData = JSON.parse(fs.readFileSync(userFile));
        userData.twoFactorEnabled = true;

        fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));
        return res.jsonSuccess('Token verified successfully!', 200);
    } else {
        return res.jsonError('Invalid Token.', 400);
    }
};

module.exports.passwordMatch = async (req, res) => {
    const { username, password } = req.body;
    const userFile = `./users/${username}.json`;
    if (!fs.existsSync(userFile)) {
        return res.jsonError(
            `Invalid credentials`, 400);
    }
    const userData = JSON.parse(fs.readFileSync(userFile));
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
        return res.jsonError(
            `Invalid Credentials`, 400);
    }

    return res.jsonSuccess('password Match', 200);
}

module.exports.isTwoFactorActivate = (req, res) => {
    let username;

    if (req.headers.authorization) {
        username = getUsernameFromToken(req)
    }

    if (!username && req.body.username) {
        username = req.body.username;
    }

    if (!username) {
        return res.jsonError('Username not provided', 400);
    }
    const userFile = `./users/${username}.json`;
    const userData = JSON.parse(fs.readFileSync(userFile));
    if (userData.twoFactorEnabled) {
        res.jsonSuccess('Two-factor authentication is active',200);
    }else {
        res.jsonError('Two-factor authentication is not active', 400)
    }
}
 
module.exports.loginUser = async (req,res) => {
    const { username, password } = req.body;
    const userFile = `./users/${username}.json`;
    if (!fs.existsSync(userFile)) {
        return res.jsonError(
            `Invalid credentials`, 400);
    }
    const userData = JSON.parse(fs.readFileSync(userFile));
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
        return res.jsonError(
            `Invalid Credentials`, 400);
    }

    const token = jwt.sign(
        {
            username: userData.username,
            twoFactorEnabled: userData.twoFactorEnabled
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    req.session.loggedIn = true
    req.session.userId = username;
    req.session.save(err => {
        if (err) {
            console.error('Error saving session:', err);
            return res.jsonError('Failed to save session', 500);
        }
        console.log(`Session saved: ${JSON.stringify(req.session)}`);
        return res.jsonSuccess(token, 200);
    });
}

module.exports.getUsersPublics = async (req, res) => {
    try {
        const usersDir = path.join(__dirname, '../users');
        const userFiles = fs.readdirSync(usersDir);
        const publicUsers = [];
        userFiles.forEach((file) => {
            const filePath = path.join(usersDir, file);
            const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (userData.isPublic) {
                delete userData.password;
                delete userData.twoFactorEnabled;
                delete userData.isPublic;
                publicUsers.push({
                    ...userData
                });
            }
        });

        return res.jsonSuccess(publicUsers, 200);
    } catch (error) {
        console.error('Error retrieving public blogs:', error);
        return res.jsonError('Internal server error', 500);
    }
}

module.exports.logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        addToBlacklist(token);

        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy session:', err);
                return res.jsonError('Failed to logout', 500);
            }
            res.clearCookie('connect.sid');
            return res.jsonSuccess('Logged out successfully', 200);
        });
    } catch (err) {
        console.error('Error during logout:', err);
        return res.jsonError('Internal server error', 500);
    }
};

module.exports.logoutAllDevices = async (req, res) => {
    const { authCode } = req.body;
    const username = getUsernameFromToken(req);
    const guessableFileName = Buffer.from(username).toString('base64').substring(0, 6);
    const directoryName = path.join(__filename, '..', 'otpkeys');
    const secretPath = path.join(directoryName, guessableFileName);

    if (!fs.existsSync(secretPath)) {
        return res.jsonError('2FA not configured for this user.', 404);
    }

    const secret = fs.readFileSync(secretPath, 'utf-8');
    const isValid = authenticator.check(authCode, secret);

    if (!isValid) {
        return res.jsonError('Invalid 2FA code', 400);
    }

    clearBlacklist();
    res.clearCookie('connect.sid');
    return res.jsonSuccess('Logged out from all devices successfully', 200);

}



module.exports.getCurrentUser = async (req, res) => {
    try {
        const username = getUsernameFromToken(req);

        const userFile = `./users/${username}.json`;

        if (!fs.existsSync(userFile)) {
            return res.jsonError('User not found', 404);
        }

        const userData = JSON.parse(fs.readFileSync(userFile));
        const responseData = { ...userData };
        delete responseData.password;

        return res.jsonSuccess(responseData, 200);
    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.jsonError('Internal server error', 500);
    }
};


module.exports.isLogged = async (req, res) => {
    try {
        if (req.session?.passport?.user || (req.session?.loggedIn && req.session?.userId)) {
            return res.jsonSuccess('User is logged in', 200);
        }

        return res.jsonError('User not logged in', 401);
    } catch (err) {
        console.error('Error processing session:', err);
        return res.jsonError('Failed to load session', 500);
    }
};
