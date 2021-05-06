module.exports = {
    isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated())
			return next();
		res.redirect('/login');
	},
    roleAdmin: (req, res, next) => {
		if (req.isAuthenticated() && req.user.role == 'admin')
			return next();
		res.redirect('/');
	},
	roleManage: (req, res, next) => {
		if (req.isAuthenticated() && req.user.role == 'manage')
			return next();
		res.redirect('/');
	},
	roleSys: (req, res, next) => {
		if (req.isAuthenticated() && (req.user.role == 'manage' || req.user.role == 'admin'))
			return next();
		res.redirect('/');
	}
};

