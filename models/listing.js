const mongoose= require("mongoose");
const listingschema= new mongoose.Schema({
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
        url: String,
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
    }
});  // creating a template a a collections

const Listing= new mongoose.model("Listing", listingschema);  //creating a collection

module.exports= Listing;