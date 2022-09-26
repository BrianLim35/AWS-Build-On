const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	res.render('index', {
		title: title
	}) // renders views/index.handlebars
});

// About Page Route
router.get('/about', (req, res) => {
	const author = "Robert Lim";
	let success_msg = 'Success message using success_msg!!';
	let error_msg = 'Error message using error_msg!!';
	let error = 'Error msg using error!!!';
	let errors = [{text: 'First error msg using errors'}, {text: 'Second error msg using errors'}, {text: 'Third error msg using errors'}]
	alertMessage(res, 'success', 'This is an important message', 'fas fa-sign-in-alt', true);
 	alertMessage(res, 'danger', 'Unauthorised access', 'fas fa-exclamation-circle', false);

	res.render('about', {
		author: author,
		success_msg: success_msg,
		error_msg: error_msg,
		error: error,
		errors: errors
	}) // renders views/about.handlebars
});

// User Login Route
router.get('/showLogin', (req, res) => {
	res.render('user/login') // renders views/user/login.handlebars
});

// Register Page Route
router.get('/showRegister', (req, res) => {
	res.render('user/register') // renders views/user/register.handlebars
});

// Logout User
router.get('/logout', (req, res, next) => {
	req.logout(req.user, err => {
		if (err) { return next(err) };
		res.redirect('/');
	});
});

module.exports = router;
