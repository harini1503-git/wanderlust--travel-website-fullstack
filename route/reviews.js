const express= require("express");
const router= express.Router({mergeParams: true});
const {ReviewSchema}= require("../Schema");
const ExpressError= require("../utils/ExpressError");
const Listing = require("../models/listing");
const Review = require("../models/review");

const validateReview= (err, req, res, next)=>{
    let {error}= ReviewSchema.validate(req.body);
        if(error){
            let errmsg= error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errmsg);
        }else{
            next();
        }
}

//review
//post review route
router.post("/",validateReview, async(req,res,next)=>{
    try{
        let listing= await Listing.findById(req.params.id);
        let newreview = new Review(req.body.review);

        listing.reviews.push(newreview);
        await newreview.save();
        await listing.save();
    
        req.flash("success","New Review Added!!!");
        res.redirect(`/listings/${req.params.id}`)
    }catch(err){
        next(err);
    }
});
 
//delete route for review
router.delete("/:reviewId", async(req,res,next)=>{
    try{
        let {id,reviewId}= req.params;
        await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review Deleted!!!");
        res.redirect(`/listings/${id}`)
    }catch(err){
        next(err);
    }
})

module.exports= router;