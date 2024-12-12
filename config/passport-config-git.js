const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const fs = require('node:fs');

passport.serializeUser((user, done) => {
    done(null, { id: user.id, username: user.username, isLogged: user.isLogged });
});

passport.deserializeUser((data, done) => {
    done(null, { id: data.id, username: data.username, isLogged: data.isLogged });
});

passport.use(new GitHubStrategy({
    clientID: 'Ov23lipVOq2A5IIw4uJA',
    clientSecret: '2454c97dc3c708cf2d7677127b99f641c13562db',
    callbackURL: 'http://localhost:3000/user/auth/github/callback',
    scope: ['user:email'],
},
async (token, tokenSecret, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        twoFactorEnabled: false,
        username: profile.emails[0].value,
        isLogged: true,
        isPublic: false,
    };

    const userFile = `./users/${user.username}.json`; 
    if (!fs.existsSync(userFile)) {
        fs.writeFileSync(userFile, JSON.stringify(user, null, 2));
    }

    return done(null, user);
}));

module.exports = passport;
