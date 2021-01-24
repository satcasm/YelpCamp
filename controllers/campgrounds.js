const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const ExpressError = require('../utils/ExpressError');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        let campgrounds = await Campground.find({ title: regex }).sort({ createdAt: -1 }).populate('popupText');
        if (campgrounds.length < 1)
            noMatch = "No campgrounds match that query, please try again.";
        res.render("campgrounds/index", { campgrounds, noMatch });
    } else {
        let campgrounds = await Campground.find().sort({ createdAt: -1 }).populate('popupText');
        res.render("campgrounds/index", { campgrounds, noMatch });
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    if (geoData.body.features.length !== 0) {
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${campground.slug}`)
    } else {
        next(new ExpressError('Try adding campground with valid details!', 500));
    }
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        options: {sort: {createdAt: -1}},
        populate: {
            path: 'author'
        }
    }).populate('author likes');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { slug } = req.params;
    const campground = await Campground.findOne({ slug });
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res, next) => {
    const { slug } = req.params;
    const campground = await Campground.findOne({ slug });
    if(campground.location!== req.body.campground.location){
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        campground.geometry = geoData.body.features[0].geometry;
    }
    campground.title = req.body.campground.title;
    campground.description = req.body.campground.description;
    campground.location = req.body.campground.location;
    campground.price = req.body.campground.price;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    let flag = 0;
    if (req.body.deleteImages) {
        if ((campground.images.length) - (req.body.deleteImages.length) !== 0) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        }
        else {
            flag = 1;
            next(new ExpressError('Minimum of one image should be associated with a campground!', 500));
        }
    }
    if (!flag) {
        req.flash('success', 'Successfully updated campground!');
        res.redirect(`/campgrounds/${campground.slug}`);
    }
}

module.exports.deleteCampground = async (req, res) => {
    const { slug } = req.params;
    await Campground.findOneAndDelete({ slug });
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}

module.exports.likeCampground = async (req, res) => {
    let foundCampground= await Campground.findOne({slug: req.params.slug});
    // check if req.user._id exists in foundCampground.likes
    let foundUserLike = await foundCampground.likes.some(function (like) {
        return like.equals(req.user._id);
    });
    if (foundUserLike) {
        foundCampground.likes.pull(req.user._id);
    } else {
        foundCampground.likes.push(req.user);
    }
    await foundCampground.save();
    res.redirect("/campgrounds/" + foundCampground.slug);
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};