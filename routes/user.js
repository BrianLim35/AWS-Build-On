const passport = require('passport');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const bcrypt = require('bcryptjs'); // for password encryption
const sgMail = require('@sendgrid/mail'); // SendGrid
const jwt = require('jsonwebtoken'); // JWT

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
				// Generate JWT token
				let token;
				jwt.sign(email, 's3cr3Tk3y', (err, jwtoken) => {
					if (err) console.log('Error generating Token: ' + err);
					token = jwtoken;
				});

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
							sendEmail(user.id, user.email, token) // Add this to call sendEmail function
								.then(msg => { // Send email success
									alertMessage(res, 'success', user.name + ' added. Please logon to ' + user.email + ' to verify account.', 'fas fa-sign-in-alt', true);
									res.redirect('/showLogin');
								}).catch(err => { // Send email fail
									alertMessage(res, 'warning', 'Error sending to ' + user.email, 'fas fa-sign-in-alt', true);
									res.redirect('/');
								}).catch(err => console.log(err));
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
			if (user.verified === true) { // Checks if user has been verified
				// User verified. Proceed to authenticate with passport
				passport.authenticate('local', {
					successRedirect: '/outfit/listOutfits',	// Route to /outfit/listOutfits URL
					failureRedirect: '/showLogin', // Route to /login URL
					failureFlash: true
					/* Setting the failureFlash option to true instructs Passport to flash an error message using the message given by
					the strategy's verify callback, if any. When a failure occur, passport passes the message object as error */
				}) (req, res, next);
			} else {
				// User not verified yet
				alertMessage(res, 'danger', user.email + ' has not been verified', 'fas fa-exclamation-circle', true);
				res.redirect('/');
			}
		} else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/');
		}
	})
});

router.get('/verify/:userId/:token', (req, res, next) => {
	// retrieve from user using id
	User.findOne({
		where: {
			id: req.params.userId
		}
	}).then(user => {
		if (user) { // If user is found
			let userEmail = user.email; // Store email in temporary variable
			if (user.verified === true) { // Checks if user has been verified
				alertMessage(res, 'info', 'User already verified', 'fas fa-exclamation-circle', true);
				res.redirect('/showLogin');
			} else {
	
				// Verify JWT token sent via URL
				jwt.verify(req.params.token, 's3cr3Tk3y', (err, authData) => {
					if (err) {
						alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
						res.redirect('/');
					} else {
						User.update({verified: 1}, {
							where: {id: user.id}
						}).then(user => {
							alertMessage(res, 'success', userEmail + ' verified. Please login', 'fas fa-sign-in-alt', true);
							res.redirect('/showLogin');
						});
					}
				});
			}
		} else {
			alertMessage(res, 'danger', 'Unauthorised Access', 'fas fa-exclamation-circle', true);
			res.redirect('/');
		}
	});
});

function sendEmail(userId, email, token){
	sgMail.setApiKey('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');
	let verifyURL = 'http://localhost:5000/user/verify/' + userId + '/' + token;
	
	const message = {
		to: email,
		from: 'brianlim35@gmail.com',
		subject: 'Verify Video Jotter Account',
		text: 'Video Jotter Email Verification',
		html: 'Thank you for registering with Video Jotter.<br><br>Please <a href="' + verifyURL + '"><strong>verify</strong></a> your account.'
		};
		// Returns the promise from SendGrid to the calling function
	return new Promise((resolve, reject) => {
		sgMail.send(message)
		.then(msg => {
			console.log(msg[0].statusCode);
			console.log(msg[0].headers);
			resolve(msg);
		})
		.catch(err => {
			console.error(err);
			reject(err);
		});
	});
}

module.exports = router;