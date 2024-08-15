const Joi = require('joi');
const review = require('./models/review');
const Listing = require("./models/listing");

const Listingschema = Joi.object({
    Listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
    }).required()
});

const ReviewSchema= Joi.object({
    Review: Joi.object({
        Comment: Joi.string().required(),
        ratings: Joi.number().required().min(1).max(5),
    })
})
module.exports= Listingschema;
module.exports= ReviewSchema;
