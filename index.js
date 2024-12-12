const express = require('express');
const path = require('node:path');
const passport = require('./config/passport-config');
const passportGit = require('./config/passport-config-git');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const BlogRoute = require('./routes/blog.routes');
const { MONGO_URI } = require('./config/index');
const UserRoute = require('./routes/user.routes');
const { default: mongoose } = require('mongoose');

const { jsonResponseMiddleware } = require('./middlewares/json-response.middleware');
const cors = require('cors');
const fs = require('node:fs');

const app = express();
app.use(cors());

app.use(express.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 3600000, 
     },
    store: new FileStore({
        path: './sessions',
        retries: 5,
        logFn: console.log,
    }),
}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(jsonResponseMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use(passportGit.initialize());
app.use(passportGit.session());


if (!fs.existsSync('./users')) fs.mkdirSync('./users');
if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

function isAuthenticated (req, res, next) {
    console.log(req.session.user);
    if (req.session.user) next()
    else res.send('Access denied <a href="/login">Login</a>')
}

app.use('/blog', BlogRoute);

app.use('/user', UserRoute);

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
})



mongoose.connect(MONGO_URI).then(() => {
    console.log('✅ Connexion to mongodb success');
}).catch(error => {
    console.log(error);
});


app.listen(3000, () => {
    console.log('✅ Server is running on port 3000');
})