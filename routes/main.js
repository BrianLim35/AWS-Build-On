const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Outfit = require('../models/Outfit');
const ensureAuthenticated = require('../helpers/auth');

router.get('/', (req, res) => {
	const title = 'Video Jotter';
	res.render('index', {
		title: title
	}) // renders views/index.handlebars
});

// List outfits belonging to current logged in user
router.get('/outfits', (req, res) => {
    Outfit.findAll({
        where: {
            public: 1
        },
        raw: true
    })
    .then((outfits) => {
        // pass object to listVideos.handlebars
        res.render('publicOutfits', {
            outfits: outfits,
        });
    })
    .catch(err => console.log(err));
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
