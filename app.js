const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport')
const session = require('express-session')
const flash = require('connect-flash');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const socketio = require('socket.io')

const database = require('./Database/database');
const indexRouter = require('./routes/index');
const User = require('./database/models/users')
const notifications = require('./database/models/notifications')

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

const PORT = 3000
const httpServer = app.listen(PORT, () => console.log('http://localhost:' + PORT))
const io = socketio(httpServer)

app.post('/addnotice', roleManage, (req, res) => {
	let newNotice = new notifications({
		title: req.body.title,
		content: req.body.content,
		iduser: req.user._id,
		created: Date.now(),
		idcategory: req.body.category
	});
	newNotice.save(function(err) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			notifications.findById(newNotice._id).populate('idcategory').exec((err, noti) => {
				io.sockets.emit('send', noti);
				req.flash('success', 'Thêm thông báo thành công!')
				backURL = req.header('Referer') || '/';
				res.redirect(backURL);
			})
		}
	})
})

io.on('connection', () => {
});	

function roleManage(req, res, next) {
	if (req.isAuthenticated() && req.user.role == 'manage')
		return next();
	res.redirect('/');
}

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


