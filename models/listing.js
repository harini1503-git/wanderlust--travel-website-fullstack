const mongoose= require("mongoose");
const Review= require("./review");
const Schema= mongoose;
const { ref } = require("joi");

const listingschema= new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image:{
        filename: String,
        url: {
            type: String,
            default: "https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg"
        }
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: "Review",
    }]
});  // creating a template a a collections

listingschema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing= new mongoose.model("Listing", listingschema);  //creating a collection

module.exports= Listing;