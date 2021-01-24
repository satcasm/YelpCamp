const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const ExpressError = require('../utils/ExpressError');
const upload = multer({
    storage,
    limits: { fileSize: 500000, files: 5 }
});

const Campground = require('../models/campground');

const uploadFiles = async (req, res, next) => {
    const uploadProcess = upload.array('image');
    uploadProcess(req, res, err => {
        if (err instanceof multer.MulterError) {
            return next(new ExpressError(err, 500));
        } else if (err) {
            return next(new ExpressError(err, 500));
        }
        next();
    });
};

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, uploadFiles, validateCampground, catchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:slug')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:slug/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.post("/:slug/like", isLoggedIn, catchAsync(campgrounds.likeCampground)); 

module.exports = router;