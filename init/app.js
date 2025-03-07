const mongoose = require("mongoose");
const Listing = require("../models/listing");
const sampleListings = require("./data");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((err) => {
        console.log(err);
    });

const initData = async () => {
    try {
        await Listing.deleteMany({});
        
        // ✅ Store the modified data
        const modifiedData = sampleListings.map((obj) => ({
            ...obj,
            owner: '67b8b7a4fb5beab0666b7a22'
        }));

        await Listing.insertMany(modifiedData); // ✅ Insert modified data
        console.log("Successfully inserted the initialized data");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
};

initData();
