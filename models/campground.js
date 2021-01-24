const mongoose = require('mongoose');
const Review = require('./review')
const ExpressError = require('../utils/ExpressError');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    slug: {
        type: String,
    },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.pre('save', async function (next) {
    try {
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(new ExpressError(err, 400));
    }
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Campground = mongoose.model('Campground', CampgroundSchema);
module.exports = Campground;

async function generateUniqueSlug(id, campgroundName, slug) {
    if (!slug) {
        slug = slugify(campgroundName);
    }
    const campground = await Campground.findOne({ slug });
    if (!campground || campground._id.equals(id)) {
        return slug;
    }
    const newSlug = slugify(campgroundName);
    return await generateUniqueSlug(id, campgroundName, newSlug);
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 75);
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);
}