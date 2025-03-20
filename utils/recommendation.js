const mongoose = require("mongoose");
const Listing = require("../models/listing");
const { cosineSimilarity } = require("./similarity");

async function getRecommendations(userPreferences) {
    try {
        // Fetch all listings from the database
        const listings = await Listing.find();

        // Calculate similarity scores
        let recommendations = listings.map(listing => {
            return {
                listing,
                score: cosineSimilarity(userPreferences, listing)
            };
        });

        // Sort listings based on similarity score
        recommendations.sort((a, b) => b.score - a.score);

        // Return top 5 recommendations
        return recommendations.slice(0, 5).map(r => r.listing);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
}

module.exports = { getRecommendations };
