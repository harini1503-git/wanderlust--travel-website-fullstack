function cosineSimilarity(userPrefs, listing) {
    const userPrefsText = `${userPrefs.location} ${userPrefs.price} ${userPrefs.amenities.join(" ")}`;
    const listingText = `${listing.location} ${listing.price} ${listing.amenities.join(" ")}`;

    const userVector = getVector(userPrefsText);
    const listingVector = getVector(listingText);

    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < userVector.length; i++) {
        dotProduct += userVector[i] * listingVector[i];
        normA += Math.pow(userVector[i], 2);
        normB += Math.pow(listingVector[i], 2);
    }
    
    return normA && normB ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

function getVector(text) {
    const words = text.toLowerCase().split(/\W+/);
    const wordFreq = {};
    words.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
    
    return Object.values(wordFreq);
}

module.exports = { cosineSimilarity };
