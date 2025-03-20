const res = require("express/lib/response");
const Listing = require("./models/listing");
const { error } = require("./Schema");
const Review = require("./models/review");

module.exports.isLoggedIn= (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error", "You must be logged in to create listings");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}

module.exports.isowner= async(req,res,next)=>{
    let {id}= req.params;
        let listing= await Listing.findById(id);
        if(!res.locals.currUser && listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("error", "You are not the owner of this listings!!!");
            return res.redirect(`/listings/${id}`);
        }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    // Ensure the current user is set
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in to perform that action!");
        return res.redirect("/login");
    }

    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    
    // Optional: Check if the review exists
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    
    // Check if the current user is the author of the review
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this review!!!");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
}
