const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const database = require('./Database/database');
const indexRouter = require('./routes/index');
const User = require('./database/models/users')
const credentials = require('./credentials')
const config = credentials.authProviders

const app = express();
const env = app.get('env')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session()); 

require('./passport')(passport);

//Login with Account
app.route('/login')
.get((req, res) => res.render('login',{
	message: req.flash('error')
	}))
.post(passport.authenticate('login-account', {
	failureRedirect: '/login',
	successRedirect: '/',
	failureFlash : true
}))


//Login with Google
app.get('/auth/google', passport.authenticate('google', { scope : [ 'email', 'profile' ] }));

app.get('/google/callback',
passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
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