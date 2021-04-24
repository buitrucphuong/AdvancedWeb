var express = require('express')
var User = require('./database/models/users')
var credentials = require('./credentials')
var GoogleStrategy = require('passport-google-oauth20').Strategy
var config = credentials.authProviders

var app = express();
var env = app.get('env')
module.exports = function(passport) {
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
                if(profile.emails[0].value.split('@', 2)[1]!=='student.tdtu.edu.vn'){
                    return done(null,false, {message: 'Vui lòng đăng nhập bằng email sinh viên!'});
                }
                if (user) {
                    return done(null, user); 
                } else {
                    var newUser = new User();
                    newUser.uid = profile.id;                                
                    newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                    newUser.pic = profile.photos[0].value;
                    newUser.role = 'student';
                    newUser.created = Date.now();
                    newUser.email = profile.emails[0].value; 
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
        //done(null, user.id);
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
        done(null, user);
    });
}