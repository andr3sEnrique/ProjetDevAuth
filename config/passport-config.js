const passport = require('passport');
const fs = require('node:fs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser((user, done) => {
    done(null, { id: user.id, username: user.username, isLogged: user.isLogged });
});

passport.deserializeUser((data, done) => {
    done(null, { id: data.id, username: data.username, isLogged: data.isLogged });

});

passport.use(new GoogleStrategy({
    clientID: '66883182043-ad7eddct3nnlhd0l1b67fdrnfeiqe5pb.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/user/auth/google/callback',
    scope: ['profile', 'email'],
    },
    async (token, tokenSecret, profile, done) => {
        const user = {
            id: profile.id,
            name: profile.displayName,
            twoFactorEnabled: false,
            isLogged: true,
            isPublic: false,
            username: profile.emails[0].value,
        };
        const userFile = `./users/${user.username}.json`;
        if (!fs.existsSync(userFile)) {

            fs.writeFileSync(userFile, JSON.stringify(user, null, 2));
        }

        return done(null, user);
    }
))

module.exports = passport;