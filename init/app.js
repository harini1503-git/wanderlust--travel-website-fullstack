const mongoose= require("mongoose");
const Listing = require("../models/listing");
const sampleListings = require("./data");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/travel", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})

const initData= async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(sampleListings);
    console.log("Successfully inserted the initialized data");
}
initData();