const express= require("express");
const router= express.Router({mergeParams: true});
const {Listingschema}= require("../Schema");
const ExpressError= require("../utils/ExpressError");
const Listing = require("../models/listing");

const validateListing= (err, req, res, next)=>{
    let {error}= Listingschema.validate(req.body);
        if(error){
            let errmsg= error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errmsg);
        }else{
            next();
        }
}

router.get("/", async(req,res)=>{
    let allListings= await Listing.find({});
    res.render("listings/indexroot.ejs", {allListings});
})

router.get("/listings", async(req,res)=>{
    let allListings= await Listing.find({});  //mongodb query to find the data from the database
    res.render("listings/indexroot.ejs", {allListings});
})

router.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
})

router.post("/",validateListing,async(req, res, next)=>{
        try{
            const newListing= new Listing(req.body);  //create a new listings
            await Listing.insertMany(newListing);   //inserting new 
            res.redirect("/listings");
        }catch(err){
            next(err);
        }
    })

router.get("/:id", async(req,res,next)=>{
    try{
        let {id}= req.params;
        const listing = await Listing.findById(id).populate({path: 'reviews'});  // Mongoose will handle the conversion internally
        res.render('listings/show', { listing });
    }catch(err){
        next(err);
    }
})

router.get("/:id/edit", async(req,res,next)=>{
   try{
    let{id}= req.params;
    const listing= await Listing.findById(id);  // Mongoose will handle the conversion internally
     res.render("listings/edit.ejs",{listing});
   }catch(err){
    next(err);
   }
});

router.put("/:id",validateListing, async(req,res,next)=>{
    try{
        let {id}= req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});;  // Mongoose will handle the conversion internally
        res.redirect(`/listings/${id}`);
    }catch(err){
        next(err);
    }
})

router.delete("/:id", async(req,res,next)=>{
   try{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
   }catch(err){
    next(err);
   }
});

module.exports= router;