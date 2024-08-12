const mongoose= require("mongoose");
const {Schema}= mongoose;

const reviewSchema= new mongoose.Schema({
    Comment: String,
    ratings:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}) 

module.exports= new mongoose.model("Review", reviewSchema);