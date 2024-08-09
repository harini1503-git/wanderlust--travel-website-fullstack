const { name } = require("ejs");
const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing = require("./models/listing");
const path= require("path");
const methodoverride= require("method-override");
const engine = require('ejs-mate');
const ObjectId = mongoose.Types.ObjectId;
const wrapAsync= require("./utils/wrapAsync");
const ExpressError= require("./utils/ExpressError");

app.engine('ejs', engine);
app.use(methodoverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})

app.get("/", (req, res)=>{
    res.send("Working");
});

app.get("/listings", async(req,res)=>{
    let allListings= await Listing.find({});
    res.render("listings/indexroot.ejs", {allListings});
})


app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
})

app.post("/listings",async(req, res, next)=>{
        try{
            if(!req.body.listing){
                throw new ExpressError(400, "Send valid data");
            }

            const newListing= new Listing(req.body.listing);
            await Listing.insertMany(newListing);
            res.redirect("/listings");
        }catch(err){
            next(err);
        }
    })

app.get("/listings/:id", async(req,res)=>{
    try{
        let {id}= req.params;
    const listing = await Listing.findById(id);  // Mongoose will handle the conversion internally
    res.render('listings/show', { listing });
    }catch(err){
        next(err);
    }
})

app.get("/listings/:id/edit", async(req,res)=>{
   try{
    let{id}= req.params;
    const listing= await Listing.findById(id);  // Mongoose will handle the conversion internally
     res.render("listings/edit.ejs",{listing});
   }catch(err){
    next(err);
   }
});

app.put("/listings/:id", async(req,res)=>{
    try{
        if(!req.body.listing){
            throw new ExpressError(400, "Send valid data");
        }

        let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});;  // Mongoose will handle the conversion internally
    res.redirect(`/listings/${id}`);
    }catch(err){
        next(err);
    }
})

app.delete("/listings/:id", async(req,res)=>{
   try{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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