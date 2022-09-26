const express = require('express');
const router = express.Router();
const moment = require('moment');
const Outfit = require('../models/Outfit');
const ensureAuthenticated = require('../helpers/auth');
const alertMessage = require('../helpers/messenger');
const fs = require('fs');
const upload = require('../helpers/imageUpload');

// List outfits belonging to current logged in user
router.get('/listOutfits', ensureAuthenticated, (req, res) => {
    Outfit.findAll({
        where: {
            userId: req.user.id
        },
        raw: true
    })
    .then((outfits) => {
        // pass object to listVideos.handlebars
        res.render('outfit/listOutfits', {
            outfits: outfits
        });
    })
    .catch(err => console.log(err));
});

// Add new outfit
router.get('/showAddOutfit', ensureAuthenticated, (req, res) => {
    res.render('outfit/addOutfit');   // Activates views/video/addVideo.handlebars
})

// Adds new outfit from /outfit/addOutfit
router.post('/addOutfit', ensureAuthenticated, (req, res) => {
    let userId = req.user.id;
    let posterURL = req.body.posterURL;

    // Multi-value components return array of string or undefined
    Outfit.create({
        posterURL,
        fitting: 0,
        notFitting: 0,
        userId
    }) .then((video) => {
        res.redirect('/outfit/listOutfits');
    })
    .catch(err => console.log(err))
});

// // Shows edit video page
// router.get('/edit/:id', ensureAuthenticated, (req, res) => {
//     Outfit.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then((video) => {
//         // Only authorised user who is owner of video can edit it
//         if (req.user.id === video.userId) { // user logged in is the owner of the video
//             checkOptions(video);
//             // call views/video/editVideo.handlebar to render the edit video page
//             res.render('video/editVideo', {
//                 video // passes video object to handlebar
//             });
//         } else { // Show error message & log the user out
//             alertMessage(res, 'danger', 'Unauthorised access to video', 'fas fa-exclamation-circle', true);
//             res.redirect('/logout');
//         }
//     }).catch(err => console.log(err)); // To catch no video ID
// });

// // Creates variables with ‘check’ to put a tick in the appropriate checkbox
// function checkOptions(video){
//     video.chineseLang = (video.language.search('Chinese') >= 0) ? 'checked' : '';
//     video.englishLang = (video.language.search('English') >= 0) ? 'checked' : '';
//     video.malayLang = (video.language.search('Malay') >= 0) ? 'checked' : '';
//     video.tamilLang = (video.language.search('Tamil') >= 0) ? 'checked' : '';

//     video.chineseSub = (video.subtitles.search('Chinese') >= 0) ? 'checked' : '';
//     video.englishSub = (video.subtitles.search('English') >= 0) ? 'checked' : '';
//     video.malaySub = (video.subtitles.search('Malay') >= 0) ? 'checked' : '';
//     video.tamilSub = (video.subtitles.search('Tamil') >= 0) ? 'checked' : '';
// }

// // Save edited video
// router.put('/saveEditedVideo/:id', ensureAuthenticated, (req, res) => {
//     let title = req.body.title;
//     let story = req.body.story.slice(0, 1999);
//     let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
//     let language = req.body.language.toString();
//     let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
//     let classification = req.body.classification;
//     let posterURL = req.body.posterURL;
//     let starring = req.body.starring;

//     Video.update({
//         title,
//         story,
//         classification,
//         language,
//         subtitles,
//         dateRelease,
//         posterURL,
//         starring
//     }, {
//         where: {
//             id: req.params.id
//         }
//     }).then((video) => {
//         // After saving, redirect to router.get(/listVideos...) to retrieve all updated videos
//         res.redirect('/video/listVideos');
//     }).catch(err => console.log(err))
// });

// // Delete the video
// router.get('/delete/:id', ensureAuthenticated, (req, res) => {
//     Video.findOne({
//         where: {
//             id: req.params.id
//         }
//     }).then((video) => {
//         let videoTitle = video.title; // to store the video title to display in success message
//         // Only authorised user who is owner of video can edit it
//         if (req.user.id === video.userId) { // user logged in is the owner of the video
//             Video.destroy({ // delete the video
//                 where: {
//                     id: req.params.id
//                 }
//             }).then(() => { // Redirect to the video list pae with the appropriate success message
//                 alertMessage(res, 'success', videoTitle + ' Video Jot deleted', 'far fa-trash-alt', true);
//                 res.redirect('/video/listVideos');
//             })
//         } else { // Show error message & log the user out
//             alertMessage(res, 'danger', 'Unauthorised access to video', 'fas fa-exclamation-circle', true);
//             res.redirect('/logout');
//         }
//     }).catch(err => console.log(err)); // To catch no video ID
// });

// Upload poster
router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)){
        fs.mkdirSync('./public/uploads/' + req.user.id);
    }
   
    upload(req, res, (err) => {
        if (err) {
            res.json({file: '/img/no-image.jpg', err: err});
        } else {
            if (req.file === undefined) {
                res.json({file: '/img/no-image.jpg', err: err});
            } else {
                res.json({file: `/uploads/${req.user.id}/${req.file.filename}`});
            }
        }
    });
})

module.exports = router;