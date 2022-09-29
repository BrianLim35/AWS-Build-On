const passport = require('passport');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const bcrypt = require('bcryptjs'); // for password encryption

// User register URL using HTTP post => /user/register
router.post('/register', (req, res) => {
	let errors = [];

	// Retrieves fields from register page from request body
	let {name, email, password, password2} = req.body;

	// Checks if both passwords entered are the same
	if (password !== password2) {
		errors.push({text: 'Passwords do not match'});
	}

	// Checks that password length is more than 4
	if (password.length < 4) {
		errors.push({text: 'Password must be at least 4 characters'});
	}

	/*
	If there is any error with password mismatch or size, then there must be
	more than one error message in the errors array, hence its length must be more than one.
	In that case, render register.handlebars with error messages.
	*/

	if (errors.length > 0) {
		res.render('user/register', {
			errors,
			name,
			email,
			password,
			password2
		});
	} else {
		// If all is well, checks if user is already registered
		User.findOne({ where: {email: req.body.email} })
			.then(user => { // Retrieved user object stored in variable user
			if (user) {
				// If user is found, that means email has already been registered
				res.render('user/register', {
					error: user.email + ' already registered',
					name,
					email,
					password,
					password2
				});
			} else {
				// Generate salt hashed password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(password, salt, (err, hash) => {
						if (err) throw err;
						password = hash;

						// Create new user record
						User.create({ 
							name, 
							email, 
							password,
							verified: 0, // Add this statement - set verify to false
						}).then(user => {
							alertMessage(res, 'success', user.name + ' added. Please logon to ' + user.email + ' to verify account.', 'fas fa-sign-in-alt', true);
							res.redirect('/showLogin');
						})
					})
				})
			}
        });
    }
});

// Login Form POST => /user/login
router.post('/login', (req, res, next) => {
	// Retrieve from user using email
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (user) { // If user is found
			// User verified. Proceed to authenticate with passport
			passport.authenticate('local', {
				successRedirect: '/outfit/listOutfits',	// Route to /outfit/listOutfits URL
				failureRedirect: '/showLogin', // Route to /login URL
				failureFlash: true
				/* Setting the failureFlash option to true instructs Passport to flash an error message using the message given by
				the strategy's verify callback, if any. When a failure occur, passport passes the message object as error */
			}) (req, res, next);
		} else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/');
		}
	})
});

module.exports = router;