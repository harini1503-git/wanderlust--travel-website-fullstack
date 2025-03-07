const { type } = require("express/lib/response");
const { required } = require("joi");
const mongoose= require("mongoose");
const {Schema}= mongoose;

const reviewSchema= new mongoose.Schema({
    Comment: {
        type: String,
        required: true,
    },
    ratings:{
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}) 

const Review= new mongoose.model("Review", reviewSchema);
module.exports= Review;