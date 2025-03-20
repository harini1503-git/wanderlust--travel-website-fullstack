require('dotenv').config()     // dotenv npm package is used to load the .env file to process.env
console.log(process.env.SECRET)

const { name } = require("ejs");
const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing = require("./models/listing");
const path= require("path");
const methodoverride= require("method-override");
const engine = require('ejs-mate');
const wrapAsync= require("./utils/wrapAsync");
const ExpressError= require("./utils/ExpressError");
const {Listingschema, ReviewSchema}= require("./Schema");
const Review = require("./models/review");
const session= require("express-session");
const flash= require("connect-flash");
const { required } = require("joi");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user");
const userRouter= require("./route/user.js");
const {isLoggedIn, saveRedirectUrl, isowner, isReviewAuthor}= require("./middleware.js");
const router = require("express/lib/router/index.js");
const res = require("express/lib/response.js");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const { access } = require('fs');
const { features } = require('process');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient= mbxGeocoding({accessToken: mapToken});
const { getRecommendations } = require("./utils/recommendation");


app.engine('ejs', engine);
app.use(methodoverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));

app.use('/static', express.static(path.join(__dirname, 'views/layout')));

const sessionOption= {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}



async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})

const validateListing= (err, req, res, next)=>{
    let {error}= Listingschema.validate(req.body);
        if(error){
            let errmsg= error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errmsg);
        }else{
            next();
        }
}
const validateReview= (err, req, res, next)=>{
    let {error}= ReviewSchema.validate(req.body);
        if(error){
            let errmsg= error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errmsg);
        }else{
            next();
        }
}

app.get("/", (req, res)=>{
    res.send("Working");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success= req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user;
    next();
})

// app.get("/demouser", async(req,res)=>{
//     let fakeUser= new User({
//         email: "customer@gmail.com",
//         username: "Annoymous"
//     });
//     let registeredUser= await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

// app.use("/", userRouter);



//UserRouter............................................
app.get('/signup', (req, res) => {
    res.render("users/signup.ejs");
  });

app.post("/signup", async(req,res)=>{
    try{
        let{username, email, password}= req.body;
        const newuser= new User({email, username});
        const registeredUser= await User.register(newuser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=>{
            if(err){
                next(err);
            }
            req.flash("success", "Welcome to WanderLust!!!");
            res.redirect("/listings");
        })
        
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
})

//login page.....................................................................................................................
app.get("/login", (req,res)=>{
    res.render("users/login.ejs");
})

app.post("/login",saveRedirectUrl,passport.authenticate('local', {failureRedirect: "/login", failureFlash: true}), async(req,res)=>{
    req.flash("success", "Welcome back to WanderLust!!!");
    let redirectUrl= res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

app.get("/logout", (req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
});


//.................................................................................................................................

app.get("/listings", async(req,res)=>{
    let allListings= await Listing.find({});
    res.render("listings/indexroot.ejs", {allListings});
})


//New Route
app.get("/listings/new", isLoggedIn, (req, res)=>{
    res.render("listings/new.ejs");
})

app.post("/listings",isLoggedIn,validateListing,async(req, res, next)=>{
    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();   
    
    try{
            const newListing= new Listing(req.body.listing);
            newListing.owner= req.user._id;
            newListing.geometry= response.body.features[0].geometry;
            let saved= await Listing.insertMany(newListing);
            console.log(saved);
            req.flash("success","New Listing Created!!!");
            res.redirect("/listings");
        }catch(err){
            next(err);
        }
    })

app.get("/listings/:id",isLoggedIn, async(req,res,next)=>{
    try{
        let {id}= req.params;
        const listing = await Listing.findById(id).populate({path: 'reviews', populate: {path: "author"}}).populate({path: 'owner'});  // Mongoose will handle the conversion internally
        if(!listing){
            req.flash("error","Listing you requested for does'nt exist!!!");
            res.redirect("/listings");
        }
        console.log(listing)
        res.render('listings/show', { listing });
    }catch(err){
        next(err);
    }
})

app.get("/listings/:id/edit",isLoggedIn,isowner, async(req,res,next)=>{
   try{
    let{id}= req.params;
    const listing= await Listing.findById(id);  // Mongoose will handle the conversion internally
    if(!listing){
        req.flash("error","Listing you requested for does'nt exist!!!");
        res.redirect("/listings");
    }
     res.render("listings/edit.ejs",{listing});
   }catch(err){
    next(err);
   }
});

app.put("/listings/:id",isLoggedIn, isowner ,validateListing, async(req,res,next)=>{
    try{
        let {id}= req.params;
        await Listing.findByIdAndUpdate(id, {...req.body.listing});;  // Mongoose will handle the conversion internally
        req.flash("success","Listing Updated!!!");
        res.redirect(`/listings/${id}`);
    }catch(err){
        next(err);
    }
})

app.delete("/listings/:id",isLoggedIn,isowner, async(req,res,next)=>{
   try{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!!!");
    res.redirect("/listings");
   }catch(err){
    next(err);
   }
});

// app.get("/recommendations", async (req, res) => {
//     try {
//         const userPreferences = {
//             location: "New York",
//             price: 100,
//             amenities: ["WiFi", "Pool", "Kitchen"]
//         };

//         const recommendations = await getRecommendations(userPreferences);
//         res.render("recommendations", { recommendations });
//     } catch (error) {
//         res.status(500).send("Error fetching recommendations");
//     }
// });

// app.post("/recommendations", async (req, res) => {
//     try {
//         const userPreferences = req.body; // { location, price, amenities }
//         const recommendations = await getRecommendations(userPreferences);
//         res.json(recommendations);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching recommendations" });
//     }
// });

//review
//post review route
app.post("/listings/:id/review",isLoggedIn,validateReview, async(req,res,next)=>{
    try{
        let listing= await Listing.findById(req.params.id);
    let newreview = new Review(req.body.review);
    newreview.author= req.user._id;
    console.log(newreview);

    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();

    req.flash("success","Review Added!!!");
    res.redirect(`/listings/${req.params.id}`)
    }catch(err){
        next(err);
    }
});
 
//delete route for review
app.delete("/listings/:id/review/:reviewId",isReviewAuthor, async(req,res,next)=>{
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

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found"));
})
app.use("/listings", (req,res, next)=>{
    next(new ExpressError(500, "Something went wrong!!!"));
})
app.use((err, req, res, next)=>{
    let {status=500, message="Something went wrong"}= err;
    res.status(status).send(message);
})
app.listen(8080, ()=>{
    console.log("listening to port 8080");
})

