const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport')
const session = require('express-session')

const database = require('./Database/database');
const indexRouter = require('./routes/index');
const User = require('./database/models/users')
const credentials = require('./credentials')
const config = credentials.authProviders

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const env = app.get('env')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session()); 

passport.use(new GoogleStrategy({
    clientID        : config.gooogle[env].appId,
    clientSecret    : config.gooogle[env].appSecret,
    callbackURL     : config.gooogle[env].callbackURL,
    profileFields: ['id', 'displayName', 'name', 'picture.type(large)']
},
function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        User.findOne({ 'uid' : profile.id }, function(err, user) {
            if (err)
                return done(err);
            if (user) {
                return done(null, user); 
            } else {
                var newUser = new User();
                newUser.uid = profile.id;                                
                newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                newUser.pic = profile.photos[0].value;
                newUser.role = 'student';
                newUser.created = Date.now();
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

    })

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get('/auth/google', passport.authenticate('google', { scope : 'profile' }));

app.get('/google/callback',
passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/login'
}));

app.use('/', indexRouter);

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.use((req, res) => {
	res.type('text/plain')
	res.status(404)
	res.send('404 - Không tìm thấy trang')
})

app.use((err, req, res, next) => {
	console.error(err.message)
	res.type('text/plain')
	res.status(500)
	res.send('500 - Server Error')
})

const PORT = 3000
app.listen(PORT, () => console.log('http://localhost:' + PORT))